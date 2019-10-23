
# Channels and Subscriptions

Since Logux is a real-time system, subscriptions and channels are the main way to get data from the server. It asks the server to send current data state and re-send all actions with these data changes.

Channel is just a string like `exchange-rate` or `users/14`.

Clients subscribe by sending `logux/subscribe` action to the server. To unsubscribe
you need to send `logux/unsubscribe` with the same channel.

<details open><summary><b>Redux client</b></summary>

```js
store.dispatch.sync({ type: 'logux/subscribe', channel: 'users/14' })
store.dispatch.sync({ type: 'logux/unsubscribe', channel: 'users/14' })
```

</details>
<details><summary><b>Logux client</b></summary>

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

<details open><summary><b>Node.js</b></summary>

```js
server.channel('users/:id', {
  async access (ctx, action, meta) {
    let client = await db.loadUser(ctx.userId)
    return client.hasAccessToUser(ctx.params.id)
  },
  async init (ctx, action, meta) {
    let user = await db.loadUser(ctx.params.id))
    ctx.sendBack({ type: 'user/add', user })
  }
})
```

</details>
<details><summary><b>Ruby on Rails</b></summary>

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

After sending initial state, the server needs to mark all action related to this channel in `resend` callback. Logux will resend these actions to all clients subscribed to this channel.

<details open><summary><b>Node.js</b></summary>

```js
server.type('users/add', {
  …,
  resend (ctx, action, meta) {
    return { channel: `users/${ action.userId }` }
  },
  …
})
```

</details>
<details><summary><b>Ruby on Rails</b></summary>

*Under construction. Until `resend` will be implemented in the gem.*

</details>


## `useSubscription`

The best way to use subscriptions is `useSubscription` React hook. This hook automatically subscribes during component render and unsubscribe when a component is unmounted. For instance, when you will render some page, this page will automatically request that data from the server.

`useSubscription` returns `true` during the downloading current state. You should show some loader at that moment.

```js
import useSubscription from '@logux/redux/use-subscription'

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
  import useSubscription from '@logux/redux/use-subscription'
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


## `connect`

For legacy React components with the class syntax, you can use `connect` decorator.

```js
import subscribe from '@logux/redux/subscribe'

class UserPage extends React.Component {
  …
}
export default subscribe(({ userId }) => `users/${ userId }`)(UserPage)
```


## Re-subscription

Logux Client tracks current subscriptions. If the client loses connection to the server, Logux Client will re-subscribe when the client gets connection again. The server will load data state from the database and send it to the client back.

During re-subscription client send the time of latest action from the server in `action.since`. The server can use this time to send only data which was updated since this time.

`action.since` use [Logux distributed time].

```js
action.since //=> { time: '1564508138460', id: '1564508138460 380:R7BNGAP5:px3-J3oc 0' }
```

For simple cases, you can use `action.since.time` with a timestamp. For more complicated cases, you can use `isFirstOlder()` function to compare `action.since` with meta of some action.

<details open><summary><b>Node.js</b></summary>

```diff
  server.channel('users/:id', {
    …,
    async init (ctx, action, meta) {
      let user = await db.loadUser(ctx.params.id))
-     ctx.sendBack({ type: 'user/add', user })
+     if (!action.since || user.changesAt > action.since.time) {
+       ctx.sendBack({ type: 'user/add', user })
+     }
    }
  })
```

</details>
<details><summary><b>Ruby on Rails</b></summary>

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

[Logux distributed time]: ./3-meta.md#id-and-time


## Channel Filters

Client by default subscribes to all further actions in this channel. If you need to subscribe the client to some part of these actions, you can define channel filter on the server. For instance, you can use it to subscribe to the client to specific fields or your model.

Only Node.js server support channel filters API.

We can add additional keys to `logux/subscribe` action to define what fields do we need.

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

**[Next chapter →](./6-reason.md)**
