# Cloudflare Pages deployment

1. Import this GitHub repository into Cloudflare Pages.
2. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. After the first deployment, open **Settings → Variables and Secrets** and add `GEMINI_API_KEY` as an encrypted secret. Never place this key in Vite variables or client code.
4. Optional: set `GEMINI_MODEL` as a normal server-side variable if you need to select another supported Gemini model.

The `/api/status` endpoint reports whether the server secret exists. The `/api/explain` endpoint provides preliminary natural-language commentary only. It does not claim Stockfish evaluations.

## Current limitations

- Stockfish is not integrated yet; no engine score, MultiPV, depth, nodes, or accuracy is produced.
- AI commentary is explicitly marked as preliminary and must not be treated as an engine verdict.
- A real Stockfish 18 WebAssembly worker and per-ply analysis pipeline are still required before calling this a complete chess analyzer.
