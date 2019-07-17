# Logux Nodes

Logux is based on top of peer-to-peer model, so there is no big difference between client and server. This is why we call both client and server “nodes”. In the web client each browser tab is also independent node.

Logux Core provides `BaseNode` class, which will synchronize actions between two nodes. `ClientNode` and `ServerNode` classes extend this class with small behaviour changes. Client uses this node inside:

<details open><summary><b>Logux client</b></summary>

```js
const client = new CrossTabClient({ … })
client.node //=> ClientNode instance
```

</details>
<details><summary><b>Redux client</b></summary>

```js
const createStore = createLoguxCreator({ … })
const store = createStore(reducer)
store.client.node //=> ClientNode instance
```

</details>

Each node has:

* [Node ID](#node-id)
* [User ID and client ID](#user-id-and-client-id)
* [Log of actions](#log)
* [Synchronization state and tab role](#state-and-role)
* Optional [application subprotocol](#subprotocol)
* Optional [credentials](#credentials)

## Node ID

Each node has unique Node ID. A string like `380:Uf_pPwE4:6K7iYdJH` or `server:iSiqWU5J`.

<details open><summary><b>Logux client</b></summary>

```js
client.node.nodeId //=> "380:Uf_pPwE4:6K7iYdJH"
```

</details>
<details><summary><b>Redux client</b></summary>

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

Node ID uses user ID, client ID and random string by [Nano ID] to be unique. Node ID contains few blocks splitted by `:`.

In `server:iSiqWU5J`:

1. `server` is user ID. Only servers can have this user ID.
2. `iSiqWU5J` is random string by Nano ID.

In `380:Uf_pPwE4:6K7iYdJH`:

1. `380` is user ID.
2. `380:Uf_pPwE4` is client ID. Each browser tab has unique node ID, but every browseer tab in this browser will have the same client ID.
3. `6K7iYdJH` is random string by Nano ID.

[Nano ID]: https://github.com/ai/nanoid/


## User ID and Client ID

Each node has user ID. A string like `380`, `server` or `false`. Only servers can use `server` user ID. User ID `false` was reserved to the cases when user didn’t authenticated yet.

In the web, user can open multiple browser tabs with the same website. Logux client in each browser tab will have unique node ID. Sometimes we need to send a message to all browser tabs on this machine. To do it, we have a client ID. A string like `580:Uf_pPwE4` with user ID and random string from Nano ID.

Mobile clients use user ID as client ID, since they do not have different tabs. Node ID will be like `580:jn1Ws0Iu`. User ID and client ID will be both `580`.

<details open><summary><b>Logux client</b></summary>

```js
const client = new CrossTabClient({ userId: '580', … })
client.node.userId   //=> "580"
client.node.clientId //=> "580:Uf_pPwE4"
client.node.nodeId   //=> "580:Uf_pPwE4:jn1Ws0Iu"
```

</details>
<details><summary><b>Redux client</b></summary>

```js
const createStore = createLoguxCreator({ userId: '580' })
const store = createStore(reducer)
store.client.node.userId   //=> "580"
store.client.node.clientId //=> "580:Uf_pPwE4"
store.client.node.nodeId   //=> "580:Uf_pPwE4:jn1Ws0Iu"
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


## Log

*Under construction*


## State and Role

*Under construction*


## Suprotocol

*Under construction*


## Credentials

*Under construction*


**[Next chapter →](./2-action.md)**
