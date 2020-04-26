# Actions

Logux actions are very similar to [Redux actions]. JSON objects describe what was changed in the [application state]. If the user does something, the client should create action to change the state. State changes will update UI.

For instance, if user press Like button, your application will create an action:

```js
{ type: 'like/add', postId: 39678 }
```

Actions are immutable. You can’t change action. If you want to change the data or revert changes, you need to add a new action.

There are only two mandatory requirements for actions:

1. They must have `type` property with a string value.
2. You can use only string, number, boolean, `null`, array, and object as values. All values should be serializable to JSON. This is why functions, class instances, `Symbol`, `BigInt` is prohibited.

[application state]: ./state.md
[Redux actions]: https://redux.js.org/basics/actions


## Atomic Actions

We recommend keeping actions atomic. It means that action should not contain current state. For instance, it is better to generate `likes/add` and `likes/remove` on the client, rather than `likes/set` with the exact number.

The server can send old action made by another user when this client was offline (for instance, other users will set like to the post too). In this case, Logux Redux will revert own recent actions, add old changes from the server, and replay own actions again. As a result, action will be applied again to a different state. Atomic `likes/add` will work great, but non-atomic `likes/set` will override other changes.

You can use CRDT as inspiration to create atomic actions.


## System Actions

Logux has a few built-in actions with `logux/` prefix.


### `logux/processed`

```js
{ type: 'logux/processed', id: '1560954012838 380:Y7bysd:O0ETfc 0' }
```

Logux Server response with `logux/processed` when it received and processed the action from the client. `action.id` of `logux/processed` will be equal to `meta.id` of received action.


### `logux/undo`

```js
{ type: 'logux/undo', id: '1560954012838 380:Y7bysd:O0ETfc 0', reason: 'error' }
```

This action asks clients to revert action. `action.id` will be equal to `meta.id` of reverted action. Logux Server sends this action on any error during action processing. In this case, `logux/processed` will not be sent.

There are 4 standard `reason` values in the action:

* `error`
* `denied`
* `unknownType`
* `wrongChannel`

A developer can create `logux/undo` at any moment on the server even after `logux/processed` was sent.

<details open><summary>Node.js</summary>

```js
server.undo(meta, 'too late')
```

</details>
<details><summary>Django</summary>

```python
class Action(ActionCommand):
    def foo(self):
        self.undo('too late')
```

</details>
<details><summary>Ruby on Rails</summary>

```ruby
Logux.undo(meta, reason: 'too late')
```

</details>

Clients can also create `logux/undo` to revert action and ask other clients to revert it (if the developer allowed to re-send these actions on the server).

<details open><summary>Redux client</summary>

```js
store.dispatch.sync({ type: 'logux/undo', id: meta.id, reason: 'too late' })
```

</details>
<details><summary>Pure JS client</summary>

```js
client.log.add({ type: 'logux/undo', id: meta.id, reason: 'too late' }, { sync: true })
```

</details>

`action.reason` describes the reason for reverting. There are only two build-in values:

* `denied` if `access()` callback on the server was not passed
* `error` on error during processing.

Developers can use any other `reason`.


### `logux/subscribe`

```js
{ type: 'logux/subscribe', channel: 'users/380' }
```

Clients use this action to subscribe to a channel. Next, we will have [special chapter] about channels and subscriptions.

Developers can define additional custom properties in subscribe action:

```js
{ type: 'logux/subscribe', channel: 'users/380', fields: ['name'] }
```

[special chapter]: ./subscription.md


### `logux/unsubscribe`

```js
{ type: 'logux/unsubscribe', channel: 'users/380' }
```

Of course, clients also have an action to unsubscribe from channels. It can have additional custom properties as well.


## Adding Actions on the Client

Adding actions to the log is the only way to change [application state] in Logux. The log is append-only. You can add action, but can’t change added action or change the state by removing actions from the log.

<details open><summary>Redux client</summary>

There are four ways to add action to Logux Redux.

1. The **standard Redux** way to dispatch actions. Action will *not* be sent to the server or another browser tab. There is no way to set action’s meta in this method.

   ```js
   store.dispatch(action)
   ```

   This way is the best for small UI states, like to open/close menu.

2. **Local action with metadata**. Action will *not* be sent to the server or another browser tab. Compare to standard Redux way, `dispatch.local` can set action’s meta.

   ```js
   store.dispatch.local(action, meta)
   ```

3. **Cross-tab action.** It sends action to all tabs in this browser.

   ```js
   store.dispatch.crossTab(action)
   store.dispatch.crossTab(action, meta)
   ```

   This method is the best for local data like client settings, which you will save to `localStorage`.

4. **Server actions.** It sends action to the server *and* all tabs in this browser.

   ```js
   store.dispatch.sync(action)
   store.dispatch.sync(action, meta)
   ```

   This method is the best for models. For instance, when the user adds a new comment or changed the post.

</details>
<details><summary>Pure JS client</summary>

1. **Local action.** Action will *not* be sent to the server or another browser tab.

   ```js
   client.log.add(action, { tab: client.id })
   ```

   This way is the best for small UI states, like opened/closed menu state.

2. **Cross-tab action.** It sends action to all tabs in this browser.

   ```js
   client.log.add(action, meta)
   ```

   This method is the best to work with local data like client settings, which you will save to `localStorage`.

3. **Send to server.** It sends action to the server *and* all tabs in this browser.

   ```js
   client.log.add(action, { sync: true })
   ```

   This method is the best for working with models. For instance, when the user adds a new comment or changed the post.

</details>


## Sending Actions to Another Browser Tab

<details open><summary>Redux client</summary>

Actions added by `dispatch.sync()` and `dispatch.crossTab()` will be visible to all browser tabs.

```js
// All browser tabs will receive these actions
store.dispatch.crossTab(action)
store.dispatch.sync(action)

// Only current browser tab will receive these actions
store.dispatch(action)
store.dispatch.local(action)
```

`store.client.log.on('add', fn)` will not see cross-tab actions. You must set listeners by `store.client.on('add', fn)`. Reducers will see cross-tab actions, you do not need to do anything.

</details>
<details><summary>Pure JS client</summary>

Any action without explicit `meta.tab` will be sent to all browser tabs.

```js
// All browser tabs will receive this action
client.log.add(action)

// Only current browser tab will receive this action
client.log.add(action, { tab: client.tabId })
```

`client.log.on('add', fn)` will not see cross-tab actions. You must set listeners by `client.on('add', fn)`.

</details>


## Sending Actions from Client to Server

When you added a new action to the log, Logux will update the application state and will try to send the action to the server in the background. If the client doesn’t have an Internet connection, Logux will keep the action in the memory and will send action to the server automatically, when the client gets the connection.

We recommend to use Optimistic UI: do not show loaders when a user changed data (save the form and press a Like button).

<details open><summary>Redux client</summary>

```js
store.dispatch.sync({ type: 'likes/add', postId })
```

</details>
<details><summary>Pure JS client</summary>

```js
client.log.add({ type: 'likes/add', postId }, { sync: true })
```

</details>

You could use [`badge()`](https://logux.io/redux-api/#globals-badge) or [`status()`](https://logux.io/redux-api/#globals-status) to show small notice if Logux is waiting for an Internet to save changes.

<details open><summary>Redux client</summary>

```js
import { badge, badgeEn } from '@logux/client'
import { badgeStyles } from '@logux/client/badge/styles'

badge(store.client, { messages: badgeMessages, styles: badgeStyles })
```

</details>
<details><summary>Pure JS client</summary>

```js
import { badge, badgeEn } from '@logux/client'
import { badgeStyles } from '@logux/client/badge/styles'

badge(client, { messages: badgeEn, styles: badgeStyles })
```

</details>

But, of course, you can use “pessimistic” UI for critical actions like payment:

<details open><summary>Redux client</summary>

```js
showLoader()
dispatch.sync({ type: 'likes/add', postId }).then(() => {
  hideLoader()
}).catch(() => {
  showError()
})
```

</details>
<details><summary>Pure JS client</summary>

```js
const waiting = { }
client.on('add', action => {
  if (action.type === 'logux/processed' && waiting[action.id]) {
    waiting[action.id].resolve()
    delete waiting[action.id]
  } else if (action.type === 'logux/undo' && waiting[action.id]) {
    waiting[action.id].reject()
    delete waiting[action.id]
  }
})

showLoader()
client.log.add({ type: 'likes/add', postId }, { sync: true }).then(meta => {
  waiting[meta.id] = {
    resolve: hideLoader,
    reject: showError
  }
})
```

</details>

By default, Logux will forget all unsaved actions if the user will close the browser before getting the Internet. You can change the log store to [`IndexedStore`](https://logux.io/redux-api/#indexedstore) or you can show a warning to prevent closing browser:

```js
import { confirm } from '@logux/client'
confirm(store.client)
```

</details>
<details><summary>Pure JS client</summary>

```js
import { confirm } from '@logux/client'
confirm(client)
```

</details>


## Permissions Check

Logux Server rejects any action if it was not explicitly allowed by developer:

<details open><summary>Node.js</summary>

```js
server.type('likes/add', {
  async access (ctx, action, meta) {
    let user = db.findUser(ctx.userId)
    return !user.isTroll && user.canRead(action.postId)
  },
  …
})
```

</details>
<details><summary>Django</summary>

```python
class AddLikesAction(ActionCommand):

    action_type = 'likes/add'

    def access(self, action: Action, meta: Meta) -> bool:
        user = User.objects.get(pk=meta.user_id)
        return not user.is_troll and user.can_read(action['postId'])
```

</details>
<details><summary>Ruby on Rails</summary>

```ruby
# app/logux/policies/channels/likes.rb
module Policies
  module Channels
    class Likes < Policies::Base
      def add?
        user = User.find(user_id)
        !user.troll? && user.can_read? action[:postId]
      end
    end
  end
end
```

</details>

If server refused the action, it would send `logux/undo` action with `reason: 'denied'`. Logux Redux would remove the action from history and replay application state.

Then the server send actions to all channels and clients from next `resend` step. In the same time it will accept the action to the database. When changes are saved, the server will send `logux/process` action back to the client.


## Sending Received Action to Clients

In special callback, server marks who will receive the actions. For instance, if Alice wrote a message to the chat, server will mark her actions to be send to call users in subscribed to this chat room.

* `channels` or `channel`: clients subscribed to any of the listed channels.
* `clients` or `client`: clients with listed client IDs.
* `users` or `users`: clients with listed user IDs.
* `nodes` or `nodes`: clients with listed node IDs.

<details open><summary>Node.js</summary>

```js
server.type('likes/add', {
  …
  resend (ctx, action, meta) {
    return { channel: `posts/${ action.postId }` }
  },
  …
})
```

</details>
<details><summary>Django</summary>

```python
class AddLikesAction(ActionCommand):
    action_type = 'likes/add'

    def resend(self, action: Action, meta: Optional[Meta]) -> Dict:
        return {'channels': [f'posts/{action["postId"]}']}
```

</details>
<details><summary>Ruby on Rails</summary>

*Under construction. Until `resend` will be implemented in the gem.*

</details>


## Changing Database According to Action

In last callback server changes database according to the new action.

<details open><summary>Node.js</summary>

```js
server.type('likes/add', {
  …
  async process (ctx, action, meta) {
    await db.query(
      'UPDATE posts SET like = like + 1 WHERE post.id = ?', action.postId
    )
  }
})
```

</details>
<details><summary>Django</summary>

```python
class AddLikesAction(ActionCommand):
    action_type = 'likes/add'

    def process(self, action: Action, meta: Optional[Meta]) -> None:
        post = Post.objects.get(pk=action['postId'])
        post.likes += 1
        post.save()
```

</details>
<details><summary>Ruby on Rails</summary>

*Under construction. Until `resend` will be implemented in the gem.*

</details>


## Adding Actions on the Server

The server adds actions to its log to send these actions to clients. There are four ways to specify receivers of new action:

* `meta.channels` or `meta.channel`: clients subscribed to any of listed channels.
* `meta.clients` or `meta.client`: clients with listed client IDs.
* `meta.users` or `meta.users`: clients with listed user IDs.
* `meta.nodes` or `meta.nodes`: clients with listed node IDs.

<details open><summary>Node.js</summary>

The most universal way is:

```js
someService.on('error', () => {
  server.log.add({ type: 'someService/error' }, { channels: ['admins'] })
})
```

But, in most of the cases, you will use `ctx.sendBack` shortcut. It sets `meta.client` to `ctx.clientId`.

```js
server.channel('user/:id', {
  …
  async load (ctx, action, meta) {
    ler user = await db.first('users', { id: ctx.params.id })
    ctx.sendBack({ type: 'users/add', user })
  }
})
```

</details>
<details><summary>Ruby on Rails</summary>

```ruby
some_service.on(:error) do
  Logux.add({ type: 'someService/error' }, { channels: ['admins'] })
end
```

*Under construction. Until `send_back` will be implemented in the gem.*

</details>


## Sending Actions from Server to Client

When you add a new action to the server’s log, the server will try to send it
to all connected clients according to `meta.channels`, `meta.users`,
`meta.clients` and `meta.nodes`.

By default, the server doesn’t keep actions in the log for offline users to make scaling easy. You can change it by setting [`reasons`] on `preadd` and removing it `processed` events.

We recommend to use subscription rather than working with `reasons`. Every time a client will connect to the server, it sends `logux/subscribe` again. The server can load the latest state from the database and send it back.

[`reasons`]: ./reason.md


## Events

Logux uses [Nano Events] API to add and remove event listener.

<details open><summary>Redux client</summary>

```js
store.client.on(event, (action, meta) => {
  …
})
```

</details>
<details><summary>Pure JS client</summary>

```js
client.on(event, (action, meta) => {
  …
})
```

</details>

Events:

* `preadd`: action is going to be added to the log. It is the only way to set [`meta.reasons`]. This event will not be called for cross-tab actions added in a different browser tab.
* `add`: action was added to the log. Do not use `client.log.on('add', fn)`. Use only `client.on('add', fn)` to get cross-tab actions.
* `clean`: action was removed from the log. It will happen if nobody will set [`meta.reasons`] for new action or you remove all reasons for old action.

See [`Server#on`](https://logux.io/node-api/#server-on) API docs for server events.

[`meta.reasons`]: ./reason.md
[Nano Events]: https://github.com/ai/nanoevents/

[Next chapter](./meta.md)
