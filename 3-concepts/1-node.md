# Logux Nodes

Logux is based on top of peer-to-peer model, so there is no big difference between client and server. This is why we call both client and server “nodes”. In the web client each browser tab is also independent node.

Logux Core provides `BaseNode` class, which will synchronize actions between two nodes. `ClientNode` and `ServerNode` classes extend this class with small behaviour changes. Client uses this node inside:

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
* List of actions. Actions will be explained in [next chapter].
* [Synchronization state and tab role](#state-and-role)
* Optional [credentials](#credentials)
* Optional [application subprotocol](#subprotocol)

See also `@logux/core/base-node.js` for node’s API.

[next chapter]: ./2-action.md


## Node ID

Each node has unique Node ID. A string like `380:Uf_pPwE4:6K7iYdJH` or `server:iSiqWU5J`.

<details open><summary><b>Redux client</b></summary>

```js
store.client.node.nodeId //=> "380:Uf_pPwE4:6K7iYdJH"
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

Node ID uses user ID, client ID and random string by [Nano ID] to be unique. Node ID contains few blocks separated by `:`.

In `server:iSiqWU5J`:

1. `server` is user ID. Only servers can have this user ID.
2. `iSiqWU5J` is random string by Nano ID.

In `380:Uf_pPwE4:6K7iYdJH`:

1. `380` is user ID.
2. `380:Uf_pPwE4` is client ID. Each browser tab has unique node ID, but every browser tab in this browser will have the same client ID.
3. `6K7iYdJH` is random string by Nano ID.

[Nano ID]: https://github.com/ai/nanoid/


## User ID and Client ID

Each node has user ID. A string like `380`, `server` or `false`. Only servers can use `server` user ID. User ID `false` was reserved to the cases when user didn’t authenticated yet.

In the web, user can open multiple browser tabs with the same website. Logux client in each browser tab will have unique node ID. Sometimes we need to send a message to all browser tabs on this machine. To do it, we have a client ID. A string like `580:Uf_pPwE4` with user ID and random string from Nano ID.

Mobile clients use user ID as client ID, since they do not have different tabs. Node ID will be like `580:jn1Ws0Iu`. User ID and client ID will be both `580`.

<details open><summary><b>Redux client</b></summary>

```js
const createStore = createLoguxCreator({ userId: '580' })
const store = createStore(reducer)
store.client.node.userId   //=> "580"
store.client.node.clientId //=> "580:Uf_pPwE4"
store.client.node.nodeId   //=> "580:Uf_pPwE4:jn1Ws0Iu"
```

</details>
<details><summary><b>Logux client</b></summary>

```js
const client = new CrossTabClient({ userId: '580', … })
client.node.userId   //=> "580"
client.node.clientId //=> "580:Uf_pPwE4"
client.node.nodeId   //=> "580:Uf_pPwE4:jn1Ws0Iu"
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


## State and Role

Node has current synchronization state. Possible values:

* `disconnected`
* `connecting`
* `sending`
* `synchronized`

State has reason only on the client. You can get current state by:

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
  switch (current) {
    case 'protocolError':
      askUserToReloadPage()
      break
    case 'syncError':
      showError('Logux error')
      break
    case 'denied':
      showError('You do not have rights for this changes')
      break
    case 'error':
      showError('You changes was reverted by server')
      break
    case 'disconnected':
      showWarning('You are offline')
      break
    case 'wait':
      showWarning('You have changes which are waiting for Internet')
      break
    case 'connectingAfterWait':
      showWarning('We are saving your changes from offline')
      break
    case 'synchronizedAfterWait':
      showWarning('Your changes was saved')
      break
    case 'connecting':
      showWarning('Connecting to the server')
      break
    case 'synchronized':
      showWarning('You are online')
      break
  }
})
```

If user will open website with Logux in multiple browser tabs, tabs will elect one leader and only this leader will keep the connection. If user will close leader tab, tabs will re-elect new leader.

`client.state` show connection state of this leader. `client.node.state` shows the state of this browser node and should *not be used*. You can use `client.role` to detect current leader. Possible values are `leader`, `follower` and `candidate` (during the election).


## Credentials

Client should use some authentication credentials to prove it’s user ID. The best way is to use [JWT] token generated on the server.

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


## Subprotocol

*Under construction*


**[Next chapter →](./2-action.md)**
