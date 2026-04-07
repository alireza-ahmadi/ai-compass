# ai compass

a 2x2 quadrant chart for placing yourself on the ai discourse, based on
[noah smith's compass](https://x.com/Noahpinion/status/2041462156936528339).
click anywhere to mark your position, share via url, download as png.

live: <https://ai-compass.alireza.es>

## stack

- sveltekit 2 + svelte 5 (runes)
- tailwind v4
- cloudflare pages (`@sveltejs/adapter-cloudflare`)
- bun

## develop

```sh
bun install
bun run dev
```

## build & preview

```sh
bun run build
bun run preview   # wrangler pages dev .svelte-kit/cloudflare
```

## deploy (cloudflare pages)

```sh
bun run build
bunx wrangler pages deploy .svelte-kit/cloudflare --project-name=ai-compass
```

or connect the repo on the cloudflare pages dashboard with build command
`bun run build` and output dir `.svelte-kit/cloudflare`.

## scripts

- `bun run dev` — vite dev server
- `bun run build` — production build (prerendered)
- `bun run preview` — local cloudflare pages preview via wrangler
- `bun run check` — svelte-check + tsc
- `bun run lint` — prettier + eslint
- `bun run format` — prettier --write
