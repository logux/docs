# Logux Back-end Protocol Examples

## Authentication

Request:

```js
POST /logux
Content-Type: application/json

{
  "version": 1,
  "secret": "secret",
  "commands": [
    ["auth", "38", "good-token", "gf4Ygi6grYZYDH5Z2BsoR"]
  ]
}
```

Response:

```js
[
  ["authenticated", "gf4Ygi6grYZYDH5Z2BsoR"]
]
```

## Actions

Request:

```js
POST /logux
Content-Type: application/json

{
  "version": 1,
  "secret": "secret",
  "commands": [
    [
      "action",
      { type: 'user/rename', user: 38, name: 'New' },
      { id: "1560954012838 38:Y7bysd:O0ETfc 0", time: 1560954012838 }
    ],
    [
      "action",
      { type: 'user/rename', user: 21, name: 'New' },
      { id: "1560954012900 38:Y7bysd:O0ETfc 1", time: 1560954012900 }
    ]
  ]
}
```

Response:

```js
[
  ["resend", "1560954012838 38:Y7bysd:O0ETfc 0", { "channels": ["users/38"] }],
  ["resend", "1560954012900 38:Y7bysd:O0ETfc 1", { "channels": ["users/21"] }],
  ["approved", "1560954012838 38:Y7bysd:O0ETfc 0"],
  ["denied", "1560954012900 38:Y7bysd:O0ETfc 1"],
  ["processed", "1560954012838 38:Y7bysd:O0ETfc 0"]
]
```

## Subscription

Request:

```js
POST /logux
Content-Type: application/json

{
  "version": 1,
  "secret": "secret",
  "commands": [
    [
      "action",
      { type: 'logux/subscribe', channel: '38/name' },
      { id: "1560954012858 38:Y7bysd:O0ETfc 0", time: 1560954012858 }
    ]
  ]
}
```

Back-end server writes:

```js
[
  ["approved", "1560954012858 38:Y7bysd:O0ETfc 0"],
```

Then back-end server sends HTTP request to Logux server:

```js
POST /
Content-Type: application/json

{
  "version": 1,
  "secret": "secret",
  "commands": [
    [
      "action",
      { type: 'user/name', user: 38, name: 'The User' },
      { clients: ['38:Y7bysd'] }
    ]
  ]
}
```

After the answer from Logux server, back-end writes the last part of an HTTP response:

```js
  ["processed", "1560954012858 38:Y7bysd:O0ETfc 0"]
]
```


## Wrong Actions

Request:

```js
POST /logux
Content-Type: application/json

{
  "version": 1,
  "secret": "secret",
  "commands": [
    [
      "action",
      { type: 'logux/subscribe', channel: 'usrs/38' },
      { id: "1560954022858 38:Y7bysd:O0ETfc 0", time: 1560954022858 }
    ],
    [
      "action",
      { type: 'user/renam', user: 38, name: 'New' },
      { id: "1560954022858 38:Y7bysd:O0ETfc 1", time: 1560954022858 }
    ]
  ]
}
```

Response:

```js
[
  ["unknownChannel", "1560954022858 38:Y7bysd:O0ETfc 0"],
  ["unknownAction", "1560954022858 38:Y7bysd:O0ETfc 1"]
]
```


## Error

Back-end server response on an internal error:

```js
[
  ["error", "PostgreSQLError: No connection to database\n    at DB.connnect"]
]
```
