# Supporting Different Versions of Client

The client-server application should support different versions of the clients.

If you deploy a new client and server, users may not reload the page and use the old client to connect to the new server. It is normal to see old clients for a week. Mobile apps or Electron apps have a much longer update process than web clients. You may expect to see old clients for months.

If you use persistent storage, new clients will load actions from an old client.

Logux gives your [`meta.subprotocol`](../guide/concepts/subprotocol.md) API to deal with this complex case of old and new clients mix.


## Subprotocol Best Practices

The developer must specify the subprotocol version ([Semantic Versioning] string like `1.5.2`) for both client and server.

We suggest to change major subprotocol version (first number `X.x.x`) on client/server API breaking changes:

* Renaming action.
* Big changes in reaction for action.

You can optionally update minor (`x.X.x`) or patch (`x.x.X`) versions of subprotocol on new actions and features or bug fixes. It can be useful for statistics.

You can change the subprotocol version at `src/store/index.js` file (or another file where you create store):

```diff
  const client = new CrossTabClient({
-   subprotocol: '1.1.0',
+   subprotocol: '2.0.0',
    …
  })
```

In Logux Node.js server or Logux proxy you need to change `index.js`:

```diff
  const server = new Server(
    Server.loadOptions(process, {
-     subprotocol: '1.1.0',
-     supports: '^1.0.0',
+     subprotocol: '2.0.0',
+     supports: '^2.0.0, ^1.0.0',
      …
    })
  )
```

[Semantic Versioning]: https://semver.org/


## Checking Client Version on the Server

On the server, you can support different versions of the client.

Note that every action has its subprotocol. With a persistence store like `IndexedStore`, user can create action in an old client, reload the client, and upload the old action to the server from a new client.

<details open><summary>Node.js</summary>

```js
server.type('user/add', {
  …,
  async process (ctx, action, meta) {
    if (ctx.isSubprotocol('~1.1.0')) {
      await db.createUser({ id: action.id, name: action.name })
    } else {
      await db.createUser({ id: action.user.id, name: action.user.name })
    }
  }
})
```

</details>
<details><summary>Ruby on Rails</summary>

```ruby
# app/logux/actions/users.rb
module Channels
  class Users < Logux::ChannelController
    def add
      user = if meta.subprotocol =~ /^1\.1\./
        User.new(id: action[:id], name: action[:name])
      else
        User.new(id: action[:user][:id], name: action[:user][:name])
      end
      user.save!
    end
  end
end
```

</details>


## Checking Action Version on the Client

If on the client-side, you are using a persistence store like `IndexedStore` your client may load actions created in a different version of the client.

You need to think about it if you want to support offline.

<details open><summary>Redux client</summary>

Unfortunately, there is no API to pass `meta.subprotocol` to Redux’s reducers. We will make a solution for old action in our future Redux API extension.

Right now you need to be read and look into action structure:

```js
export default function reduceUsers(state = { }, action) {
  if (action.type === 'users/add') {
    if (action.id) {
      return { ...state, [action.id]: { name: action.name } }
    } else {
      return { ...state, [action.user.id]: action.user }
    }
  }
}
```

</details>
<details><summary>Vuex client</summary>

Unfortunately, there is no API to pass `meta.subprotocol` to Vuex mutations. We will make a solution for old action in our future Vuex API extension.

Right now you need to be read and look into action structure:

```js
export default {
  …
  'users/add': (state, action) => {
    if (action.id) {
      return { ...state.users, [action.id]: { name: action.name } }
    } else {
      return { ...state.users, [action.user.id]: action.user }
    }
  }
}
```

</details>
<details><summary>Pure JS client</summary>

```js
client.type('users/add', (action, meta) => {
  if (meta.subprotocol.startsWith('1.1.')) {
    users.add({ id: action.id, name: action.name })
  } else {
    users.add({ action.user })
  }
})
```

</details>


## Forcing Clients to Update Client

The server will refuse a connection if the client’s subprotocol doesn’t pass `supports` requirements. The client will show “Reload the page” error to the user.

For instance, if you do not want to support `1.x.x` clients and force them to update an app, change this line in server’s or proxy’s `index.js`:

```diff
  const server = new Server(
    Server.loadOptions(process, {
      subprotocol: '2.0.0',
-     supports: '^2.0.0, ^1.0.0',
+     supports: '^2.0.0',
      …
    })
  )
```

You can read more about `subprotocol` syntax in [npm docs](https://github.com/npm/node-semver#advanced-range-syntax).
