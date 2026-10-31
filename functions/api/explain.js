export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY) return Response.json({ error: "Gemini пока не настроен: владелец проекта должен добавить GEMINI_API_KEY в секреты Cloudflare Pages." }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Некорректный JSON." }, { status: 400 }); }
  const { pgn, ply, move, fenBefore, fenAfter } = body || {};
  if (typeof pgn !== "string" || pgn.length > 30000 || !Number.isInteger(ply) || ply < 1 || typeof move !== "string" || typeof fenBefore !== "string" || typeof fenAfter !== "string") {
    return Response.json({ error: "Недостаточно данных для объяснения хода." }, { status: 400 });
  }
  const prompt = [
    "Ты шахматный тренер. Объясни один указанный ход по-русски, кратко и точно.",
    "Не выдумывай оценку движка, вариант или тактическую угрозу. Stockfish-оценка не передана, поэтому явно скажи, что это предварительное позиционное объяснение, а не движковый вердикт.",
    "Укажи идею хода, что изменилось в позиции и на что обратить внимание. Если данных недостаточно — скажи об этом.",
    `Номер полухода: ${ply}; ход: ${move}`,
    `Позиция до: ${fenBefore}`,
    `Позиция после: ${fenAfter}`,
    `PGN: ${pgn}`
  ].join("\n\n");
  try {
    const model = env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 700 } })
    });
    const data = await response.json();
    if (!response.ok) return Response.json({ error: "Gemini API вернул ошибку. Проверьте серверный ключ и доступ к модели." }, { status: 502 });
    const explanation = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!explanation) return Response.json({ error: "Gemini не вернул текст объяснения." }, { status: 502 });
    return Response.json({ explanation });
  } catch {
    return Response.json({ error: "Не удалось связаться с Gemini." }, { status: 502 });
  }
}
