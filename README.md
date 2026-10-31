# triprdx ChessLab

Mobile-friendly chess game review website.

## Features in the current build
- PGN import and move navigation
- Interactive board position replay
- Stockfish 18 lite single-threaded WASM analysis
- MultiPV 3, depth 14 per position, evaluation, nodes and NPS
- Gemini move commentary grounded in Stockfish lines (server-side only)

## Local development
`npm install`
`npm run dev`

The prebuild script copies the Stockfish 18 JS/WASM files from the installed package into `public/stockfish`.

## Cloudflare Pages
Build command: `npm run build`
Output directory: `dist`

Add `GEMINI_API_KEY` as an encrypted Cloudflare Pages secret. Never expose it in client-side code or commit it to Git.

## Current limitations
- Engine uses the lite neural-network build, single-threaded, for a smaller download and broad browser compatibility.
- The current whole-game pass runs depth 14 on every position; it is a first working analysis pass, not a final tuned deep-analysis pipeline.
- Move classifications, accuracy calculation, evaluation graph, and depth controls are not implemented yet.
- The project has not yet been deployed or tested end-to-end on iPhone Safari.
