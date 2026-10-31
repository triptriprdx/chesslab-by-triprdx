# triprdx ChessLab

A mobile-friendly chess game analysis website branded **triprdx**.

## Planned capabilities
- Import and review PGN games
- Per-ply explanations and move classifications
- Stockfish-powered evaluation and candidate lines
- Evaluation graph and engine telemetry
- Optional Gemini explanations through a server-side API
- Responsive dark interface for phones

## Development
`npm install` then `npm run dev`.

## Deployment
The project is intended for Cloudflare Pages. Set `GEMINI_API_KEY` as a server-side Pages secret before enabling AI explanations. Never put API keys in client-side code.

## Status
Initial repository scaffold. Engine integration and production deployment still require verification.
