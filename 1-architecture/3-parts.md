# Logux Parts

We split Logux into many projects.

* **[Logux Docs]:** guides and references about all other Logux parts.
  You are reading it right now.
* **[Logux Core]:**  low-level core component to build Logux node on JavaScript.
  Most of the users will use some high-level wrap around this core
  (like Logux Server or Logux redux). You may use it directly to load
  components for app’s tests like `TestTime` or `TestPair`. Also, you may use
  it directly to build some non-standard architecture.
* **[Logux Client]:** components to build Logux web client.
  It adds to the Core high-level APIs, subprotocols, subscriptions, and
  cross-tab communication. It contains few UI components, like synchronization
  status widget, different favicon for online/offline, and prompt to close
  browser tab with unsaved changes.
* **[Logux Redux]:** warp around Logux Client with Redux compatible API.
  With time travel it avoids you from thinking about action’s time and order.
  The best option for React, Preact and any other SPA.
* **[Logux Server]:** high-level components to build your Logux Server
  on JavaScript or to create a proxy between WebSocket and HTTP and keep
  the back-end on any language, that you want.
* **[Logux Rails]:** library to connect Ruby on Rails application
  with Logux Server in proxy mode.
* **Logux Server Pro:** closed source additional features for Logux Server
  for monitoring and scaling. Write to [`logux@evilmartians.com`] for access.

[`logux@evilmartians.com`]: mailto:logux@evilmartians.com
[Logux Client]: https://github.com/logux/client
[Logux Server]: https://github.com/logux/server
[Logux Rails]: https://github.com/logux/logux_rails
[Logux Redux]: https://github.com/logux/redux
[Logux Core]: https://github.com/logux/core
[Logux Docs]: https://github.com/logux/logux

**[Next chapter →](./4-choosing.md)**
