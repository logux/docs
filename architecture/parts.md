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
  You may use it directly if you don’t need Redux’s time travel.
* **[Logux Redux]:** high-level Redux compatible Logux client.
  With time travel it avoids you from thinking about action’s time and order.
  The best option for React, Preact and any other SPA.
* **[Logux Server]:** high-level components to build your Logux Server
  on JavaScript or to create a proxy between WebSocket and HTTP and keep
  the back-end on any language, that you want.
* **Logux Server Pro:** closed source additional features for Logux Server
  for monitoring and scaling. Contact [Evil Martians] for access.
* **[Logux Protocol]:** Logux protocol specification. You should subscribe
  on any repository changes if you made your Logux implementation.

[Logux Protocol]: https://github.com/logux/protocol
[Evil Martians]: https://evilmartians.com/
[Logux Client]: https://github.com/logux/client
[Logux Server]: https://github.com/logux/server
[Logux Redux]: https://github.com/logux/redux
[Logux Core]: https://github.com/logux/core
[Logux Docs]: https://github.com/logux/logux
