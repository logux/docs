# Logux Back-end Protocol

Logux uses Back-end Protocol to make a proxy between WebSocket and HTTP. Logux Server sends the user’s authentication requests, subscriptions, and actions to an HTTP server and receives new actions by HTTP to send them to Logux clients.

* [Communication examples](./examples.md)
* [Protocol versions](./versions.md)
* Ruby implementation: [`logux_rails`](https://github.com/logux/logux_rails)
* Node.js implementation: [`tchak/logux-processor`](https://github.com/tchak/logux-processor)


## Requests

Logux Server sends HTTP requests to single entry point (user specifies URL by `LOGUX_BACKEND`) with `POST` method and JSON to encode the body.

Each request contains protocol version (the latest version is `2`), the secret to protect servers from unknown requests from Internet (you set this secret by `LOGUX_CONTROL_SECRET`) and list of commands.

```ts
{
  version: number,
  secret: string,
  commands: Command[]
}
```

Requests from Logux server to back-end server use `auth` and `action` commands. Requests from a back-end server to Logux server use only `action` command.

For performance reasons, each request can contain multiple commands from different users.

The HTTP response contains an array of responses. Responses could have a different order than commands. Some commands require more than one answer during processing.

HTTP server should use keep-alive HTTP response to write answers to TCP socket during the processing. It will be bad for performance if the server will write answers for all commands only when the latest command was processed.

```ts
Answer[]
```


## `auth`

```ts
{
  command: "auth",
  authId: string,
  userId: string,
  token?: string,
  subprotocol: string,
  cookie: {
    [name]: string
  },
  headers: {
    [name]: string
  }
}
```

`auth` command asks back-end server to authenticate the user by ID, token, cookie and Logux’s headers. `authId` is used to specify the command, when the HTTP request contains multiple `auth` commands.

On correct user ID and credentials back-end server must answer `authenticated` with server’s [subprotocol](https://logux.io/guide/concepts/subprotocol/).

```ts
{
  answer: "authenticated",
  subprotocol: string,
  authId: string
}
```

On wrong credentials or unknown user ID:

```ts
{
  answer: "denied",
  authId: string
}
```

If back-end do not support client’s subprotocol, with the [npm range](https://docs.npmjs.com/misc/semver) of supported subprotocols.

```ts
{
  answer: "wrongSubprotocol",
  supported: string
}
```

On any error during the authentication (`details` can be used for stack-trace):

```ts
{
  answer: "error",
  authId: string,
  details: string
}
```

See [authentication example](./examples.md#authentication).


## `action`

```ts
{
  command: "action",
  action: Action,
  meta: Meta,
  headers: {
    [name]: string
  }
}
```

Logux server uses `action` command to ask the back-end server to process action or subscription. Back-end server uses this action to ask Logux server to add action to the log and re-send it to all clients from action’s meta.

Back-end server must do three steps during action processing:

1. Mark what users will also receive this action by writing `resend` answer to HTTP response. Object can use `channels`, `nodes`, `clients` or `users` to specify receivers. If Logux should not re-send this action, back-end server should not write anything. Do not worry, Logux will re-send actions only after passing validation on step 2.

   ```ts
   {
     answer: "resend",
     id: string,
     channels?: string[],
     clients?: string[],
     nodes?: string[],
     users?: string
   }
   ```
2. Validate that the user has the right to do this action. Back-end server must write `approved` or `forbidden` answer to HTTP responses immediately when it finished this step.

   ```ts
   {
     answer: "approved",
     id: string
   }
   ```

   ```ts
   {
     answer: "forbidden",
     id: string
   }
   ```
3. Process the action (for instance, apply changes to the database). Back-end server must write `processed` immediately when it finished this step.

   ```ts
   {
     answer: "processed",
     id: string
   }
   ```

Back-end server can take user ID from `meta.id`:

```js
meta.id //=> '1560954012838 38:Y7bysd:O0ETfc 0'
meta.id.split(' ')[1].split(':')[0] //=> '38'
```

Action with `type: "logux/subscribe"` tells that user wants to load data and subscribe to data changes. On this action back-end server must:

1. Validate that the user has access to this data and write:

   ```ts
   {
     answer: "approved",
     id: string
   }
   ```

   ```ts
   {
     answer: "forbidden",
     id: string
   }
   ```
2. Send data in actions by writing answers:

   ```ts
   {
     answer: "action",
     id: string,
     action: Action,
     meta: Meta
   }
   ```
3. Write `processed` to this response, when it will get response from Logux server.

   ```ts
   {
     answer: "processed",
     id: string
   }
   ```

Back-end server can take the client ID from `meta.id`:

```js

meta.id //=> '1560954012838 38:Y7bysd:O0ETfc 0'
meta.id.split(' ')[1].split(':').slice(0, 2).join(':') //=> '38:Y7bysd'
```

If back-end server doesn’t have code to validate action it must write `unknownChannel` for `logux/subscribe` action and `unknownAction` for other actions.

```ts
{
  answer: "unknownAction",
  id: string
}
```

```ts
{
  answer: "unknownChannel",
  id: string
}
```

If back-end server had any errors during action validating and processing it should write `error` answer (`details` can be used for stack-trace).

```ts
{
  answer: "error",
  id: string,
  details: string
}
```

See [action examples](./examples.md#actions).
