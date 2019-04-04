# Using Logux Concepts in Practice

Logux architecture was designed to be peer-to-peer and flexible.
You can build different architecture on top of core concepts depends
on your needs. But in this docs we will show how to use
[Logux core concepts](./core.md) for the most popular standard case
with web clients and several servers.


## Connecting

Logux client keeps only one Web Socket connection even if user open
an application in multiple browser’s tabs. To do this, Logux clients
detects other browser’s tab with the same web site
and **tabs elect one leader**. Only leader will keep connection.
If user will close leader tab, other tabs will re-elect leader.

*You can try this election system in [online demo].
Just open it in several tabs.*

[online demo]: https://logux.github.io/client/

When Logux client will open Web Socket connection, it sends user ID
and user token to the server.

Logux server is written in JS. There are two ways to use it:

1. The first way is to use Logux server as framework and write application
  on top of **Logux JS API**. In this mode you can use any database
  to store data.

    ```js
    server.auth(async (userId, token) => {
      let user = findUser(userId)
      return user.token === token
    })
    ```
2. The second way is to use **Logux server as a proxy**. In this mode Logux will
   convert all Web Sockets events to HTTP request to your web server.
   It is the perfect case if you want keep your back-end on PHP, Ruby on Rails
   or any other non-JS environment.

We will show examples in JS API, but you can use Logux proxy with your favorite
back-end language for all our examples.

When server will authenticate user, server will calculate **time different**
between client and server. It is useful when client has wrong time settings.


## Subscriptions

Because live updates is important parts of Logux idea, in Logux
*subscriptions** is a way to request data from the server.

On the client, you wrap a component into `subscribe` decorator. Every time,
when component added to UI, Logux will subscribe for the channel with the data.
Every time, when component will be removed, Logux will unsubscribe
from the channel.

```js
export default subscribe(({ userId }) => `user/${ userId }`)(UserUI)
```

Logux client subscribe to some channel, it send `logux/subscribe` action
to the server:

```js
{ type: 'logux/subscribe', channel: 'user' }
```

Logux server will receive this action and will do 3 steps:

1. Check that user has access to this channel.
2. Load initial data (the current state) from database and send an action
   with this data to the client.
3. Subscribe the client to any data changes. It means that any action with
   this channel in `meta.channels` will be send to this client.

```js
server.channel('user/:id', {
  access (ctx) {
    // User can subscribe only on own data
    return ctx.params.id === ctx.userId
  },
  async init (ctx) {
    let name = await db.loadUserName(ctx.params.id)
    // Creating action to set user name and sending it to the client
    server.log.add({ type: 'user/name', name }, { clients: [ctx.clientId] } )
  }
})
```

Logux client will show loader while server loads data. When action with initial
data will be received by client, it will apply data to the state and show it
in UI.

```js
const UserUI = ({ name, isSubscribing }) => {
  if (isSubscribing) {
    return <Loader />
  } else {
    return <Name>{ name }</Name>
  }
}
```
