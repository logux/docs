# Authentication

In previous chapters we created Logux server and client. Now we need to add
authentication process to connect them.

In this examples we will use simple email/password authentication.
But this process can be used for any kind of authentication including OAuth
or WebAuthn.

Client will use user ID and JWT token. We will explain 2 the most popular cases:

1. You already have Ruby/PHP/Python back-end server and HTML page
   with email and password fields. When user will pass authentication
   back-end server will redirect them to application page
   (like `app.example.com`) and insert user ID and token as `<meta>` tags.
2. You keep all your business logic in Logux Server and use HTTP just
   to send static HTML, JS, and CSS files to client. In this case,
   Logux client will open Logux connection as a guest to send
   authentication action. Logux server will send action with user ID and token
   back to client. Client will save them to `localStorage`.

If you need another way, you can combine methods or ask for advice
in [Logux support chat].

[Logux support chat]: https://gitter.im/logux/logux


## Method 1: HTML Form and Meta Tags

### Server

*Under construction*

### Client

*Under construction*


## Method 2: Everything in Logux

### Server

Go to Logux Server and add library to generate JWT:

```sh
npm i jwt-then
```

Add load it in the server:

```diff
  const { Server } = require('@logux/server')
+ const jwt = require('jwt-then')
  const pg = require('pg-promise')
```

Add JWT secret key to local `.env`:

```diff
  DATABASE_URL=postgres://localhost/server-logux
+ JWT_SECRET=secret
```

Replace `server.auth(…)` with this code:

```js
server.auth(async (userId, token) => {
  if (userId === 'false') {
    // Guests don’t need any validations
    return true
  } else {
    try {
      const data = await jwt.verify(token, process.env.JWT_SECRET)
      return data.sub === userId
    } catch (e) {
      return false
    }
  }
})

// Handler for { type: 'login', email, password } actions
server.type('login', {
  async access (ctx) {
    // This action is accepted only from guests
    return ctx.userId === 'false'
  },
  async process (ctx, action) {
    let user = await db.one('SELECT * FROM users WHERE email = ?', action.email)
    if (user && user.password === action.password) {
      let token = await jwt.sign({ sub: user.id }, process.env.JWT_SECRET)
      ctx.sendBack({ type: 'login/done', userId: user.id, token })
    } else {
      ctx.sendBack({ type: 'login/error' })
    }
  }
})
```


### Client

*Under construction*
