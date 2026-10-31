function parseInfo(line, activeColor) {
  if (!line.startsWith("info ")) return null;
  const get = (key) => { const m=line.match(new RegExp("\\b"+key+"\\s+([^\\s]+)")); return m?.[1]; };
  const depth=Number(get("depth")||0), nodes=Number(get("nodes")||0), nps=Number(get("nps")||0), multipv=Number(get("multipv")||1);
  const scoreMatch=line.match(/\bscore\s+(cp|mate)\s+(-?\d+)/);
  if (!scoreMatch) return null;
  let value=Number(scoreMatch[2]);
  if(activeColor==="b") value=-value;
  const pvMatch=line.match(/\bpv\s+(.+)$/);
  return {depth,nodes,nps,multipv,scoreType:scoreMatch[1],score:value,rawScore:Number(scoreMatch[2]),pv:pvMatch?.[1]||""};
}

export class StockfishEngine {
  constructor(workerUrl=`${import.meta.env.BASE_URL}stockfish/stockfish-18-lite-single.js`) {
    this.worker=new Worker(workerUrl);
    this.ready=false;
    this.pending=null;
    this.lines=new Map();
    this.worker.onmessage=(event)=>{
      const line=String(event.data||"").trim();
      if(line==="uciok"&&this.uciResolve){this.uciResolve();this.uciResolve=null;}
      if(line==="readyok"&&this.readyResolve){this.readyResolve();this.readyResolve=null;}
      if(line.startsWith("info ")&&this.pending){
        const parsed=parseInfo(line,this.pending.activeColor);
        if(parsed){this.lines.set(parsed.multipv,parsed);this.pending.onInfo?.([...this.lines.values()].sort((a,b)=>a.multipv-b.multipv));}
      }
      if(line.startsWith("bestmove ")&&this.pending){
        const pending=this.pending;this.pending=null;clearTimeout(pending.timer);
        pending.resolve({bestmove:line.split(/\s+/)[1],lines:[...this.lines.values()].sort((a,b)=>a.multipv-b.multipv)});
      }
    };
    this.worker.onerror=()=>{if(this.pending){this.pending.reject(new Error("Не удалось запустить Stockfish. Проверьте загрузку файлов движка."));this.pending=null;}};
  }
  send(command){this.worker.postMessage(command);}
  async waitReady(timeout=15000){
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{if(this.readyResolve){this.readyResolve=null;reject(new Error("Stockfish не ответил на isready."));}},timeout);
      this.readyResolve=()=>{clearTimeout(timer);this.readyResolve=null;resolve();};
      this.send("isready");
    });
  }
  async init(){
    if(this.ready)return;
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{if(this.uciResolve){this.uciResolve=null;reject(new Error("Stockfish не ответил на UCI."));}},20000);
      this.uciResolve=()=>{clearTimeout(timer);this.uciResolve=null;resolve();};
      this.send("uci");
    });
    await this.waitReady();
    this.ready=true;
  }
  async analyze(fen,{depth=14,multiPv=3,onInfo}={}){
    await this.init();
    if(this.pending) throw new Error("Предыдущий анализ ещё выполняется.");
    this.lines.clear();
    this.send("setoption name MultiPV value "+multiPv);
    await this.waitReady();
    const activeColor=fen.split(" ")[1]||"w";
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending=null;reject(new Error("Stockfish превысил лимит времени."));},90000);
      this.pending={resolve,reject,timer,onInfo,activeColor};
      this.send("position fen "+fen);
      this.send("go depth "+depth);
    });
  }
  stop(){this.send("stop");}
  terminate(){this.worker.terminate();this.pending=null;this.ready=false;}
}
