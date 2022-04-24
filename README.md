# Logux

<img align="right" width="95" height="148" title="Logux logotype"
     src="https://logux.io/branding/logotype.svg">

Logux is an WebSocket client/server framework to make:

* **Collaborative apps** when multiple users work with the same document. Logux has features inspired by **[CRDT]** to resolve edit conflicts between users. Real-time updates to prevent conflicts. Time travel to keep actions order the same on every client. A distributed timer to detect the latest changes.
* **Real-time** to see changes by another user immediately. Logux combines WebSocket with modern reactive client architecture. It synchronizes Redux actions between clients and servers, and **keeps the same order** of actions.
* **Optimistic UI** to improve UI performance by updating UI without waiting for an answer from the server. **Time travel** will revert changes later if the server refuses them.
* **Offline-first** for the next billion users or New York City Subway. Logux saves Redux actions to **IndexedDB** and has a lot of features to **merge changes** from different users.
* **Without vendor lock-in**: works in any cloud with **any database**.
* Just extra [**9 KB**] in client-side JS bundle.

Ask your questions at [community chat] or [commercial support].

[Next chapter](./guide/starting/choosing-architecture.md)

[commercial support]: mailto:logux@evilmartians.com
[community chat]: https://gitter.im/logux/logux
[**9 kB**]: https://github.com/logux/client/blob/main/package.json#L57-L63
[CRDT]: https://slides.com/ai/crdt

<a href="https://evilmartians.com/?utm_source=logux-docs">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>


## Client Example

Using [Logux Client](https://github.com/logux/client/):

<details open><summary>React client</summary>

```ts
import { syncMapTemplate } from '@logux/client'

export type TaskValue {
  finished: boolean
  text: string
  authorId: string
}

export const Task = syncMapTemplate<TaskValue>('tasks')
```

```ts
export const ToDo = ({ userId }) => {
  const tasks = useFilter(Task, { authorId: userId })
  if (tasks.isLoading) {
    return <Loader />
  } else {
    return <ul>
      {tasks.map(task => <li>{task.text}</li>)}
    </ul>
  }
}
```

```ts
export const TaskPage = ({ id }) => {
  const client = useClient()
  const task = useSync(Task, id)
  if (task.isLoading) {
    return <Loader />
  } else {
    return <form>
      <input type="checkbox" checked={task.finished} onChange={e => {
        changeSyncMapById(client, Task, id, { finished: e.target.checked })
      }}>
      <input type="text" value={post.title} onChange={e => {
        changeSyncMapById(client, Task, id, { text: e.target.value })
      }} />
    </form>
  }
}
```

</details>
<details><summary>Vue client</summary>

Using [Logux Vuex](https://github.com/logux/vuex/):

```html
<template>
  <h1 v-if="isSubscribing">Loading</h1>
  <div v-else>
    <h1>{{ counter }}</h1>
    <button @click="increment"></button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore, useSubscription } from '@logux/vuex'

export default {
  setup () {
    // Inject store into the component
    let store = useStore()
    // Retrieve counter state from store
    let counter = computed(() => store.state.counter)
    // Load current counter from server and subscribe to counter changes
    let isSubscribing = useSubscription(['counter'])

    function increment () {
      // Send action to the server and all tabs in this browser
      store.commit.sync({ type: 'INC' })
    }

    return {
      counter,
      increment,
      isSubscribing
    }
  }
}
</script>
```

</details>
<details><summary>Pure JS client</summary>

You can use [Logux Client](https://github.com/logux/client/) API with any framework:

```js
client.type('INC', (action, meta) => {
  counter.innerHTML = parseInt(counter.innerHTML) + 1
})

increase.addEventListener('click', () => {
  client.sync({ type: 'INC' })
})

loading.classList.add('is-show')
await client.sync({ type: 'logux/subscribe' channel: 'counter' })
loading.classList.remove('is-show')
```

</details>


## Server Example

Using [Logux Server](https://github.com/logux/server/):

```js
addSyncMap(server, 'tasks', {
  async access (ctx, id) {
    const task = await Task.find(id)
    return ctx.userId === task.authorId
  },
  async load (ctx, id, since) {
    const task = await Task.find(id)
    if (!task) throw new LoguxNotFoundError()
    return {
      id: task.id,
      text: ChangedAt(task.text, task.textChanged),
      finished: ChangedAt(task.finished, task.finishedChanged),
    }
  },
  async create (ctx, id, fields, time) {
    await Task.create({
      id,
      authorId: ctx.userId,
      text: fields.text,
      textChanged: time,
      finished: fields.finished,
      finishedChanged: time
    })
  },
  async change (ctx, id, fields, time) {
    const task = await Task.find(id)
    if ('text' in fields) {
      if (task.textChanged < time) {
        await task.update({
          text: fields.text,
          textChanged: time
        })
      }
    }
    if ('finished' in fields) {
      if (task.finishedChanged < time) {
        await task.update({
          finished: fields.finished,
          finishedChanged: time
        })
      }
    }
  }
  async delete (ctx, id) {
    await Task.delete(id)
  }
})

addSyncMapFilter(server, 'tasks', {
  access (ctx, filter) {
    return true
  },
  initial (ctx, filter, since) {
    let tasks = await Tasks.where({ ...filter, authorId: ctx.userId })
    return tasks.map(task => ({
      id: task.id,
      text: ChangedAt(task.text, task.textChanged),
      finished: ChangedAt(task.finished, task.finishedChanged),
    }))
  },
  actions (filterCtx, filter) {
    return (actionCtx, action, meta) => {
      return actionCtx.userId === filterCtx.userId
    }
  }
})
```


## Talks

### CRDT ideas in Logux

`Youtube:c7t_YBNHkeo` CRDT ideas in Logux talk


### Using Logux in Production

`Youtube:DvHNOplQ-tY` Using Logux in Production talk
