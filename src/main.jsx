import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { manual } from "./manual";
import "./styles.css";

const tabs = [
  ["home", "Command Center"], ["identity", "Identity"], ["company", "Company"], ["business", "Business"],
  ["communication", "Communication"], ["sales", "Sales"], ["delivery", "Delivery"], ["operations", "Operations"],
  ["memory", "Memory"], ["90day", "90 Days"], ["test", "Examination"]
];

function App() {
  const [tab, setTab] = useState("home");
  const [open, setOpen] = useState(null);
  const [checked, setChecked] = useState({});
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [testIndex, setTestIndex] = useState(0);
  const [testDone, setTestDone] = useState(false);

  const sectionsRead = Object.values(checked).filter(Boolean).length;
  const testScore = useMemo(() => Object.values(results).filter(Boolean).length, [results]);

  const mark = (key) => setChecked(p => ({ ...p, [key]: !p[key] }));

  function answerTest(i, value) {
    const correct = value.trim().toLowerCase() === manual.tests[i].a.trim().toLowerCase();
    setResults(p => ({ ...p, [i]: correct }));
    if (i < manual.tests.length - 1) setTimeout(() => setTestIndex(i + 1), 350);
    else setTestDone(true);
  }

  function Home() {
    return <>
      <Hero />
      <div className="stats">
        <Stat value={`${sectionsRead}/11`} label="Manual areas reviewed" />
        <Stat value={`${testScore}/${manual.tests.length}`} label="Examination recall" />
        <Stat value="90" label="Day operating cycle" />
      </div>
      <section className="command">
        <div><span className="tag">TODAY'S OPERATING ORDER</span><h2>Read. Memorize. Speak. Apply. Review.</h2><p>The manual supplies the material. Your job is to learn it accurately and use it in real business behavior.</p></div>
        <button onClick={() => setTab("identity")}>BEGIN MANUAL</button>
      </section>
      <div className="cards">
        {tabs.slice(1, 7).map(([id, name], i) => <button className="navCard" key={id} onClick={() => setTab(id)}><span>0{i + 1}</span><strong>{name}</strong><small>Open training</small></button>)}
      </div>
    </>;
  }

  function Hero() { return <header className="hero"><div><div className="tag">FOGLE UNLIMITED</div><h1>EXECUTIVE<br/>TRAINING MANUAL</h1><p>Professional identity. Business knowledge. Repeated application.</p></div><div className="target"><span>INTERNAL TARGET</span><b>$80M</b><small>Future target — not a current financial claim.</small></div></header>; }
  function Stat({ value, label }) { return <div className="stat"><b>{value}</b><span>{label}</span></div>; }
  function Page({ title, intro, children }) { return <><div className="pageHead"><span className="tag">TRAINING MANUAL</span><h1>{title}</h1><p>{intro}</p></div>{children}</>; }
  function Section({ title, text, items, id }) { return <article className="lesson"><div className="lessonTop"><div><span className="tag">LESSON</span><h2>{title}</h2></div><button className={checked[id] ? "done" : ""} onClick={() => mark(id)}>{checked[id] ? "REVIEWED" : "MARK REVIEWED"}</button></div>{text && <p className="lead">{text}</p>}{items && <ul>{items.map((x, i) => <li key={i}>{Array.isArray(x) ? <><b>{x[0]}</b> — {x[1]}</> : x}</li>)}</ul>}</article>; }

  function Content() {
    if (tab === "home") return <Home />;
    if (tab === "identity") return <Page title={manual.identity.title} intro={manual.identity.summary}><Section id="identity" title="Identity facts to memorize" items={manual.identity.facts}/><Section id="doctrine" title={manual.doctrine.title} items={manual.doctrine.sections}/></Page>;
    if (tab === "company") return <Page title={manual.company.title} intro="This is the company story and operating foundation. Learn it exactly; do not invent replacements."><Section id="company" title="Company foundation" items={manual.company.sections}/><Section id="standards" title={manual.standards.title} items={manual.standards.items}/></Page>;
    if (tab === "business") return <Page title="Business Engine" intro="Learn how a professional technology business identifies problems, creates offers, and delivers useful systems."><Section id="customer" title="Customer discovery" items={manual.customer.questions}/><Section id="business" title="Sales system" items={manual.sales.steps}/><Section id="offer" title="Marketing and funnel" items={[manual.marketing.message, manual.marketing.ad, ...manual.marketing.funnel, ...manual.marketing.rules]}/><Section id="money" title="Business numbers" items={[...manual.money.rules, ...manual.money.terms]}/></Page>;
    if (tab === "communication") return <Page title={manual.communication.title} intro="Professional communication is calm, clear, factual, and useful."><Section id="communication" title="Communication rules" items={manual.communication.rules}/><Section id="phrases" title="Verbal practice" items={manual.communication.phrases}/><Section id="objections" title={manual.objections.title} items={manual.objections.pairs}/></Page>;
    if (tab === "sales") return <Page title="Sales & Customer Conversations" intro="Discover first. Diagnose the problem. Present only what fits. Ask for the next step."><Section id="sales" title="Sales sequence" items={manual.sales.steps}/><Section id="discovery" title="Discovery questions" items={manual.customer.questions}/><Section id="objections2" title="Objection practice" items={manual.objections.pairs}/></Page>;
    if (tab === "delivery") return <Page title={manual.delivery.title} intro="A professional delivery system defines scope, builds carefully, tests, documents, and confirms completion."><Section id="delivery" title="Delivery sequence" items={manual.delivery.steps}/><Section id="quality" title="Quality control" items={manual.delivery.quality}/></Page>;
    if (tab === "operations") return <Page title={manual.operations.title} intro="Build simple systems around real problems. Document repeatable work. Protect information. Test before relying on it."><Section id="operations" title="Operating systems" items={manual.operations.systems}/><Section id="automation" title="Automation method" items={manual.operations.automation}/></Page>;
    if (tab === "memory") return <Page title={manual.memory.title} intro={manual.memory.rule}><Section id="memory" title="Memory protocol" items={manual.memory.method}/><section className="practice"><span className="tag">DAILY VERBAL DRILL</span><h2>Speak these without reading.</h2>{manual.communication.phrases.slice(0,6).map((p,i)=><div className="phrase" key={i}>{p}</div>)}</section></Page>;
    if (tab === "90day") return <Page title={manual.ninetyDay.title} intro="A 90-day cycle of repeated professional behavior. The system gives you the material; you execute it."><Section id="daily" title="Daily operating sequence" items={manual.ninetyDay.daily}/><Section id="behaviors" title="Behavior progression" items={manual.ninetyDay.behaviors}/></Page>;
    return <Examination />;
  }

  function Examination() {
    const q = manual.tests[testIndex];
    return <Page title="Examination" intro="Recall the manual without looking. Exact company facts matter. Do not guess."><section className="exam"><div className="examCount">QUESTION {testIndex + 1} / {manual.tests.length}</div><h2>{q.q}</h2><p className="hint">Type the answer from memory. The reference answer is not shown until the test is complete.</p><textarea value={answers[testIndex] || ""} onChange={e => setAnswers(p => ({ ...p, [testIndex]: e.target.value }))} /><button onClick={() => answerTest(testIndex, answers[testIndex] || "")}>SUBMIT RECALL</button>{results[testIndex] !== undefined && <div className={results[testIndex] ? "result pass" : "result fail"}>{results[testIndex] ? "CORRECT — continue." : `INCORRECT. Study this: ${q.a}`}</div>}{testDone && <div className="final"><h2>Examination recorded</h2><b>{testScore}/{manual.tests.length}</b><p>Review every missed answer before treating the material as mastered.</p></div>}</section></Page>;
  }

  return <div className="app"><aside><div className="brand">FU<span>•</span></div><div className="rail">{tabs.map(([id,name]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>{name}</button>)}</div><div className="railFoot">LOCAL MANUAL<br/>NO PROFILE SETUP</div></aside><main><nav><span>FOGLE UNLIMITED / TRAINING</span><span>INSTRUCTOR-LED MODE</span></nav><div className="content">{Content()}</div></main></div>;
}

createRoot(document.getElementById("root")).render(<App />);
