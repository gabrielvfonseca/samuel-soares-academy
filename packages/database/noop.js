// No-op worker entrypoint.
//
// `wrangler.jsonc` in this package points `main` at this file so that
// `wrangler d1 ...` commands (migrations apply, execute, etc.) can resolve a
// worker. The D1 database itself is the only resource this package manages —
// the code is never executed. Both apps (`apps/site`, `apps/admin`) deploy
// their own workers and bind to the same D1 database (`ssa-db`).

export default {
  async fetch() {
    return new Response("ssa-db is a D1-only package; no worker to run.", {
      status: 501,
    });
  },
};
