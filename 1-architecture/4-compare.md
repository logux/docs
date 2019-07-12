# Comparing Logux with AJAX and GraphQL

All three technologies (Logux, AJAX, GraphQL) was created for communication between clients and server. AJAX and GraphQL are based on requests and responses. Logux is based on synchronizing state by synchronizing list of actions by WebSocket. However, there are many similar things between these technologies.


## Similarities

### Terms

| Term           | AJAX            | GraphQL            | Logux
| -------------- | --------------- | ------------------ | -----
| Data request   | GET request     | Query              | Subscription to the channel
| Request ID     | URL             | Query name         | Channel name
| Requested data | HTTP response   | Query response     | Server sends action on subscription
| Change data    | POST/DELETE/PUT | Mutation           | Add action and synchronize logs
| Changes ID     | URL             | Mutation name      | Action type
| Changed values | POST/PUT body   | Mutation variables | Other action keys
| Authentication | Session cookie  | Session cookie     | User ID from `meta.id` of each action


### Loading the Data from Client

In **AJAX** you send GET request to some URL and wait for response.

```js
// components/users.js
export default () => {
  const [state, setState] = useState('loading')
  useEffect(() => {
    fetch('/users').then(response => {
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

In **GraphQL** you wrap your component in `<Query>` HOC to make request
to single entry point.

```js
// components/users.js
export default () => (
  <Query query={
    gql`{
      users { id, name }
    }`
  }>{({ loading, error, users }) => {
    if (loading) {
      return <Loader />
    } else if (error) {
      return <Error />
    } else {
      return <Users users={users} />
    }
  }}</Query>
);
```

**Logux** is focusing on live-updates. You are subscribing to the channel instead of requesting the data. Logux Server sends current users list in `users/add` Redux actions. Logux has global UI to show server errors and much more reliable for network problems. As result, you do not need to care about errors in this case.

```js
// reducers/users.js
export default function (state = { }, action) {
  if (action.type === 'users/add') {
    return { ...state, [action.user.id]: action.user }
  }
}

// components/users.js
export default () => {
  const isSubscribing = useSubscription('users')
  const users = useSelector(state => state.users)
  if (isSubscribing) {
    return <Loader />
  } else {
    return <Users users={users} />
  }
}
```

*Under construction*


## Differences

*Under construction*

## What to Choose

*Under construction*

**[Next chapter →](./5-parts.md)**
