#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const [packRootArg] = process.argv.slice(2);

if (!packRootArg) {
  console.error("Usage: build-learning-page.mjs <pack-root>");
  process.exit(2);
}

const packRoot = path.resolve(packRootArg);
const learningMapPath = path.join(packRoot, "graph", "learning-map.json");
const outputPath = path.join(packRoot, "learning.html");
const annotationsPath = path.join(packRoot, "progress", "learning-annotations.json");

function read(relPath) {
  return fs.readFileSync(path.join(packRoot, relPath), "utf8");
}

function fileExists(relPath) {
  return fs.existsSync(path.join(packRoot, relPath));
}

const learningMap = JSON.parse(fs.readFileSync(learningMapPath, "utf8"));

const labPathByUnit = {
  "01-runnable": "labs/01-mini-runnable/README.md",
  "02-message-schema": "labs/02-message-types/README.md",
  "03-prompt-template": "labs/03-mini-prompt-template/README.md",
  "04-chat-model-adapter": "labs/04-mini-chat-model-adapter/README.md",
  "05-tool-interface": "labs/05-mini-tool-calling/README.md",
  "06-callback-tracing": "labs/06-mini-callback-tracer/README.md",
  "07-agent-loop": "labs/07-mini-agent-loop/README.md",
  "08-provider-integration": "labs/08-mini-provider-adapter/README.md",
};

function defaultLabPath(unitId) {
  if (labPathByUnit[unitId]) return labPathByUnit[unitId];
  const slug = unitId.replace(/^\d+-/, "");
  return `labs/${unitId.startsWith("99-") ? unitId : `mini-${slug}`}/README.md`;
}

const units = learningMap.units.map((unit) => {
  const labPath = defaultLabPath(unit.id);
  return {
    ...unit,
    sections: {
      lesson: {
        label: "课程",
        path: `lessons/${unit.id}.md`,
        markdown: read(`lessons/${unit.id}.md`),
      },
      quiz: {
        label: "测试",
        path: `quizzes/${unit.id}.quiz.md`,
        markdown: read(`quizzes/${unit.id}.quiz.md`),
      },
      mastery: {
        label: "掌握度",
        path: `mastery/${unit.id}.mastery.md`,
        markdown: read(`mastery/${unit.id}.mastery.md`),
      },
      lab: {
        label: "实验",
        path: labPath,
        markdown: read(labPath),
      },
    },
  };
});

const extras = {
  readme: { label: "入口说明", path: "README.md", markdown: read("README.md") },
  path: { label: "学习路线", path: "learning-path.md", markdown: read("learning-path.md") },
  finalQuiz: {
    label: "总复盘测试",
    path: "quizzes/99-final-review.quiz.md",
    markdown: read("quizzes/99-final-review.quiz.md"),
  },
  capstoneMastery: {
    label: "Capstone 掌握度",
    path: "mastery/99-capstone.mastery.md",
    markdown: read("mastery/99-capstone.mastery.md"),
  },
  capstoneLab: {
    label: "Capstone 实验",
    path: "labs/99-capstone-mini-langchain-agent/README.md",
    markdown: read("labs/99-capstone-mini-langchain-agent/README.md"),
  },
  weakEvidence: {
    label: "弱证据报告",
    path: "review/weak-evidence.md",
    markdown: read("review/weak-evidence.md"),
  },
  progress: {
    label: "学习进度",
    path: "progress/learning-progress.md",
    markdown: read("progress/learning-progress.md"),
  },
};

if (fileExists("review/test-evidence-matrix.md")) {
  extras.testEvidence = {
    label: "测试证据矩阵",
    path: "review/test-evidence-matrix.md",
    markdown: read("review/test-evidence-matrix.md"),
  };
}

const data = {
  generatedAt: new Date().toISOString(),
  units,
  extras,
};

let embeddedAnnotations = [];
if (fs.existsSync(annotationsPath)) {
  embeddedAnnotations = JSON.parse(fs.readFileSync(annotationsPath, "utf8"));
}

const page = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Agent Code Learning Pack</title>
  <style>
    :root{color-scheme:light;--bg:#f7f7f4;--panel:#fff;--soft:#f0f3f1;--text:#1f2723;--muted:#68746d;--line:#d9ded8;--accent:#256f63;--accent2:#174b43;--accent-soft:#dcebe7;--warn:#fff4d7;--code:#18211e;--code-text:#eef7f3;--shadow:0 10px 28px rgba(28,39,35,.08);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text)}button{cursor:pointer}a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
    .app{min-height:100vh;display:grid;grid-template-columns:320px minmax(0,1fr) 260px}.sidebar{position:sticky;top:0;height:100vh;overflow:auto;padding:20px 16px;border-right:1px solid var(--line);background:#fbfbf8}
    .brand h1{margin:0 0 8px;font-size:18px;line-height:1.25}.brand p{margin:0;color:var(--muted);font-size:13px;line-height:1.55}.quick{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}.nav-title{margin:18px 0 8px;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
    .unit-list{display:grid;gap:8px}.unit,.quick button,.tab{border:1px solid var(--line);background:var(--panel);border-radius:8px;color:var(--text)}.unit{width:100%;padding:10px;text-align:left;display:grid;gap:4px}.unit:hover,.unit.active,.quick button:hover,.quick button.active{border-color:var(--accent);background:var(--accent-soft)}
    .kicker,.deps,.meta{color:var(--muted);font-size:12px}.name{font-size:14px;font-weight:700;line-height:1.35}.main{min-width:0;padding:24px 30px 56px}.topbar{position:sticky;top:0;z-index:3;padding-bottom:14px;background:linear-gradient(var(--bg) 78%,rgba(247,247,244,0))}
    .title{background:var(--panel);border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:18px 20px;display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.title h2{margin:0 0 6px;font-size:22px;line-height:1.25}.source{display:inline-flex;max-width:100%;gap:6px;padding:6px 8px;border:1px solid var(--line);border-radius:6px;color:var(--muted);font-size:12px;background:var(--soft);word-break:break-all}
    .tabs{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.tab{padding:8px 12px;font-size:14px}.tab.active,.tab:hover{border-color:var(--accent);background:var(--accent);color:white}.content{background:var(--panel);border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:28px;margin-top:16px;min-height:70vh}
    .markdown{line-height:1.76;font-size:16px}.markdown h1{margin:0 0 22px;font-size:30px;line-height:1.25}.markdown h2{margin:34px 0 12px;font-size:22px;line-height:1.3;padding-top:6px;border-top:1px solid var(--line)}.markdown h3{margin:26px 0 10px;font-size:18px}.markdown code{background:#eef2ef;color:#143e37;border-radius:4px;padding:2px 5px;font-size:.92em}.markdown pre{overflow:auto;background:var(--code);color:var(--code-text);padding:16px;border-radius:8px;line-height:1.55}.markdown pre code{background:transparent;color:inherit;padding:0}.markdown table{border-collapse:collapse;width:100%;display:block;overflow-x:auto}.markdown th,.markdown td{border:1px solid var(--line);padding:8px 10px}.markdown th{background:var(--soft)}
    .toc-panel{position:sticky;top:0;height:100vh;overflow:auto;padding:20px 16px;border-left:1px solid var(--line);background:#fbfbf8}.toc-panel h3{margin:0 0 12px;font-size:14px}.toc{display:grid;gap:5px}.toc a{display:block;color:var(--muted);font-size:13px;line-height:1.35;padding:5px 8px;border-radius:6px}.toc a:hover{background:var(--soft);color:var(--accent2);text-decoration:none}.toc .h3{padding-left:20px;font-size:12px}.notice{margin-top:16px;padding:10px 12px;border-radius:8px;background:var(--warn);border:1px solid #ead18b;color:#5b4710;font-size:13px;line-height:1.5}.mobile{display:none;margin-bottom:12px;gap:8px}.mobile select{width:100%;padding:10px;border:1px solid var(--line);border-radius:6px;background:white;color:var(--text)}
    .annotation-toolbar{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.annotation-toolbar button,.note-actions button,.note-mode button{border:1px solid var(--line);background:var(--panel);border-radius:6px;padding:7px 9px;color:var(--text);font-size:12px}.annotation-toolbar button:hover,.note-actions button:hover,.note-mode button:hover,.note-mode button.active{border-color:var(--accent);background:var(--accent-soft)}mark.study-note{background:#fff0a8;color:inherit;border-bottom:2px solid #e1aa00;border-radius:3px;padding:1px 2px;cursor:pointer}mark.study-note[data-note-type="question"]{background:#ffe0bd;border-bottom-color:#df7d18}mark.study-note[data-note-type="note"]{background:#dff1ff;border-bottom-color:#3982b8}.note-list{display:grid;gap:10px;margin-top:10px}.note-card{border:1px solid var(--line);border-radius:8px;background:var(--panel);padding:10px}.note-type{display:inline-block;margin:0 0 6px;padding:2px 6px;border-radius:99px;background:var(--soft);color:var(--muted);font-size:11px}.note-type.question{background:#ffe7cf;color:#7a3f08}.note-type.note{background:#e3f1ff;color:#245b82}.note-quote{margin:0 0 7px;color:var(--accent2);font-size:12px;line-height:1.45}.note-text{margin:0;color:var(--text);font-size:13px;line-height:1.55;white-space:pre-wrap}.qa-answer{margin-top:9px;padding:9px 10px;border-left:3px solid var(--accent);background:var(--accent-soft);border-radius:6px}.note-meta{margin-top:7px;color:var(--muted);font-size:11px}.note-empty{color:var(--muted);font-size:13px;line-height:1.5}.note-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(25,35,31,.34);z-index:20;padding:18px}.note-modal.open{display:flex}.note-dialog{width:min(680px,100%);background:var(--panel);border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow);padding:18px}.note-dialog h3{margin:0 0 10px;font-size:18px}.note-mode{display:flex;gap:8px;margin:0 0 12px}.note-dialog blockquote{margin:0 0 12px;padding:10px 12px;border-left:4px solid var(--accent);background:var(--accent-soft);color:var(--accent2);font-size:14px;line-height:1.55}.note-dialog textarea{width:100%;min-height:130px;resize:vertical;border:1px solid var(--line);border-radius:8px;padding:10px;font:inherit;line-height:1.55}.note-dialog .note-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.note-primary{background:var(--accent)!important;color:white!important;border-color:var(--accent)!important}
    @media(max-width:1120px){.app{grid-template-columns:280px minmax(0,1fr)}.toc-panel{display:none}}@media(max-width:760px){.app{display:block}.sidebar{display:none}.main{padding:14px 12px 40px}.mobile{display:grid}.title{display:block;padding:14px}.title h2{font-size:19px}.content{padding:18px 14px}.markdown{font-size:15px}.markdown h1{font-size:24px}.markdown h2{font-size:19px}}
  </style>
</head>
<body>
  <div class="app">
    <aside class="sidebar"><div class="brand"><h1>Agent Code Learning Pack</h1><p>按路线学习源码：课程、测试、掌握度和实验集中在一个静态页面里。</p></div><div class="quick" id="quick"></div><div class="annotation-toolbar"><button id="addNoteBtn" type="button">给选中文字加注释</button><button id="viewQaBtn" type="button">问答回顾</button><button id="viewStudyNotesBtn" type="button">学习笔记</button><button id="exportNotesBtn" type="button">导出带注释 HTML</button><button id="exportStudyNotesBtn" type="button">导出学习笔记 MD</button></div><div class="nav-title">课程</div><div class="unit-list" id="unitList"></div><div class="notice">选中正文后可记录“疑问”或“学习笔记”。疑问导出后可交给 AI 回答并补课；学习笔记可单独导出 Markdown，沉淀到你的知识库。</div></aside>
    <main class="main"><div class="mobile"><select id="mobileUnit"></select><select id="mobileSection"></select></div><div class="topbar"><div class="title"><div><h2 id="pageTitle">加载中</h2><p class="meta" id="pageMeta"></p></div><div class="source" id="sourcePath"></div></div><div class="tabs" id="tabs"></div></div><article class="content"><div class="markdown" id="content"></div></article></main>
    <aside class="toc-panel"><h3>当前页目录</h3><nav class="toc" id="toc"></nav><h3 style="margin-top:22px" id="notePanelTitle">学习注释</h3><div class="note-list" id="noteList"></div></aside>
  </div>
  <div class="note-modal" id="noteModal" role="dialog" aria-modal="true" aria-labelledby="noteTitle"><div class="note-dialog"><h3 id="noteTitle">添加学习注释</h3><div class="note-mode"><button class="active" id="questionModeBtn" type="button">记录我的疑问</button><button id="studyNoteModeBtn" type="button">记录我的学习笔记</button></div><blockquote id="noteQuote"></blockquote><textarea id="noteInput" placeholder="写下哪里没看懂、你希望课程怎么补充、或者你自己的理解。"></textarea><div class="note-actions"><button id="cancelNoteBtn" type="button">取消</button><button class="note-primary" id="saveNoteBtn" type="button">保存注释</button></div></div></div>
  <script src="wiki/wiki/marked.min.js"></script>
  <script src="wiki/wiki/purify.min.js"></script>
  <script id="learning-data" type="application/json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
  <script id="learning-annotations-data" type="application/json">${JSON.stringify(embeddedAnnotations).replace(/</g, "\\u003c")}</script>
  <script>
    const DATA=JSON.parse(document.getElementById('learning-data').textContent);
    const labels={lesson:'课程',quiz:'测试',mastery:'掌握度',lab:'实验'};
    const state={kind:'unit',unit:DATA.units[0]?.id,section:'lesson',extra:'readme',noteView:'all'};
    const slug=(s,i)=>s.toLowerCase().replace(/[^\\w\\u4e00-\\u9fa5]+/g,'-').replace(/^-|-$/g,'')||'h-'+i;
    const noteStoreKey='agent-code-learning-pack-annotations:'+location.pathname;
    let annotations=loadAnnotations();
    let pendingQuote='';
    let pendingType='question';
    function md(x){return DOMPurify.sanitize(marked.parse(x||''));}
    function doc(){return state.kind==='extra'?DATA.extras[state.extra]:DATA.units.find(u=>u.id===state.unit).sections[state.section];}
    function loadAnnotations(){let embedded=[];let stored=[];try{embedded=JSON.parse(document.getElementById('learning-annotations-data')?.textContent||'[]');}catch{}try{stored=JSON.parse(localStorage.getItem(noteStoreKey)||'[]');}catch{}const merged=[...embedded,...stored];const seen=new Set();return merged.filter(n=>{if(!n||!n.id||seen.has(n.id))return false;seen.add(n.id);return true;});}
    function saveAnnotations(){try{localStorage.setItem(noteStoreKey,JSON.stringify(annotations));}catch{}const el=document.getElementById('learning-annotations-data');if(el)el.textContent=JSON.stringify(annotations);}
    function currentDocPath(){return doc().path;}
    function currentNotes(){const p=currentDocPath();return annotations.filter(n=>n.path===p).filter(n=>state.noteView==='all'||(n.type||'question')===state.noteView);}
    function selectionQuote(){const sel=window.getSelection();if(!sel||sel.rangeCount===0)return'';const text=sel.toString().replace(/\\s+/g,' ').trim();if(!text)return'';const content=document.getElementById('content');const node=sel.getRangeAt(0).commonAncestorContainer;const owner=node.nodeType===1?node:node.parentElement;if(!content.contains(owner))return'';return text.slice(0,600);}
    function setPendingType(type){pendingType=type;document.getElementById('questionModeBtn').classList.toggle('active',type==='question');document.getElementById('studyNoteModeBtn').classList.toggle('active',type==='note');document.getElementById('noteInput').placeholder=type==='question'?'写下哪里没看懂、希望 AI 后续补充什么。':'写下你的理解、总结、类比或可沉淀进知识库的笔记。';}
    function openNoteModal(){pendingQuote=selectionQuote();if(!pendingQuote){alert('请先在正文里选中一段你看不懂或想记录的内容。');return;}setPendingType('question');document.getElementById('noteQuote').textContent=pendingQuote;document.getElementById('noteInput').value='';document.getElementById('noteModal').classList.add('open');document.getElementById('noteInput').focus();}
    function closeNoteModal(){document.getElementById('noteModal').classList.remove('open');pendingQuote='';}
    function saveNote(){const note=document.getElementById('noteInput').value.trim();if(!note){alert('请先写下注释内容。');return;}const d=doc();annotations.push({id:'note-'+Date.now()+'-'+Math.random().toString(16).slice(2),type:pendingType,path:d.path,title:document.getElementById('pageTitle').textContent,kind:state.kind,unit:state.unit,section:state.section,extra:state.extra,quote:pendingQuote,note,question:pendingType==='question'?note:'',answer:'',createdAt:new Date().toISOString()});saveAnnotations();closeNoteModal();state.noteView=pendingType;render();}
    function textNodes(root){const out=[];const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){if(!node.nodeValue.trim())return NodeFilter.FILTER_REJECT;const p=node.parentElement;if(!p||['SCRIPT','STYLE','TEXTAREA','MARK'].includes(p.tagName))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT;}});let n;while((n=walker.nextNode()))out.push(n);return out;}
    function applyNoteHighlight(note){const root=document.getElementById('content');const q=note.quote.replace(/\\s+/g,' ').trim();if(!q)return;for(const node of textNodes(root)){const compact=node.nodeValue.replace(/\\s+/g,' ');const idx=compact.indexOf(q);if(idx<0)continue;const raw=node.nodeValue;const rawIdx=raw.indexOf(q);if(rawIdx<0)continue;const mark=document.createElement('mark');mark.className='study-note';mark.dataset.noteId=note.id;mark.dataset.noteType=note.type||'question';mark.title=note.note;mark.textContent=raw.slice(rawIdx,rawIdx+q.length);mark.onclick=()=>{const card=document.querySelector('[data-note-card=\"'+note.id+'\"]');if(card)card.scrollIntoView({behavior:'smooth',block:'center'});};const frag=document.createDocumentFragment();frag.append(document.createTextNode(raw.slice(0,rawIdx)),mark,document.createTextNode(raw.slice(rawIdx+q.length)));node.parentNode.replaceChild(frag,node);break;}}
    function highlightNotes(){annotations.filter(n=>n.path===currentDocPath()).forEach(applyNoteHighlight);}
    function deleteNote(id){annotations=annotations.filter(n=>n.id!==id);saveAnnotations();render();}
    function noteViewTitle(){return state.noteView==='question'?'问答 QA':state.noteView==='note'?'学习笔记':'学习注释';}
    function setNoteView(view){state.noteView=view;render();}
    function renderNotes(){const list=document.getElementById('noteList');if(!list)return;document.getElementById('notePanelTitle').textContent=noteViewTitle();const notes=currentNotes();list.innerHTML='';if(!notes.length){list.innerHTML='<div class=\"note-empty\">当前页面还没有'+noteViewTitle()+'。选中正文后点击左侧“给选中文字加注释”。</div>';return;}notes.forEach((n,i)=>{const type=n.type||'question';const isQuestion=type==='question';const label=isQuestion?'疑问':'学习笔记';const answer=n.answer?'<div class=\"qa-answer\"><p class=\"note-text\"><strong>A：</strong>'+escapeHtml(n.answer)+'</p></div>':'<div class=\"qa-answer\"><p class=\"note-text\"><strong>A：</strong>导出 HTML 给 AI 后，这里会回填解答。</p></div>';const review=n.review?'<div class=\"qa-answer\"><p class=\"note-text\"><strong>校正：</strong>'+escapeHtml(n.review)+'</p></div>':'';const card=document.createElement('div');card.className='note-card';card.dataset.noteCard=n.id;card.innerHTML='<span class=\"note-type '+type+'\">'+label+'</span><p class=\"note-quote\">#'+(i+1)+' 引用：'+escapeHtml(n.quote)+'</p><p class=\"note-text\"><strong>'+(isQuestion?'Q：':'笔记：')+'</strong>'+escapeHtml(n.note)+'</p>'+(isQuestion?answer:review)+'<div class=\"note-meta\">'+new Date(n.createdAt).toLocaleString()+'</div><div class=\"note-actions\"><button type=\"button\" data-delete=\"'+n.id+'\">删除</button></div>';list.appendChild(card);});list.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteNote(b.dataset.delete));}
    function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',\"'\":'&#39;'}[c]));}
    function downloadText(filename,text,type='text/plain;charset=utf-8'){const blob=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();URL.revokeObjectURL(a.href);a.remove();}
    function exportAnnotatedHtml(){saveAnnotations();const html='<!doctype html>\\n'+document.documentElement.outerHTML;const stamp=new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');downloadText('learning-annotated-'+stamp+'.html',html,'text/html;charset=utf-8');}
    function exportStudyNotesMarkdown(){const notes=annotations.filter(n=>(n.type||'question')==='note');if(!notes.length){alert('还没有学习笔记可以导出。');return;}const body=['# 学习笔记导出',''].concat(notes.map((n,i)=>['## '+(i+1)+'. '+n.title,'','- source: '+n.path,'- created: '+n.createdAt,'','> '+n.quote.replace(/\\n/g,'\\n> '),'','### 原始笔记','',n.note,'',n.review?'### AI 校正\\n\\n'+n.review+'\\n':''].join('\\n'))).join('\\n');const stamp=new Date().toISOString().slice(0,10);downloadText('learning-notes-'+stamp+'.md',body,'text/markdown;charset=utf-8');}
    function renderNav(){const ul=document.getElementById('unitList');ul.innerHTML='';DATA.units.forEach(u=>{const b=document.createElement('button');b.className='unit '+(state.kind==='unit'&&state.unit===u.id?'active':'');b.onclick=()=>{state.kind='unit';state.unit=u.id;state.section='lesson';render();};b.innerHTML='<span class="kicker">'+u.id+'</span><span class="name">'+u.title+'</span><span class="deps">'+(u.depends_on?.length?'依赖 '+u.depends_on.join(', '):'起点课程')+'</span>';ul.appendChild(b);});const q=document.getElementById('quick');q.innerHTML='';Object.entries(DATA.extras).forEach(([k,v])=>{const b=document.createElement('button');b.className=state.kind==='extra'&&state.extra===k?'active':'';b.textContent=v.label;b.onclick=()=>{state.kind='extra';state.extra=k;render();};q.appendChild(b);});const mu=document.getElementById('mobileUnit');mu.innerHTML='';DATA.units.forEach(u=>{const o=document.createElement('option');o.value=u.id;o.textContent=u.id+' '+u.title;mu.appendChild(o);});mu.value=state.unit;mu.onchange=e=>{state.kind='unit';state.unit=e.target.value;render();};}
    function renderTabs(){const tabs=document.getElementById('tabs');const ms=document.getElementById('mobileSection');tabs.innerHTML='';ms.innerHTML='';if(state.kind==='extra'){tabs.style.display='none';ms.style.display='none';return;}tabs.style.display='flex';ms.style.display='block';Object.entries(labels).forEach(([k,label])=>{const b=document.createElement('button');b.className='tab '+(state.section===k?'active':'');b.textContent=label;b.onclick=()=>{state.section=k;render();};tabs.appendChild(b);const o=document.createElement('option');o.value=k;o.textContent=label;ms.appendChild(o);});ms.value=state.section;ms.onchange=e=>{state.section=e.target.value;render();};}
    function toc(){const c=document.getElementById('content');const heads=[...c.querySelectorAll('h2,h3')];const t=document.getElementById('toc');t.innerHTML='';heads.forEach((h,i)=>{h.id=slug(h.textContent,i);const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;a.className=h.tagName.toLowerCase();t.appendChild(a);});if(!heads.length)t.innerHTML='<span class="meta">当前页没有二级目录。</span>';}
    function render(){renderNav();renderTabs();const d=doc();const u=DATA.units.find(x=>x.id===state.unit);document.getElementById('pageTitle').textContent=state.kind==='extra'?d.label:u.title+' · '+labels[state.section];document.getElementById('pageMeta').textContent=state.kind==='extra'?'学习包辅助页面':'课程 '+u.id+' · 状态 '+u.status+(u.depends_on?.length?' · 依赖 '+u.depends_on.join(', '):' · 起点课程');document.getElementById('sourcePath').textContent=d.path;document.getElementById('content').innerHTML=md(d.markdown);highlightNotes();toc();renderNotes();document.title=document.getElementById('pageTitle').textContent+' | Learning Pack';}
    document.getElementById('addNoteBtn').onclick=openNoteModal;
    document.getElementById('viewQaBtn').onclick=()=>setNoteView('question');
    document.getElementById('viewStudyNotesBtn').onclick=()=>setNoteView('note');
    document.getElementById('exportNotesBtn').onclick=exportAnnotatedHtml;
    document.getElementById('exportStudyNotesBtn').onclick=exportStudyNotesMarkdown;
    document.getElementById('questionModeBtn').onclick=()=>setPendingType('question');
    document.getElementById('studyNoteModeBtn').onclick=()=>setPendingType('note');
    document.getElementById('cancelNoteBtn').onclick=closeNoteModal;
    document.getElementById('saveNoteBtn').onclick=saveNote;
    document.getElementById('noteModal').addEventListener('click',e=>{if(e.target.id==='noteModal')closeNoteModal();});
    render();
  </script>
</body>
</html>
`;

fs.writeFileSync(outputPath, page);
console.log(JSON.stringify({ outputPath, units: units.length, extras: Object.keys(extras).length }, null, 2));
