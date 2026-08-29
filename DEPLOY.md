# Fix production (required once)

Live site https://physics-universe.vercel.app/ is serving an **old** Lab/engine bundle.
GitHub `main` already has the 44-lab engine, Sound, and 3D camera.
This environment cannot call the Vercel API (403 Forbidden).

## Redeploy Production from the current main branch

1. Open https://vercel.com/dashboard and sign in as the owner of `physics-universe`.
2. Open the **physics-universe** project.
3. Settings → Git
   - Connected repo must be `sgue19000/physics-universe`
   - Production Branch must be `main`
   - If disconnected: Connect Git Repository → GitHub → `sgue19000/physics-universe`
4. Deployments tab → click the latest Deployment from `main`
   **or** Deployments → … menu on the newest commit → Redeploy
   - Environment: **Production**
   - Uncheck “Use existing Build Cache”
5. Wait until Status is Ready.
6. Confirm the live JS changed:
   View source on any lab page. The slug chunk must **not** still be `page-91b3e0022f019be5.js`.
   Search the new JS for `Reset camera` and `Sound`.
