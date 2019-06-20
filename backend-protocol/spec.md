# Logux Back-end Protocol

Logux uses Back-end Protocol to make a proxy between WebSocket and HTTP.
Logux Server sends the user’s authentication requests, subscriptions,
and actions to an HTTP server and receives new actions by HTTP to send them
to Logux clients.

* **Communication examples:** [`examples.md`](./examples.md)
* **Protocol versions:** [`changes.md`](./changes.md)
* **Referral JS implementation:**
  [`logux_rails`](https://github.com/logux/logux_rails)


## Requests

HTTP requests use `POST` method and JSON to encode the body.

Each request contains protocol version (the latest version is `2`),
the password to protect servers from unknown requests from Internet
(you set this password by `LOGUX_CONTROL_PASSWORD`) and list of commands.

```ts
{
  "version": number version,
  "password": string password,
  "commands": [
    command+
  ]
}
```

Requests from Logux server to back-end server use `auth` and `action` commands.
Requests from a back-end server to Logux server use only `action` command.

For performance reasons, each request can contain multiple commands
from different users.

The HTTP response contains an array of responses.
Responses could have a different order than commands.
Some commands require more than one answer during processing.

HTTP server should use keep-alive HTTP response to write answers to TCP socket
during the processing. It will be bad for performance if the server will write
answers for all commands only when the latest command was processed.

```ts
[
  answer+
]
```


## `auth`

```ts
["auth", string userId, any credentials, string authId]
```

`auth` command asks back-end server to authenticate the user by ID
and credentials (for instance, string of JWT token). `authId` is used
to specify the command, when the HTTP request contains multiple `auth` commands.

Back-end server must answer `["authenticated", authId]` on correct user ID
and credentials or `["denied", authId]` on wrong credentials or unknown user ID.

See [authentication example](./examples.md#authentication).


## `action`

```ts
["action", object action, object meta]
```

Logux server uses `action` command to ask the back-end server to process action
or subscription. Back-end server uses this action to ask Logux server
to add action to the log and re-send it to all clients from action’s meta.

Back-end server must do three steps during action processing:

1. Mark what users will also receive this action by writing
   `["resend", meta.id, { "channels": ["project/12"] }]` answer
   to HTTP response. Object can use `channels`, `nodes`, `clients` or `users`
   to specify receivers. If Logux should not re-send this action,
   back-end server should not write anything. Do not worry, Logux will re-send
   actions only after passing validation on step 2.
2. Validate that the user has the right to do this action. Back-end server must
   write `["approved", meta.id]` or `["forbidden", meta.id]` answer
   to HTTP responses immediately when it finished this step.
3. Process the action (for instance, apply changes to the database).
   Back-end server must write `["processed", meta.id]` immediately when
   it finished this step.

Back-end server can take user ID from `meta.id`:

```js
meta.id //=> '1560954012838 38:Y7bysd:O0ETfc 0'
meta.id.split(' ')[1].split(':')[0] //=> '38'
```

Action with `type: "logux/subscribe"` tells that user wants to load data
and subscribe to data changes. On this action back-end server must:

1. Validate that the user has access to this data and write
   `["approved", meta.id]` or `["forbidden", meta.id]`.
2. Send separated HTTP request with actions with current data
   to Logux server using `action` commands. Actions with data must use
   client ID from subscribe’s action in `meta.clients` array.
3. Write `["processed", meta.id]` to this response, when it will get response
   from Logux server.

Back-end server can take the client ID from `meta.id`:

```js

meta.id //=> '1560954012838 38:Y7bysd:O0ETfc 0'
meta.id.split(' ')[1].split(':').slice(0, 2).join(':') //=> '38:Y7bysd'
```

If back-end server doesn’t have code to validate action it must write
`["unknownChannel", meta.id]` for `logux/subscribe` action
and `["unknownAction", meta.id]` for other actions.

If back-end server had any errors during action validating and processing
it should write `["error", string stacktrace]` answer.

See [action examples](./examples.md#actions).
