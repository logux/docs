# Application State

State describes all data of your application. On the client-side state describe UI state, data load from the server, user’s local changes. On the server-side state is what you have in database.


## Client State

Logux Redux uses *event sourcing* pattern on client-side. Actions describe the current state. State object is just an cache.

Developer provide reducer. Reducer has initial state (`[]` in this example) and describe how to change the current state on this action:

```js
export default function usersReducer (state = [], action) {
  if (action.type === 'user/add') {
    return state.concat([action.user])
  } else if (action.type === 'user/remove') {
    return state.filter(user => user.id !== action.userId)
  }
}
```

Application combines reducers of each key in store:

```js
import { combineReducers } from 'redux'
import usersReducer from './users'

export default combineReducers({
  users: usersReducer
})
```

This big reducers generate initial state during Logux Redux initialization:

```js
reducer(undefined, { type: '@@redux/INIT' }) //=> { users: [] }
```

Then each action will change the state:

```js
const action = {
  type: 'user/add',
  user: { id: '7tEL8t', name: 'First' }
}
reducer({ users: [] }, action) //=> { users: [{ id: '7tEL8t', name: 'First' }] }
```

Each reducer must be a pure function (always return the same result on same argument):

1. It should create new state object, not changing old one.
2. It should be state-less. It should work only with old state and action. You can not use `localStorage` or AJAX in reducer.

As result, with a history of actions you can always re-generate the same state. If you will remove action from the history, you can generate a different state. Logux uses it for reverting changes and edit conflict resolution.

By default, Logux keep last 1000 action (you can change it, see [reasons chapter]) and cache state every 50 actions to make time-travel faster.

[reasons chapter]: ./6-reasons.md

## Client State and UI

Logux Redux generates big JS object as application state. We recommend to use some reactive UI library (React, Vue.js, Svelte, etc) to render and change UI according state changes:

```js
import { useSelector } from 'react-redux'

export const Users = ({ id }) => {
  const users = useSelector(state => state.users)
  return <>
    {users.map(user => <User key={user.id} user={user}>)}
  </>
}
```

Often we need non-pure logic and we can’t put it to reducer. For instance, we need to change `document.title` on new error. For this cases, you need to set listener for state changes:

```js
store.subscribe(() => {
  if (store.getState().errors.length) {
    document.title = '* Error'
  } else {
    document.title = 'OK'
  }
})
```


## Server State

By default, server state is opposite to client state. Because server-side cache could be very big, the database is the single source of truth. You can use any database with Logux.

Logux Server removes action after processing and always look to database for the latest value. As result, you can’t undo actions on the server.

However, you can change this behaviour and have event sourcing on the server too.

Every time when client subscribes to some data, server go to database and send initial value:

<details open><summary><b>Node.js</b></summary>

```js
server.channel('users/:id', {
  …,
  async init (ctx, action, meta) {
    let user = await db.loadUser(action.userId)
    ctx.sendBack({ type: 'user/add', user })
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
      [{ type: 'user/add', user: user }]
    end
  end
end
```

</details>

After initial subscribing, server will just re-send changes without going to database:

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

Every time when user sends action, server change the data in database:

<details open><summary><b>Node.js</b></summary>

```js
server.type('users/add', {
  …,
  async process (ctx, action, meta) {
    await db.insertUser(action.user)
  }
})
```

</details>
<details><summary><b>Ruby on Rails</b></summary>

```ruby
# app/logux/actions/users.rb
module Channels
  class Users < Logux::ChannelController
    def add
      user = User.new(user_params)
      user.save!
    end

    private

    def user_params
      action.require(:user).permit(:id, :name)
    end
  end
end
```

</details>


## Conflict Resolution

If several users can work on the same document in your application, you need to think about conflict resolution. It is especially important for offline first application. However, because of network latency, online-only collaborative applications need conflict resolution too.

There is no single solution for conflict resolution. It is always depends on data type and business processes. Logux gives you few basements to not care about conflict resolutions in the simple cases and write custom logic in complicated cases.

**Logux Redux** uses time travel to keep the same actions order on all machines. It uses [ID and time] from meta to detect order and time travel to insert action in the correct moment of the history. Time travel is a technique when Logux Redux revert recent actions, apply new action and then re-apply recent actions.

As result, if developer used [atomic actions], conflict actions will override each other (“last write wins” model). In complicated cases, you can make your can define merge logic in reducers.

By default, **Server** doesn’t use time travel, because average state can’t be stored in the memory. You need manually compare action’s time and latest change time to implement “last write wins”. In the similiar way you can implement any other conflict resolution logic.

<details open><summary><b>Node.js</b></summary>

```js
server.type('users/rename', {
  …,
  async process (ctx, action, meta) {
    const user = await db.getUser(action.userId)
    if (isFirstOlder(user.nameChangedAt, meta)) {
      user.name = action.name
      user.nameChangedAt = meta
      await user.save()
    }
  }
})
```

</details>
<details><summary><b>Ruby on Rails</b></summary>

```ruby
# app/logux/actions/users.rb
module Channels
  class Users < Logux::ChannelController
    def rename
      user = User.find(action[:userId])
      if user.name_changed_at <= meta.time
        user.name = action[:name]
        user.name_changed_at = meta.time
        user.save!
      end
    end
  end
end
```

</details>

[atomic actions]: ./2-actions.md#atomic-actions
[ID and time]: ./3-meta.md#id-and-time


## Reverting Changes

*Under construction*

**[Next chapter →](./5-subscription.md)**
