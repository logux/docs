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
  <Loader v-if="state === 'loading'" />
  <Error v-else-if="state === 'error'" />
  <Users v-else :users="users" />
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'UsersView',
  setup () {
    let state = ref('loading)
    watch(() => {
      fetch('/users', { credentials: 'include' }).then(response => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error('HTTP error ' + response.code)
        }
      }).then(users => {
        state.value = users
      }).catch(error => {
        state.value = 'error'
      })
    })
    return { state }
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
  <Loader v-if="loading" />
  <Error v-else-if="error" />
  <Users v-else-if="users" :users="users" />
</template>

<script>
import { useQuery, useResult } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  name: 'UsersView',
  setup () {
    let { result, loading, error } = useQuery(gql`
      query getUsers {
        users: {
          id,
          name
        }
      }
    `)
    let users = useResult(result, null, data => data.users)
    return { users, loading, error }
  }
}
</script>
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
  <Loader v-if="isSubscribing" />
  <Users v-else :users="users" />
</template>

<script>
import {
  computed,
  useStore,
  useSubscription
} from '@logux/vuex'

export default {
  name: 'UsersView',
  setup () {
    let store = useStore()
    let isSubscribing = useSubscription(['users'])
    let users = computed(() => store.state.users)
    return { isSubscribing, users }
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
  <Loader v-if="state === 'loading'"/>
  <UserForm
    v-else
    :error="state === 'error'"
    @submit="onNameChanged"
  />
</template>

<script>
import { ref, toRefs } from 'vue'

export default {
  name: 'UserFormView',
  props: ['userId'],
  setup (props) {
    let { userId } = toRefs(props)
    let state = ref('ok')
    function onNameChanged () {
      state.value = 'loading'
      fetch(`/users/${ userId }`, {
        method: 'PUT',
        credentials: 'include'
      }).then(response => {
        if (response.ok) {
          state.value = 'saved'
        } else {
          throw new Error('HTTP error ' + response.code)
        }
      }).catch(error => {
        state.value = 'error'
      })
      return { state, onNameChanged }
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
  <Loader v-if="loading" />
  <UserForm v-else @submit="name => mutate({ variables: { name, id: userId } })" />
</template>

<script>
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  name: 'UserFormView',
  props: ['userId'],
  setup (props) {
    let { mutate: changeName } = useMutation(gql`
      mutation ChangeName($name: String!, $id: ID!) {
        changeName(name: $name, id: $id) {
          id
          name
        }
      }
    `)
    return { changeName, userId: props.userId }
  }
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
  <user-form @submit="onNameChange">
</template>

<script>
import { toRefs } from 'vue'
import { useStore } from '@logux/vuex'

export default {
  name: 'UserFormView',
  props: ['userId'],
  setup (props) {
    let store = useStore()
    let { userId } = toRefs(props)
    return {
      onNameChange (name) {
        store.commit.sync({ type: 'users/rename', userId, name })
      }
    }
  }
}
</script>
```

</details>

[Next chapter](./parts.md)
