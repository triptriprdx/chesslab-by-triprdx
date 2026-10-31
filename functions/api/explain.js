export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY) return Response.json({ error: "Gemini пока не настроен: добавьте GEMINI_API_KEY в секреты Cloudflare Pages." }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Некорректный JSON." }, { status: 400 }); }
  const { pgn, ply, move, fenBefore, fenAfter, engineResult } = body || {};
  if (typeof pgn !== "string" || pgn.length > 30000 || !Number.isInteger(ply) || ply < 1 || typeof move !== "string" || typeof fenBefore !== "string" || typeof fenAfter !== "string") return Response.json({ error: "Недостаточно данных для объяснения хода." }, { status: 400 });
  const lines = Array.isArray(engineResult?.lines) ? engineResult.lines.slice(0,3).map(line => ({ multipv:Number(line.multipv), depth:Number(line.depth), scoreType:line.scoreType, score:Number(line.score), pv:String(line.pv || "").slice(0,500) })).filter(line => Number.isFinite(line.score) && Number.isFinite(line.depth)) : [];
  if (!lines.length) return Response.json({ error: "Сначала запусти Stockfish для этой позиции — объяснение без движкового анализа пока недоступно." }, { status: 409 });
  const prompt = ["Ты шахматный тренер. Объясни указанный ход по-русски, понятно и точно.", "Используй только переданные оценки и варианты Stockfish. Не выдумывай тактику, варианты или оценки. Оценки относятся к позиции после выбранного хода.", "Объясни идею хода, угрозы и слабости, а также сравни варианты, если это видно из данных. Не называй ход ошибкой только по небольшой разнице оценок.", `Полуход №${ply}; сыгранный ход: ${move}`, `Позиция до: ${fenBefore}`, `Позиция после: ${fenAfter}`, `Stockfish lines: ${JSON.stringify(lines)}`, `PGN: ${pgn}`].join("\n\n");
  try {
    const model = env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method:"POST", headers:{"content-type":"application/json","x-goog-api-key":env.GEMINI_API_KEY}, body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.2,maxOutputTokens:800}}) });
    const data = await response.json();
    if (!response.ok) return Response.json({error:"Gemini API вернул ошибку. Проверь серверный ключ и доступ к модели."},{status:502});
    const explanation=data.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim();
    if (!explanation) return Response.json({error:"Gemini не вернул текст объяснения."},{status:502});
    return Response.json({explanation});
  } catch { return Response.json({error:"Не удалось связаться с Gemini."},{status:502}); }
}