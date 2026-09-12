# Logux Binary Protocol

Logux Protocol has a binary form. It uses the same messages as [text protocol](./spec.md) just in different format.

Text protocols always starts with `[`. If the first byte is not `[` but valid Message Type Byte of binary protocol, we should switch to binary protocol.

## Integer

An unsigned integer encoded as a Variable-Length Quantity (LEB128). Each byte uses the first bit as a continuation flag.

- 1 byte: `0xxxxxxx` covers 0 to 127.
- 2 bytes: `1xxxxxxx 0xxxxxxx` covers 128 to 16,383.
- 3 bytes: `1xxxxxxx 1xxxxxxx 0xxxxxxx` covers 16,384 to 2,097,151.

```
00000010: 2
01111111: 127
10001000 00000001: 136
```

## Signed integer

A signed integer encoded as a `varint` with zigzag: non-negative `n` is encoded as `2n`, negative `n` as `-2n - 1`. Actions, which are older than the current connection, have negative `time` and `shift`.

```
00000000: 0
00000001: -1
00000010: 1
```

## String

```ts
varint length
utf8[length] chars
```

The string starts with a `varint` representing the total byte count. The following bytes are the string body encoded in UTF-8.

`json` is a string with JSON-encoded content. It could be just an empty string if JSON parameter is optional and we are missing it.

## Meta

In contrast with text format, in binary format meta can contains only: `id` (as `shift` and `nodeId` parts), `time`, `subprotocol`.

Sender splits ID to `nodeId` and `shift`, where `shift` is a signed integer of decoded ID time minus second time in `connected` message. Receiver encodes `shift` back to the ID time. If `nodeId` is equal to sender node ID, it could be missed.

`time` is action’s creation time in milliseconds since second time in `connected` message.

If `subprotocol` is equal to the value in `connected` message, it can be missed.

The first byte is a literal value indicating the number of fields that follow.

```ts
2
signed time
signed shift
```

```ts
3
signed time
signed shift
varint subprotocol
```

```ts
4
signed time
signed shift
string nodeId
varint subprotocol
```

## Action ID

Some actions like `logux/processed` references to other action by ID. To encode actions ID a few formats can be used.

The first byte is a ID Type Byte.

```ts
10
signed shift
```

```ts
11
signed shift
string nodeId
```

## Action

Action starts with a single Action Type Byte. Action type bytes only appear inside `sync` messages, so they never collide with message type bytes.

Any action in JSON format.

```ts
"j"
varint length
json[length] data
meta meta
```

`logux/processed` action:

```ts
"p"
id actionId
meta meta
```

[`0` action](https://github.com/logux/actions/blob/main/zero-knowledge/index.d.ts) for end-to-end encryption with compression:

```ts
"Z"
byte[12] iv
varint length
byte[length] d
meta meta
```

`0` with encryption but without compression:

```ts
"z"
byte[12] iv
varint length
byte[length] d
meta meta
```

`0/clean` action with `id`:

```ts
"c"
id actionId
meta meta
```

`0/clean` action with `ids`:

```ts
"C"
varint length
id[length] ids
meta meta
```

## Messages

Each message starts with a single Message Type Byte. These identifiers use ASCII character codes for readability.

See [text protocol](./spec.md) for the meaning of messages options.

Paired messages (`connect`-`connected`, `sync`-`synced`, `ping`-`pong`) use lower and upper case (`c`-`C`, `s`-`S`, `p`-`P`) as type byte.

## `error`

```ts
"e"
string errorType
json options
```

## `headers`

```ts
"h"
json data
```

## `connect`

```ts
"c"
varint protocol
string nodeId
varint synced
varint subprotocol
json options
```

## `connected`

```ts
"C"
varint protocol
string nodeId
varint start
varint end
varint subprotocol
json options
```

## `ping`

```ts
"p"
varint synced
```

## `pong`

```ts
"P"
varint synced
```

## `sync`

```ts
"s"
varint synced
varint length
action[length] actions
```

## `synced`

```ts
"S"
varint synced
```

## `ready`

```ts
"r"
varint synced
```

## `debug`

```ts
"d"
string type
json data
```
