# Logux Back-end Protocol Changes

## 4

* Use objects for commands and answers.
* Add `subpotocol`, `cookie` and `headers` keys to `auth` command.
* Add `headers` key to `action` command.
* Add `action` answer.
* Add `wrongSubprotocol` answer.
* Add `subporotocol` to `authenticated` answer.


## 3

* Rename `password` to `secret`.
* Add action ID to `error` response.
* Token must be a string.


## 2

* Add `resend` answer to `action` command.


## 1

* Initial release.
