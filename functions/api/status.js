export async function onRequestGet({ env }) {
  return Response.json({
    app: "triprdx ChessLab",
    api: true,
    geminiConfigured: Boolean(env.GEMINI_API_KEY),
    engine: "Stockfish 18 lite single-threaded WASM",
    engineAssets: "/stockfish/stockfish-18-lite-single.js"
  });
}
