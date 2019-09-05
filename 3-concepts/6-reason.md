# Cleaning Log and Action Reasons

Logux uses reasons API for it to clean log from outdated actions.

In real systems you may have different strategies to keep action in the log. Development tools may need last 1000 action. Synchronization may require to keep all unsynchronized actions in the log. Application may need action with latest value of each model field. Reasons API allow you to combine these different strategies.

Every action has ann array of string in `meta.reasons`. Application can add or remove reasons of any action.

```js
meta.reasons //=> ['syncing', 'devtool']
```

When you remove all reasons from the action, Logux removes it from the log:

```js
// Will delete action with this ID
server.log.changeMeta(meta.id, { reasons: [] })
```

When Logux cleans event it call `clean` event listeners:

```js
server.log.on('clean', (action, meta) => {
  console.log('Action was cleaned', action, meta)
})
```

If you add action without reasons, Logux will not even put it to the log. Logux will call `preadd` event, check reasons after, call `add` event and remove action from the memory if it doesn’t have any reasons.

```js
// Actions will be removed from the memory
server.log.add(action)
server.log.add(action, { reasons: [] })

// Action will be kept in log until you removed this reason
server.log.add(action, { reasons: ['someReason'] })
```

Logux doesn’t sysynchronize `reasons` between nodes. This is why the best way to set reasons is `preadd` event listener.

```js
server.log.on('preadd', (action, meta) {
  meta.reasons.push('test')
})
```

You can use `removeReason` API to remove some reason from all action passed some criteria. See `@logux/core/log` API for criteria API.

```js
server.log.removeReason('syncing', { maxAdded: lastSynced })
server.log.removeReason('devtool', { maxAdded: last - 1000 })
```

However, most of Logux implementation has built-in strategies on top of this reasons API.


## `keepLast`

`meta.keepLast` is a shortcut to set passed string as a reason and remove this reasons from all previous actions. Note that this shortcut will keep reason on latest action according to `meta.id` and `meta.time`. Latest action could not be the action which you are adding.

```js
// Keep action with latest name
server.log.add(
  { type: 'user/rename', userId: 380, name: 'New name' },
  { keepLast: ['user/380/name'] }
)
```


## Server

By default, Logux Server doesn’t keep any actions in the memory. This is why you should keep all data in database and get data from dadatabase on every subscription.

If you want a complete event-sourcing system, you can implement log store in persistant database and define actions cleaning strategy with reasons API and `preadd` event.


## Logux Client

By default, Logux Client keeps actions with `meta.sync`, which was not synchronized yet.

Logux Client is low-level API. If you do not want to have deal with complicated reasons API, Logux Redux is a better option.


## Logux Redux

By default, Logux Redux will keep last 1000 action without explicit `meta.reasons`.

```js
// Logux Redux will 1000 action without defined reasons
store.dispatch.crossTab(action)

// Logux Redux will not keep this actiom since we define reasons manually
store.dispatch.crossTab(action, { reasons: [] })
```

You can change actions limit by `reasonlessHistory` option in `createLoguxCreator`.

If Logux Redux will need cleaned action from time travel, it will call `onMissedHistory` callback. You can ask user to reload page or load latest data state from the server, becaue time travel can’t guarantee the result in this case.

```js
let store = createLoguxCreator({
  …,
  onMissedHistory (action) {
    if (CRITICAL_ACTIONS.includes(action.type)) {
      store.dispatch.sync({ type: 'reload/state' }) // Ask server for latest state
    }
  }
})
```

**[Next chapter →](./7-subprotocol.md)**
