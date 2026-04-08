
# Fooflix

Fooflix is a lightweight Next.js media browser for movies and TV shows. It aggregates data from TMDB (via a proxy) and a local "flix" service to present searchable, browsable media with rich detail pages and media playback.

Key points
- Built with Next.js 16, React 19 and TypeScript
- UI: shadcn / Tailwind CSS, components under `components/` and `components/ui/`
- Data: TMDB integration (see `services/tmdb.ts`) and a local `services/flix` proxy
- Uses `swr` for client data fetching and caching

Local development
- Install: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`

Environment
- NEXT_PUBLIC_TMDB_API_BASE — base URL for the TMDB proxy (optional)
- NEXT_PUBLIC_TMDB_API_KEY — TMDB API key (required for TMDB endpoints)
