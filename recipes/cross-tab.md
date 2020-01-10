# Cross-Tab Communication with Logux

We created Logux with thoughts that good UX means that user have the same state in every browser tab. If user added product to Shopping Cart in one browser tab, it will see the same produc in another tab.

To archive that UX on client-side Logux separated all [actions] into 2 categories:
1. **Cross-tab actions:** any changes of global state. If user change some document or add comment it should be a cross-tab action.
2. **Tab-specific action:** everything related to current context. For instance, open or close menu, start animation, etc.

Logux will synchronize all cross-tab actions between all openned tabs.

<details open><summary>Redux client</summary>

In Redux client `dispatch()` and `dispatch.local()` create tab-specific actions:

```js
// This action will be seen only in current tab
dispatch({ type: 'menu/open' })
```

`dispatch.sync()` creates cross-tab action and send it to the server. `dispatch.crossTan()` creates cross-tab action without sending it to the server.

```js
// All tabs will receive this action
dispatch.crossTab({ type: 'notification/close' })
```

</detailt>
<details><summary>Pure JS client</summary>

In pure JS Logux Client all actions are cross-tab by default.

```js
// All tabs will receive this action
client.log.add({ type: 'notification/close' })
```

You need to set `meta.tab` with `client.id` to create tab-specific action:

```js
// Only this client (this tab) will receive this action
client.log.add({ type: 'menu/open' }, { tab: client.id })
```

</detailt>

[actions]: ../guide/concepts/action.md


## New Tab

Note, that if user will open a new tab, Logux will not load action from other tab. New tab will load latest state only in two cases:

1. You use persistance log store on the client-side like
   [`IndexedStore`](/web-api/#indexedstore).
2. New tab loads latest state from the server with [subscriptions].

[subscriptions]: ../guide/concepts/subscription.md


## Server Actions

By default, all actions came from server are **cross-tab** action. All tabs will receive actions from the server, even if only single tab subscribed for them.

All actions, which client send to the server is cross-tab actions too.

<details open><summary>Redux client</summary>

```js
// All tabs will receive this action
dispatch.sync({ type: 'USERS/RENAME', id, name })
```

</detailt>
<details><summary>Pure JS client</summary>

```js
// All tabs will receive this action
client.log.add({ type: 'USERS/RENAME', id, name }, { sync: true })
```

</detailt>

We recommend you to create [reducers] with thinking about it. For instance, reducer should ignore “rename user” action if there if no this user in tab’s state.

```js
export default function reduceUsers(state = { }, action) {
  if (action.type === 'users/rename') {
    const user = state[action.id]
    if (user) {
      return { ...state, [action.id]: { ...user, name: action.name } }
    } else {
      return state
    }
  }
}
```

[reducers]: ../guide/concepts/state.md
