# Pagination example with logux

Example implementation of a **real-time table** with **pagination**.

This table supports all **CRUD** operations.

[source code]

## Using typesafe actions

As recommended in the [logux TypeScript recipe], we use [`typescript-fsa`] to share actions between client and server:

```ts
import { actionCreatorFactory } from 'typescript-fsa'

export const createAction = actionCreatorFactory()

export const loadPlayersPageAction = createAction<{
  page: number
}>('players/loadPage')

export const playersPageLoadedAction =
  createAction<PlayersPageResponse>('players/pageLoaded')

export const createPlayerAction = createAction<Player>('players/create')

export const playerCreatedAction = createAction<{
  player: Player
  senderClientId: string
}>('players/created')

export const updatePlayerAction = createAction<Player>('players/update')

export const deletePlayerAction = 
  createAction<{ id: string }>('players/delete')

export const playerDeletedAction = createAction<{
  id: string
  senderClientId: string
}>('players/deleted')

```

## Fetching data with pagination

To get data by pages from the server, we use **2 actions**: `loadPlayersPageAction` and `playersPageLoadedAction`.

The first one is sent from the client:

```ts
client.sync(loadPlayersPageAction({ page }))
```

The server handles it and sends back the `playersPageLoadedAction`:

```ts
server.type(loadPlayersPageAction, {
  async access() {
    ...
  },
  async process(ctx, action) {
    const playersPage = await getPlayersPage(action.payload.page)
    await ctx.sendBack(playersPageLoadedAction(playersPage))
  }
})
```

Note that the action `playersPageLoadedAction` is sent [back to the same client], and other clients don't receive it.

The client handles the `playersPageLoadedAction` by updating the respective states:

```ts
client.type(playersPageLoadedAction, action => {
  setPlayers(action.payload.players)
  setPage(action.payload.page)
  setTotalPages(action.payload.totalPages)

  /* 
    This could happen if we, for example, 
    had 2 pages and tried to get page 2,
    but during that time the page 2 was deleted
    and the server returned: page = 2, totalPages = 1.
    
    In this case, instead of showing an empty page 
    to the user, we update the page:
  */
  if (
    action.payload.page > action.payload.totalPages &&
    action.payload.totalPages > 0
  ) {
    setPage(action.payload.totalPages)
    client.sync(
      loadPlayersPageAction({ page: action.payload.totalPages })
    )
  }
})
```

## Creating a new item

From the client, we send `createPlayerAction` to the server.

The server handles the action and sends `playerCreatedAction` to **all clients** that are subscribed to the `players` channel:

```ts
server.type(createPlayerAction, {
  async access() {
    ...
  },
  async process(ctx, action) {
    const player = await createPlayer(action.payload)
    // Notify all clients so that they can update UI
    await server.process(
      playerCreatedAction({
        player,
        senderClientId: ctx.clientId
      })
    )
  }
})

server.type(playerCreatedAction, {
  async access() {
    return false
  },
  resend() {
    return [PLAYERS_CHANNEL]
  }
})
```

On the client, if we can add the new item to the **current page** (for example, the current page has 4 elements and we display 5 element per page), then we update the table using **Optimistic UI**:

```ts
setIsUpdating(true)
client.sync(createPlayerAction(player)).catch(() => {
  setIsUpdating(false)
})
if (players.length < PER_PAGE) {
  // Update the table right away
  setPlayers(data => [...data, player])
}
```

However, if we **can't add** a new item to the current page (for example, the current page has 5 elements out of 5 and we have 2 pages in total), then we need to **request the current page again** after adding the item, in order to properly update the total number of pages that might have changed after a new item was added:

```ts
// Handle `playerCreatedAction` that was sent from the server
// by updating the current page
client.sync(loadPlayersPageAction({ page }))
```

## Deleting an item

Upon deletion, we send `deletePlayerAction` to the server and immediately update the table with **Optimistic UI**:

```ts
setPlayers(data => data.filter(x => x.id !== player.id))
setIsUpdating(true)
client.sync(deletePlayerAction({ id: player.id })).catch(() => {
  setIsUpdating(false)
})
```

The server handles the action and sends `playerDeletedAction` to **all clients** that are subscribed to the `players` channel:

```ts
server.type(deletePlayerAction, {
  async access() {
    ...
  },
  async process(ctx, action) {
    await deletePlayer(action.payload.id)
    // Notify all clients so that they can update UI
    await server.process(
      playerDeletedAction({
        id: action.payload.id,
        senderClientId: ctx.clientId
      })
    )
  }
})

server.type(playerDeletedAction, {
  async access() {
    return false
  },
  resend() {
    return [PLAYERS_CHANNEL]
  }
})
```

After the client receives the `playerDeletedAction`, it needs to **update the current page** in order to **get actual page data** that might have changed after deletion of an element:

```ts
// Refresh the current page
client.sync(loadPlayersPageAction({ page }))
```

## Updating an item

To update the data, we send `updatePlayerAction` to the server and **update UI right away**:

```ts
setPlayers(data =>
  data.map(player => (player.id === edited.id ? edited : player))
)
client.sync(updatePlayerAction(edited))
```

The server handles the action and resends it to **all clients** subscribed to the `players` channel:

```ts
server.type(updatePlayerAction, {
  async access() {
    ...
  },
  async process(ctx, action, meta) {
    const player = await findPlayer(action.payload.id)
    if (!player || isFirstOlder(meta, player.updatedAt.toString())) {
      return
    }

    await updatePlayer(action.payload)
  },
  resend() {
    return PLAYERS_CHANNEL
  }
})
```

When a client receives this action from the server, it checks to see if this action **was initiated by it** (by comparing [clientId]), and if so, it means that **UI has already been updated** and the action can be ignored. Otherwise, the client updates the UI:

```ts
client.type(updatePlayerAction, (action, meta) => {
  if (client.clientId === parseId(meta.id).clientId) {
    return
  }

  setPlayers(prev =>
    prev.map(x => (x.id === action.payload.id ? action.payload : x))
  )
})
```

[source code]: https://github.com/VladBrok/logux-pagination-example
[back to the same client]: https://logux.org/node-api/#channelcontext-sendback
[logux TypeScript recipe]: https://logux.org/recipes/typescript/
[`typescript-fsa`]: https://github.com/aikoven/typescript-fsa
[clientId]: https://logux.org/web-api/#client-clientid
