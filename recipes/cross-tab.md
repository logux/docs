# Cross-Tab Communication with Logux

We created Logux with thoughts that good UX means that user has the same state in every browser tab. If the user added a product to Shopping Cart in one browser tab, it would see the same product in another tab.

To archive that UX on client-side Logux separated all [actions] into two categories:
1. **Cross-tab actions:** any changes in the global state. If the user changes a document or adds a comment, it should be a cross-tab action.
2. **Tab-specific action:** everything related to the current context. For instance, open or close menu, start an animation, etc.

Logux will synchronize all cross-tab actions between all opened tabs.

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

</details>
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

</details>

[actions]: ../guide/concepts/action.md


## New Tab

Note that if a user opens a new tab, Logux will not load action from another tab. A new tab will load the latest state only in two cases:

1. You use persistent log store on the client-side like
   [`IndexedStore`](/web-api/#indexedstore).
2. The new tab loads the latest state from the server with [subscriptions].

[subscriptions]: ../guide/concepts/subscription.md


## Server Actions

By default, all actions that came from a server are **cross-tab** action. All tabs will receive actions from the server, even if only a single tab subscribed to them.

All actions, which the client sends to the server, is cross-tab actions too.

<details open><summary>Redux client</summary>

```js
// All tabs will receive this action
dispatch.sync({ type: 'USERS/RENAME', id, name })
```

</details>
<details><summary>Pure JS client</summary>

```js
// All tabs will receive this action
client.log.add({ type: 'USERS/RENAME', id, name }, { sync: true })
```

</details>

We recommend you to create [reducers] with thinking about it. For instance, the reducer should ignore the “rename user” action if there is no user in the tab’s state.

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
