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
    {
      "command": "auth",
      "authId": "gf4Ygi6grYZYDH5Z2BsoR",
      "userId": "38",
      "cookie": {
        "token:": "good-token"
      }
    }
  ]
}
```

Response:

```js
[
  {
    "answer": "authenticated",
    "authId": "gf4Ygi6grYZYDH5Z2BsoR"
  }
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
    {
      "command": "action",
      "action": {
        "type": "user/rename",
        "user": 38,
        "name": "New"
      },
      "meta": {
        "id": "1560954012838 38:Y7bysd:O0ETfc 0",
        "time": 1560954012838,
        "subprotocol": "1.0.0"
      }
    },
    {
      "command": "action",
      "action": {
        "type": "user/rename",
        "user": 21,
        "name": "New"
      },
      "meta": {
        "id": "1560954012900 38:Y7bysd:O0ETfc 1",
        "time": 1560954012900,
        "subprotocol": "1.0.0"
      }
    }
  ]
}
```

Response:

```js
[
  {
    "answer": "resend",
    "id": "1560954012838 38:Y7bysd:O0ETfc 0",
    "channels": ["users/38"]
  },
  {
    "answer": "resend",
    "id": "1560954012900 38:Y7bysd:O0ETfc 1",
    "channels": ["users/21"]
  },
  {
    "answer": "approved",
    "id": "1560954012838 38:Y7bysd:O0ETfc 0"
  },
  {
    "answer": "denied",
    "id": "1560954012900 38:Y7bysd:O0ETfc 1"
  },
  {
    "answer": "processed",
    "id": "1560954012838 38:Y7bysd:O0ETfc 0"
  }
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
    {
      "command": "action",
      "action": {
        "type": "logux/subscribe",
        "channel": "user/38",
        "since": { "id": "1560954012838 38:Y7bysd:O0ETfc 0", "time": 1560954012838 }
      },
      "meta": {
        "id": "1560954012858 38:Y7bysd:O0ETfc 0",
        "time": 1560954012858,
        "subprotocol": "1.0.0"
      }
    }
  ]
}
```

Back-end server writes:

```js
[
  {
    "answer": "approved",
    "id": "1560954012858 38:Y7bysd:O0ETfc 0"
  },
```

Then back-end server sends HTTP request to Logux server:

```js
POST /
Content-Type: application/json

{
  "version": 1,
  "secret": "secret",
  "commands": [
    {
      "command": "action",
      "action": { "type": "user/name", "user": 38, "name": "The User" },
      "meta": { "client": "38:Y7bysd" }
    }
  ]
}
```

After the answer from Logux server, back-end writes the last part of an HTTP response:

```js
  {
    "answer": "processed",
    "id": "1560954012858 38:Y7bysd:O0ETfc 0"
  }
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
    {
      "command": "action",
      "action": { "type": "logux/subscribe", "channel": "usrs/38" },
      "meta": { "id": "1560954022858 38:Y7bysd:O0ETfc 0", "time": 1560954022858 }
    },
    {
      "command": "action",
      "action": { "type": "user/renam", "user": 38, "name": "New" },
      "meta": { "id": "1560954022858 38:Y7bysd:O0ETfc 1", "time": 1560954022858 }
    }
  ]
}
```

Response:

```js
[
  {
    "answer": "unknownChannel",
    "id": "1560954022858 38:Y7bysd:O0ETfc 0"
  },
  {
    "answer": "unknownAction",
    "id": "1560954022858 38:Y7bysd:O0ETfc 1"
  }
]
```


## Error

Back-end server response on an internal error:

```js
[
  {
    "answer": "error",
    "id": "1560954012838 38:Y7bysd:O0ETfc 0",
    "details": "PostgreSQLError: No connection to database\n    at DB.connnect"
  }
]
```
