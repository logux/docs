# Meta

Logux stores metadata for every [action] in separated object:

```js
log = [
  [action1, meta1],
  [action2, meta2],
  …
]
```

Meta contains Logux-related data. It should not contain anything related to application state.

Meta has unique action’s ID, creating time, processing status and many other things. Meta is open structure, applications can set custom keys to meta object.

```js
{
  added: 5,
  id: "1564508138460 380:R7BNGAP5:px3-J3oc 0",
  reasons: ['amplifr/lastPrices'],  ​
  subprotocol: '0.6.2',
  time: 1564508138460
}
```

[application state]: ./4-state.md
[action]: ./2-action.md


## Setting Meta

Most of methods to add action accept meta as second arguments:

```js
store.dispatch.sync(action, meta)
client.log.add(action, meta)
server.log.add(action, meta)
ctx.sendBack(action, meta)
```

Logux Redux has the only method without meta argument: `store.dispatch(action)`. Use `store.dispatch.local(action, meta)` to set meta for local-tab actions.


## Changing Meta

In Logux architecture, you can change application state only by adding new action to the log. This is why you can’t change action or action’s order.

Since meta doesn’t contain anything related to application state, you can change meta if it will not affect action’s order.

<details open><summary><b>Redux client</b></summary>

```js
store.log.changeMeta(actionId, {
  reasons: []
})
```

</details>
<details><summary><b>Logux client</b></summary>

```js
client.log.changeMeta(actionId, {
  reasons: []
})
```

</details>

You can not change meta’s keys related to action’s order: `id`, `time`, `added`.


## Meta Synchronization

Logux synachronizes only 3 meta’s keys:

* `id`
* `time`, but it will be changed to fix time difference between client and server
* `subprotocol`

All other meta keys are local and both server and client do not send them.


## ID and Time

Each action has unique ID. This ID is unique on all machines.

```js
"1564508138460 380:R7BNGAP5:px3-J3oc 0"
```

To generate ID unique across all nodes in Logux cluster, Logux combines 3 values:

* `1564508138460`: local timestamp on the node, which generate the action.
* `380:R7BNGAP5:px3-J3oc`: [unique ID] of node, which generate the action.
* `0` is a counter for the case, when node will generate several actions during the same timestamp.

```js
log.generateId() //=> "1564508138460 380:R7BNGAP5:px3-J3oc 0"
log.generateId() //=> "1564508138460 380:R7BNGAP5:px3-J3oc 1"
log.generateId() //=> "1564508138461 380:R7BNGAP5:px3-J3oc 0"
```

In real world, every node will have own time. For instance, user could set wrong time on own phone. This is why you should not use `meta.id` as a time. Logux has special `meta.time`, which will use time of current node. During the connection client and server will calculate time difference between them and change `meta.time` during synchronization. As result, `meta.time` could be different on different nodes.

```js
const time = new Date(meta.time) //=> Date 2019-07-30T17:35:38.460Z
```

`meta.time` is a timestamp. Few actions can have the same `meta.time` if these actions was generated very fast in the same millisecond. Logux has `isFirstOlder` helper, which uses both `meta.time` and `meta.id` to always be sure what action was generated later.

```js
import isFirstOlder from '@logux/core/is-first-older'

if (isFirstOlder(meta1, meta2)) {
  lastName = action1.name
} else {
  lastName = action2.name
}
```

[node ID]: ./1-node.md#node-id


## Common Meta Keys

*Under construction*


## Client Meta Keys

*Under construction*


## Server Meta Keys

*Under construction*

**[Next chapter →](./4-state.md)**
