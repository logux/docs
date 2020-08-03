# Nodes

Logux uses the peer-to-peer model. There is no big difference between client and server. This is why we call both client and server “nodes”.

If a user opens a website with Logux in multiple browser tabs, tabs will elect one leader, and only this leader will keep the connection. If the user closes the leader tab, tabs will re-elect a new leader.

Logux Core provides `BaseNode` class, which will synchronize actions between two nodes. `ClientNode` and `ServerNode` classes extend this class with small behaviour changes.

<details open><summary>Redux client</summary>

```js
const createStore = createLoguxCreator({ … })
const store = createStore(reducer)
store.client.node //=> ClientNode instance
```

</details>
<details><summary>Vuex client</summary>

```js
const client = new CrossTabClient({ … })
const createStore = createStoreCreator(client, { … })
const store = createStore({ … })
store.client.node //=> ClientNode instance
```

</details>
<details><summary>Pure JS client</summary>

```js
const client = new CrossTabClient({ … })
client.node //=> ClientNode instance
```

</details>

See also [`BaseNode`](https://logux.io/node-api/#basenode) for node’s API.


## Node ID

Each node has a unique node ID — a string like `380:Uf_pPwE4:6K7iYdJH` or `server:iSiqWU5J`.

Current node ID of client:

<details open><summary>Redux client</summary>

```js
store.client.nodeId //=> "380:Uf_pPwE4:6K7iYdJH"
```

</details>
<details><summary>Vuex client</summary>

```js
store.client.nodeId //=> "380:Uf_pPwE4:6K7iYdJH"
```

</details>
<details><summary>Pure JS client</summary>

```js
client.nodeId //=> "380:Uf_pPwE4:6K7iYdJH"
```

</details>

Current node ID of server:

<details open><summary>Node.js</summary>

```js
server.nodeId //=> "server:iSiqWU5J"
```

</details>
<details><summary>Ruby on Rails</summary>

```ruby
Logux::Node.instance.node_id #=> "server:iSiqWU5J"
```

</details>

Node ID uses user ID, client ID, and random string by [Nano ID] to be unique.

In `server:iSiqWU5J`:

1. `server` is the **user ID**. Only servers can uses this user ID.
2. `iSiqWU5J` is random string by Nano ID.

In `380:Uf_pPwE4:6K7iYdJH`:

1. `380` is the **user ID**.
2. `380:Uf_pPwE4` is **client ID**. Each browser tab has a unique node ID, but every browser tab in this browser will have the same client ID.
3. `6K7iYdJH` is **tab ID**. Each browser tab will have unique value.

You can use [`parseId`](https://logux.io/redux-api/#globals-parseid) helper to get user ID and client ID from action ID or node ID.

On the server you can get user ID and client ID of the client by:

<details open><summary>Node.js</summary>

```js
server.type('INC', {
  access (ctx, action, meta) {
    ctx.userId   //=> "580"
    ctx.clientId //=> "580:Uf_pPwE4"
  }
})

server.channel('counter', {
  access (ctx, action, meta) {
    ctx.userId   //=> "580"
    ctx.clientId //=> "580:Uf_pPwE4"
  }
})
```

</details>
<details><summary>Ruby on Rails</summary>

```ruby
module Actions
  class Inc < Logux::ActionController
    def inc
      user_id   #=> "580"
      client_id #=> "580:Uf_pPwE4"
    end
  end
end
```

</details>

[Nano ID]: https://github.com/ai/nanoid/


## Store

Nodes synchronize actions. You can read about actions in [next chapter].

Nodes need a store for these actions and action meta. By default client and server keep actions in memory. It is not a problem for server, because it saves data from actions to database.

You can change action store. For instance, you can use `indexedDB` store for better offline support.

<details open><summary>Redux client</summary>

```js
import { IndexedStore } from '@logux/client'

const createStore = createLoguxCreator({
  store: new IndexedStore(),
  …
})
```

</details>
<details><summary>Vuex client</summary>

```js
import { IndexedStore } from '@logux/client'

const client = new CrossTabClient({
  store: new IndexedStore(),
  …
})
```

</details>
<details><summary>Pure JS client</summary>

```js
import { IndexedStore } from '@logux/client'

const client = new CrossTabClient({
  store: new IndexedStore(),
  …
})
```

</details>

[next chapter]: ./action.md


## Connection

By default, nodes use WebSocket to connect to each other. You just pass URL to the server:

<details open><summary>Redux client</summary>

```js
const createStore = createLoguxCreator({
  server: 'wss://example.com',
  …
})
```

</details>
<details><summary>Vuex client</summary>

```js
const client = new CrossTabClient({
  server: 'wss://example.com',
  …
})
```

</details>
<details><summary>Pure JS client</summary>

```js
const client = new CrossTabClient({
  server: 'wss://example.com',
  …
})
```

</details>

By default, Logux forces you to use WebSocket over TLS (`wss:`) in production. It is important to fix the problem between WebSocket and old firewalls and routers. Encryption makes traffic looks like any keep-alive HTTPS connection.

You can use WebSocket without encryption in development or with `allowDangerousProtocol` option.

If you do not want to use WebSocket, you can implementation own [`Connection`](https://logux.io/redux-api/#connection) class and pass it to `server` option. For instance, you can use [`TestPair`](https://logux.io/redux-api/#testpair) in tests:

<details open><summary>Redux client</summary>

```js
import { TestPair } from '@logux/core'

const pair = new TestPair()
const createStore = createLoguxCreator({
  server: pair.left,
  …
})
```

</details>
<details><summary>Vuex client</summary>

```js
import { TestPair } from '@logux/core'

const pair = new TestPair()
const client = new CrossTabClient({
  server: pair.left,
  …
})
```

</details>
<details><summary>Pure JS client</summary>

```js
import { TestPair } from '@logux/core'

const pair = new TestPair()
const client = new CrossTabClient({
  server: pair.left,
  …
})
```

</details>


## State

Node has current synchronization state. Possible values are `disconnected`, `connecting`, `sending`, and `synchronized`. You can get current state by:

<details open><summary>Redux client</summary>

```js
store.client.state //=> "synchronized"

store.client.on('state', () => {
  console.log(store.client.state) // Track state changes
})
```

</details>
<details><summary>Vuex client</summary>

```js
store.client.state //=> "synchronized"

store.client.on('state', () => {
  console.log(store.client.state) // Track state changes
})
```

</details>
<details><summary>Pure JS client</summary>

```js
client.state //=> "synchronized"

client.on('state', () => {
  console.log(client.state) // Track state changes
})
```

</details>

`@logux/client/status` provides useful syntax sugar around state with extra values:

```js
import { status } from '@logux/client'

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


## Cross-Tab Communication

In the web, user can open multiple browser tabs with the same website. In Logux only one browser tab will keep WebSocket connection with a server. All other tabs will use this connection. It keeps the same state in all tabs and save server resources.

When you open 2 browser tabs, they start election and elect the leader. If you will close leader tab, other tabs will detect it and start election again.

You can use `role` to detect the current leader. Possible values are `leader`, `follower`, and `candidate` (during the election).

<details open><summary>Redux client</summary>

```js
store.client.role //=> "leader"

store.client.on('role', () => {
  console.log(store.client.role) // Track role changes
})
```

</details>
<details><summary>Vuex client</summary>

```js
store.client.role //=> "leader"

store.client.on('role', () => {
  console.log(store.client.role) // Track role changes
})
```

</details>
<details><summary>Pure JS client</summary>

```js
client.role //=> "leader"

client.on('role', () => {
  console.log(client.role) // Track role changes
})
```

</details>

Each browser tab will have unique node ID, but they all have the same client ID. The server responses to all browsers tab, because multiple browser tabs can use one connection. You can do it by using client ID as an address.

In `380:Uf_pPwE4:6K7iYdJH` node ID, `380:Uf_pPwE4` is client ID and `6K7iYdJH` is tab ID.

<details open><summary>Redux client</summary>

```js
store.client.clientId //=> "380:Uf_pPwE4"
store.client.tabId //=> "6K7iYdJH"
```

</details>
<details><summary>Vuex client</summary>

```js
store.client.clientId //=> "380:Uf_pPwE4"
store.client.tabId //=> "6K7iYdJH"
```

</details>
<details><summary>Pure JS client</summary>

```js
client.clientId //=> "380:Uf_pPwE4"
client.tabId //=> "6K7iYdJH"
```

</details>

Browser tabs can synchronize actions between each other. Actions from server and for the server (with `meta.sync = true`) are sharing between browser tabs by default.


## Authentication

The client should use some token to prove it’s user ID. The best way is to use [JWT] token generated on the server.

<details open><summary>Redux client</summary>

```js
const createStore = createLoguxCreator({
  userId: localStorage.getItem('userId') || 'anonymous',
  token: localStorage.getItem('userToken') || '',
  …
})
```

</details>
<details><summary>Vuex client</summary>

```js
const client = new CrossTabClient({
  userId: localStorage.getItem('userId') || 'anonymous',
  token: localStorage.getItem('userToken') || '',
  …
})
```

</details>
<details><summary>Pure JS client</summary>

```js
const client = new CrossTabClient({
  userId: localStorage.getItem('userId') || 'anonymous',
  token: localStorage.getItem('userToken') || '',
  …
})
```

</details>

User ID and token will be checked on the server:

<details open><summary>Node.js</summary>

```js
server.auth(({ userId, token }) => {
  const data = await jwt.verify(token, process.env.JWT_SECRET)
  return data.sub === userId
})
```

</details>
<details><summary>Ruby on Rails</summary>

```ruby
config.auth_rule = lambda do |user_id, token|
  data = JWT.decode token, ENV['JWT_SECRET'], { algorithm: 'HS256' }
  data[0]['sub'] == user_id
end
```

</details>

[JWT]: https://jwt.io/introduction/

[Next chapter](./action.md)
