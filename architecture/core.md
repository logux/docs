# Core Concepts of Logux

Logux synchronizes action log between peer-to-peer nodes.

You can use Logux to connect clients with a server, clients with clients,
servers with servers or for mesh-networks. There is no big difference between
clients and server in Logux. So we will call them **nodes**.

```haskell
[Client 1] ⇆ [Client 2] ⇆ [Server A] ⇆ [Server B]
```

However, Logux was created for standard applications with multiple
web and mobile clients and several servers. Next chapter read will show
how core concepts work in standard case.

Each node has **action** log (list of operations). Every time, when you want
to change application state, you add an action to the log. Action is a JSON
object that describes what happened. Every action must have `type` property.

```js
{ type: 'user/rename' userId: 386, name: 'New name' }
```

You can only add new action to the **log** (append-only log).
You can’t change old action or you can’t remove action
to change application state. However, you can clean (or compress) log
from old actions, if they are not actual anymore. For instance, if you rename
user to `A` and then remove to `B`, you can clean log from `A` action.

```js
app.log.add(action)
```

Each action in the log has own **meta**. It contains:

* `meta.id`: unique action ID.
* `meta.time`: action creation time. It uses local client’s time
  and so could be different on different client.
* `meta.reasons`: array of the strings. Each string is a code for some “reason”
  why action is still actual. When application will remove all reasons,
  Logux will clean action from the log.
* Application could add own data to **meta** depends on its needs.

```js
[action, {
  // Core meta
  id: '1553821137583 388:mgxhClZT:mAKgAtBF 0',
  time: 1553821137582,
  reasons: ['user:388:lastName'],
  // Custom meta
  channels: ['users/388']
}]
```

Differences between action and meta:

* **Actions are immutable.** You can’t change action if it was put to the log.
  But you can change meta (except `meta.id`).
* Logux synchronize actions, but **only few keys of meta will be synchronized**.
  Each Logux implementation decides what meta keys it will synchronize.

Nodes can be connected to other nodes with any way that you want.
**Web Socket** is only default way.

During the synchronization Logux **guarantee**:

* Each action will be synchronized **only once**.
* Action will have **the same order** on each nodes.

When node creates action, it applies it immediately to own application state.
In the background Logux will synchronize this new action with another nodes.
It calls **Optimistic UI**.

If your task requires approve from other node (e.g., “server”)
you can create `payment/ask` action on “client” node, wait until this action
will be synchronized to the “server” node and server will create
`payment/done` action and synchronized it back.
