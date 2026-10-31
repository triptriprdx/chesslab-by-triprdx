import React from "react";
import { createRoot } from "react-dom/client";
import { Chess } from "chess.js";
import "./style.css";

const START = new Chess().board();
const glyph = { w:{k:"♔",q:"♕",r:"♖",b:"♗",n:"♘",p:"♙"}, b:{k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"} };
function App() {
  const [pgn,setPgn]=React.useState("");
  const [game,setGame]=React.useState(null);
  const [positions,setPositions]=React.useState([]);
  const [moves,setMoves]=React.useState([]);
  const [selected,setSelected]=React.useState(-1);
  const [error,setError]=React.useState("");
  const [busy,setBusy]=React.useState(false);
  const [explanation,setExplanation]=React.useState("");
  const board = positions[Math.max(0,selected+1)] || START;
  function loadGame(){
    setError("");setExplanation("");
    try{
      const g=new Chess();
      if(!pgn.trim()) throw new Error("Вставь PGN партии.");
      g.loadPgn(pgn);
      const history=g.history({verbose:true});
      if(!history.length) throw new Error("В PGN не найдены ходы.");
      const replay=new Chess(), frames=[replay.board()];
      const list=[];
      history.forEach((m,i)=>{replay.move(m);frames.push(replay.board());list.push({...m,number:Math.floor(i/2)+1,side:i%2===0?"Белые":"Чёрные"});});
      setGame(g);setPositions(frames);setMoves(list);setSelected(0);
    }catch(e){setGame(null);setMoves([]);setPositions([]);setError(e.message||"Не удалось прочитать PGN.");}
  }
  async function explainSelected(){
    if(selected<0||!moves[selected])return;
    setBusy(true);setExplanation("");
    try{
      const r=await fetch("/api/explain",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
        pgn,ply:selected+1,move:moves[selected].san,fenBefore:(()=>{const c=new Chess();for(let i=0;i<selected;i++)c.move(moves[i]);return c.fen()})(),
        fenAfter:(()=>{const c=new Chess();for(let i=0;i<=selected;i++)c.move(moves[i]);return c.fen()})()
      })});
      const data=await r.json();
      if(!r.ok) throw new Error(data.error||"Сервис объяснений пока недоступен.");
      setExplanation(data.explanation||"Объяснение не получено.");
    }catch(e){setExplanation(e.message);}
    finally{setBusy(false);}
  }
  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="mark">t.</span><div><b>triprdx</b><small>CHESSLAB</small></div></div><span className="status">CHESS ANALYSIS STUDIO</span></header>
    <section className="hero"><p className="eyebrow">CHESS ANALYSIS / 001</p><h1>Понимай игру.<br/><em>Ход за ходом.</em></h1><p className="sub">Рабочее пространство для разбора шахматных партий.</p></section>
    <section className="panel"><div className="panel-head"><div><span className="eyebrow">01 / IMPORT</span><h2>Импорт партии</h2></div><span className="tag">PGN</span></div>
      <textarea value={pgn} onChange={e=>setPgn(e.target.value)} placeholder={'Вставь PGN партии…\n\n[Event "Casual Game"]\n1. e4 e5 2. Nf3 Nc6'} />
      <div className="actions"><button onClick={loadGame}>Загрузить партию <span>↗</span></button><span className="hint">Стандартный формат PGN</span></div>{error&&<p className="error">{error}</p>}
    </section>
    {moves.length>0&&<><section className="workspace">
      <div className="panel board-panel"><div className="panel-head"><div><span className="eyebrow">02 / POSITION</span><h2>Позиция на доске</h2></div><span className="tag">{selected<0?"START":`PLY ${selected+1}`}</span></div>
        <div className="board" aria-label="Шахматная доска">{board.flatMap((rank,r)=>rank.map((piece,c)=><div key={r+"-"+c} className={`square ${(r+c)%2===0?"light":"dark"}`}>{piece?<span className={piece.color==="w"?"white-piece":"black-piece"}>{glyph[piece.color][piece.type]}</span>:null}</div>))}</div>
        <div className="board-controls"><button className="secondary" onClick={()=>setSelected(-1)}>Начало</button><button className="secondary" onClick={()=>setSelected(v=>Math.max(-1,v-1))}>← Назад</button><button className="secondary" onClick={()=>setSelected(v=>Math.min(moves.length-1,v+1))}>Вперёд →</button></div>
      </div>
      <div className="panel move-panel"><div className="panel-head"><div><span className="eyebrow">03 / NOTATION</span><h2>Ходы партии</h2></div><span className="tag">{moves.length} PLY</span></div>
        <div className="move-list">{moves.map((m,i)=><button key={i} className={`move-row ${selected===i?"active":""}`} onClick={()=>{setSelected(i);setExplanation("");}}><span className="move-number">{i%2===0?m.number+".":""}</span><b>{m.san}</b><small>{m.side}</small></button>)}</div>
      </div>
    </section><section className="panel explain-panel"><div className="panel-head"><div><span className="eyebrow">04 / MOVE REVIEW</span><h2>Объяснение выбранного хода</h2></div><span className="tag">{selected>=0?moves[selected].san:"—"}</span></div>
      <p className="notice">AI-объяснение использует серверный Gemini. Для точной шахматной оценки сначала требуется подключить и запустить Stockfish; без его оценки приложение не будет выдавать догадки за анализ движка.</p>
      <button disabled={selected<0||busy} onClick={explainSelected}>{busy?"Готовлю объяснение…":"Объяснить ход"}</button>
      {explanation&&<div className="explanation">{explanation}</div>}
    </section></>}
    <footer><span>triprdx © 2026</span><span>BUILT FOR THE GAME</span></footer>
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);
