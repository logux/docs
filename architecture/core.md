# Core Concepts of Logux

Core idea of Logux is to synchronize action log between peer-to-peer nodes.

There is no big difference between clients and server in Logux architecture.
This is why in Logux documentation we will call them both as **nodes**.

Each node has **action** log (list of operations). Every time, when you want
to change application state, you add a action to this log.
Action is a JSON object that describes what happened.
There is only one requirement: every action must have `type` property.

```js
{ type: 'user/rename' userId: 386, name: 'New name' }
```

You can only add new action to the **log** (append-only log).
You can’t change old action or you can’t remove action
to change application state. However, you can clean (or compress) log
from old actions, if they are not actual anymore. For instance, if you rename
user to `A` and then remove to `B`, you can clean log from `A` action.

Each action in the log has own **meta**. It contains:

* `meta.id`: unique action ID.
* `meta.time`: action creation time. It uses local client’s time
  and so could be different on different client.
* `meta.reasons`: array of the strings. Each string is a code for some “reason”
  why action is still actual. When application will remove all reasons,
  Logux will clean action from the log.
* Application could add own data to **meta** depends on its needs.

Differences between action and meta:

* **Actions are immutable.** You can’t change action if it was put to the log.
  But you can change meta (except `meta.id`).
* Logux synchronize actions, but **only few keys of meta will be synchronized**.
  Each Logux implementation decides what meta keys it will synchronize.

Nodes can be connected to other nodes with any way that you want.
**Web Socket** is only default way.

When node creates action, it applies it immediately to own application state.
In the background Logux will synchronize this new action with another nodes.
It calls **Optimistic UI**.

Nodes can apply some filter and synchronize only specific actions.

During the synchronization Logux **guarantee**:

* Each action will be synchronized **only once**.
* Action will have **the same order** on each nodes.
