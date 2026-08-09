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
SERVER < ['connected', 0, 'server', [7059950678, 7059951483]]

CLIENT > ['ping', 0]
SERVER < ['pong', 0]

CLIENT > ['headers', { language: 'en' }]

SERVER < ['sync', 1, { type: 'a' }, { id: [59637, 'client2'] }]
CLIENT > ['synced', 1]

CLIENT > ['ping', 1]
SERVER < ['pong', 1]
DISCONNECTED

CONNECTED
CLIENT > ['connect', 0, 'client1', 1, { token: 'token' }]
SERVER < ['connected', 0, 'server', [7060128520, 7060129315]]
SERVER < ['sync', 2, { type: 'b' }, { id: [-18928, 'client2'], time: -18928 }]
CLIENT > ['synced', 2]
```

Clients may hide some actions from each other, so `added` time could be different:

```ts
CONNECTED
CLIENT > ["connect", 0, "client1", 130, { token: "token" }]
SERVER < ["connected", 0, "server", [7059637007, 7059638615]]
SERVER < ["sync", 132,
          { type: 'a' }, { id: [-11687, "client2"], time: -11687 },
          { type: 'b' }, { id: [-22034, "client2"], time: -22034 }]
CLIENT > ["sync", 1,
          { type: 'c' }, { id: -1617, meta: -1617 }]
CLIENT > ["synced", 132]
SERVER < ["synced", 1]

CLINET > ["ping", 3]
SERVER < ["pong", 150]

CLIENT > ["sync", 4,
          { type: 'd' }, { id: 234257, time: 234257 }]
          { type: 'e' }, { id: 234258, time: 234258 }]
SERVER < ["synced", 4]
DISCONNECTED
```
