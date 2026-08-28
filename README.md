# Physics Universe

Interactive physics laboratory.

**See Physics. Change Physics. Understand Physics.**

## Stack

Next.js · TypeScript · Tailwind CSS · Canvas simulations · Vitest

All MVP simulations run client-side. No database. No secrets.

## Scripts

```bash
npm install
npm test
npx tsc --noEmit
npm run build
npm run dev
```

## Architecture

- `lib/concepts.ts` — concept registry (metadata, equations, parameters)
- `lib/physics.ts` — SI helpers, integrators, closed-form checks
- `lib/engine.ts` — `initialize / step / reset / render / measure`
- `components/Lab.tsx` — shared laboratory shell

Each concept is a record plus a branch in the engine. Add a simulation by extending the registry and the `step`/`draw` switch.

## Scientific notes

Visualizations that are schematic (solar system scale, black-hole disk) are labeled as visualizations. Special-relativity sliders never exceed 0.999c. Quantum detections are sampled from |ψ|²; no hidden classical trajectories are drawn.
