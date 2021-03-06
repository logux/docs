# Logux Parts

We split Logux into many projects.

* **[Logux Docs]:** guides and references about all other Logux parts. You are reading it right now.
* **[Logux Core]:** low-level core component to build Logux node on JavaScript. Most of the users will use some high-level wrapper around this core (like Logux Server or Logux Redux). You may use it directly to load components for app’s tests like `TestTime` or `TestPair`. Also, you may use it directly to build some non-standard architecture.
* **[Logux Client]:** components to build Logux web client. It adds to the Core high-level APIs, subprotocols, subscriptions, and cross-tab communication. It contains few UI components, like synchronization status widget, different favicon for online/offline, and prompt to close browser tab with unsaved changes.
* **[Logux Redux]:** wrapper around Logux Client with Redux compatible API. With time travel it avoids you from thinking about action’s time and order. The best option for React, Preact and any other SPA.
* **[Logux Vuex]:** wrapper around Logux Client with Vuex compatible API. With time travel it avoids you from thinking about action’s time and order. The best option for Vue.
* **[Logux Vue Devtools]:** Vue devtools plugin for debugging Logux applications. It adds a timeline with all Logux events and Logux Client to the component inspector.
* **[Logux Server]:** high-level components to build your Logux Server on JavaScript or to create a proxy between WebSocket and HTTP and keep the back-end on any language, that you want.
* **[Logux Django]:** syntax sugar to connect Django application with Logux Server in proxy mode.
* **[Logux Rails]:** syntax sugar to connect Ruby on Rails application with Logux Server in proxy mode.
* **[Logux Rack]:** low-level library for creating syntax sugar to connect Ruby applications with Logux Server in proxy mode.
* **Logux Server Pro:** closed source additional features for Logux Server for monitoring and scaling. Write to [`logux@evilmartians.com`] for access.

[`logux@evilmartians.com`]: mailto:logux@evilmartians.com
[Logux Vue Devtools]: https://github.com/logux/vue-devtools
[Logux Client]: https://github.com/logux/client
[Logux Server]: https://github.com/logux/server
[Logux Django]: https://github.com/logux/django/
[Logux Rails]: https://github.com/logux/logux_rails
[Logux Redux]: https://github.com/logux/redux
[Logux Rack]: https://github.com/logux/logux-rack
[Logux Vuex]: https://github.com/logux/vuex
[Logux Core]: https://github.com/logux/core
[Logux Docs]: https://github.com/logux/docs

[Next chapter](../concepts/node.md)
