# Using Logux Concepts in Practice

Logux architecture was designed to be peer-to-peer and flexible.
You can build different architecture on top of core concepts depends
on your needs. But in this docs, we will show how to use
[Logux core concepts](./core.md) for the most popular standard case
with web clients and several servers.


## Connecting

Logux client keeps only one Web Socket connection even if the user opens
an application in multiple browser’s tabs. Logux clients in different
**elect one leader** to keep the connection. If the user closes the leader tab,
other tabs will re-elect a leader.

When Logux client opens Web Socket connection, it sends a user ID
and user token to the server.

Logux server is written in JS. There are two ways to use it:

1. Use Logux server as a framework and write an application
   on top of **Logux JS API**. You can use any database to store data.

    ```js
    server.auth(async (userId, token) => {
      let user = findUser(userId)
      return user.token === token
    })
    ```
2. Use **Logux server as a proxy**. Logux can convert all Web Sockets events
   to the HTTP request to your web server. You can use your favorite back-end
   language: for instance, PHP, Ruby on Rails or Go.

We will show examples in JS API, but you can use Logux proxy with any back-end
language for all our examples.

After authenticating user server will calculate **time different**
between client and server. It is useful when the client has the wrong
time settings.


## Subscriptions

Because live updates are important parts of Logux idea, in Logux
*subscriptions* is a way to request data from the server.

On the client, you wrap a component into `subscribe` decorator. Every time,
when component added to UI, Logux will subscribe for the channel with the data.
Every time, when the component will be removed, Logux will unsubscribe
from the channel.

```js
export default subscribe(({ userId }) => `user/${ userId }`)(UserUI)
```

Logux client sends `logux/subscribe` action to the server:

```js
{ type: 'logux/subscribe', channel: 'user' }
```

After receiving `logux/subscribe` Logux server does three steps.

1. Check that user has **access** to this channel.
2. Load **initial data** (the current state) from the database and send
   an action with this data to the client.
3. Subscribe the client to any new **data changes**. Any new action with
   this channel in `meta.channels` will be sent to this client.

```js
server.channel('user/:id', {
  access (ctx) {
    // User can subscribe only to own data
    return ctx.params.id === ctx.userId
  },
  async init (ctx) {
    let name = await db.loadUserName(ctx.params.id)
    // Creating action to set user name and sending it to subscriber
    server.log.add({ type: 'user/name', name }, { clients: [ctx.clientId] } )
  }
})
```

Logux client shows loader while the server loads data. When the client will
receive initial data, the client will apply data to the state and hide loader.

```js
const UserUI = ({ name, isSubscribing }) => {
  if (isSubscribing) {
    return <Loader />
  } else {
    return <Name>{name}</Name>
  }
}
```


## Changing Data

Clients or server should create an action to change data.

```js
log.add(
  { type: 'user/name', name: 'New name', userId: 29 }, // Action
  { channels: ['user/29'], sync: true }                // Meta
)
```

In the most popular case, Logux client use [Redux-style reducers]
to **reduce list of action to the state**. Reducer is a pure function,
which immutable change the state according to this new action:

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

If the user changed their name in the form, the client does not need to show
loader on the Save button. The client creates action and applies this action
to the state **immediately**.

In the background, the client will send this new action to the server
by Web Socket. While the client is waiting for the answer from the server,
it is showing small *“changes were not saved yet”* warning.

When the server receives new action it does three things:

1. Check user **access** to do this action.
2. Apply this action to **database**.
3. **Re-send** this action to all clients subscribed to `meta.channels`.

```js
server.type('user/name', {
  access (ctx, action) {
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

After saving action to the database, the server will send `logux/processed`
action to origin client. When the client receives `logux/processed` action,
it hides *“changes were not saved yet”* warning.

```js
{ type: 'logux/processed', actionId: meta.id }
```


## Handling Errors

On any error with action processing, the server will send back to the client
`logux/undo` action. It could happen if the server found that client has
no access. Or if the database threw an error during saving.

```js
{ type: 'logux/undo', actionId: meta.id, reason: 'error' }
```

Logux clients use pure reducers for **time traveling** feature. When the client
received `logux/undo`, it rollbacks the state to the latest saved point and call
reducers for all next action, except the action from `logux/undo`.

An application can catch `logux/undo` action and show some error warning.


## Loader During Processing

Optimistic UI isn’t mandatory. If you need a loader (for instance,
for payment process), you can use it:

1. When the user clicks on the “Pay” button, the client sends a `pay/request`
   action to the server and **show loader**.
2. After finishing the payment, the server sends `logux/processed` back.
   On this action, the client shows the **done** message.
3. If the user’s bank card did not pass server validation, the server sends
  `logux/undo` back, and client **shows error**.


## Offline

Logux architecture was created to be **offline-first** by design.

Logux clients send pings messages to Web Socket to detect loosing
Internet and show *“you are offline”* warning.

An offline state is normal for Logux. The user can work with data and create
an action to change the data. Unsent action be kept in the log and user will see
*“changes were not saved yet”* warning.

When user get Internet back, Logux will reconnect to the server,
send all actions and receive all data updates.


## Merging Edit Conflicts

When you are working with any offline-first system, you should ask how it deals
with edit conflicts. During offline two users can change the same document.
Even if only one user works with the document, this user can change
the document from different devices.

To merge edit conflicts in Logux:

1. You need to use atomic actions. `likes/increase` will be more atomic
   than `likes/set`.
2. Each action has a creation time. An application can detect what action
   created earlier and could be overridden by more recent action.

Logux client and server use different approaches to work with old actions.
For instance, another client create action hour ago in offline and finally
got connection to synchronize it.

* On the server you need to store **last edit time** for all fields.
  On the action, you need to compare action’s time and last edit time.
* Logux client has **time traveling**. When the client receives old action,
  it put old action in the middle of the log. It reverts all later action,
  applies old action and then re-apply reverted actions.
