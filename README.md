# kiselyovd.github.io

Personal portfolio website — [kiselyovd.github.io](https://kiselyovd.github.io)

## Tech Stack

- **Framework**: [Astro](https://astro.build/) 6
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4
- **Runtime**: [Bun](https://bun.sh/)
- **Linting**: [Biome](https://biomejs.dev/)
- **Git hooks**: [Lefthook](https://github.com/evilmartians/lefthook)
- **Type checking**: TypeScript 6 + `astro check`
- **Deploy**: GitHub Pages via Actions

## Development

```bash
bun install
bun run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server |
| `bun run build` | Type check + production build |
| `bun run preview` | Preview production build |
| `bun run check` | Astro type check |
| `bun run lint` | Biome lint & format check |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run format` | Format with Biome |

## Deployment

Automatically deployed to GitHub Pages on push to `main`. CI pipeline runs Biome lint, Astro type check, and build before deploying.

## License

MIT
