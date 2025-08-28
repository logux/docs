# Subprotocols

Deploying a SPA is not easy. You can deploy new versions of client and server, but users may use old client for weeks because they do not reload the page. It could be even worse for mobile application. User may avoid updating client and use old client for months.

As a result, the server needs to be able to speak with different versions of clients. Logux has subprotocol versions to do it.

Subprotocol is your application-level protocol:

* What actions can be generated on the client and the server.
* The schema of action’s objects.
* The reaction on this actions.

Subprotocol version is a number.

On the client you define what subprotocol version does it use:

```js
const client = new CrossTabClient({
  subprotocol: 10,
  …
})
```

In Logux Node.js server, you define what subprotocol does server use and what clients does it support.

```js
const server = new Server(
  Server.loadOptions(process, {
    subprotocol: 10,
    minSubprotocol: 9,
    …
  })
)
```

If the server doesn’t support the client’s subprotocol, it will refuse the connection and client will show “Please reload page” warning to the user.

On the server you can have different logic for different clients:

<details open><summary>Node.js</summary>

```js
server.type('user/add', {
  …,
  async process (ctx, action, meta) {
    if (meta.subprotocol <= 9) {
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
      user = if meta.subprotocol <=9
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

[Next chapter](../../recipes/authentication.md)
