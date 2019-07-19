# Logux Nodes

Logux uses the peer-to-peer model. There is no big difference between client and server. This is why we call both client and server “nodes”.

If a user opens a website with Logux in multiple browser tabs, tabs will elect one leader, and only this leader will keep the connection. If the user closes the leader tab, tabs will re-elect a new leader.

Logux Core provides `BaseNode` class, which will synchronize actions between two nodes. `ClientNode` and `ServerNode` classes extend this class with small behaviour changes.

<details open><summary><b>Redux client</b></summary>

```js
const createStore = createLoguxCreator({ … })
const store = createStore(reducer)
store.client.node //=> ClientNode instance
```

</details>
<details><summary><b>Logux client</b></summary>

```js
const client = new CrossTabClient({ … })
client.node //=> ClientNode instance
```

</details>

Each node has:

* [Node ID](#node-id)
* [User ID and client ID](#user-id-and-client-id)
* [Store](#store) for actions.
* [Connection](#connection).
* [Synchronization state and tab role](#state-and-role).
* Optional [credentials](#credentials).
* Optional application subprotocol. We will explain it in [special chapter].

See also `@logux/core/base-node.js` for node’s API.

[special chapter]: ./6-subprotocol.md


## Node ID

Each node has a unique node ID — a string like `380:Uf_pPwE4:6K7iYdJH` or `server:iSiqWU5J`.

<details open><summary><b>Redux client</b></summary>

```js
store.client.nodeId //=> "380:Uf_pPwE4:6K7iYdJH"
```

</details>
<details open><summary><b>Logux client</b></summary>

```js
client.nodeId //=> "380:Uf_pPwE4:6K7iYdJH"
```

</details>
<details><summary><b>Logux Server</b></summary>

```js
server.nodeId //=> "server:iSiqWU5J"
```

</details>
<details><summary><b>Logux Rails</b></summary>

```ruby
Logux::Node.instance.node_id #=> "server:iSiqWU5J"
```

</details>

Node ID uses user ID, client ID, and random string by [Nano ID] to be unique.

In `server:iSiqWU5J`:

1. `server` is the user ID. Only servers can uses this user ID.
2. `iSiqWU5J` is random string by Nano ID.

In `380:Uf_pPwE4:6K7iYdJH`:

1. `380` is the user ID.
2. `380:Uf_pPwE4` is client ID. Each browser tab has a unique node ID, but every browser tab in this browser will have the same client ID.
3. `6K7iYdJH` is random string by Nano ID.

[Nano ID]: https://github.com/ai/nanoid/


## User ID and Client ID

Each node has a user ID — a string like `380`, `server` or `false`. Only servers can use `server` user ID. `false` means that user wasn’t authenticated yet.

Logux client in each browser tab will have a unique node ID. Sometimes we need to send a message to all browser tabs on this machine. To do it, we have a client ID — a string like `580:Uf_pPwE4` with a user ID and random string from Nano ID.

Mobile clients use user ID as client ID since they do not have different tabs. Node ID will be like `580:jn1Ws0Iu`. User ID and client ID will be both `580`.

<details open><summary><b>Redux client</b></summary>

```js
const createStore = createLoguxCreator({ userId: '580', … })
const store = createStore(reducer)
store.client.options.userId   //=> "580"
store.client.clientId //=> "580:Uf_pPwE4"
store.client.nodeId   //=> "580:Uf_pPwE4:jn1Ws0Iu"
```

</details>
<details><summary><b>Logux client</b></summary>

```js
const client = new CrossTabClient({ userId: '580', … })
client.options.userId   //=> "580"
client.clientId //=> "580:Uf_pPwE4"
client.nodeId   //=> "580:Uf_pPwE4:jn1Ws0Iu"
```

</details>

On the server you can get user ID and client ID of the client by:

<details open><summary><b>Logux Server</b></summary>

```js
server.type('INC', {
  access (ctx, action, meta) {
    ctx.userId   //=> "580"
    ctx.clientId //=> "580:Uf_pPwE4"
    ctx.nodeId   //=> "580:Uf_pPwE4:jn1Ws0Iu"
  }
})

server.channel('counter', {
  access (ctx, action, meta) {
    ctx.userId   //=> "580"
    ctx.clientId //=> "580:Uf_pPwE4"
    ctx.nodeId   //=> "580:Uf_pPwE4:jn1Ws0Iu"
  }
})
```

</details>
<details><summary><b>Logux Rails</b></summary>

```ruby
module Actions
  class Inc < Actions::Base
    def inc
      user_id   #=> "580"
      client_id #=> "580:Uf_pPwE4"
      node_id   #=> "580:Uf_pPwE4:jn1Ws0Iu"
    end
  end
end
```

</details>


## Store

Nodes synchronize actions. You can read about actions in [next chapter].

Nodes need a store for these actions and action meta. By default client and server keep actions in memory. It is not a problem for server, because it saves data from actions to database.

You can change action store. For instance, you can use` indexedDB` store for better offline support.

<details open><summary><b>Redux client</b></summary>

```js
import IndexedStore from '@logux/client/indexed-store'

const createStore = createLoguxCreator({
  store: new IndexedStore(),
  …
})
```

</details>
<details><summary><b>Logux client</b></summary>

```js
import IndexedStore from '@logux/client/indexed-store'

const client = new CrossTabClient({
  store: new IndexedStore(),
  …
})
```

</details>

[next chapter]: ./2-action.md


## Connection

By default, nodes use WebSocket to connect to each other. You just pass URL to the server:

<details open><summary><b>Redux client</b></summary>

```js
const createStore = createLoguxCreator({
  server: 'wss://example.com',
  …
})
```

</details>
<details><summary><b>Logux client</b></summary>

```js
const client = new CrossTabClient({
  server: 'wss://example.com',
  …
})
```

</details>

By default, Logux forces you to use WebSocket over TLS (`wss:`) in production. It is important to fix the problem between WebSocket and old firewalls and routers. Encryption makes traffic looks like any keep-alive HTTPS connection.

You can use WebSocket without encryption in development or with `allowDangerousProtocol` option.

If you do not want to use WebSocket, you can implementation own `Connection` class and pass it to `server` option. For instance, you can use `@logux/core/test-pair` in tests:

<details open><summary><b>Redux client</b></summary>

```js
import { testPair } from 'logux-core'

const pair = new testPair()
const createStore = createLoguxCreator({
  server: pair.left,
  …
})
```

</details>
<details><summary><b>Logux client</b></summary>

```js
import { testPair } from 'logux-core'

const pair = new testPair()
const client = new CrossTabClient({
  server: pair.left,
  …
})
```

</details>


## State and Role

Node has current synchronization state. Possible values are `disconnected`, `connecting`, `sending`, and `synchronized`. You can get current state by:

<details open><summary><b>Redux client</b></summary>

```js
store.client.state //=> "synchronized"
```

</details>
<details><summary><b>Logux client</b></summary>

```js
client.state //=> "synchronized"
```

</details>

`@logux/client/status` provides useful syntax sugar around state with extra values:

```js
import status from '@logux/client/state'

status(client, current => {
  if (current === 'protocolError') {
    askUserToReloadPage()
  } else if (current === 'syncError') {
    showError('Logux error')
  } else if (current === 'denied') {
    showError('You do not have rights for this changes')
  } else if (current === 'error') {
    showError('You changes was reverted by server')
  } else if (current === 'disconnected') {
    showWarning('You are offline')
  } else if (current === 'wait') {
    showWarning('You have changes which are waiting for Internet')
  } else if (current === 'connectingAfterWait') {
    showWarning('We are saving your changes from offline')
  } else if (current === 'synchronizedAfterWait') {
    showWarning('Your changes was saved')
  } else if (current === 'connecting') {
    showWarning('Connecting to the server')
  } else if (current === 'synchronized') {
    showWarning('You are online')
  }
})
```

In the web, user can open multiple browser tabs with the same website. Only one leader Logux client will keep the connection with the server. `client.state` shows the connection state of this leader. You can use `client.role` to detect the current leader. Possible values are `leader`, `follower`, and `candidate` (during the election).


## Credentials

The client should use some authentication credentials to prove it’s user ID. The best way is to use [JWT] token generated on the server.

<details open><summary><b>Redux client</b></summary>

```js
const createStore = createLoguxCreator({
  userId: localStorage.getItem('userId'),
  credentials: localStorage.getItem('userToken'),
  …
})
```

</details>
<details><summary><b>Logux client</b></summary>

```js
const client = new CrossTabClient({
  userId: localStorage.getItem('userId'),
  credentials: localStorage.getItem('userToken'),
  …
})
```

</details>

User ID and credentials will be checked on the server:

<details open><summary><b>Logux Server</b></summary>

```js
server.auth((userId, credentials) => {
  const data = await jwt.verify(credentials, process.env.JWT_SECRET)
  return data.sub === userId
})
```

</details>
<details><summary><b>Logux Rails</b></summary>

```ruby
config.auth_rule = lambda do |user_id, token|
  data = JWT.decode token, ENV['JWT_SECRET'], { algorithm: 'HS256' }
  data[0]['sub'] == user_id
end
```

</details>

[JWT]: https://jwt.io/introduction/

**[Next chapter →](./2-action.md)**
