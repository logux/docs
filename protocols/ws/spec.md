# Logux Protocol

Logux is a client-server communication protocol. It synchronizes actions between clients and server logs.

* [Communication examples](./examples.md)
* [Protocol versions](./versions.md)
* Referral JS implementation: [`@logux/core`](https://github.com/logux/core)


## Basics

You can use any encoding and any low-level protocol: JSON encoding over WebSocket, XML over AJAX and HTTP “keep-alive”. Low-level protocol must guarantee messages order and content. Main way is JSON over WebSocket Secure.

This protocol is based on simple JS types: boolean, number, string, array and key-value object.


## Messages

Communication is based on messages. Every message is a array with string in the beginning and any types next:

```ts
[
  string type,
  …
]
```

First string in message array is a message type. Possible types:

* [`error`]
* [`headers`]
* [`connect`]
* [`connected`]
* [`ping`]
* [`pong`]
* [`sync`]
* [`synced`]
* [`debug`]

If client received unknown type, it should send `wrong-format` error and continue communication.

Protocol design has no client and server roles. But in most real cases client will send `connect` and `ping`. Server will send `connected` and `pong`. Both will send `headers`, `error`, `sync` and `synced`.

[`headers`]:   #headers
[`connected`]: #connected
[`connect`]:   #connect
[`synced`]:    #synced
[`error`]:     #error
[`ping`]:      #ping
[`pong`]:      #pong
[`sync`]:      #sync
[`debug`]:     #debug


## `error`

Error message contains error description and error type.

```ts
[
  "error",
  string errorType,
  (any options)?
]
```

Right now there are 7 possible errors:

* `wrong-protocol`: client Logux protocol version is not supported by server. Error options object will contain `supported` key with minimum supported version and `used` with used version.
* `wrong-format`: message is not correct JSON, is not a array or have no `type`. Error options will contain bad message string.
* `unknown-message`: message’s type is not supported. Error options will contain bad message type.
* `wrong-credentials`: sent token doesn’t pass authentication.
* `missed-auth`: not `connect`, `connected` or `error` messages was sent before authentication. Error options will contain bad message string.
* `timeout`: a timeout was reached. Errors options will contain timeout duration in milliseconds.
* `wrong-subprotocol`: client application subprotocol version is not supported by server. Error options object will contain `supported` key with requirements and `used` with used version.

## `headers`

`headers` message contains custom data about the node. For instance, a user’s locale or server’s environment.

```ts
[
  "headers",
  (object data)
]
```

The second position is data object. This object could contain any keys and values.
After receiving this command receiver doesn’t send any messages back.

The sender could send this command multiple times but data will be saved only from the last command.
If next `headers` misses some keys from previous command, node should delete these missed keys.

## `connect`

After connection was started some client should send `connect` message to other.

```ts
[
  "connect",
  number protocol,
  string nodeId,
  number synced,
  (object options)?
]
```

Receiver should check protocol version in second position in message array. If version is lower, than minimum supported version, it should send `wrong-protocol` error and close connection.

Third position contains unique node name. Same node name is used in default log timer, so sender must be sure that name is unique. Client should use UUID if it can’t guarantee name uniqueness with other way.

Fourth position contains last `added` time used by receiver in previous connection (`0` on first connection). message with all new actions since `synced` (all actions on first connection).

Fifth position is optional and contains extra client option in object. Right now protocol supports only `subprotocol` and `token` keys there.

Subprotocol version is a string in [SemVer] format. It describes a application subprotocol, which developer will create on top of Logux protocol. If other node doesn’t support this subprotocol version, it could send `wrong-subprotocol` error.

Token could be a string. On wrong token data receiver may send `wrong-credentials` error and close connection.

In most cases client will initiate connection, so client will send `connect`.

[SemVer]: http://semver.org/


## `connected`

This message is answer to received [`connect`] message.

```ts
[
  "connected",
  number protocol,
  string nodeId,
  [number start, number end],
  (object options)?
]
```

`protocol`, `nodeId` and `options` are same with [`connect`] message, but contains server’s protocol, server’s Node ID and optional server token.

Fourth position contains [`connect`] receiving time and `connected` sending time. Time should be a milliseconds elapsed since 1 January 1970 00:00:00 UTC. Receiver may use this information to calculate difference between sender and receiver time. It could prevents problems if somebody has wrong time or wrong time zone. Calculated time fix may be used to correct action’s `time` in [`sync`] messages.

Right after this message receiver should send [`sync`] message with all new actions since last connection (all actions on first connection).

In most cases client will initiate connection, so server will answer `connected`.


## `ping`

Client could send `ping` message to check connection.

```ts
[
  "ping",
  number synced
]
```

Message array contains also sender last `added`. So receiver could update it to use in next [`connect`] message.

Receiver should send [`pong`] message as soon as possible.

In most cases client will send `ping`.


## `pong`

`pong` message is a answer to [`ping`] message.

```ts
[
  "pong",
  number synced
]
```

Message array contains sender last `added` too.

In most cases server will send `pong`.


## `sync`

This message contains new actions for synchronization.

```ts
[
  "sync",
  number synced
  (object action, object meta)+
]
```

Second position contain biggest `added` time from actions in message. Receiver should send it back in [`synced`] message.

This message array length is dynamic. For each action sender should add 2 position: for action object and action’s metadata.

Action object could contains any key and values, but it must contains at least `type` key with string value.

Action metadata contains at least `id` and `time`. `time` is action’s creation time. It is a milliseconds since second time in `connected` message.

`id` could be in 3 forms:

```ts
[number shift, string nodeId, number orderInMs]
[number shift, number orderInMs]
number shift
```

`shift` is a milliseconds since second time in `connected` message. If `nodeId` is equal to sender node ID, it could be missed. `[shift, 0]` could be compressed to just `shift`.

Every action should have unique `id`. If receiver’s log already contains action with same `id`, receiver must silently ignore new action from `sync`.

Received action’s `time` time may be different with sender’s `time`, because sender could correct action’s time based on data from [`connected`] message. This correction could fix problems when some client have wrong time or time zone.


## `synced`

`synced` message is a answer to [`sync`] message.

```ts
[
  "synced",
  number synced
]
```

Receiver should mark all actions with lower `added` time as synchronized.


## `debug`

`debug` message contains debug information for developer.

```ts
[
  "debug",
  string type,
  any data
]
```

Right now there is only one type:

* `error`: node catch a error. Debug data will contain error stack trace.
