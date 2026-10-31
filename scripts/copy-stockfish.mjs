import { mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
const source="node_modules/stockfish/bin";
const target="public/stockfish";
const files=["stockfish-18-lite-single.js","stockfish-18-lite-single.wasm"];
if(!existsSync(source)) throw new Error("Stockfish package not installed. Run npm install first.");
await mkdir(target,{recursive:true});
for(const file of files) await copyFile(`${source}/${file}`,`${target}/${file}`);
console.log("Copied Stockfish 18 lite single-threaded browser engine.");
