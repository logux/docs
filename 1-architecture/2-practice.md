# Using Logux Concepts in Practice

Logux architecture was designed to be peer-to-peer and flexible. You can build different architecture on top of core concepts depends on your needs. But in this docs, we will show how to use [Logux core concepts](./1-core.md) for the most popular standard case with web clients and several servers.


## Connecting

Logux client keeps only one WebSocket connection even if the user opens an application in multiple browser’s tabs. Logux clients in different **elect one leader** to keep the connection. If the user closes the leader tab, other tabs will re-elect a leader.

When Logux client opens WebSocket connection, it sends a user ID and user token to the server.

Logux server is written in JS. There are two ways to use it:

1. Use Logux server as a framework and write an application on top of **Logux JS API**. You can use any database to store data.

    ```js
    server.auth(async (userId, token) => {
      return verifyJWT(token).userId === userId
    })
    ```
2. Use **Logux server as a proxy**. Logux can convert all WebSocket events to the HTTP request to your web server. You can use your favorite back-end language: for instance, PHP, Ruby on Rails or Go.

We will show examples in JS API, but you can use Logux proxy with any back-end language for all our examples.

After authenticating user server will calculate **time different** between client and server. It is useful when the client has the wrong time settings.


## Subscriptions

Because real-time are important parts of Logux idea, in Logux *subscriptions* is a way to request data from the server.

On the client, you use `useSubscription` hook or wrap a component into `subscribe` decorator. Every time, when component added to UI, Logux will subscribe for the channel with the data. Every time, when the component will be removed, Logux will unsubscribe from the channel.

```js
export const User = (userId) => {
  const isSubscribing = useSubscription(`user/${ userId }`)
  …
}
```

Logux client sends `logux/subscribe` action to the server:

```js
{ type: 'logux/subscribe', channel: 'user/388' }
```

After receiving `logux/subscribe` Logux server does three steps.

1. Check that user has **access** to this channel.
2. Load **initial data** (the current state) from the database and send an action with this data to the client.
3. Subscribe the client to any new **data changes**. Any new action with this channel in `meta.channels` will be sent to this client.

```js
server.channel('user/:id', {
  access (ctx) {
    // User can subscribe only to own data
    return ctx.params.id === ctx.userId
  },
  async init (ctx) {
    let name = await db.loadUserName(ctx.params.id)
    // Creating action to set user name and sending it to subscriber
    ctx.sendBack({ type: 'user/name', name })
  }
})
```

Logux client shows loader while the server loads data. When the client will receive initial data, the client will apply data to the state and hide loader.

```js
export const User = ({ userId }) => {
  const isSubscribing = useSubscription(`user/${ userId }`)
  const user = useSelector(state => state.users[userId])

  if (isSubscribing) {
    return <Loader />
  } else {
    return <Name>{user.name}</Name>
  }
}
```


## Changing Data

Clients or server should create an action to change data.

```js
log.add(
  { type: 'user/name', name: 'New name', userId: 29 }, // Action
  { sync: true }                                       // Meta
)
```

In the most popular case, Logux client use [Redux-style reducers] to **reduce list of action to the state**. Reducer is a pure function, which immutable change the state according to this new action:

```js
function usersReducers (state = { }, action) {
  if (action.type === 'user/name') {
    return { ...state, name: action.name }
  } else {
    return state
  }
}
```

[Redux-style reducers]: https://redux.js.org/basics/reducers

If the user changed their name in the form, the client does not need to show loader on the Save button. The client creates action and applies this action to the state **immediately**.

In the background, the client will send this new action to the server by WebSocket. While the client is waiting for the answer from the server, it is showing small *“changes were not saved yet”* warning.

When the server receives new action it does three things:

1. Get `meta.channels` to find whom we should re-send the action after checking access.
2. Check user **access** to do this action.
3. **Re-send** this action to all clients subscribed to `meta.channels`.
4. Apply this action to **database**.
5. **Clean** server log from this action since server do not need it anymore. When other clients will connect to the server, server will create a new action for them as described in “Subscriptions” section.

```js
server.type('user/name', {
  resend (ctx, action, meta) {
    // Resend this action to everyone who subscribed to this user
    return { channel: `user/${ action.userId }` }
  },
  access (ctx, action, meta) {
    // User can change only own name
    return action.userId === ctx.userId
  },
  async process (ctx, action, meta) {
    let lastChanged = await db.getChangeTimeForUserName(action.userId)
    // Ignore action if somebody already changed the name later
    if (isFirstOlder(lastChanged, meta)) {
      await db.saveUserName(action.userId, action.name)
    }
  }
})
```

After saving action to the database, the server will send `logux/processed` action to origin client. When the client receives `logux/processed` action, it hides *“changes were not saved yet”* warning.

```js
{ type: 'logux/processed', id: meta.id }
```


## Handling Errors

On any error with action processing, the server will send back to the client `logux/undo` action.

```js
{ type: 'logux/undo', id: meta.id, reason: 'error' }
```

Logux client uses pure reducers for **time traveling**. When the client received `logux/undo`, it rollbacks the state to the latest saved point and call reducers for all next action, except the action from `logux/undo`.

An application can catch `logux/undo` action and show some error warning.


## Loader During Action Processing

Optimistic UI is great for UX. Some actions (like payments) require loader. Logux can be used for UI with blocking loader:

1. When the user clicks on the “Pay” button, the client sends a `pay/request` action to the server and **show loader**.
2. After finishing the payment, the server sends `logux/processed` back. On this action, the client shows the **done** message.
3. If the user’s bank card did not pass server validation, the server sends `logux/undo` back, and client **shows error**.


## Offline

Logux clients send pings messages to WebSocket to detect loosing Internet and show *“you are offline”* warning.

Offline is a normal mode for Logux. The user can work with data and create an action to change the data. Unsent action be kept in the log and user will see *“changes were not saved yet”* warning.

<img src="./offline-badge.png" width="314" height="64"
     alt="Logux Client badge with Offline and Changes not saved messages">

When user get Internet back, Logux will reconnect to the server, send all actions and receive all data updates.


## Merging Edit Conflicts

When you are working with any offline-first system, you should ask how it deals with edit conflicts. During offline two users can change the same document. Even if only one user works with the document, this user can change the document from different devices.

For instance, *user A* changed the title and publication date for the document. *User B* a few minutes later changed document’s title and tags. Because of offline, *user A* could synchronize their actions later, than *user B*.

To merge edit conflicts in Logux:

1. You need to use **atomic actions**. Separated actions for each changed property is better than sending the whole document in action. For tags it is better to have `document/tags/add` and `document/tags/remove` actions, instead of one action to override whole tags list.

    ```js
    { type: 'document/set', docId: 12, prop: 'title', value: 'New title' }
    { type: 'document/tags/add', docId: 12, tag: 'crdt' }
    ```

2. Each action has a **creation time**. In our example, both users changed the title.
   The most popular merge strategy is to keep the latest change.

Logux client and server use different approaches to work with action’s order.

* Server stores **last edit time** for each document property. When it received
  action from *user B*, server applies their changes to the database
  (because last change of the document title was a few weeks ago). The server will receive action from *user A*. Because *A’s* action time is smaller,
  than latest title changes (*B’s* action time), the server will ignore
  *A’s* action.
* Logux client has **time traveling**. When *user B* received *A’s* action
  from (server re-sent it), the client will revert all recent action,
  including their title changes. Then it will apply *A’s* action and re-apply
  all reverted actions back. As a result, *A’s* action was placed in the correct moment of history. So, *A’s* title changes were overridden by later
  *B’s* action.

**[Next chapter →](./3-solved.md)**
