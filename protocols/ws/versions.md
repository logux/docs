# Logux Protocol Changes

## Unreleased

- Count time in `meta.id` from 20 May 2026 04:46:35 UTC instead of UNIX epoch.
- Remove order in millisecond from action `meta.id`.
- Compress time part in `meta.id`.
- Send `meta.id` in `sync` message as a string.
- Use signed integer for `time` and `shift` in binary protocol.

## 5 “Kēlen”

- Change SemVer subprotocol to number.

## 4 “Blissymbols”

- Add `headers` message (by Ivan Menshykov).

## 3 “Iţkuîl”

- Rename `credentials` to `token`.
- Token must be a string.

## 2 “Toki Pona”

- Use single number for protocol version.
- Add action metadata to `sync` message.
- Use `meta.time` property for `fixTime` feature.
- Add optional `meta.id` compression.
- Add `debug` message.

## 1 “Esperanto”

- Initial release.
