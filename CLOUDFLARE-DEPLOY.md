# Cloudflare Pages deployment

1. Import this GitHub repository into Cloudflare Pages.
2. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. Add `GEMINI_API_KEY` as an encrypted secret under **Settings → Variables and Secrets**.
4. Optional: set `GEMINI_MODEL` as a server-side variable to choose another supported Gemini model.

The build script copies the Stockfish 18 lite single-threaded JS and WASM files from the pinned npm dependency into `public/stockfish`. The app runs the engine locally in the browser; Gemini is used only for explanations.

## Notes
- The lite engine is single-threaded and avoids SharedArrayBuffer/cross-origin isolation requirements.
- The current pass analyses each position to depth 14 with MultiPV 3. More advanced time/depth controls and per-move classifications remain future work.
- The API key must never be stored in Vite client variables.
