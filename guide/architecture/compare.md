# Comparing Logux with AJAX and GraphQL

All three technologies (Logux, AJAX, GraphQL) was created for communication between clients and server. AJAX and GraphQL are based on requests and responses. Logux is based on synchronizing state by synchronizing list of actions by WebSocket. However, there are many similar things between these technologies.


## Similarities


### Loading the Data from Client

In **AJAX** you send GET request to some URL and wait for response.

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

In **GraphQL** (Apollo) you wrap your component in `<Query>` to make request
to single entry point.

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

**Logux** is focusing on live-updates. You are subscribing to the channel instead of requesting the data. Logux Server sends current users list in `users/add` Redux actions. Logux has global UI to show server errors and much more reliable for network problems. As result, you do not need to care about errors in this case.

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


### Change the Data on the Client

In **AJAX** you send POST request with the new data:

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

In **GraphQL** you call a mutation:

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

In **Logux** you create the Redux action by `dispatch.sync`. Logux uses Optimistic UI by default, so you do not need a loader in this case.

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

[Next chapter](./parts.md)
