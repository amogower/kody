# Dependency overrides

This file documents every `overrides` entry in the root `package.json` and
explains why it exists. `npm run overrides:check` (part of `npm run validate`
and the CI static job) fails when an override has no `###` heading here whose
first code span is the overridden package (nested overrides also name each
parent in backticks before the `→`), when a heading documents a package or
parent with no matching override, or when `package.json` repeats a key.

After changing overrides, `npm run audit:prod` is the production-dependency
check. It is part of `npm run validate` and the CI static job (see
[`checks`](./setup/checks.md) and
[`dependency auditing`](./setup/dependency-auditing.md)). Clearing these
override targets does not mean every advisory is gone — other transitive
packages can still report findings outside this file's scope.

## Production overrides

### `@modelcontextprotocol/sdk` → `1.32.2`

The MCP SDK is pinned to a single version so that all workspaces resolve the
same copy. Without this override, npm may hoist conflicting versions from
transitive consumers (`agents`, `@kody/worker`). `agents@0.33.0` peers this
exact version, and the `@kody/worker` and root manifests declare it directly.

The pin is `1.32.2` for:

- [GHSA-46jr-4wx8-v453](https://github.com/advisories/GHSA-46jr-4wx8-v453) — one
  HTTP request within the default size limit could exhaust server memory during
  validation (`>=1.3.0, <1.32.0`)
- [GHSA-rvq5-wwqv-78pq](https://github.com/advisories/GHSA-rvq5-wwqv-78pq) —
  server bearer authentication accepted tokens issued for another service
  (`>=1.6.0, <1.32.0`)
- [GHSA-6prh-2h8m-c8cw](https://github.com/advisories/GHSA-6prh-2h8m-c8cw) —
  HTTP client transports and OAuth requests followed cross-origin redirects and
  re-sent custom headers and request bodies (`<1.32.0`)
- [GHSA-22jm-h49p-29qw](https://github.com/advisories/GHSA-22jm-h49p-29qw) —
  experimental tasks were not tied to the session that created them
  (`>=1.24.0, <1.32.0`)
- [GHSA-6qxp-vccf-f47h](https://github.com/advisories/GHSA-6qxp-vccf-f47h) — the
  OAuth client could send credentials to an authorization server chosen by the
  MCP server (`>=1.12.0, <1.31.0`)
- [GHSA-f897-62hf-6gxq](https://github.com/advisories/GHSA-f897-62hf-6gxq) —
  HTTP server transports and handlers did not limit request body size or
  JSON-RPC batch length (`>=1.10.0, <1.30.1`)

### `hono` → `>=4.13.11 <5.0.0`

Keeps the transitive hono copy at or above the current advisory floor. Upstream
`@modelcontextprotocol/sdk@1.32.2` still declares `hono@^4.11.4`, which allows
vulnerable releases below `4.13.11`, so this override cannot be removed yet.

The floor is `4.13.11` for:

- [GHSA-5r4p-p66f-jhc7](https://github.com/advisories/GHSA-5r4p-p66f-jhc7) —
  `serveStatic` decodes the request path a second time, which bypasses
  middleware on static paths (`>=4.12.4, <4.13.11`)

That range also covers the `4.13.7` fixes:

- [GHSA-hxh3-vqpv-xpqv](https://github.com/advisories/GHSA-hxh3-vqpv-xpqv) —
  `hono/jsx` renders plain strings unescaped in boundary components (`<4.13.7`)

And the `4.13.5` fixes:

- [GHSA-gqvv-2mrq-wpjv](https://github.com/advisories/GHSA-gqvv-2mrq-wpjv) —
  `toSSG()` can still write files outside the output directory (`<4.13.5`)
- [GHSA-g6gw-c38x-mqfc](https://github.com/advisories/GHSA-g6gw-c38x-mqfc) —
  unbounded dot-notation nesting in `parseBody()` (`<4.13.5`)
- [GHSA-crvj-82cr-hjcx](https://github.com/advisories/GHSA-crvj-82cr-hjcx) —
  query parser reads parameters after the URL fragment (`<4.13.5`)

Earlier floors through `4.12.27` stay covered, including:

- [GHSA-hvrm-45r6-mjfj](https://github.com/advisories/GHSA-hvrm-45r6-mjfj) —
  hono/jsx context not isolated per request (`>=4.11.8, <4.12.27`)
- [GHSA-w62v-xxxg-mg59](https://github.com/advisories/GHSA-w62v-xxxg-mg59) —
  server-side XSS via JSX escaping bypass in `cx()` (`>=4.0.0, <4.12.27`)
- [GHSA-xgm2-5f3f-mvvc](https://github.com/advisories/GHSA-xgm2-5f3f-mvvc) — API
  Gateway v1 adapter can drop a distinct repeated header value
  (`>=4.3.3, <4.12.27`)

The upper bound `<5.0.0` keeps the override within the same major version to
avoid breaking changes.

### `@hono/node-server` → `>=2.1.3 <3.0.0`

Keeps the transitive `@hono/node-server` copy at or above the current advisory
floor. Upstream `@modelcontextprotocol/sdk@1.32.2` declares
`@hono/node-server@^1.19.9 || ^2.0.5`, which can still resolve a vulnerable 1.x
or a 2.x below `2.1.3`, so this override forces the patched 2.x floor and cannot
be removed yet.

Advisories requiring the 2.x floor:

- [GHSA-rmxm-3fg6-px4f](https://github.com/advisories/GHSA-rmxm-3fg6-px4f) —
  `serveStatic` decodes the request path a second time, which bypasses
  middleware on static paths (vulnerable `>=1.19.10, <2.1.3`)
- [GHSA-frvp-7c67-39w9](https://github.com/advisories/GHSA-frvp-7c67-39w9) —
  path traversal in `serve-static` on Windows via encoded backslash (`%5C`)
  (vulnerable `<2.0.5`, including all remaining 1.x releases)
- [GHSA-9mqv-5hh9-4cgg](https://github.com/advisories/GHSA-9mqv-5hh9-4cgg) —
  follow-on 2.x issue (`>=2.0.0, <=2.0.9`, patched `2.0.10`)

The older 1.x floor (`>=1.19.13`) only addressed
[GHSA-92pp-h63x-v22m](https://github.com/advisories/GHSA-92pp-h63x-v22m) and is
stale relative to the advisories above. The upper bound `<3.0.0` keeps the
override within the forced 2.x major.

### `proxy-addr` → `>=2.0.8 <3.0.0`

Keeps the transitive `proxy-addr` copy (via `express` from
`@modelcontextprotocol/sdk` and `@cloudflare/codemode`) at or above the current
advisory floor. Upstream `express@5.2.1` declares `proxy-addr@^2.0.7`, which
still allows `2.0.7`, so this override cannot be removed yet.

- [GHSA-jqcg-44mw-7w3h](https://github.com/advisories/GHSA-jqcg-44mw-7w3h) — IP
  spoofing when a trusted subnet is given as an IPv4-mapped IPv6 address
  (`>=1.1.0, <2.0.8`, critical)

The upper bound `<3.0.0` keeps the override within the same major version.

### `body-parser` → `>=2.4.0 <3.0.0`

Keeps the transitive `body-parser` copy (via `express`) at or above the current
advisory floor. Upstream `express@5.2.1` declares `body-parser@^2.2.1`, which
still allows releases below `2.4.0`, so this override cannot be removed yet.

- [GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828) —
  denial of service through trailing bytes after a compressed request body
  (`>=2.0.0, <2.4.0`)

The upper bound `<3.0.0` keeps the override within the same major version.

### `qs` → `>=6.17.1 <7.0.0`

Keeps the transitive `qs` copy (via `express`) at or above the current advisory
floor. Upstream `express@5.2.1` declares `qs@^6.14.0`, which still allows
`6.16.0`, so this override cannot be removed yet.

- [GHSA-6pq8-jhm2-2vcw](https://github.com/advisories/GHSA-6pq8-jhm2-2vcw) —
  `qs.stringify` with the `comma` array format throws an uncaught TypeError on
  an array element with a non-callable own `toString` (`>=6.7.0, <=6.16.0`)

The upper bound `<7.0.0` keeps the override within the same major version.

### `postcss` → `>=8.5.10 <9.0.0`

Resolves a moderate advisory in postcss <8.5.10:

- [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) — XSS
  via unescaped `</style>` in CSS stringify output

PostCSS is pulled transitively by Vite (via `agents` / `vitest`). Upstream Vite
still declares `postcss@^8.5.8`, which allows `8.5.8` / `8.5.9`, so this
override cannot be removed yet even though a fresh resolve often lands on a
newer 8.5.x. No newer PostCSS advisory has raised the patched floor beyond
`8.5.10`. The upper bound `<9.0.0` keeps the override within the same major
version to avoid breaking changes.

### `ip-address` → `>=10.7.4 <11.0.0`

Keeps the transitive `ip-address` copy (via `express-rate-limit`) at or above
the current advisory floor. Upstream still declares `ip-address@^10.2.0`, which
allows `10.7.3`, so this override cannot be removed yet.

- [GHSA-rxp7-6hxx-x8q5](https://github.com/advisories/GHSA-rxp7-6hxx-x8q5) —
  `Address6` matches a zone identifier in quadratic time ahead of its length
  limit, so one long string stalls the process (`<=10.7.3`)
- [GHSA-rpw4-54j3-4h4q](https://github.com/advisories/GHSA-rpw4-54j3-4h4q) —
  `Address6.isLinkLocal()` recognizes `fe80::/64` rather than `fe80::/10`
  (`<=10.5.0`)
- [GHSA-2vr4-cq9g-pvrc](https://github.com/advisories/GHSA-2vr4-cq9g-pvrc) —
  `isPrivate()` misses NAT64 local-use `64:ff9b:1::/48` (`>=10.2.1, <=10.5.0`)

The upper bound `<11.0.0` keeps the override within the same major version.

### `fast-uri` → `>=3.1.9 <4.0.0`

Keeps the transitive `fast-uri` copy (via `ajv` from
`@modelcontextprotocol/sdk`) at or above the current advisory floor. Upstream
still declares `fast-uri@^3.0.1`, which allows `3.1.8`, so this override cannot
be removed yet.

- [GHSA-w74x-v6f9-j3xg](https://github.com/advisories/GHSA-w74x-v6f9-j3xg) — URI
  scheme spoofing via percent-encoded scheme decoding (`>=3.0.0, <3.1.9`)
- [GHSA-xhq7-xmqj-769h](https://github.com/advisories/GHSA-xhq7-xmqj-769h) —
  improper path equivalence in relative reference normalization
  (`>=3.0.0, <3.1.9`)
- [GHSA-wjr9-j795-jxcr](https://github.com/advisories/GHSA-wjr9-j795-jxcr) —
  host confusion via unchecked WHATWG host canonicalization (`>=3.1.3, <3.1.9`)
- [GHSA-333x-w4r6-6crp](https://github.com/advisories/GHSA-333x-w4r6-6crp) —
  scheme injection via an unescaped first-segment colon in suffix references
  (`>=3.0.0, <3.1.9`)
- [GHSA-hrr3-gc8f-f4qj](https://github.com/advisories/GHSA-hrr3-gc8f-f4qj) —
  inconsistent host case normalization via percent-encoded octets
  (`>=3.0.0, <=3.1.7`)

The upper bound `<4.0.0` keeps the override within the same major version.

### `source-map-js` → `>=1.2.2 <2.0.0`

Keeps the transitive `source-map-js` copy (via `remix`) at or above the current
advisory floor. Upstream still declares `source-map-js@^1.2.1`, which allows
`1.2.1`, so this override cannot be removed yet.

- [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) —
  event-loop denial of service through indexed source-map section offsets
  (`>=1.0.0, <1.2.2`)

The upper bound `<2.0.0` keeps the override within the same major version.

### `smol-toml` → `>=1.9.0 <2.0.0`

Keeps the transitive `smol-toml` copy (via `@cloudflare/worker-bundler`) at or
above the current advisory floor. Upstream still declares `smol-toml@^1.6.0`,
which allows `1.8.0`, so this override cannot be removed yet.

- [GHSA-r4xh-jqrq-34v2](https://github.com/advisories/GHSA-r4xh-jqrq-34v2) —
  quadratic-time `parse()` because `parseKey` rescans to the end of the document
  for each key line (`<=1.8.0`)

The upper bound `<2.0.0` keeps the override within the same major version.

### `sharp` → `>=0.35.5 <0.36.0`

Keeps the transitive `sharp` copy (via `miniflare` from `wrangler`) at or above
the current advisory floor. Upstream still allows releases below `0.35.5`, so
this override cannot be removed yet.

- [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) —
  vulnerability in the librsvg dependency (`<0.35.5`)

The upper bound `<0.36.0` keeps the override within the same 0.35 minor line.

### `undici` (under `wrangler` / `miniflare` / `@cloudflare/vite-plugin`) → `>=7.30.1 <8.0.0`

Floors only the Cloudflare 7.x undici copies. The root `undici@6.28.1` is
already on the 6.x patched line and must stay there.

- [GHSA-4qv8-2p9j-2685](https://github.com/advisories/GHSA-4qv8-2p9j-2685) —
  denial of service via unbounded memory in the EventSource parser
  (`>=7.0.0, <7.30.1`)
- [GHSA-f72v-6w45-q472](https://github.com/advisories/GHSA-f72v-6w45-q472) —
  subresource integrity bypass via non-lowercase algorithm tokens
  (`>=7.15.0, <7.30.1`)
- [GHSA-xjj6-f33q-929c](https://github.com/advisories/GHSA-xjj6-f33q-929c) —
  denial of service via an unhandled error on excessive content-encodings
  (`>=7.18.0, <7.30.1`)
- [GHSA-4w7w-5xrc-9h26](https://github.com/advisories/GHSA-4w7w-5xrc-9h26) —
  cache poisoning and cross-user disclosure via cross-origin redirects
  (`>=7.0.0, <7.30.1`)
- [GHSA-2m5v-pch6-74hx](https://github.com/advisories/GHSA-2m5v-pch6-74hx) — TLS
  certificate validation bypass via dropped `tls` options in `Agent`
  (`>=7.0.0, <7.30.1`)
- [GHSA-qrxm-fqhp-jwvm](https://github.com/advisories/GHSA-qrxm-fqhp-jwvm) —
  denial of service via TLS 1.2 certificate-changing renegotiation
  (`>=7.0.0, <7.30.1`)
- [GHSA-9fm3-97px-rjf6](https://github.com/advisories/GHSA-9fm3-97px-rjf6) —
  WebSocket client denial of service via unbounded automatic PONG buffering
  (`>=7.0.0, <7.30.1`)
- [GHSA-55wc-3pg8-jfw6](https://github.com/advisories/GHSA-55wc-3pg8-jfw6) —
  denial of service via an unhandled exception in the decompress interceptor
  (`>=7.15.0, <7.30.1`)
- [GHSA-3wwx-pv8p-q78v](https://github.com/advisories/GHSA-3wwx-pv8p-q78v) —
  WebSocket permessage-deflate decompression can crash the process
  (`7.28.0`–`7.29.0`)

The upper bound `<8.0.0` keeps those tools on 7.x.

### `isomorphic-git` → `>=1.40.0 <1.40.8`

A compatibility cap, not an advisory floor. `isomorphic-git@1.40.8` and later
route `git.init` through a `mkdirp` that expects Node-style error codes, which
the `@cloudflare/shell` workspace filesystem does not set, so repo sessions fail
to initialize. Remove the cap once a newer release (or `@cloudflare/shell`)
handles those errors and repo-session tests pass against it.

### `zod` → `4.6.7`

Pins a single Zod copy across the workspace. Without this override,
`@cloudflare/vitest-pool-workers@0.22.0` (exact `zod@4.4.3`) and `@kody/worker`
(`zod@^4.6.5`) resolve two trees, and the Worker-local copy misses
`patches/zod+4.6.7.patch`, which trims `zod/v4/locales` to English-only and
strips unused `compile` / `fromJSONSchema` / `deepPartial` barrel exports for
the startup budget. Keep this pin aligned with the Worker Zod range and refresh
the patch when bumping.

- [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) — Zod
  can exhaust memory while validating oversized constrained collections
  (`<4.6.6`)

## Direct dependency bumps

`npm audit --omit=dev` also reads the production tree, so a direct dependency
with its own advisory is fixed by raising its specifier rather than by an
override. Current floors:

- `agents` `^0.33.0` in `@kody/worker` — carries patched
  `@modelcontextprotocol/client` / `@modelcontextprotocol/server` /
  `@modelcontextprotocol/sdk` peers
- `@modelcontextprotocol/client` `2.4.0` at the root —
  [GHSA-6qxp-vccf-f47h](https://github.com/advisories/GHSA-6qxp-vccf-f47h)
  (`>=2.0.0, <2.2.0`) and
  [GHSA-6prh-2h8m-c8cw](https://github.com/advisories/GHSA-6prh-2h8m-c8cw)
  (`>=2.0.0, <2.3.0`)
- `@modelcontextprotocol/server` `2.4.0` in `@kody/worker` —
  [GHSA-jm63-cq47-j5jp](https://github.com/advisories/GHSA-jm63-cq47-j5jp)
  (shared transport or server instances delivered one HTTP client's messages to
  another, `>=2.0.0, <2.3.0`) plus the SDK advisories listed above
- `postal-mime` `^4.0.8` in `@kody/worker` —
  [GHSA-f2hq-32vh-53cc](https://github.com/advisories/GHSA-f2hq-32vh-53cc)
  (quadratic CPU consumption when decoding a header of many joinable RFC 2047
  base64 words, `>=3.0.0, <4.0.8`)
- `vite` `>=8.3.3 <8.3.5` at the root — an advisory floor plus a compatibility
  cap. The floor is `8.3.3` for:
  - [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv) —
    `launch-editor` `escapeCmdArgs()` omits `%` escaping on Windows
    (`>=8.3.0, <=8.3.2`)
  - [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw) —
    `launch-editor` editor CLI flag misinterpretation, which runs an arbitrary
    command for some editors (`>=8.3.0, <=8.3.2`)
  - [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) —
    `launch-editor` `fs.existsSync()` check can be bypassed on Windows
    (`>=8.3.0, <=8.3.2`)
  - [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) —
    cross origin script execution through a custom middleware
    (`>=8.3.0, <=8.3.2`)
  - [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) —
    files outside `server.fs.allow` are served when project paths match system
    paths (`>=8.3.0, <=8.3.2`)
  - [GHSA-vfpm-58rq-9qcg](https://github.com/advisories/GHSA-vfpm-58rq-9qcg) —
    the first 4 bytes of files outside `server.fs` are exposed by
    `?vite-wasm-instance` (`>=8.3.0, <=8.3.2`)

  The cap `<8.3.5` keeps `worker-startup-bundles:check` working. Vite `8.3.5`
  and later declare `rolldown@~1.2.14`, and `rolldown@1.2.14` dropped the
  entry-chunk source map (`dist/ssr/index.js.map`) that the check reads to
  attribute startup bytes. Vite `8.3.3` and `8.3.4` declare `rolldown@~1.2.12`,
  which still writes it. Remove the vite cap and the `rolldown` cap below
  together, once a newer release writes that map again.

### `rolldown` → `>=1.2.12 <1.2.14`

A compatibility cap, not an advisory floor. Vite `8.3.4` declares
`rolldown@~1.2.12`, which also allows `1.2.14` and later, and `rolldown@1.2.14`
stopped writing the entry-chunk source map that `worker-startup-bundles:check`
reads (`dist/ssr/index.js.map`). `1.2.12` and `1.2.13` still write it, so the
cap keeps the startup byte attribution and the deploy's SSR source map. Remove
this cap (and the vite cap above) once a newer rolldown writes the map again.

## Direct dependency bumps

`npm audit --omit=dev` also reads the production tree, so a direct dependency
with its own advisory is fixed by raising its specifier rather than by an
override. Current floors:

- `agents` `^0.33.0` in `@kody/worker` — carries patched
  `@modelcontextprotocol/client` / `@modelcontextprotocol/server` /
  `@modelcontextprotocol/sdk` peers
- `@modelcontextprotocol/client` `2.4.0` at the root —
  [GHSA-6qxp-vccf-f47h](https://github.com/advisories/GHSA-6qxp-vccf-f47h)
  (`>=2.0.0, <2.2.0`) and
  [GHSA-6prh-2h8m-c8cw](https://github.com/advisories/GHSA-6prh-2h8m-c8cw)
  (`>=2.0.0, <2.3.0`)
- `@modelcontextprotocol/server` `2.4.0` in `@kody/worker` —
  [GHSA-jm63-cq47-j5jp](https://github.com/advisories/GHSA-jm63-cq47-j5jp)
  (shared transport or server instances delivered one HTTP client's messages to
  another, `>=2.0.0, <2.3.0`) plus the SDK advisories listed above
- `postal-mime` `^4.0.8` in `@kody/worker` —
  [GHSA-f2hq-32vh-53cc](https://github.com/advisories/GHSA-f2hq-32vh-53cc)
  (quadratic CPU consumption when decoding a header of many joinable RFC 2047
  base64 words, `>=3.0.0, <4.0.8`)
- `vite` `>=8.3.3 <8.3.5` at the root — an advisory floor plus a compatibility
  cap. The floor is `8.3.3` for:
  - [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv) —
    `launch-editor` `escapeCmdArgs()` omits `%` escaping on Windows
    (`>=8.3.0, <=8.3.2`)
  - [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw) —
    `launch-editor` editor CLI flag misinterpretation, which runs an arbitrary
    command for some editors (`>=8.3.0, <=8.3.2`)
  - [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) —
    `launch-editor` `fs.existsSync()` check can be bypassed on Windows
    (`>=8.3.0, <=8.3.2`)
  - [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) —
    cross origin script execution through a custom middleware
    (`>=8.3.0, <=8.3.2`)
  - [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) —
    files outside `server.fs.allow` are served when project paths match system
    paths (`>=8.3.0, <=8.3.2`)
  - [GHSA-vfpm-58rq-9qcg](https://github.com/advisories/GHSA-vfpm-58rq-9qcg) —
    the first 4 bytes of files outside `server.fs` are exposed by
    `?vite-wasm-instance` (`>=8.3.0, <=8.3.2`)

  The cap `<8.3.5` keeps `worker-startup-bundles:check` working: Vite 8.3.5 and
  later stop writing the entry-chunk source map (`dist/ssr/index.js.map`) that
  the check reads to attribute startup bytes. Vite 8.3.3 and 8.3.4 still write
  it. Remove the cap once a newer release writes that map again.

- `wrangler` `^4.158.0` at the root — carries the patched `miniflare`, `sharp`,
  and `undici` versions

## Development overrides

These packages are only reached through dev tooling, so `audit:prod` does not
cover them. The overrides still keep the local and CI toolchain off known
vulnerable releases.

### `brace-expansion` → `>=5.0.12 <6.0.0`

Keeps the `brace-expansion` copy (via `nx` and its `minimatch`) at or above the
current advisory floor. Upstream `nx@23.2.1` pins `brace-expansion@5.0.9`
exactly and `minimatch@10.2.5` declares `^5.0.5`, both of which allow vulnerable
releases, so this override cannot be removed yet.

The floor is `5.0.12` for:

- [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) —
  quadratic-time expansion of the `{a},b}` rewrite (`<5.0.12`)
- [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7) —
  uncontrolled recursion on nested brace groups (`<5.0.11`)
- [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) —
  uncontrolled recursion in `parseCommaParts` (`<5.0.10`)

The upper bound `<6.0.0` keeps the override within the same major version.
