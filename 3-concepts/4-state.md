# Application State

State describes all data of your application. On the client-side state describe UI state, data load from the server, user’s local changes. On the server-side state is what you have in database.


## Client State

Logux uses *event sourcing* pattern on client-side. Actions describe the current state. State object is just an cache.

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

## Server State

By default, server state is opposite to client state. Because server-side cache could be very big, the database is the single source of truth. Logux Server removes action after processing and always look to database for the latest value. As result, you can’t undo actions on the server.

However, you can change this behaviour and have event sourcing on the server too.

Every time when client subscribes to some data, server go to database and send initial value:

```js
server.channel('users/:id', {
  …,
  async init (ctx, action, meta) {
    let user = await db.loadUser(action.userId)
    ctx.sendBack({ type: 'user/add', user })
  }
})
```

After initial subscribing, server will just re-send changes without going to database:

```js
server.type('users/add', {
  …,
  resend (ctx, action, meta) {
    return { channel: `users/${ action.userId }` }
  },
  …
})
```

Every time when user sends action, server change the data in database:

```js
server.type('users/add', {
  …,
  async process (ctx, action, meta) {
    await db.insertUser(action.user)
  }
})
```


## Conflict Resolution

*Under construction*


## Reverting Changes

*Under construction*

**[Next chapter →](./5-subscription.md)**
