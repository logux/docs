# Logux Back-end Protocol

Logux uses Back-end protocol to make a proxy between WebSocket and HTTP.
Logux sends user’s authentication requests, subscriptions and actions
to HTTP server and receive actions by HTTP from other servers
to send these actions to Logux clients.

* **Protocol versions:** [`changes.md`](./changes.md)
* **Referral JS implementation:**
  [`logux_rails`](https://github.com/logux/logux_rails)

*Under construction*
