# Logux Binary Protocol

Logux Protocol has a binary form. It uses the same messages as [text protocol](./spec.md) just in different format.

## Integer

A unsigned integer encoded as a Variable-Length Quantity (LEB128). Each byte uses the first bit as a continuation flag.

- 1 byte: `0xxxxxxx` covers 0 to 127.
- 2 bytes: `1xxxxxxx 0xxxxxxx` covers 128 to 16,383.
- 3 bytes: `1xxxxxxx 1xxxxxxx 0xxxxxxx` covers 16,384 to 2,097,151.

```
00000010: 2
01111111: 127
10001000 00000001: 136
```

## String

```ts
varint length
utf8[length] chars
```

The string starts with a `varint` representing the total byte count. The following bytes are the string body encoded in UTF-8.

`json` is a string with JSON-encoded content.


## Meta

In contrast with text format, in binary format meta could contains only: `id` (as `shift`, `nodeId`, `orderInMs` parts), `time`, `subprotocol`.

`time` is action’s creation time in milliseconds since second time in `connected` message.

`shift` is a milliseconds since second time in `connected` message. If `nodeId` is equal to sender node ID, it could be missed. `[shift, 0]` could be compressed to just `shift`.

If `subprotocol` is equal to the value in `connected` message, it can be missed.

The first byte of meta block encodes how many parts is missing.

```ts
2
number time
number shift
```

```ts
3
number time
number shift
number orderInMs
```

```ts
4
number time
number shift
number orderInMs
number subprotocol
```

```ts
5
number time
number shift
string nodeId
number orderInMs
number subprotocol
```

## Action ID

Some actions like `logux/processed` references to other action by ID. To encode actions ID a few formats can be used:

```ts
10
number shift
```

```ts
11
number shift
number orderInMs
```

```ts
12
number shift
string nodeId
number orderInMs
```

## Action

Action starts with single Action Type Byte.

Any action in JSON format.

```ts
"j"
number length
json[length] data
meta meta
```

`logux/processed` action:

```ts
"p"
id actionId
meta meta
```

`0` action for end-to-end encryption with compression:

```ts
"E"
byte[12] iv
number length
byte[length] d
```

`0` with compression:

```ts
"e"
byte[12] iv
number length
byte[length] d
```

`0/clean` action:

```ts
"c"
id actionId
meta meta
```

## Messages

Each message starts with a single Message Type Byte. These identifiers use ASCII character codes for readability.

See [text protocol](./spec.md) for the meaning for messages options.

Paired messages (`connect`-`connected`, `sync-synced`, `ping-pong`) uses lower and upper case (`c`-`C`, `s`-`S`, `p`-`P`) as type byte.

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
number synced
number subprotocol
json options
```

## `connected`

```ts
"C"
number protocol
string nodeId
number start
number end
number subprotocol
json options
```

## `ping`

```ts
"p"
number synced
```

## `pong`

```ts
"P"
number synced
```

## `sync`

```ts
"s"
number synced
number length
action[length] actions
```

## `synced`

```ts
"S"
number synced
```

## `debug`

```ts
"d"
string type
json data
```
