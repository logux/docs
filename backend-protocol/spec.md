# Logux Back-end Protocol

Logux uses Back-end protocol to make a proxy between WebSocket and HTTP.
Logux sends user’s authentication requests, subscriptions and actions
to HTTP server and receive actions by HTTP to send these actions
to Logux clients.

* **Communication examples:** [`examples.md`](./examples.md)
* **Protocol versions:** [`changes.md`](./changes.md)
* **Referral JS implementation:**
  [`logux_rails`](https://github.com/logux/logux_rails)


## Requests

HTTP requests use `POST` method and JSON to encode the body.

Each request contains protocol version (the latest version is `1`),
password to protect servers from unknown requests from Internet (you set this password by `LOGUX_CONTROL_PASSWORD`) and list of commands.

```ts
{
  "version": number version,
  "password": string password,
  "commands": [
    (command)+
  ]
}
```

Requests from back-end server to Logux server use only `action` command.
Requests from Logux server to back-end server use `auth` and `action` commands.

Each request can contain multiple commands from different users.

HTTP response contains array of responses for every command.
Responses could have different order, than commands. Some commands
requires more than 1 answer during processing.

HTTP server should use keep-alive HTTP response to write answers during
the processing. It will be bad for performance if server will write
answers for all commands only when latest command was processed.

```ts
[
  [string status, string id])+
]
```


## `auth`

```ts
["auth", string userId, any credentials, string authId]
```

`auth` command ask back-end server to authenticate user by ID and credentials
(in most of the cases it will be string JWT token). `authId` is used
to identificate request, when request contains multiple `auth` commands.

Back-end server must answer `["authenticated", authId]` on correct user ID
and credentials or `["denied", authId]` on wrong credentials or unknown user ID.


## `action`

```ts
["action", object action, object meta]
```

Logux server uses `action` command to ask back-end server to process action
or subscriptions. Back-end server uses this action to ask Logux server
to add action to the log and re-send it to all clients from action’s meta.

Back-end server must do 2 steps during action processing:

1. Validate that user has right to do this action. Back-end server must write
   `["approved", meta.id]` or `["forbidden", meta.id]` answer to HTTP responses immediately when it finished this step.
2. Process the action (for instance, apply changes to database).
   Back-end server must write `["processed", meta.id]` immediately when
   it finished this step.

Back-end server can take user ID from `meta.id`:

```js
meta.id //=> '1560954012838 me@example.com:Y7bysd:O0ETfc 0'
meta.id.split(' ')[1].split(':')[0] //=> 'me@example.com'
```

Action with `type: "logux/subscribe"` tells that user want to load data
and subscribe to data changes. On this action back-end server must:

1. Validate that user has access to this data and write
   `["approved", meta.id]` or `["forbidden", meta.id]`.
2. Send separated HTTP request with actions with current data
   to Logux server using `action` commands. Actions with data must use
   client ID from subscribe’s action in `meta.clientIds` array.
3. Write `["processed", meta.id]` to this response.

Back-end server can take user ID from `meta.id`:

```js

meta.id //=> '1560954012838 me@example.com:Y7bysd:O0ETfc 0'
meta.id.split(' ')[1].split(':').slice(0, 2).join(':') //=> 'me@example.com:Y7bysd'
```

If back-end server doesn’t have code to validate action it must write
`["unknownChannel", meta.id]` for `logux/subscribe` action
and `["unknownAction", meta.id]` for other actions.

If back-end server had any errors during action validating and processing
it should write `["error", string stacktrace]` answer.
