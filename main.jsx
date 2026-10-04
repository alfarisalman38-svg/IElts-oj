import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const DRIVE="https://drive.google.com/drive/folders/1PRmJgR0C2w3HnakB5DGq4bmQNA8-OUfT";
const ranks=[
  {name:"BRONZE",min:0,stars:"⭐"},
  {name:"STEEL",min:1500,stars:"⭐⭐"},
  {name:"GOLD",min:4000,stars:"⭐⭐⭐"},
  {name:"OBSIDIAN",min:7500,stars:"⭐⭐⭐⭐"}
];
const lessons={
  Vocabulary:[
    ["Daily Vocabulary","Words you can use every day.","reliable = dapat diandalkan","The service is reliable."],
    ["Academic Vocabulary","Build words for formal and academic contexts.","significant = penting/berarti","There was a significant increase."],
    ["Synonyms & Antonyms","Expand your range without repeating words.","rapid ≈ fast | rapid ≠ slow","The city experienced rapid growth."],
    ["Phrasal Verbs","Learn common verb + particle combinations.","carry out = melaksanakan","Researchers carried out a study."]
  ],
  Grammar:[
    ["Basic Grammar","Subject + verb agreement.","She works every day.","They work every day."],
    ["Tenses","Use tense to show time clearly.","I have finished my homework.","Present perfect connects past action to now."],
    ["Sentence Structure","Build clear clauses and sentences.","Although it rained, we continued.","Complex sentences improve writing variety."],
    ["Conditionals","Talk about real and hypothetical situations.","If I study, I will improve.","If I studied more, I would improve."]
  ],
  Listening:[
    ["Daily Conversation","Listen for keywords and context.","Where are you from? — I'm from Indonesia.","Focus on meaning, not every word."],
    ["Academic Listening","Identify signposting and examples.","First..., however..., for example...","These markers guide the speaker's logic."],
    ["IELTS Listening","Train with prediction and note-taking.","Predict the type of answer before listening.","Check spelling and word limits."]
  ],
  Speaking:[
    ["Daily Conversation","Answer naturally and extend ideas.","I enjoy photography because it helps me notice details.","Give a reason or example."],
    ["Pronunciation","Prioritize clarity and word stress.","PHOtograph / phoTOGraphy","Stress can change meaning."],
    ["IELTS Speaking","Use answer + reason + example.","I prefer studying in the morning because...","Develop your answer beyond one sentence."]
  ],
  Reading:[
    ["Reading Comprehension","Find the main idea and supporting details.","What is the passage mainly about?","Read the question carefully."],
    ["Skimming","Read quickly for overall meaning.","Look at headings and topic sentences.","Do not translate every word."],
    ["Scanning","Search for specific information.","Find names, dates, numbers, and keywords.","Use visual anchors."]
  ],
  Writing:[
    ["Sentence Writing","Make accurate, varied sentences.","The chart illustrates changes in sales.","Avoid fragments."],
    ["Paragraph Writing","Use topic sentence + support + example.","One reason is that...","Keep one main idea per paragraph."],
    ["IELTS Writing Task 1","Summarize visual information objectively.","Overall, the figure increased...","Include an overview."],
    ["IELTS Writing Task 2","Present a clear position and develop ideas.","One argument is that...","Answer every part of the prompt."]
  ]
};
const quiz=[
  {q:"Choose the correct sentence.",opts:["She work every day.","She works every day.","She working every day."],a:1,e:"For he/she/it in the present simple, the verb usually takes -s."},
  {q:"What is a synonym of 'rapid'?",opts:["slow","quick","weak"],a:1,e:"Rapid means happening very quickly."},
  {q:"If I study consistently, I ___ improve.",opts:["will","would","was"],a:0,e:"First conditional: If + present, will + base verb."}
];

function rankFor(x){return [...ranks].reverse().find(r=>x>=r.min)||ranks[0]}
function getUser(){try{return JSON.parse(localStorage.getItem("ieltsUser")||"null")}catch{return null}}
function saveUser(u){localStorage.setItem("ieltsUser",JSON.stringify(u))}
function App(){
  const [user,setUser]=useState(getUser());
  const [page,setPage]=useState(user?"dashboard":"welcome");
  const [form,setForm]=useState({full:"",nick:"",birth:""});
  const [toast,setToast]=useState("");
  const [quizIndex,setQuizIndex]=useState(0),[selected,setSelected]=useState(null),[score,setScore]=useState(null);
  const [ai,setAi]=useState(""); const [question,setQuestion]=useState("");
  const [notif,setNotif]=useState(()=>localStorage.getItem("notif")==="1");
  const rank=rankFor(user?.xp||0);

  useEffect(()=>{if(toast){let t=setTimeout(()=>setToast(""),2500);return()=>clearTimeout(t)}},[toast]);
  const nav=(p)=>setPage(p);

  function register(e){
    e.preventDefault();
    if(!form.full||!form.nick||!form.birth){setToast("Lengkapi semua data terlebih dahulu.");return}
    const u={fullName:form.full,nickname:form.nick,birthDate:form.birth,xp:0,rank:"BRONZE",streak:0,quiz:0,progress:0,target:"IELTS 8.5",createdAt:new Date().toISOString()};
    saveUser(u);setUser(u);setPage("login");setToast("Pendaftaran berhasil. Silakan login.");
  }
  function login(e){e.preventDefault(); const stored=getUser(); if(stored&&form.nick.trim().toLowerCase()===stored.nickname.toLowerCase()){setUser(stored);setPage("dashboard");setToast("Login berhasil!")}else setToast("Nama panggilan tidak ditemukan.")}
  function checkin(){
    const today=new Date().toISOString().slice(0,10), last=localStorage.getItem("lastCheckin");
    if(last===today){setToast("Kamu sudah check-in hari ini 🔥");return}
    let streak=(user.streak||0)+1; let u={...user,streak,xp:user.xp+100};saveUser(u);setUser(u);localStorage.setItem("lastCheckin",today);setToast("Daily Check-in berhasil! +100 XP 🔥");
  }
  function finishQuiz(){
    if(selected===null)return setToast("Pilih jawaban terlebih dahulu.");
    const correct=selected===quiz[quizIndex].a;
    let newScore=(score===null?0:score)+(correct?1:0);
    if(quizIndex<quiz.length-1){setScore(newScore);setSelected(null);setQuizIndex(quizIndex+1);setToast(correct?"✓ Correct +50 XP":"✗ Incorrect")}
    else{
      const total=newScore;let u={...user,xp:user.xp+total*50,quiz:(user.quiz||0)+1,progress:Math.min(100,(user.progress||0)+5)};
      saveUser(u);setUser(u);setScore(total);setSelected(null);setToast(`Quiz selesai: ${total}/${quiz.length}`);
    }
  }
  function askAI(){
    if(!question.trim())return;
    setAi(`Demo tutor: "${question}"\n\nCoba jawab dengan kalimat sederhana. Untuk penjelasan AI real-time, hubungkan endpoint server-side Meta AI/API milikmu; API key jangan diletakkan di frontend.`);
    setQuestion("");
  }
  const navItems=["dashboard","learning","quiz","ai","profile","settings"];
  return <div className="app">
    <div className="bg-grid"/><div className="glow g1"/><div className="glow g2"/>
    {page==="welcome"&&<Welcome setPage={setPage}/>}
    {page==="register"&&<Auth title="Create your account" submit={register} button="DAFTAR"><input placeholder="Nama lengkap" value={form.full} onChange={e=>setForm({...form,full:e.target.value})}/><input placeholder="Nama panggilan" value={form.nick} onChange={e=>setForm({...form,nick:e.target.value})}/><input type="date" value={form.birth} onChange={e=>setForm({...form,birth:e.target.value})}/></Auth>}
    {page==="login"&&<Auth title="Welcome back" submit={login} button="LOGIN"><input placeholder="Nama panggilan" value={form.nick} onChange={e=>setForm({...form,nick:e.target.value})}/></Auth>}
    {user&&page!=="welcome"&&page!=="register"&&page!=="login"&&<div className="shell">
      <aside><div className="brand"><span>EA</span><div>ENGLISH IELTS<br/><b>ACADEMY</b></div></div>
      <nav>{navItems.map(n=><button className={page===n?"active":""} onClick={()=>nav(n)} key={n}>{({dashboard:"⌂ Dashboard",learning:"▣ Learning",quiz:"✓ Quiz",ai:"◉ AI Tutor",profile:"◉ Profile",settings:"⚙ Settings"})[n]}</button>)}</nav>
      <a className="drive" href={DRIVE} target="_blank" rel="noreferrer">🔗 IELTS 8.5 LINK</a>
      <button className="logout" onClick={()=>{setUser(null);localStorage.removeItem("ieltsUser");setPage("welcome")}}>Logout</button>
      </aside>
      <main><header><div><span className="eyebrow">ENGLISH • IELTS • ACADEMY</span><h1>{page==="dashboard"?`Welcome back, ${user.nickname}! 👋`:page.toUpperCase()}</h1></div><div className="mini-rank">{rank.stars}<br/><b>{rank.name}</b></div></header>
      {page==="dashboard"&&<Dashboard user={user} rank={rank} go={nav} checkin={checkin}/>}
      {page==="learning"&&<Learning go={nav}/>}
      {page==="quiz"&&<Quiz {...{quizIndex,quiz,selected,setSelected,finishQuiz,score}}/>}
      {page==="ai"&&<AI {...{ai,question,setQuestion,askAI}}/>}
      {page==="profile"&&<Profile user={user} rank={rank}/>}
      {page==="settings"&&<Settings notif={notif} setNotif={v=>{setNotif(v);localStorage.setItem("notif",v?"1":"0")}}/>}
      </main>
    </div>}
    {toast&&<div className="toast">{toast}</div>}
  </div>
}
function Welcome({setPage}){return <section className="welcome"><div className="hero-card"><div className="eyebrow">NEXT-GEN ENGLISH LEARNING</div><h1>ENGLISH<br/><span>IELTS ACADEMY</span></h1><p>Learn English. <b>Master IELTS.</b> Reach Your 8.5.</p><div className="saitama"><div className="head">◉</div><div className="cape">SAITAMA<br/><small>AI TUTOR</small></div></div><button className="primary" onClick={()=>setPage("register")}>START YOUR JOURNEY →</button><div className="tiny">Platform edukasi • Gamified learning • IELTS preparation</div></div></section>}
function Auth({title,submit,button,children}){return <section className="auth"><form className="auth-card" onSubmit={submit}><div className="eyebrow">ENGLISH IELTS ACADEMY</div><h2>{title}</h2>{children}<button className="primary">{button} →</button><p className="tiny">Data akun disimpan lokal untuk demo. Untuk produksi, sambungkan database + authentication backend.</p></form></section>}
function Dashboard({user,rank,go,checkin}){return <div className="content"><div className="hero-grid"><div className="panel hero"><div className="saitama big"><div className="head">◉</div><div className="cape">SAITAMA AI<br/>ENGLISH TUTOR</div></div><div><div className="eyebrow">TODAY'S MISSION</div><h2>Build your English, one day at a time.</h2><p>Halo, {user.nickname}! Siap meningkatkan kemampuan Bahasa Inggrismu hari ini?</p><button onClick={()=>go("learning")} className="primary">MULAI BELAJAR</button></div></div>
<div className="stats">{[["LEVEL",rank.name],["XP",`${user.xp} XP`],["STREAK",`🔥 ${user.streak} DAYS`],["QUIZ",user.quiz+" COMPLETED"]].map(x=><div className="stat" key={x[0]}><small>{x[0]}</small><b>{x[1]}</b></div>)}</div>
<div className="panel"><div className="row"><h3>Progress Belajar</h3><b>{user.progress}%</b></div><div className="progress"><i style={{width:user.progress+"%"}}/></div><div className="actions"><button onClick={checkin}>🔥 DAILY CHECK-IN</button><button onClick={()=>go("ai")}>🤖 AI TUTOR</button><a href={DRIVE} target="_blank" rel="noreferrer">🔗 LINK PEMBELAJARAN IELTS 8.5</a></div></div>
<div className="levels"><Level title="MEDIUM" color="green" open/><Level title="HARD" color="red" open={user.progress>=20}/><Level title="DARKNESS" color="dark" open={user.progress>=60}/></div></div>}
function Level({title,color,open}){return <div className={`level ${color}`}><div className="level-top"><span>{open?"🔓":"🔒"}</span><b>{title}</b><small>{open?"UNLOCKED":"LOCKED"}</small></div><div className="chapters"><span>Chapter 1</span><span>Chapter 2</span><span>Chapter 3</span><span>Quiz</span></div></div>}
function Learning({go}){const [cat,setCat]=useState("Vocabulary");return <div className="content"><div className="tabs">{Object.keys(lessons).map(x=><button className={cat===x?"sel":""} onClick={()=>setCat(x)} key={x}>{x}</button>)}</div><div className="lesson-grid">{lessons[cat].map((l,i)=><article className="lesson" key={l[0]}><span>0{i+1}</span><h3>{l[0]}</h3><p>{l[1]}</p><div className="example"><b>Example</b><br/>{l[2]}<br/><br/><b>Tip</b><br/>{l[3]}</div><button onClick={()=>go("quiz")}>PRACTICE →</button></article>)}</div></div>}
function Quiz({quiz,quizIndex,selected,setSelected,finishQuiz,score}){const q=quiz[quizIndex];return <div className="content"><div className="panel quiz-card"><div className="eyebrow">QUIZ {quizIndex+1}/{quiz.length}</div><h2>{q.q}</h2><div className="options">{q.opts.map((o,i)=><button className={selected===i?"chosen":""} onClick={()=>setSelected(i)} key={o}>{String.fromCharCode(65+i)}. {o}</button>)}</div><button className="primary" onClick={finishQuiz}>{quizIndex===quiz.length-1?"FINISH QUIZ":"CHECK ANSWER"} →</button>{score!==null&&<p className="tiny">Current score: {score}</p>}</div></div>}
function AI({ai,question,setQuestion,askAI}){return <div className="content"><div className="panel ai-card"><div className="saitama"><div className="head">◉</div><div className="cape">SAITAMA AI<br/><small>ENGLISH TUTOR</small></div></div><h2>Ask Saitama anything about English.</h2><p className="tiny">Tutor demo siap dipakai. Untuk AI sungguhan, panggil API melalui backend/server-side.</p><textarea placeholder="Contoh: Jelaskan present perfect..." value={question} onChange={e=>setQuestion(e.target.value)}/><button className="primary" onClick={askAI}>ASK SAITAMA →</button>{ai&&<div className="answer">{ai}</div>}</div></div>}
function Profile({user,rank}){return <div className="content"><div className="profile-card"><div className="avatar">{user.nickname.slice(0,1).toUpperCase()}</div><div><h2>{user.nickname}</h2><p>{user.fullName}</p><b>{rank.stars} {rank.name}</b></div></div><div className="stats"><div className="stat"><small>XP</small><b>{user.xp.toLocaleString()} XP</b></div><div className="stat"><small>STREAK</small><b>🔥 {user.streak} Days</b></div><div className="stat"><small>QUIZ</small><b>{user.quiz}</b></div><div className="stat"><small>TARGET</small><b>{user.target}</b></div></div></div>}
function Settings({notif,setNotif}){return <div className="content"><div className="panel"><h2>Notification Settings</h2><div className="setting"><span>🔔 Notifications</span><button className={notif?"toggle on":"toggle"} onClick={()=>setNotif(!notif)}>{notif?"ON":"OFF"}</button></div><p className="tiny">Jadwal default: 09:00 dan 19:00. Web Push membutuhkan permission browser dan service worker di deployment produksi.</p></div><div className="panel"><h2>Security</h2><p>Gunakan authentication/database server-side untuk produksi. API key AI harus disimpan sebagai environment variable, bukan di frontend.</p></div></div>}
createRoot(document.getElementById("root")).render(<App/>);