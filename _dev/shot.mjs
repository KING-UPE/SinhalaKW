// Headless Chrome CDP screenshots of the Results/Reviews sections.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const URL = process.argv[2] || 'http://localhost:8080/';
const OUT = 'D:\\SinhalaKW\\_dev\\shots';
mkdirSync(OUT, { recursive: true });
const PORT = 9333;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  '--user-data-dir=D:\\SinhalaKW\\_dev\\chrome-prof', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = js => send('Runtime.evaluate', { expression: js, awaitPromise: true, returnByValue: true }).then(r => r.result?.result?.value);
async function shot(name) { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${OUT}\\${name}.png`, Buffer.from(r.result.data, 'base64')); console.log('shot', name); }
async function viewport(w, h, mobile) { await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile }); }
async function goto(sel, offset = 0) {
  await ev(`(async()=>{const el=document.querySelector('${sel}');const y=el.getBoundingClientRect().top+scrollY+${offset};
    for(let s=scrollY;Math.abs(s-y)>5;){s+= (y-s)/3; scrollTo(0,s); await new Promise(r=>setTimeout(r,60));} scrollTo(0,y);})()`);
  await sleep(2500);
}
try {
  for (let t = 0; t < 40; t++) { try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); const p = l.find(x => x.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch {} await sleep(250); }
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', m => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Runtime.enable');
  const errs = [];
  ws.addEventListener('message', m => { const d = JSON.parse(m.data); if (d.method === 'Runtime.exceptionThrown') errs.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text); });

  await viewport(1440, 900, false);
  await send('Page.navigate', { url: URL }); await sleep(5000);
  await goto('#results', 40); await shot('d_results_2025_top');
  await goto('.year-panel:not(.is-hidden) .sheets', -260); await shot('d_results_2025_sheets');
  for (const y of ['2024', '2023', '2022']) { await ev(`document.querySelector('#yt-${y}').click()`); await sleep(400); await goto('#results', 120); await shot(`d_results_${y}`); }
  await ev(`document.querySelector('#yt-2023').click()`); await sleep(300);
  await ev(`document.querySelector('#yp-2023 .sheet-more').closest('button').click()`); await sleep(1500); await shot('d_lightbox_2023');
  console.log('lightbox caption:', await ev(`document.querySelector('#lbCap').textContent`));
  await ev(`document.querySelector('#lbClose').click()`); await sleep(500);
  await goto('#reviews', 0); await shot('d_reviews_1');
  await goto('#reviews', 800); await shot('d_reviews_2');

  await viewport(390, 844, true);
  await send('Page.reload'); await sleep(5000);
  await goto('#results', 0); await shot('m_results_1');
  await goto('#results', 700); await shot('m_results_2');
  await ev(`document.querySelector('#yt-2023').click()`); await sleep(400); await goto('#results', 250); await shot('m_results_2023');
  await goto('#reviews', 0); await shot('m_reviews');
  console.log('errors:', JSON.stringify(errs));
} finally { chrome.kill(); process.exit(0); }
