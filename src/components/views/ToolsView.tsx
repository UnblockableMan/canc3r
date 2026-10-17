"use client";

import { useState } from "react";
import { Wrench, ExternalLink, BookOpen, Lock, Lightbulb, ChevronDown, ChevronRight } from "lucide-react";
import { useNav } from "@/store/nav";
import { toast } from "sonner";

// Prank tools — history flooder, tab spinner, etc. Each opens in a new tab.
interface PrankTool { name: string; icon: string; desc: string; code: string; }
const PRANK_TOOLS: PrankTool[] = [
  {
    name: "History Flooder",
    icon: "📜",
    desc: "Floods the browser history with whatever text you enter. The back button becomes useless.",
    code: `<!DOCTYPE html><html><head><title>History Flooder</title><style>body{background:#1a1a2e;color:#fff;font-family:monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0}input,button{padding:10px;margin:5px;font-size:16px;border-radius:8px;border:1px solid #444;background:#16213e;color:#fff}button{cursor:pointer;background:#e94560}</style></head><body><h1>History Flooder</h1><input id="txt" value="C3 was here" placeholder="Text to flood"><input id="num" type="number" value="100" placeholder="Count"><button onclick="var t=document.getElementById('txt').value;var n=parseInt(document.getElementById('num').value)||100;var i=0;function f(){if(i>=n)return;history.pushState({},t,'/'+t+'-'+i);i++;setTimeout(f,10)}f()">Flood!</button><p id="done"></p></body></html>`,
  },
  {
    name: "Tab Spinner",
    icon: "🌀",
    desc: "Opens spinning tabs that change title rapidly. Chaotic.",
    code: `<!DOCTYPE html><html><head><title>Spinner</title><style>body{background:#000;color:#0f0;font-family:monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0}</style></head><body><h1>Tab Spinner</h1><button onclick="var s='';setInterval(function(){s=Math.random().toString(36).substr(2,8);document.title=s;},50)">Spin title</button></body></html>`,
  },
  {
    name: "Fake Update",
    icon: "💻",
    desc: "Shows a fake Windows update screen. Prank your teacher.",
    code: `<!DOCTYPE html><html><head><title>Windows Update</title><style>body{margin:0;background:#0078d4;color:#fff;font-family:'Segoe UI',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}.pct{font-size:48px;margin:20px}.bar{width:300px;height:6px;background:rgba(255,255,255,0.3);border-radius:3px;overflow:hidden}.fill{height:100%;background:#fff;width:0;transition:width 0.5s}.spin{width:40px;height:40px;border:4px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:s 1s linear infinite;margin:20px}@keyframes s{to{transform:rotate(360deg)}}</style></head><body><div class="spin"></div><div class="pct" id="p">0%</div><div class="bar"><div class="fill" id="f"></div></div><p>Working on updates</p><p>Don't turn off your PC</p><script>var p=0;setInterval(function(){p+=Math.random()*5;if(p>100)p=0;document.getElementById('p').textContent=Math.floor(p)+'%';document.getElementById('f').style.width=p+'%'},500)</script></body></html>`,
  },
  {
    name: "Matrix Rain",
    icon: "💚",
    desc: "Classic Matrix digital rain effect. Full screen green characters.",
    code: `<!DOCTYPE html><html><head><title>Matrix</title><style>body{margin:0;overflow:hidden;background:#000}canvas{display:block}</style></head><body><canvas id="c"></canvas><script>var c=document.getElementById('c');var ctx=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;var fs=16;var cols=Math.floor(c.width/fs);var drops=Array(cols).fill(0);var chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';function draw(){ctx.fillStyle='rgba(0,0,0,0.05)';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#0f0';ctx.font=fs+'px monospace';for(var i=0;i<drops.length;i++){var t=chars[Math.floor(Math.random()*chars.length)];ctx.fillText(t,i*fs,drops[i]*fs);if(drops[i]*fs>c.height&&Math.random()>0.975)drops[i]=0;drops[i]++}}setInterval(draw,50)</script></body></html>`,
  },
  {
    name: "Snake Game",
    icon: "🐍",
    desc: "Play Snake in a popup. Classic distraction.",
    code: `<!DOCTYPE html><html><head><title>Snake</title><style>body{margin:0;background:#1a1a2e;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}canvas{border:2px solid #e94560;background:#16213e}</style></head><body><canvas id="c" width="400" height="400"></canvas><script>var c=document.getElementById('c').getContext('2d');var s=[{x:200,y:200}];var d={x:0,y:0};var f={x:100,y:100};var g=20;function loop(){s.unshift({x:s[0].x+d.x*g,y:s[0].y+d.y*g});if(s[0].x<0||s[0].x>=400||s[0].y<0||s[0].y>=400||s.slice(1).some(p=>p.x==s[0].x&&p.y==s[0].y)){s=[{x:200,y:200}];d={x:0,y:0}}if(s[0].x==f.x&&s[0].y==f.y){f={x:Math.floor(Math.random()*20)*g,y:Math.floor(Math.random()*20)*g}}else{s.pop()}c.fillStyle='#16213e';c.fillRect(0,0,400,400);c.fillStyle='#e94560';c.fillRect(f.x,f.y,g-2,g-2);c.fillStyle='#0f0';s.forEach(p=>c.fillRect(p.x,p.y,g-2,g-2))}setInterval(loop,100);addEventListener('keydown',e=>{var m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(m)d={x:m[0]*g,y:m[1]*g}})</script></body></html>`,
  },
  {
    name: "Screen Flicker",
    icon: "⚡",
    desc: "Flickers the screen colors rapidly. Annoying but harmless.",
    code: `<!DOCTYPE html><html><head><title>Flicker</title><style>body{margin:0}</style></head><body><script>var colors=['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#000000','#ffffff'];var i=0;setInterval(function(){document.body.style.background=colors[i%colors.length];i++},50)</script></body></html>`,
  },
];

// Bookmarklets — run inline via eval.
interface Bookmarklet { name: string; icon: string; desc: string; code: string; }
const BOOKMARKLETS: Bookmarklet[] = [
  { name: "Edit Page", icon: "✏️", desc: "Make the current page editable. Click text and type.", code: "document.body.contentEditable='true';document.designMode='on';void 0" },
  { name: "Dark Mode", icon: "🌙", desc: "Force dark mode on any page via CSS filter.", code: "document.documentElement.style.filter='invert(1) hue-rotate(180deg)';void 0" },
  { name: "Remove Images", icon: "🚫", desc: "Strip all images from the page. Instant text mode.", code: "document.querySelectorAll('img').forEach(e=>e.remove());void 0" },
  { name: "Show Passwords", icon: "🔑", desc: "Reveal all hidden password fields as text.", code: "document.querySelectorAll('input[type=password]').forEach(e=>e.type='text');void 0" },
  { name: "Spin Everything", icon: "🌀", desc: "Makes every element on the page spin. Chaotic.", code: "document.querySelectorAll('*').forEach(e=>{e.style.animation='spin 1s linear infinite'});var s=document.createElement('style');s.textContent='@keyframes spin{to{transform:rotate(360deg)}}';document.head.appendChild(s);void 0" },
  { name: "Gravity Drop", icon: "🍎", desc: "All elements fall to the bottom of the screen.", code: "var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/gravity@1.0.0/gravity.min.js';document.body.appendChild(s);void 0" },
];

// Study cheats — open in Browser view via Scramjet proxy.
interface Cheat {
  name: string;
  platform: string;
  url: string;
  icon: string;
  desc: string;
}

const STUDY_CHEATS: Cheat[] = [
  {
    name: "Blooket",
    platform: "blooket",
    url: "https://studyoutlaws.com/dashboard?platform=blooket",
    icon: "https://www.blooket.com/favicon.ico",
    desc: "Auto-answer, token farmer, host control, and more for Blooket games.",
  },
  {
    name: "Waygrounds",
    platform: "waygrounds",
    url: "https://studyoutlaws.com/dashboard?platform=wayground",
    icon: "https://waygrounds.com/favicon.ico",
    desc: "Cheats for the Waygrounds platform.",
  },
  {
    name: "Kahoot",
    platform: "kahoot",
    url: "https://studyoutlaws.com/dashboard?platform=kahoot",
    icon: "https://kahoot.com/favicon.ico",
    desc: "Auto-answer, spam bots, hidden answer reveal for Kahoot quizzes.",
  },
  {
    name: "Delta Math",
    platform: "deltamath",
    url: "https://studyoutlaws.com/dashboard?platform=deltamath",
    icon: "https://deltamath.com/favicon.ico",
    desc: "Auto-solver + show work for Delta Math problem sets.",
  },
  {
    name: "Membean",
    platform: "membean",
    url: "https://studyoutlaws.com/dashboard?platform=membean",
    icon: "https://www.membean.com/favicon.ico",
    desc: "Auto-answer + word-reveal for Membean vocabulary sessions.",
  },
];

const UNLOCK_STEPS_CHROME = [
  { step: "Open Chrome and click your profile picture in the top-right corner.", detail: "It's the circular icon next to the three-dot menu." },
  { step: "Click \"Sync is on\" or \"Sync\" in the dropdown.", detail: "A small popup will appear showing your sync status." },
  { step: "Click \"Manage what you sync\" or \"Customize sync\".", detail: "This opens the sync customization panel." },
  { step: "Toggle OFF every category: Apps, Bookmarks, History, Passwords, Settings, Themes, Wi-Fi networks, etc.", detail: "Or just toggle the top \"Sync everything\" switch to OFF — that kills all of them at once." },
  { step: "Click \"Turn off\" to confirm.", detail: "Sync is now disabled. Your school admin can no longer see your browsing." },
  { step: "Restart your computer.", detail: "Fully shut down (not sleep/restart). This ensures any cached sync state is flushed and the school's MDM profile doesn't auto-re-enable sync on next boot." },
];

const UNLOCK_STEPS_OS = [
  { step: "Open your computer's Settings app.", detail: "Windows: Start menu → Settings. macOS: Apple menu → System Settings." },
  { step: "Navigate to Accounts (Win) or Apple ID / Internet Accounts (Mac).", detail: "Look for any \"Work or school\" account listed." },
  { step: "Find the \"Sync\" or \"Connected accounts\" section.", detail: "On Windows it's under Accounts → Access work or school. On Mac it's under Internet Accounts." },
  { step: "For each connected account, click it and select \"Disconnect\" or \"Stop sync\".", detail: "This severs the link between your local account and the school's domain controller." },
  { step: "Restart your computer.", detail: "A full restart — not sleep. If you have admin rights, you may also want to remove the school's MDM profile." },
];

export function ToolsView() {
  const setView = useNav((s) => s.setView);
  const [expanded, setExpanded] = useState<"chrome" | "os" | null>("chrome");

  const openCheat = (c: Cheat) => {
    setView("browser");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("redux-browser-init", { detail: c.url }));
    }, 50);
    toast.info(`Loading ${c.name} cheats`, { description: c.desc });
  };

  return (
    <div className="fade-in p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Wrench className="h-6 w-6" style={{ color: "var(--accent)" }} />
        <div>
          <h1 className="text-2xl font-bold">Tools</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Computer unlock guides + study cheats (Blooket, Kahoot, Delta Math, Membean, Waygrounds).
          </p>
        </div>
      </div>

      {/* Computer Unlock guides */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <h2 className="text-lg font-semibold">Unlock Your Computer</h2>
        </div>
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          School-issued Chromebooks and managed accounts often have sync forced on, which lets your admin
          see your tabs, history, and passwords. Here's how to disable it. Use at your own risk — make sure
          you know what your school's policy is.
        </p>

        {/* Chrome sync unlock */}
        <div className="mb-4 rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setExpanded(expanded === "chrome" ? null : "chrome")}
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:surface2"
            style={{ background: "var(--surface)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌐</span>
              <div>
                <div className="font-medium">Method 1: Disable Chrome sync (recommended)</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Turn off all sync categories in Chrome, then restart.
                </div>
              </div>
            </div>
            {expanded === "chrome" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {expanded === "chrome" && (
            <div className="p-4" style={{ background: "var(--bg)" }}>
              <ol className="space-y-3">
                {UNLOCK_STEPS_CHROME.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold" style={{ background: "var(--accent)", color: "var(--bg)" }}>{i + 1}</span>
                    <div>
                      <div className="text-sm font-medium">{s.step}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.detail}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 rounded-lg border p-3 text-xs" style={{ borderColor: "var(--border)", background: "var(--surface2)" }}>
                <Lightbulb className="inline h-3.5 w-3.5 mr-1" style={{ color: "var(--accent)" }} />
                <strong>Tip:</strong> If your school blocks the sync settings page, you can also sign out of
                your Chrome profile entirely (Settings → You and Google → Turn off sync → Sign out). After
                that, browse in Incognito or as a guest to leave no local trace.
              </div>
            </div>
          )}
        </div>

        {/* OS-level sync unlock */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setExpanded(expanded === "os" ? null : "os")}
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:surface2"
            style={{ background: "var(--surface)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <div>
                <div className="font-medium">Method 2: Disable OS-level sync (Windows/Mac)</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Disconnect work or school accounts from your system settings.
                </div>
              </div>
            </div>
            {expanded === "os" ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {expanded === "os" && (
            <div className="p-4" style={{ background: "var(--bg)" }}>
              <ol className="space-y-3">
                {UNLOCK_STEPS_OS.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold" style={{ background: "var(--accent)", color: "var(--bg)" }}>{i + 1}</span>
                    <div>
                      <div className="text-sm font-medium">{s.step}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.detail}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

      {/* Study cheats */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <h2 className="text-lg font-semibold">Study Cheats</h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>via studyoutlaws.com</span>
        </div>
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          Each cheat dashboard opens in the proxy browser. Cheats work for live quizzes — they auto-answer
          questions, reveal hidden options, farm tokens, and more.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STUDY_CHEATS.map((c) => (
            <button
              key={c.platform}
              onClick={() => openCheat(c)}
              className="group surface flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:scale-[1.02]"
              style={{ borderColor: "var(--border)" }}
              title={c.desc}
            >
              <img
                src={c.icon}
                alt=""
                className="h-10 w-10 flex-none rounded-lg object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{c.name}</div>
                <div className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{c.desc}</div>
              </div>
              <ExternalLink className="h-4 w-4 flex-none opacity-50 transition-opacity group-hover:opacity-100" style={{ color: "var(--accent)" }} />
            </button>
          ))}
        </div>
      </section>

      {/* Prank tools — history flooder, tab spinner, etc. */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-base">🃏</span>
          <h2 className="text-lg font-semibold">Prank Tools</h2>
        </div>
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          Run these tools to flood history, spin tabs, or mess with the browser. Each runs instantly in a new tab.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRANK_TOOLS.map((t) => (
            <button
              key={t.name}
              onClick={() => {
                const w = window.open("about:blank", "_blank");
                if (!w) { toast.error("Popup blocked"); return; }
                w.document.write(t.code);
                w.document.close();
                toast.success(`Launched ${t.name}`);
              }}
              className="group surface flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:scale-[1.02]"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="text-2xl">{t.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{t.name}</div>
                <div className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{t.desc}</div>
              </div>
              <ExternalLink className="h-4 w-4 flex-none opacity-50 transition-opacity group-hover:opacity-100" style={{ color: "var(--accent)" }} />
            </button>
          ))}
        </div>
      </section>

      {/* Bookmarklets — drag to bookmark bar or click to run */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="text-base">📌</span>
          <h2 className="text-lg font-semibold">Bookmarklets</h2>
        </div>
        <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
          Click to run instantly, or drag to your bookmark bar for quick access.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BOOKMARKLETS.map((b) => (
            <button
              key={b.name}
              onClick={() => {
                try { eval(b.code); toast.success(`Ran ${b.name}`); }
                catch (e: any) { toast.error("Failed", { description: e?.message }); }
              }}
              className="group surface flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:scale-[1.02]"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="text-2xl">{b.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{b.name}</div>
                <div className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{b.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
