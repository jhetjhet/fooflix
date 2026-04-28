# Fooflix

Fooflix is the Next.js frontend for a larger full-stack app from [repo](https://github.com/jhetjhet/freeflixv2). It replaces the legacy React frontend with a more modern stack while keeping the existing core functionality.

[Live Demo](https://fooflixv2.austin-full-stack-developer.tech/)

## Improvements over the legacy frontend

- Better SEO with dynamic metadata for media pages
- Cookie-based session handling for authentication
- Stronger typing with TypeScript
- Server-rendered components and hidden credentials

## Local development

- Install dependencies: `pnpm install`
- Start the dev server: `pnpm dev`
- Build for production: `pnpm build`
- Start the production server: `pnpm start`

To run the app with its dependent services, refer to the main [repo](https://github.com/jhetjhet/freeflixv2).

## Environment variables

```env
NODE_SOCKET_URL=<your_domain>
NODE_SOCKET_PATH=/node/socket.io
NODE_EXT_API_URL=<your_domain>
NODE_API_URL=http://web-server/node
DJANGO_API_URL=http://web-server
COOKIE_DOMAIN=<your_domain>
COOKIE_MAX_AGE=604800
```

`NODE_API_URL` and `DJANGO_API_URL` use Docker service DNS names in the full stack setup. `COOKIE_MAX_AGE` is set to 7 days in seconds.