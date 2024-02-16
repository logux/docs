
# Channels and Subscriptions

Since Logux is a real-time system, subscriptions and channels are the main way to get data from the server. It asks the server to send current data state and re-send all actions with these data changes.

Channel is just a string like `exchange-rate` or `users/14`.

Clients subscribe by sending `logux/subscribe` action to the server. To unsubscribe
you need to send `logux/unsubscribe` with the same channel.

<details open><summary>Redux client</summary>

```js
store.dispatch.sync({ type: 'logux/subscribe', channel: 'users/14' })
store.dispatch.sync({ type: 'logux/unsubscribe', channel: 'users/14' })
```

</details>
<details><summary>Vuex client</summary>

```js
store.commit.sync({ type: 'logux/subscribe', channel: 'users/14' })
store.commit.sync({ type: 'logux/unsubscribe', channel: 'users/14' })
```

</details>
<details><summary>Pure JS client</summary>

```js
client.log.add({ type: 'logux/subscribe', channel: 'users/14' }, { sync: true })
client.log.add({ type: 'logux/unsubscribe', channel: 'users/14' }, { sync: true })
```

</details>

The client remembers all the subscriptions. If the client loses connection, it will re-subscribe to channels again.

When the server receives `logux/subscribe` it will:

1. Check does this user has access to this data.
2. Load the current state from the database.
3. Send actions with current state back to the client.

<details open><summary>Node.js</summary>

```js
server.channel('users/:id', {
  async access (ctx, action, meta) {
    let client = await db.loadUser(ctx.userId)
    return client.hasAccessToUser(ctx.params.id)
  },
  async load (ctx, action, meta) {
    let user = await db.loadUser(ctx.params.id)
    return { type: 'user/add', user }
  }
})
```

</details>
<details><summary>Django</summary>

```python
class UserChannel(ChannelCommand):

    channel_pattern = r'^users/(?P<user_id>\w+)$'

    def access(self, action: Action, meta: Optional[Meta]) -> bool:
        client = User.objects.get(pk=meta.user_id)
        return client.has_access_to_user(self.params['user_id'])

    def load(self, action: Action, meta: Meta) -> Action:
        user = User.objects.get(pk=self.params['user_id'])
        return {'type': 'user/add', 'payload': {'user': user.json()} }
```

</details>
<details><summary>Ruby on Rails</summary>

```ruby
# app/logux/policies/channels/users.rb
module Policies
  module Actions
    class users < Policies::Base
      def subscribe?
        client = User.find(userId)
        id = action.channel.split('/')[1]
        return client.has_access_to_user? id
      end
    end
  end
end
```

```ruby
# app/logux/channels/users.rb
module Channels
  class Users < Logux::ChannelController
    def initial_data
      user = User.find(action.channel.split('/')[1])
      [{ type: 'user/add', user: user }]
    end
  end
end
```

</details>

After sending initial state, the server needs to know what actions are connected with this channel. You can set channels for action in `resend` callback. Logux will resend these actions to all clients subscribed to this channel.

For instance, here we are saying that all `users/add` actions should be broadcast to all clients subscribed to the `users/:id` channel, where `:id` comes from the action data.

<details open><summary>Node.js</summary>

```js
server.type('users/add', {
  …
  resend (ctx, action, meta) {
    return `users/${ action.userId }`
  },
  …
})
```

</details>
<details><summary>Django</summary>

```python
class AddUserAction(ActionCommand):
    action_type = 'users/add'

    def resend(self, action: Action, meta: Optional[Meta]) -> List[str]:
        return [f'users/{action["userId"]}']
```

</details>
<details><summary>Ruby on Rails</summary>

*Under construction. Until `resend` will be implemented in the gem.*

</details>

You can mark action with several channels. If client was subscribed to several of action’s channel, it will received action only once.


## Subscription

<details open><summary>Redux client</summary>

`useSubscription` React hook automatically subscribes during component render and unsubscribe when a component is unmounted. For instance, when you will render some page, this page will automatically request that data from the server.

`useSubscription` returns `true` during the downloading current state. You should show some loader at that moment.

```js
import { useSubscription } from '@logux/redux'

const UserPage = ({ userId }) => {
  const isSubscribing = useSubscription([`user/${ userId }`])
  if (isSubscribing) {
    return <Loader />
  } else {
    // Render user page
  }
}
```

This hook automatically tracks all subscriptions and doesn’t subscribe to channel if another component already subscribed to the same channel.

`useSubscription` doesn’t return the data from the server. It just dispatches subscribe/unsubscribe actions and track loading. Subscription asks the server to send you Redux actions. You should process these actions with reducers and put data from actions to the store (see Redux docs).

```js
export default function usersReducer (state = [], action) {
  if (action.type === 'user/add') {
    return state.concat([action.user])
  }
}
```

In component, you should use Redux’s `useSelector` hook to select that data from the store.

```diff
  import { useSubscription } from '@logux/redux'
+ import { useSelector } from 'react-redux'

  const UserPage = ({ userId }) => {
    const isSubscribing = useSubscription([`user/${ userId }`])
+   const user = useSelector(state => state.users.find(i => i.id === userId))
    if (isSubscribing) {
      return <Loader />
    } else {
-     // Render user page
+     return <h1>{ user.name }</h1>
    }
  }
```

For legacy React components with the class syntax, you can use `connect` decorator.

```js
import { subscribe } from '@logux/redux'

class UserPage extends React.Component {
  …
}
export default subscribe(({ userId }) => `users/${ userId }`)(UserPage)
```

</details>
<details><summary>Vuex client</summary>

Use `useSubscription` composable function or wrap template into `Subscribe` component.

`useSubscription` automatically subscribes for channels during component initialization and unsubscribe on unmounted. For instance, when you will render some page, that page will automatically request data from the server.

`useSubscription` returns `true` during loading the current state. You can use this to show the loading status.

```html
<template>
  <h1 v-if="isSubscribing">Loading</h1>
  <!-- Render user page -->
</template>

<script>
import { toRefs, computed } from 'vue'
import { useSubscription } from '@logux/vuex'

export default {
  props: ['userId'],
  setup (props) {
    let { userId } = toRefs(props)
    let isSubscribing = useSubscription(() => [`users/${userId.value}`])
    return { isSubscribing }
  }
}
</script>
```

This function automatically tracks all subscriptions and doesn’t subscribe to channel if another component already subscribed to the same channel.

`useSubscription` doesn’t receive the data from the server. It just sends `logux/subscribe` and `logux/unsubscribe` actions and tracks loading status. Subscription asks the server to send you actions. You should process these actions with Vuex mutation and put state from actions to the store (see Vuex docs).

In component, you should just return the state within a computed property as usual.

```diff
  <template>
    <h1 v-if="isSubscribing">Loading</h1>
-   <!-- Render user page -->
+   <h1 v-else>{{ user.name }}</h1>
  </template>

  <script>
  import { toRefs, computed } from 'vue'
- import { useSubscription } from '@logux/vuex'
+ import { useStore, useSubscription } from '@logux/vuex'

  export default {
    props: ['userId'],
    setup (props) {
      let { userId } = toRefs(props)
      let isSubscribing = useSubscription(() => [`users/${userId.value}`])
+
+     let store = useStore()
+     let user = computed(() => store.state.user[userId.value])
+
-     return { isSubscribing }
+     return { isSubscribing, user }
    }
  }
  </script>
```

`Subscribe` is a component with scoped slots. It takes a `channels` in its props and passes down the `isSubscribing`.

```html
<template>
  <subscribe :channels="[`user/${userId}`]" v-slot="{ isSubscribing }">
    <h1 v-if="isSubscribing">Loading</h1>
    <h1 v-else>{{ user.name }}</h1>
  </subscribe>
</template>

<script>
import { toRefs, computed } from 'vue'
import { Subscribe, useStore } from '@logux/vuex'

export default {
  components: { Subscribe },
  props: ['userId'],
  setup (props) {
    let { userId } = toRefs(props)

    let store = useStore()
    let user = computed(() => store.state.user[userId.value])

    return { userId, user }
  }
}
</script>
```
</details>


## Re-subscription

Logux Client tracks current subscriptions. If the client loses connection to the server, Logux Client will re-subscribe when the client gets connection again. The server will load data state from the database and send it to the client back.

During re-subscription client send the time of latest action from the server in `action.since`. The server can use this time to send only data which was updated since this time.

`action.since` use [Logux distributed time].

```js
action.since //=> { time: '1564508138460', id: '1564508138460 380:R7BNGAP5:px3-J3oc 0' }
```

For simple cases, you can use `action.since.time` with a timestamp. For more complicated cases, you can use `isFirstOlder()` function to compare `action.since` with meta of some action.

<details open><summary>Node.js</summary>

```diff
  server.channel('users/:id', {
    …,
    async load (ctx, action, meta) {
      let user = await db.loadUser(ctx.params.id)
-     return { type: 'user/add', user }
+     if (!action.since || user.changesAt > action.since.time) {
+       return { type: 'user/add', user }
+     }
    }
  })
```

</details>
<details><summary>Django</summary>

```python
class UserChannel(ChannelCommand):

    channel_pattern = r'^user/(?P<user_id>\w+)$'

    def load(self, action: Action, meta: Meta) -> Action:
        user = User.objects.get(pk=self.params['user_id'])
        since = action.get('since', None)
        if since is None or (user.changes_at > since['time']):
            return {'type': 'user/name', 'payload': {'user': user.json()} }
```

</details>
<details><summary>Ruby on Rails</summary>

```ruby
# app/logux/channels/users.rb
module Channels
  class Users < Logux::ChannelController
    def initial_data
      user = User.find(action.channel.split('/')[1])
      if !since_time || since_time < user.changed_at
        [{ type: 'user/add', user: user }]
      end
    end
  end
end
```

</details>

[Logux distributed time]: ./meta.md#id-and-time


## Channel Filters

Client by default subscribes to all further actions in this channel. If you need to subscribe the client to some part of these actions, you can define channel filter on the server. For instance, you can use it to subscribe to the client to specific fields or your model.

Only Node.js server support channel filters API.

We can add additional keys to `logux/subscribe` action to define what fields do we need.

<details open><summary>Redux client</summary>

```diff
  const UserPage = ({ userId }) => {
-   const isSubscribing = useSubscription([`user/${ userId }`])
+   const isSubscribing = useSubscription([
+     { channel: `user/${ userId }`, fields: ['name'] }
+   ])
    const user = useSelector(state => state.users.find(i => i.id === userId))
    if (isSubscribing) {
      return <Loader />
    } else {
      return <h1>{ user.name }</h1>
    }
  }
```

</details>
<details><summary>Vuex client</summary>

```diff
  import { toRefs, computed } from 'vue'
  import { useStore, useSubscription } from '@logux/vuex'

  export default {
    props: ['userId'],
    setup (props) {
      let { userId } = toRefs(props)
-     let isSubscribing = useSubscription(() => [`users/${userId.value}`])
+     let isSubscribing = useSubscription(() => [
+       { channel: `users/${userId.value}`, fields: ['name'] }
+     ])

      let store = useStore()
      let user = computed(() => store.state.user[userId.value])

      return { isSubscribing, user }
    }
  }
```

</details>

On the server we can define filter in `filter` callback:

```js
server.channel('users/:id', {
  …,
  filter (ctx, action, meta) {
    let fields = action.fields
    if (!fields) return
    return (userAction, userMeta) => {
      return userAction.type === 'user/set' && fields.includes(userAction.key)
    }
  }
})
```

[Next chapter](./reason.md)
