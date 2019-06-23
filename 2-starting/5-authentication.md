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

Go to you back-end and server and

<details><summary><b>Ruby on Rails</b></summary>

*Under construction*

</details>
<details><summary><b>Any other HTTP server</b></summary>

*Under construction*

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
    subprotocol: '0.1.0',
    server: process.env.NODE_ENV === 'development'
      ? 'ws://localhost:31337'
      : 'wss://logux.example.com',
-   userId: false,  // TODO: We will fill it in next chapter
-   credentials: '' // TODO: We will fill it in next chapter
+   userId: userId.content,
+   credentials: token.content,
  })
```

*Under construction*


### Check the Result

Start Logux server and Logux client and try to sign-in into application.
If you will have any problems feel free to ask question at our [support chat].

[support chat]: https://gitter.im/logux/logux


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
      server.undo(meta, 'wrong')
    }
  }
})
```


### Client

Open your Logux Redux client and add signup form according too your design.

Then add code to login user:

```js
import { useState, useCallback } from 'react'
import Client from '@logux/client/client'

export LoginController = () => {
  const [email, changeEmail] = useState('')
  const [password, changePassword] = useState('')
  const [error, showError] = useState()

  const submit = useCallback(() => {
    let client = new Client({
      subprotocol: '0.1.0',
      server: process.env.NODE_ENV === 'development'
        ? 'ws://localhost:31337'
        : 'wss://logux.example.com',
      userId: false
    })
    client.add({ type: 'logux', email, password }, { sync: true })
    client.on('add', action => {
      if (action.type === 'login/done') {
        localStorage.setItem('userId', action.userId)
        localStorage.setItem('token', action.token)
        location.href = process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/dashboard'
          : 'https://app.example.com/dashboard'
      } else if (action === 'logux/undo') {
        showError('Wrong email or password')
      }
    })
    client.start()
  }, [email, password])

  return <LoguxForm
    error={error}
    email={email}
    password={password}
    onSubmit={submit}
    onEmailChange={changeEmail}
    onPasswordChange={changePassword}
  />
}
```

Use these `localStorage` values in the store:

```diff
+ if (!localStorage.getItem('userId')) {
+   location.href = process.env.NODE_ENV === 'development'
+     ? 'http://localhost:3000/login'
+     : 'https://example.com/login'
+ }
  const createStore = createLoguxCreator({
    subprotocol: '0.1.0',
    server: process.env.NODE_ENV === 'development'
      ? 'ws://localhost:31337'
      : 'wss://logux.example.com',
-   userId: false,  // TODO: We will fill it in next chapter
-   credentials: '' // TODO: We will fill it in next chapter
+   userId: localStorage.getItem('userId'),
+   credentials: localStorage.getItem('token'),
  })
```


### Check the Result

Add new user by SQL command:

```sh
psql project-logux
INSERT INTO users (email, password) VALUES ('test@example.com', 'qwerty');
SELECT * FROM users;
exit
```

Start Logux server and Logux client and try to sign-in into application.
If you will have any problems feel free to ask question at our [support chat].

In next steps you will need to create good sign-up form, email verification,
and many other things for good authentication. They are higly depends
on your application and out of the topic of this guide.

[support chat]: https://gitter.im/logux/logux
