# Authentication with Logux

In this example, we will use simple email/password authentication. Logux supports any authentication, including OAuth or WebAuthn.

We will show two of the most popular cases:

1. You already have Ruby/PHP/Python back-end server and HTML page with email and password fields. When user passed authentication back-end server redirects them and insert user ID and token as `<meta>` tags.
2. You keep all your business logic in Logux Server and use HTTP just to send static HTML. In this case, Logux client connects as a guest and sends authentication action. Logux server sends action with a user ID and token back to the client. The client will save them to `localStorage`.

If you need another way, you can combine methods or ask for advice in [Logux support chat].

[Logux support chat]: https://gitter.im/logux/logux


## Method 1: HTML Form and Meta Tags

### Server

Go to your back-end server.

<details><summary><b>Ruby on Rails</b></summary>

Add `jwt` to `Gemfile` and call `bundle`:

```ruby
gem 'jwt'
```

Add JWT secret key to local `.env`:

```diff
  LOGUX_CONTROL_PASSWORD=secret
  LOGUX_URL=http://localhost:31338
+ JWT_SECRET=secret
```

Edit `config/initializers/logux.rb`:

```diff
  config.auth_rule = lambda do |user_id, token|
-   # Allow only local users until we will have a proper authentication
-   Rails.env.development?
+   data = JWT.decode token, ENV['JWT_SECRET'], { algorithm: 'HS256' }
+   data[0]['sub'] == user_id
  end
```

Add `<meta>` tags to application layout used for authenticated user:

```haml
    meta( name="userId" content=current_user.id )
    meta( name="token" content=JWT.encode({ sub: current_user.id }, ENV['JWT_SECRET'], 'HS256') )
```

</details>
<details><summary><b>Any other HTTP server</b></summary>

Add JWT secret key to proper storage for your environment. Local `.env` is a good option.

```diff
  LOGUX_CONTROL_PASSWORD=secret
  LOGUX_URL=http://localhost:31338
+ JWT_SECRET=secret
```

Add library to support JWT. Add code to check `userId` and `token` from Logux:

```js
data = JWT.decode(token, ENV['JWT_SECRET'])
return data.sub == userId
```

Generate token to use in HTML template:

```js
token = JWT.encode({ sub: userId }, ENV['JWT_SECRET'])
```

Add this token and user ID to HTML templates used for authenticated user:

```html
    <meta name="userId" content=<?= userId ?>>
    <meta name="token" content=<?= token ?>>
```

</details>


### Client

Use these `<meta>` values in the store:

```diff
+ userId = document.querySelector('meta[name=userId]')
+ token = document.querySelector('meta[name=token]')
+ if (!userId) {
+   location.href = process.env.NODE_ENV === 'development'
+     ? 'http://localhost:3000/login'
+     : 'https://example.com/login'
+ }
  const createStore = createLoguxCreator({
    subprotocol: '1.0.0',
    server: process.env.NODE_ENV === 'development'
      ? 'ws://localhost:31337'
      : 'wss://logux.example.com',
-   userId: false,  // TODO: We will fill it in next chapter
-   credentials: '' // TODO: We will fill it in next chapter
+   userId: userId.content,
+   credentials: token.content,
  })
```


### Check the Result

Start back-end server, Logux proxy, and Logux client. Try to sign-in into application. If you will have any problems feel free to ask a question at our [support chat].

**[Next chapter →](../3-concepts/1-node.md)**

[support chat]: https://gitter.im/logux/logux


## Method 2: Everything in Logux

### Server

Go to Logux Server and add the library to generate JWT:

```sh
npm i jwt-simple bcrypt
```

Load it in the `index.js`:

```diff
  const { Server } = require('@logux/server')
+ const bcrypt = require('bcrypt')
+ const jwt = require('jwt-simple')
  const pg = require('pg-promise')
```

Add JWT secret key to local `.env` config file:

```diff
  DATABASE_URL=postgres://localhost/server-logux
+ JWT_SECRET=secret
```

Go back to `index.js` and replace `server.auth(…)` with this code:

```js
server.auth((userId, token) => {
  if (!userId) {
    return true
  } else {
    try {
      const data = jwt.decode(token, process.env.JWT_SECRET)
      return data.sub === userId
    } catch (e) {
      return false
    }
  }
})

server.type('login', {
  async access (ctx) {
    return ctx.userId === 'false'
  },
  async process (ctx, action) {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', action.email);
    if(!user) {
        return server.undo(meta, 'Unknown email')
    }
    if (await bcrypt.compare(action.password, hash)) {
      let token = jwt.encode({ sub: user.id }, process.env.JWT_SECRET)
      ctx.sendBack({ type: 'login/done', userId: user.id, token })
    } else {
      server.undo(meta, 'Wrong password')
    }
  }
})
```


### Client

Open your Logux Redux client and add sign-up form according to your design.

Then add code to login user:

```js
import Client from '@logux/client/client'

function login (email, password) {
  let client = new Client({
    subprotocol: '1.0.0',
    server: process.env.NODE_ENV === 'development'
      ? 'ws://localhost:31337'
      : 'wss://logux.example.com',
    userId: false
  })
  client.log.on('add', action => {
    if (action.type === 'login/done') {
      localStorage.setItem('userId', action.userId)
      localStorage.setItem('token', action.token)
      location.href = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/dashboard'
        : 'https://app.example.com/dashboard'
    } else if (action.type === 'logux/undo') {
      alert(action.reason)
    }
  })
  client.start()
  client.log.add({ type: 'login', email, password }, { sync: true })
})
```

Use these `localStorage` values in the store:

```diff
+ if (!localStorage.getItem('userId')) {
+   location.href = process.env.NODE_ENV === 'development'
+     ? 'http://localhost:3000/login'
+     : 'https://example.com/login'
+ };
  const createStore = createLoguxCreator({
    subprotocol: '1.0.0',
    server: process.env.NODE_ENV === 'development'
      ? 'ws://localhost:31337'
      : 'wss://logux.example.com',
-   userId: false,  // TODO: We will fill it in next chapter
-   credentials: '' // TODO: We will fill it in next chapter
+   userId: localStorage.getItem('userId'),
+   credentials: localStorage.getItem('token'),
  });
```


### Check the Result

In the next steps, you will need a good sign-up form, email verification, and many other things for proper authentication. They highly depend on your application and out of this guide topic.
