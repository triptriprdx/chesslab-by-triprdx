import React from "react";
import { createRoot } from "react-dom/client";
import { Chess } from "chess.js";
import "./style.css";

function App() {
  const [pgn, setPgn] = React.useState("");
  const [moves, setMoves] = React.useState([]);
  const [error, setError] = React.useState("");

  function loadGame() {
    setError("");
    try {
      const game = new Chess();
      if (!pgn.trim()) throw new Error("Вставь PGN партии.");
      game.loadPgn(pgn);
      const history = game.history({ verbose: true });
      if (!history.length) throw new Error("В PGN не найдены ходы.");
      setMoves(history.map((move, index) => ({
        number: Math.floor(index / 2) + 1,
        side: index % 2 === 0 ? "Белые" : "Чёрные",
        san: move.san,
        from: move.from,
        to: move.to
      })));
    } catch (e) {
      setMoves([]);
      setError(e.message || "Не удалось прочитать PGN.");
    }
  }

  return <main className="shell">
    <header className="topbar">
      <div className="brand"><span className="mark">t.</span><div><b>triprdx</b><small>CHESSLAB</small></div></div>
      <span className="status">ANALYSIS WORKSPACE</span>
    </header>
    <section className="hero">
      <p className="eyebrow">CHESS ANALYSIS / 001</p>
      <h1>Разбор партии.<br/><em>Каждый ход имеет значение.</em></h1>
      <p className="sub">Загрузи PGN, чтобы подготовить партию к подробному анализу.</p>
    </section>
    <section className="panel">
      <div className="panel-head"><div><span className="eyebrow">01 / IMPORT</span><h2>Импорт партии</h2></div><span className="tag">PGN</span></div>
      <textarea value={pgn} onChange={e => setPgn(e.target.value)} placeholder={'Вставь сюда PGN партии…\n\n[Event "Casual Game"]\n1. e4 e5 2. Nf3 Nc6'} />
      <div className="actions"><button onClick={loadGame}>Загрузить партию <span>↗</span></button><span className="hint">Поддерживается стандартный PGN</span></div>
      {error && <p className="error">{error}</p>}
    </section>
    {moves.length > 0 && <section className="panel">
      <div className="panel-head"><div><span className="eyebrow">02 / MOVES</span><h2>Список ходов</h2></div><span className="tag">{moves.length} HALF-MOVES</span></div>
      <div className="moves">{moves.map((m, i) => <div className="move" key={i}><span className="move-no">{m.side === "Белые" ? m.number + "." : ""}</span><b>{m.san}</b><small>{m.side}</small></div>)}</div>
      <p className="notice">Это пока просмотр PGN. Движок Stockfish и объяснения ещё не подключены.</p>
    </section>}
    <footer><span>triprdx © 2026</span><span>BUILT FOR THE GAME</span></footer>
  </main>;
}

createRoot(document.getElementById("root")).render(<App />);
