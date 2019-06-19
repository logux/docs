# Logux Back-end Protocol Examples

## Authentication

Request:

```js
POST /logux
Content-Type: application/json

{
  "version": 1,
  "password": "secret",
  "commands": [
    ["auth", "ivan@example.com", "good-token", "gf4Ygi6grYZYDH5Z2BsoR"]
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
  "password": "secret",
  "commands": [
    [
      "action",
      { type: 'user/rename', user: 'me@example.com', name: 'New' },
      { id: "1560954012838 me@example.com:Y7bysd:O0ETfc 0", time: 1560954012838 }
    ],
    [
      "action",
      { type: 'user/rename', user: 'other@example.com', name: 'New' },
      { id: "1560954012900 me@example.com:Y7bysd:O0ETfc 1", time: 1560954012900 }
    ]
  ]
}
```

Response:

```js
[
  ["approved", "1560954012838 me@example.com:Y7bysd:O0ETfc 0"],
  ["denied", "1560954012900 me@example.com:Y7bysd:O0ETfc 1"],
  ["processed", "1560954012838 me@example.com:Y7bysd:O0ETfc 0"]
]
```

## Subscription

Request:

```js
POST /logux
Content-Type: application/json

{
  "version": 1,
  "password": "secret",
  "commands": [
    [
      "action",
      { type: 'logux/subscribe', channel: 'me@example.com/name' },
      { id: "1560954012858 me@example.com:Y7bysd:O0ETfc 0", time: 1560954012858 }
    ]
  ]
}
```

Back-end server writes:

```js
[
  ["approved", "1560954012858 me@example.com:Y7bysd:O0ETfc 0"],
```

Then back-end server send HTTP request to Logux server:

```js
POST /
Content-Type: application/json

{
  "version": 1,
  "password": "secret",
  "commands": [
    [
      "action",
      { type: 'user/name', user: 'me@example.com', name: 'The User' },
      { clients: ['me@example.com:Y7bysd'] }
    ]
  ]
}
```

After the answer from Logux server, back-end write the last part
of HTTP response:

```js
  ["processed", "1560954012858 me@example.com:Y7bysd:O0ETfc 0"]
]
```


## Wrong Actions

Request:

```js
POST /logux
Content-Type: application/json

{
  "version": 1,
  "password": "secret",
  "commands": [
    [
      "action",
      { type: 'logux/subscribe', channel: 'me@example.com/nme' },
      { id: "1560954022858 me@example.com:Y7bysd:O0ETfc 0", time: 1560954022858 }
    ],
    [
      "action",
      { type: 'user/renam', user: 'me@example.com', name: 'New' },
      { id: "1560954022858 me@example.com:Y7bysd:O0ETfc 1", time: 1560954022858 }
    ]
  ]
}
```

Response:

```js
[
  ["unknownChannel", "1560954022858 me@example.com:Y7bysd:O0ETfc 0"],
  ["unknownAction", "1560954022858 me@example.com:Y7bysd:O0ETfc 1"]
]
```


## Error

If error has any internal error or any problem with infrastructure during
action or authentication processing it should response:

```js
[["error", "PostgreSQLError: No connection to database\n    at DB.connnect"]]
```
