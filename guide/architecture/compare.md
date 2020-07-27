# Comparing Logux with AJAX and GraphQL

All three technologies (Logux, AJAX, GraphQL) was created for communication between clients and server. AJAX and GraphQL are based on requests and responses. Logux is based on synchronizing state by synchronizing list of actions by WebSocket. However, there are many similar things between these technologies.


## Similarities


### Loading the Data from Client

In **AJAX** you send GET request to some URL and wait for response.

<details open><summary>Redux client</summary>

```js
// containers/users.js
export default () => {
  const [state, setState] = useState('loading')
  useEffect(() => {
    fetch('/users', { credentials: 'include' }).then(response => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error('HTTP error ' + response.code)
      }
    }).then(users => {
      setState(users)
    }).catch(error => {
      setState('error')
    })
  })
  if (state === 'loading') {
    return <Loader />
  } else if (state === 'error') {
    return <Error />
  } else {
    return <Users users={state} />
  }
}
```

</details>
<details><summary>Vuex client</summary>

```html
<!-- views/UsersView.vue -->
<template>
  <div>
    <loader v-if="state === 'loading'"/>
    <error v-else-if="state === 'error'"/>
    <users v-else :users='users'/>
  </div>
</template>

<script>
export default {
  name: 'UsersView',
  data: () => ({
    state: 'loading',
    users: []
  }),
  mounted () {
    fetch('/users', { credentials: 'include' }).then(response => {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error('HTTP error ' + response.code)
      }
    }).then(users => {
      this.users = users
    }).catch(error => {
      console.log(error)
      this.state = 'error'
    }).finally(() => this.state = 'ok')
  }
}
</script>
```

</details>

In **GraphQL** (Apollo) you wrap your component to make request to single entry point.

<details open><summary>Redux client</summary>

```js
// containers/users.js
export default () => {
  return <Query query={
    gql`{
      users {
        id,
        name
      }
    }`
  }>
    {({ loading, error, users }) => {
      if (loading) {
        return <Loader />
      } else if (error) {
        return <Error />
      } else {
        return <Users users={users} />
      }
    }}
  </Query>
}
```

</details>
<details><summary>Vuex client</summary>

```html
<!-- views/UsersView.vue -->
<template>
  <ApolloQuery :query="gql => gql`
    query {
      users: {
        id,
        name
      }
    }
  `">
    <template v-slot="{ result: { loading, error, users } }">
      <loader v-if="loading"/>
      <error v-else-if="error"/>
      <users v-else-if="users" :users='users'/>
      <div v-else>No users</div>
    </template>
  </ApolloQuery>
</template>
```

</details>

**Logux** is focusing on live-updates. You are subscribing to the channel instead of requesting the data. Logux Server sends current users list in `users/add` actions. Logux has global UI to show server errors and much more reliable for network problems. As result, you do not need to care about errors in this case.

<details open><summary>Redux client</summary>

```js
// reducers/users.js
export default function (state = { }, action) {
  if (action.type === 'users/add') {
    return { ...state, [action.user.id]: action.user }
  }
}

// containers/users.js
export default () => {
  const isSubscribing = useSubscription(['users'])
  const users = useSelector(state => state.users)
  if (isSubscribing) {
    return <Loader />
  } else {
    return <Users users={users} />
  }
}
```

</details>
<details><summary>Vuex client</summary>

```js
// store/users/mutations.js
export default {
  …
  'user/add': (state, action) => {
    state.users = { ...state.users, [action.user.id]: action.user }
  }
}
```

```html
<!-- views/UsersView.vue -->
<template>
  <div>
    <loader v-if="isSubscribing"/>
    <users v-else :users='users'/>
  </div>
</template>

<script>
import { loguxMixin } from '@logux/vuex'

export default {
  name: 'UsersView',
  mixins: [loguxMixin],
  computed: {
    channels () {
      return ['users']
    },
    users () {
      return this.$store.state.users
    }
  }
}
</script>
```

</details>


### Change the Data on the Client

In **AJAX** you send POST request with the new data:

<details open><summary>Redux client</summary>

```js
// containers/user-form.js
export default ({ userId }) => {
  const [state, setState] = useState()
  const onNameChanged = useCallback(name => {
    setState('loading')
    fetch(`/users/${ userId }`, {
      method: 'PUT',
      credentials: 'include'
    }).then(response => {
      if (response.ok) {
        setState('saved')
      } else {
        throw new Error('HTTP error ' + response.code)
      }
    }).catch(error => {
      setState('error')
    })
  })
  if (state === 'loading') {
    return <Loader />
  } else {
    return <UserForm error={state === 'error'} onSubmit={onNameChanged} />
  }
}
```

</details>
<details><summary>Vuex client</summary>

```html
<!-- views/UserFormView.vue -->
<template>
  <div>
    <loader v-if="state === 'loading'"/>
    <user-form
      v-else
      :error="state === 'error'"
      @onSubmit='onNameChanged'
    />
  </div>
</template>

<script>
export default {
  name: 'UserFormView',
  props: ['userId'],
  data: () => ({
    state: 'ok'
  }),
  methods: {
    onNameChanged () {
      fetch(`users/${ this.userId }`, {
        method: 'PUT',
        credentials: 'include'
      }).then(response => {
        if (response.ok) {
          this.state = 'saved'
        } else {
          throw new Error('HTTP error ' + response.code)
        }
      }).catch(error => {
        console.log(error)
        this.state = 'error'
      })
    }
  }
}
</script>
```

</details>

In **GraphQL** you call a mutation:

<details open><summary>Redux client</summary>

```js
// containers/user-form.js
const CHANGE_NAME = gql`
  mutation ChangeName($name: String!, $id: ID!) {
    changeName(name: $name, id: $id) {
      id
      name
    }
  }
`

export default ({ userId }) => {
  return <Mutation mutation={CHANGE_NAME}>
    {(changeName, { data }) => {
      if (data.loading) {
        return <Loader>
      } else {
        return <UserForm
          error={data.error}
          onSubmit={name => changeName({ variables: { name, id: userId } })}
        >
      }
    }}
  </Mutation>
}
```

</details>
<details><summary>Vuex client</summary>

```html
<!-- views/UserFormView.vue -->
<template>
  <ApolloMutation :mutation="$options.fragments.changeName">
    <template v-slot="{ result: { mutate, loading, error } }">
      <loader v-if="loading"/>
      <user-form v-else @onSubmit="name => mutate({ variables: { name, id: userId } })"/>
    </template>
  </ApolloMutation>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'UserFormView',
  fragments: {
    changeName: gql`
      mutation ChangeName($name: String!, $id: ID!) {
        changeName(name: $name, id: $id) {
          id
          name
        }
      }
    `
  },
  props: ['userId']
}
</script>
```

</details>

In **Logux** you create the Redux action by `dispatch.sync`. Logux uses Optimistic UI by default, so you do not need a loader in this case.

<details open><summary>Redux client</summary>

```js
// reducers/users.js
export default function (state = { }, action) {
  if (action.type === 'users/rename') {
    let id = action.userId
    return { ...state, [id]: { ...state[id], name: action.name } }
  }
}

// containers/user-form.js
export default ({ userId }) => {
  const dispatch = useDispatch()
  const onNameChanged = useCallback(name => {
    dispatch.sync({ type: 'users/rename', userId, name })
  })
  return <UserForm onSubmit={onNameChanged} />
}
```

</details>
<details><summary>Vuex client</summary>

```js
// store/users/mutations.js
export default {
  …
  'user/rename': (state, action) => {
    let id = action.userId
    state.users = { ...state.users, [id]: { ...state.users[id], name: action.name } }
  }
}
```

```html
<!-- views/UserFormView.vue -->
<template>
  <user-form @onSubmit="onNameChange">
</template>

<script>
export default {
  name: 'UserFormView',
  props: ['userId'],
  methods: {
    onNameChange (name) {
      this.$store.commit.sync({ type: 'users/rename', userId, name })
    }
  }
}
</script>
```

</details>

[Next chapter](./parts.md)
