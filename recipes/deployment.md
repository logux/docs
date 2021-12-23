# Deploying Logux Server

Logux Server can be deployed to any hosting provider where Node.js is available.

## Docker Image

[Docker](https://www.docker.com/) is the preferred way to deploy Logux since Docker is supported by various number of cloud providers and can be used in more complex schemas such as deployment to Kubernetes cluster.


```js
// index.js

import { Server } from '@logux/server'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Since we are in ESM scope, we don't have __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = new Server(
  Server.loadOptions(process, {
    subprotocol: '1.0.0',
    supports: '1.x',
    host: '0.0.0.0', // Note we must bind to 0.0.0.0
    root: __dirname,
  })
)

// ...

server.listen()
```

Create `Dockerfile`. Here there is an example for Yarn Classic.

```dockerfile
// Dockerfile

# Install dependencies only when needed
FROM node:lts-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts --production

# Production image, copy all the files and run Logux
FROM node:lts-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S logux -u 1001

# Copy all files
COPY index.js .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

USER logux

EXPOSE 31337

CMD ["node", "index.js"]
```

## Health Check

Logux Server provides a HTTP health check endpoint to indicate whether server is running or not:

```
GET /health
```

It is useful for monitoring or orchestrating purposes.
