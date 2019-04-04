# Using Logux Concepts in Practice

Logux architecture was designed to be peer-to-peer and flexible.
You can build different architecture on top of core concepts depends
on your needs. But in this docs we will show how to use
[Logux core concepts](./core.md) for the most popular standard case
with web clients and several servers.


## Connecting

Logux client keeps only one Web Socket connection even if user open
an application in multiple browser’s tabs. Logux clients in different
**elect one leader** to keep the connection. If user will close leader tab,
other tabs will re-elect leader.

When Logux client opens Web Socket connection, it sends user ID
and user token to the server.

Logux server is written in JS. There are two ways to use it:

1. Use Logux server as framework and write application
   on top of **Logux JS API**. You can use any database to store data.

    ```js
    server.auth(async (userId, token) => {
      let user = findUser(userId)
      return user.token === token
    })
    ```
2. Use **Logux server as a proxy**. Logux can convert all Web Sockets events
   to HTTP request to your web server. You can use your favorite back-end
   language: for instance, PHP, Ruby on Rails or Go.

We will show examples in JS API, but you can use Logux proxy with any back-end
language for all our examples.

After authenticating user server will calculate **time different**
between client and server. It is useful when client has wrong time settings.


## Subscriptions

Because live updates is important parts of Logux idea, in Logux
*subscriptions* is a way to request data from the server.

On the client, you wrap a component into `subscribe` decorator. Every time,
when component added to UI, Logux will subscribe for the channel with the data.
Every time, when component will be removed, Logux will unsubscribe
from the channel.

```js
export default subscribe(({ userId }) => `user/${ userId }`)(UserUI)
```

Logux client sends `logux/subscribe` action to the server:

```js
{ type: 'logux/subscribe', channel: 'user' }
```

After receiving `logux/subscribe` Logux server does 3 steps.

1. Check that user has **access** to this channel.
2. Load **initial data** (the current state) from database and send an action
   with this data to the client.
3. Subscribe the client to any new **data changes**. Any new action with
   this channel in `meta.channels` will be send to this client.

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

Logux client shows loader while server loads data. When action with initial
data will be received by client, it will apply data to the state
and hide loader.

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

To change data, clients or server should create an action:

```js
log.add(
  { type: 'user/name', name: 'New name', userId: 29 }, // Action
  { channels: ['user/29'], sync: true }                // Meta
)
```

In most popular case, Logux client use [Redux-style reducers] to **reduce list
of action to the state**. Reducer is a pure function, which immutable change
the state according to this new action:

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

If user changed their name in the form, client do not need show loader on Save
button. Client creates action and applies this action to the state
**immediately**.

In the background client will send this new action to the server by Web Socket.
While client is waiting the answer from the server it is showing small
*“changes were not saved yet”* warning.

When server receives new action it does 3 things:

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

After saving action to database, server will send `logux/processed` action
to origin client. When client receives `logux/processed` action, it hides
*“changes were not saved yet”* warning.

```js
{ type: 'logux/processed', actionId: meta.id }
```


## Handling Errors

On any error with action processing, server will send back to the client
`logux/undo` action. It could happen if server will find that client have
no access (for instance, access was taken, but client did not receive it yet).
Or if database threw error during saving.

```js
{ type: 'logux/undo', actionId: meta.id, reason: 'error' }
```

Logux clients use pure reducers for **time traveling** feature.
When client received `logux/undo`, it rollback the state to the latest saved
point and call reducers for all next action, except the action
from `logux/undo`.

Application can catch `logux/undo` action and show some error warning.


## Loader During Processing

Optimistic UI isn’t mandatory. If you need a loader (for instance,
for payment process), you can do it in old way:

1. When user will click on “Pay” button, client will send `pay/ask` action
   to the server and **show loader**.
2. When server will make payment, it will send `logux/processed` back.
   On this action, client will show “done” message.
3. If user’s bank card do not pass server validation, server will send
  `logux/undo` back and client will show error.


## Offline


## Merging Edit Conflicts
