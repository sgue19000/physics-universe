# Status

Public GitHub: https://github.com/sgue19000/physics-universe

Vercel production deploy is blocked: the connected Vercel account returns HTTP 403 (not authorized) for list_teams and deploy_to_vercel.

Local project lives at physics-universe/ with the simulation engine, 22 MVP concept models, Vitest checks against analytic projectile / gamma / fringe / tunneling formulas, and the Next.js App Router UI.

To go live from this repo after granting Vercel access:

```
npm install
npm test
npm run build
vercel --prod
```
