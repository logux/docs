# Actions

Logux actions are very similar to [Redux actions]. It is JSON objects, which describe what was changed in application state. If user do something, you should create action to change the state. State changes will update UI.

For instance, if user press like, your application will create an action like:

```js
{ type: 'like/add', postId: 39678 }
```

Actions are immutable. You can’t change added action. If you want to change the data or revert changes, you need to add new action.

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


## Adding Actions on the Client

Adding actions to the log is the only way to change [application state] in Logux. Log is append-only. You can add action, but can’t change added action or change the state by removing actions from the log.

<details open><summary><b>Redux client</b></summary>

There are four ways to add action to Logux Redux.

1. The **standard Redux** way to dispatch actions. It adds local action. Action will *not* be sent to server or another browser tab. There is no way to set action’s meta in this method.

   ```js
   store.dispatch(action)
   ```

   This way is the best for small UI states, like opened/closed menu state.

2. **Local action with metadata**. It adds local action. Action will *not* be sent to server or another browser tab. Compare to standard Redux way with `dispatch.local` you can set action’s meta.

   ```js
   store.dispatch.local(action)
   store.dispatch.local(action, meta)
   ```

3. **Cross-tab action.** It sends action to all tabs in this browser.

   ```js
   store.dispatch.crossTab(action)
   store.dispatch.crossTab(action, meta)
   ```

   This method is the best to work with local data like client settings, which you will save to `localStorage`.

4. **Send to server.** It sends action to the server *and* all tabs in this browser.

   ```js
   store.dispatch.sync(action)
   store.dispatch.sync(action, meta)
   ```

   This method is the best for working with models. For instance, when user add new comment or changed the post.

</details>
<details><summary><b>Logux client</b></summary>

1. **Local action.** Action will *not* be sent to server or another browser tab.

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

   This method is the best for working with models. For instance, when user add new comment or changed the post.

</details>

[application state]: ./4-state.md
[reasons]: ./6-reasons.md


## Sending Actions from Client to Server

When you added new action to the log, Logux will update application state and will try to send the action to the server in background. If client doesn’t have Internet connection right now, Logux will keep the action in the memory and will send action to the server automatically, when client will get the connection.

We recommend to use Optimistic UI: do not show loaders when you change data (save the form and press a Like button).

<details open><summary><b>Redux client</b></summary>

```js
dispatch.sync({ type: 'likes/inc', postId })
```

</details>
<details><summary><b>Logux client</b></summary>

```js
client.log.add({ type: 'likes/inc', postId }, { sync: true })
```

</details>

You can use `@logux/client/badge` or `@logux/client/status` to show small notice if changes was not saved to server and Logux waiting for Internet connection.

<details open><summary><b>Redux client</b></summary>

```js
import badge from '@logux/client/badge'
import badgeStyles from '@logux/client/default'
import badgeText from '@logux/client/en'

badge(store.client, { messages: badgeMessages, styles: badgeStyles })
```

</details>
<details><summary><b>Logux client</b></summary>

```js
import badge from '@logux/client/badge'
import badgeStyles from '@logux/client/default'
import badgeText from '@logux/client/en'

badge(client, { messages: badgeMessages, styles: badgeStyles })
```

</details>

But, of course, you can use pessimistic UI too for critical actions like payment:

<details open><summary><b>Redux client</b></summary>

```js
showLoader()
dispatch.sync({ type: 'likes/inc', postId }).then(() => {
  hideLoader()
}).catch(() => {
  showError()
})
```

</details>
<details><summary><b>Logux client</b></summary>

```js
const waiting = { }
client.log.on('add', action => {
  if (action.type === 'logux/processed' && waiting[action.id]) {
    waiting[action.id].resolve()
    delete waiting[action.id]
  } else if (action.type === 'logux/undo' && waiting[action.id]) {
    waiting[action.id].reject()
    delete waiting[action.id]
  }
})

showLoader()
client.log.add({ type: 'likes/inc', postId }, { sync: true }).then(meta => {
  waiting[meta.id] = {
    resolve: hideLoader,
    reject: showError
  }
})
```

</details>

By default, Logux will forget all unsaved actions if user will close the browser before getting the Internet. You can change log store to `@logux/client/indexed-store` or you can show warning to prevent closing browser:

```js
import confirm from '@logux/client/confirm'
confirm(store.client)
```

</details>
<details><summary><b>Logux client</b></summary>

```js
import confirm from '@logux/client/confirm'
confirm(client)
```


## Permissions Check

Logux Server will reject any action if it was not explicitly allowed by developer:

<details open><summary><b>Logux Server</b></summary>

```js
server.type('likes/inc', () => {
  async access (ctx, action, meta) {
    let user = db.findUser(ctx.userId)
    return !user.isTroll && user.canRead(action.postId)
  },
  …
})
```

</details>
<details><summary><b>Logux Rails</b></summary>

```ruby
# app/logux/policies/channels/likes.rb
module Policies
  module Channels
    class Likes < Policies::Base
      def inc?
        user = User.find(user_id)
        !user.troll? && user.can_read? action[:postId]
      end
    end
  end
end
```

</details>

If server refused the action, server will send `logux/undo` action with `reason: 'denied'` and Logux Redux will remove action from history and replay application state.

If server accepted the action, it will re-send this action to all clients subscribed to some channel, or to specific clients by `userId` or `clientId`.

<details open><summary><b>Logux Server</b></summary>

```js
server.type('likes/inc', () => {
  …
  resend (ctx, action, meta) {
    return { channel: `posts/${ action.postId }` }
  },
  …
})
```

</details>
<details><summary><b>Logux Rails</b></summary>

*Under construction. Until `resend` will be implemented in gem.*

</details>

Then server will accept the action to database.


## Adding Actions on the Server

Server adds actions to it’s log to send these actions to clients. So, in most of the cases, you need to specify in action’s meta who is receiver of these actions.

* `meta.channels` sends action to all clients subscribed to any of listed channels.
* `meta.clients` sends action to clients with listed client IDs.
* `meta.users` sends action to clients with listed user IDs.
* `meta.nodes` sends action to clients with listed node IDs.

<details open><summary><b>Logux Server</b></summary>

The most universal way is:

```js
someService.on('error', () => {
  server.log.add({ type: 'someService/error' }, { channels: ['admins'] })
})
```

However, in most of the cases, you will use `ctx.sendBack` shortcut, which is available in `server.type()` and `server.channel()` callbacks.

```js
server.channel('user/:id', {
  …
  async init (ctx, action, meta) {
    ler user = await db.first('users', { id: ctx.params.id })
    ctx.sendBack({ type: 'users/add', user })
  }
})
```

</details>
<details><summary><b>Logux Rails</b></summary>

```ruby
some_service.on(:error) do
  Logux.add({ type: 'someService/error' }, { channels: ['admins'] })
end
```

*Under construction. Until `send_back` will be implemented in gem.*

</details>

[client IDs]: ./1-node.md#node-id


## Sending Actions from Server to Client

When you add new action to the server’s log, server will try to send it
to all connected clients according to `meta.channels`, `meta.users`,
`meta.clients` and `meta.nodes`.

By default, server doesn’t keep actions in the log for offline users to make scaling easy. You can enable keeping action in the log, by setting and removing [`reasons`] on `preadd` and `processed` events. But we recommend to use subscriptions.

Every time client will connect to the server, it sends `logux/subscribe` again. Server can load the latest state from database and send it back.

[`reasons`]: ./6-reason.md


## Client Events

Logux uses [Nano Events] API to add and remove event listener.

<details open><summary><b>Redux client</b></summary>

```js
store.client.on(event, (action, meta) => {
  …
})
```

</details>
<details><summary><b>Logux client</b></summary>

```js
client.on(event, (action, meta) => {
  …
})
```

</details>

Events:

* `preadd`: action is goind to be added to the log. It is a only way to set [`meta.reasons`]. This event will not be called for cross-tab actions added in different browser tab.
* `add`: action was added to the log.
* `clean`: action was removed from the log. It will happen if nobody will set [`meta.reasons`] for new action or you remove all reasons for old action.

[`meta.reasons`]: ./6-reason.md
[Nano Events]: https://github.com/ai/nanoevents/


## Server Events

*Under construction*

**[Next chapter →](./3-meta.md)**
