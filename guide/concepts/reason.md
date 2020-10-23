# Cleaning Log and Action Reasons

Logux uses reasons API for it to clean log from outdated actions.

In real systems, you may have different strategies to keep the action in the log. Development tools may need last 1000 action. Synchronization may require to keep all unsynchronized actions in the log. An application may need action with the latest value of each model field. Reasons API allow you to combine these different strategies.

Every action has an array of string in `meta.reasons`. An application can add or remove reasons of any action.

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

If you add action without reasons, Logux will not even put it to the log. Logux will call `preadd` event, check reasons after, call `add` event, and remove an action from the memory if it doesn’t have any reasons.

```js
// Actions will be removed from the memory
server.log.add(action)
server.log.add(action, { reasons: [] })

// Action will be kept in log until you removed this reason
server.log.add(action, { reasons: ['someReason'] })
```

Logux doesn’t synchronize `reasons` between nodes. The best way to set reasons is `preadd` event listener.

```js
server.log.on('preadd', (action, meta) {
  meta.reasons.push('test')
})
```

You can use `removeReason` API to remove some reason from all action passed some criteria. See [`Log#removeReason`](https://logux.io/redux-api/#log-removereason) API for criteria API.

```js
server.log.removeReason('syncing', { maxAdded: lastSynced })
server.log.removeReason('devtool', { maxAdded: last - 1000 })
```

However, most of Logux implementation has built-in strategies on top of these reasons API.


## `keepLast`

`meta.keepLast` is a shortcut to set a passed string as a reason and remove these reasons from all previous actions. Note that this shortcut will keep reason on the latest action according to `meta.id` and `meta.time`. The latest action could not be the action which you are adding.

```js
// Keep action with latest name
server.log.add(
  { type: 'user/rename', userId: 380, name: 'New name' },
  { keepLast: ['user/380/name'] }
)
```


## Server

By default, Logux Server doesn’t keep any actions in the memory. This is why you should keep all data in the database and get data from the database on every subscription.

If you want a complete event-sourcing system, you can implement a log store in persistent database and define actions cleaning strategy with reasons API and `preadd` event.

## Client

<details open><summary>Redux client</summary>

By default, Logux Redux will keep last 1000 actions without explicit `meta.reasons`.

```js
// Logux Redux will keep 1000 actions without defined reasons
store.dispatch.crossTab(action)

// Logux Redux will not keep this action since we define reasons manually
store.dispatch.crossTab(action, { reasons: [] })
```

You can change actions limit by `reasonlessHistory` option in `createStoreCreator`.

If Logux Redux needs cleaned action from time travel, it will call `onMissedHistory` callback. You can ask a user to reload the page or load the latest data state from the server because time travel can’t guarantee the result in this case.

```js
let createStore = createStoreCreator(client, {
  …,
  onMissedHistory (action) {
    if (CRITICAL_ACTIONS.includes(action.type)) {
      store.dispatch.sync({ type: 'reload/state' }) // Ask server for latest state
    }
  }
})
```

Logux Redux keeps last 1000 action by setting `timeTravel` and `timeTravelTab…` reasons for new actions. If you want to specify reasons manually, you should set reasons in `preadd` event and set `noAutoReason` meta key:

```js
store.log.type('user/rename', (action, meta) => {
  meta.noAutoReason = true
  meta.keepLast = `user/${ action.userId }/name`
}, 'preadd')
```

</details>
<details><summary>Vuex client</summary>

By default, Logux Vuex will keep last 1000 actions without explicit `meta.reasons`.

```js
// Logux Vuex will keep 1000 actions without defined reasons
store.commit.crossTab(action)

// Logux Vuex will not keep this action since we define reasons manually
store.commit.crossTab(action, { reasons: [] })
```

You can change actions limit by `reasonlessHistory` option in `createStoreCreator`.

If Logux Vuex needs cleaned action from time travel, it will call `onMissedHistory` callback. You can ask a user to reload the page or load the latest data state from the server because time travel can’t guarantee the result in this case.

```js
let client = new CrossTabClient({ … })
let createStore = createStoreCreator(client, {
  onMissedHistory (action) {
    if (CRITICAL_ACTIONS.includes(action.type)) {
      store.commit.sync({ type: 'reload/state' }) // Ask server for latest state
    }
  }
})
```

Logux Vuex keeps last 1000 action by setting `timeTravel` and `timeTravelTab…` reasons for new actions. If you want to specify reasons manually, you should set reasons in `preadd` event and set `noAutoReason` meta key:

```js
store.log.type('user/rename', (action, meta) => {
  meta.noAutoReason = true
  meta.keepLast = `user/${ action.userId }/name`
}, 'preadd')
```

</details>
<details><summary>Pure JS client</summary>

By default, Logux Client keeps actions with `meta.sync`, which was not synchronized yet.

Logux Client is low-level API. If you do not want to have a deal with complicated reasons API, Logux Redux or Logux Vuex is a better option.

</details>

[Next chapter](./subprotocol.md)
