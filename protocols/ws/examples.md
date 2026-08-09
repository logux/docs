# Logux Protocol Examples

Wrong authentication:

```ts
CONNECTED
CLIENT > ['connect', 0, 'client1', { token: 'wrongToken' }]
SERVER < ['error', 'wrong-credentials']
DISCONNECTED
```

Correct synchronization:

```ts
CONNECTED
CLIENT > ['headers', { language: 'pl' }]
CLIENT > ['connect', 0, 'client1', 0, { token: 'token' }]
SERVER < ['headers', { env: 'development' }]
SERVER < ['connected', 0, 'server', [1786312345678, 1786312346483]]

CLIENT > ['ping', 0]
SERVER < ['pong', 0]

CLIENT > ['headers', { language: 'en' }]

SERVER < ['sync', 1, { type: 'a' }, { id: 'OzaODN- client2' }]
CLIENT > ['synced', 1]

CLIENT > ['ping', 1]
SERVER < ['pong', 1]
DISCONNECTED

CONNECTED
CLIENT > ['connect', 0, 'client1', 1, { token: 'token' }]
SERVER < ['connected', 0, 'server', [1786312523520, 1786312524315]]
SERVER < ['sync', 2, { type: 'b' }, { id: 'OzaODN0 client2', time: -18928 }]
CLIENT > ['synced', 2]
```

Clients may hide some actions from each other, so `added` time could be different:

```ts
CONNECTED
CLIENT > ["connect", 0, "client1", 130, { token: "token" }]
SERVER < ["connected", 0, "server", [1786312032007, 1786312033615]]
SERVER < ["sync", 132,
          { type: 'a' }, { id: "OzaODN1 client2", time: -11687 },
          { type: 'b' }, { id: "OzaODN2 client2", time: -22034 }]
CLIENT > ["sync", 1,
          { type: 'c' }, { id: "OzaODN3", time: -1617 }]
CLIENT > ["synced", 132]
SERVER < ["synced", 1]

CLINET > ["ping", 3]
SERVER < ["pong", 150]

CLIENT > ["sync", 4,
          { type: 'd' }, { id: "OzaODN4", time: 234257 }]
          { type: 'e' }, { id: "OzaODN5", time: 234258 }]
SERVER < ["synced", 4]
DISCONNECTED
```
