export async function onRequestGet({ env }) {
  return Response.json({
    app: "triprdx ChessLab",
    api: true,
    geminiConfigured: Boolean(env.GEMINI_API_KEY),
    engineConfigured: false,
    note: "Stockfish engine integration is not yet installed."
  });
}
