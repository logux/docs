# Actions

Logux actions are very similar to [Redux actions]. It is JSON objects, which describe what was changed in application state. If user do something, you should create action to change the state. State changes will update UI.

For instance, if user press like, your application will create an action like:

```js
{ type: 'like/add', postId: 39678 }
```

When you add action, you can’t change it. If you want to change the data or revert changes, you need to add new action.

There are only 2 mandatory requirements for actions:

1. They must have `type` property with string value.
2. You can use only string, number, boolean, `null`, array and object as values. All values should be serializable to JSON. This is why functions, class instances, `Symbol`, `BigInt` is prohibited.

[Redux actions]: https://redux.js.org/basics/actions


## Recommendations

*Under construction*


## System Actions

Logux has few built-in actions with `logux/` prefix.


### `logux/processed`

```js
{ type: 'logux/processed', id: '1560954012838 380:Y7bysd:O0ETfc 0' }
```

Logux Server response with `logux/processed` when it received and processed the action from the client. `action.id` of `logux/processed` will be equal to `meta.id` of received action.

Logux Server uses [client ID] sends `logux/processed` back to the client. So all browser tabs will receive this action from the server.

[client ID]: ./1-node.md#cross-tab-communication


### `logux/undo`

```js
{ type: 'logux/undo', id: '1560954012838 380:Y7bysd:O0ETfc 0', reason: 'error' }
```

This action ask clients to revert action. `action.id` will be equal to `meta.id` of reverted action.

Logux Server sends this action on any error during action processing. In this case `logux/processed` will not be sent.

Developer can create `logux/undo` in any moment on the server even after `logux/processed` was sent.

<details open><summary><b>Logux Server</b></summary>

```js
  process (ctx, action, meta) {
    server.undo(meta, 'too late')
  }
```

</details>
<details><summary><b>Logux Rails</b></summary>

```ruby
Logux.undo(meta, reason: 'too late')
```

</details>

Clients can also create `logux/undo` to revert action and ask other clients to revert it (if server allows it).

<details open><summary><b>Redux client</b></summary>

```js
store.dispatch.sync({ type: 'logux/undo', id: meta.id, reason: 'too late' })
```

</details>
<details><summary><b>Logux client</b></summary>

```js
client.add({ type: 'logux/undo', id: meta.id, reason: 'too late' }, { sync: true })
```

</details>

`action.reason` describes the reason of reverting. There are only two build-in values: `denied` if `access()` callback was not passed on the server and `error` on error during processing. Developers can use any other `reason`.


### `logux/subscribe`

```js
{ type: 'logux/subscribe', channel: 'users/380' }
```

Clients use this action to subscribe to channel. Next we will have [special chapter] about channels and subscriptions.

Developers can define additional custom properties in subscribe action:

```js
{ type: 'logux/subscribe', channel: 'users/380', fields: ['name'] }
```

[special chapter]: ./5-subscription.md


### `logux/unsubscribe`

```js
{ type: 'logux/unsubscribe', channel: 'users/380' }
```

Of course, clients has also an action to unsubscribe from channels. It can has additional custom properties as well.


## Adding Actions

*Under construction*


## Removing Actions

*Under construction*


## Synchronization

*Under construction*


## Events

*Under construction*

**[Next chapter →](./3-meta.md)**
