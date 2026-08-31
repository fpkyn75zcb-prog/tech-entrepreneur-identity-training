import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const KEY = "te_identity_training_v2";

const sections = [
  ["identity", "Professional Identity", ["Professional identity", "Mission", "Values", "Standards", "Strengths", "Weaknesses", "Skills"]],
  ["business", "Business Knowledge", ["Technology", "Business models", "Customers", "Problems", "Solutions", "Value", "Revenue", "Costs", "Metrics"]],
  ["communication", "Communication", ["Clear speaking", "Active listening", "Asking questions", "Explaining ideas", "Professional language", "Handling uncertainty"]],
  ["decision", "Decision Making", ["Facts", "Options", "Risks", "Tradeoffs", "Decisions", "Follow-through"]],
  ["leadership", "Leadership", ["Responsibility", "Reliability", "Communication", "Delegation", "Accountability", "Problem solving"]],
  ["sales", "Sales", ["Discovery", "Customer problems", "Value", "Objections", "Offers", "Follow-up", "Asking for the sale"]],
  ["negotiation", "Negotiation", ["Preparation", "Interests", "Options", "Boundaries", "Tradeoffs", "Agreement"]],
  ["emotion", "Emotional Control", ["Rejection", "Criticism", "Pressure", "Uncertainty", "Failure", "Difficult conversations"]],
  ["money", "Money", ["Revenue", "Expenses", "Profit", "Cash flow", "Pricing", "Saving", "Reinvestment"]],
  ["standards", "Professional Standards", ["Reliability", "Preparation", "Honesty", "Follow-through", "Professional appearance", "Professional communication", "Keeping commitments"]]
];

const lessons = {
  identity: ["A professional identity is built through truthful, repeatable behavior.", ["Use truthful facts.", "Ask before assuming.", "Practice the behavior you want to make normal."], "Write one professional standard you will follow today."],
  business: ["Entrepreneurs solve real problems for specific people.", ["Start with the customer problem.", "Know how value is created.", "Track money clearly."], "Name one customer problem you can solve and the result you want."],
  communication: ["Clear communication reduces confusion.", ["Listen before answering.", "Use simple words.", "Say what you know and do not know."], "Explain one service in 30 seconds."],
  decision: ["Good decisions use facts, options, tradeoffs and action.", ["Separate facts from assumptions.", "Choose a next action.", "Review results."], "Write the facts, options and next action for one decision."],
  leadership: ["Leadership is shown through responsibility and useful action.", ["Own commitments.", "Communicate early.", "Solve problems."], "Identify one commitment you can complete today."],
  sales: ["Sales starts with understanding a problem and matching a truthful offer.", ["Discover before pitching.", "Sell outcomes, not hype.", "Ask for the next step."], "Write three discovery questions."],
  negotiation: ["Negotiation works better when interests and boundaries are clear.", ["Prepare first.", "Know your boundary.", "Look for mutual value."], "Write your ideal outcome, acceptable outcome and boundary."],
  emotion: ["Professional behavior includes deliberate responses under pressure.", ["Pause before reacting.", "Separate feedback from identity.", "Return to facts and objectives."], "Describe one pressure situation and your desired response."],
  money: ["A business must understand revenue, costs, profit and cash flow.", ["Know the numbers.", "Protect cash flow.", "Price from value and costs."], "List one revenue source and three related costs."],
  standards: ["Professional reputation is built through repeated observable behavior.", ["Be on time.", "Prepare.", "Do what you said you would do."], "Choose one commitment and record when you will complete it."]
};

const scenarios = [
  ["Low Pressure", "Introduce yourself to a new business contact. Explain what you do and ask one useful question."],
  ["Networking", "An owner says they are busy. Respond professionally and ask for a better time."],
  ["Sales", "A prospect says, “I already have someone.” Respond without arguing."],
  ["Pricing", "A prospect says your price is too high. Ask a useful question before responding."],
  ["Negotiation", "A buyer wants more work for the same price. Explain your boundary and offer a tradeoff."],
  ["Difficult Customer", "A customer is upset about a missed expectation. Respond calmly and propose the next step."],
  ["High Pressure", "You are asked a technical question you do not know. Answer without pretending to know."]
];

const dailyItems = [
  "Identity review",
  "Verbal practice",
  "Scenario drill",
  "Real-world business action",
  "Behavior of the day",
  "Evening review"
];

function initialState() {
  return {
    passed: [],
    learned: [],
    scores: {},
    scenarioLevel: 0,
    scenarioScores: [],
    history: [],
    daily: {},
    profile: {},
    complete: false
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const [s, setS] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || initialState();
    } catch {
      return initialState();
    }
  });

  const [tab, setTab] = useState("dashboard");
  const [active, setActive] = useState(null);
  const [answer, setAnswer] = useState("");
  const [scenarioAnswer, setScenarioAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [review, setReview] = useState("");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(s));
  }, [s]);

  const date = today();
  const todayData = s.daily[date] || {};
  const passedCount = s.passed.length;
  const progress = Math.round((passedCount / sections.length) * 100);
  const next = sections.find(x => !s.passed.includes(x[0]));
  const dailyDone = Object.values(todayData.items || {}).filter(Boolean).length;
  const dailyScore = Math.round((dailyDone / dailyItems.length) * 100);

  const streak = useMemo(() => {
    let count = 0;
    let d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      const item = s.daily[key];
      if (!item || !item.items || Object.values(item.items).filter(Boolean).length === 0) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [s.daily]);

  function update(patch) {
    setS(prev => ({ ...prev, ...patch }));
  }

  function toggleDaily(i) {
    const items = { ...(todayData.items || {}), [i]: !(todayData.items || {})[i] };
    setS(prev => ({
      ...prev,
      daily: { ...prev.daily, [date]: { ...(prev.daily[date] || {}), items } }
    }));
  }

  function markLearn(id) {
    update({ learned: [...new Set([...s.learned, id])] });
    setFeedback("Learning recorded.");
  }

  function test(id) {
    const good = answer.trim().length >= 25;
    const score = good ? 90 : 40;

    update({
      scores: { ...s.scores, [id]: score },
      passed: good ? [...new Set([...s.passed, id])] : s.passed
    });

    setFeedback(good
      ? `Passed — ${score}%`
      : `Failed — ${score}%. Write a more complete applied response.`
    );

    if (good) setAnswer("");
  }

  function submitScenario() {
    const length = scenarioAnswer.trim().length;
    const score = length >= 80 ? 95 : length >= 30 ? 75 : 40;
    const passed = score >= 75;

    setS(prev => ({
      ...prev,
      scenarioLevel: passed ? Math.min(prev.scenarioLevel + 1, scenarios.length - 1) : prev.scenarioLevel,
      scenarioScores: [
        ...prev.scenarioScores,
        { date, level: Math.min(prev.scenarioLevel + 1, scenarios.length), score }
      ]
    }));

    setFeedback(
      passed
        ? `Scenario scored ${score}%. Level recorded.`
        : `Scenario scored ${score}%. Write a fuller response and try again.`
    );

    setScenarioAnswer("");
  }

  function saveReview() {
    if (!review.trim()) return;

    const existing = s.daily[date] || {};

    setS(prev => ({
      ...prev,
      daily: {
        ...prev.daily,
        [date]: { ...existing, review }
      },
      history: [
        ...prev.history.filter(x => x.date !== date),
        { date, dailyScore, review }
      ]
    }));

    setFeedback("End-of-day review saved.");
    setReview("");
  }

  function finalTest() {
    if (passedCount !== sections.length) {
      setFeedback("Complete all Phase 1 sections first.");
      return;
    }

    update({ complete: true });
    setFeedback("SYSTEM COMPLETE — Phase 1 passed.");
  }

  function reset() {
    if (confirm("Erase all local training progress?")) {
      localStorage.removeItem(KEY);
      location.reload();
    }
  }

  function render() {
    if (tab === "dashboard") return <Dashboard />;
    if (tab === "identity") return <IdentityProfile />;
    if (tab === "phase1") return <Phase1 />;
    if (tab === "daily") return <Daily />;
    if (tab === "scenarios") return <Scenarios />;
    if (tab === "memory") return <Memory />;
    if (tab === "audit") return <Audit />;
    if (tab === "final") return <Final />;
    if (tab === "settings") return <Settings />;
    return <Dashboard />;
  }

  function Dashboard() {
    return (
      <>
        <Hero />

        <div className="grid">
          <Card title="Today's score">
            <b>{dailyScore}%</b>
            <span>{dailyDone}/{dailyItems.length} daily actions complete</span>
          </Card>

          <Card title="Training streak">
            <b>{streak} day{streak === 1 ? "" : "s"}</b>
            <span>Consecutive training days</span>
          </Card>

          <Card title="Overall progress">
            <b>{progress}%</b>
            <span>{passedCount}/{sections.length} sections passed</span>
          </Card>
        </div>

        <div className="grid">
          <Card title="Scenario level">
            <b>Level {Math.min(s.scenarioLevel + 1, scenarios.length)}</b>
            <span>{s.scenarioScores.length} scenario attempts recorded</span>
          </Card>

          <Card title="Training days">
            <b>{Object.keys(s.daily).length}</b>
            <span>Total days with saved activity</span>
          </Card>

          <Card title="Next action">
            <b>{next ? next[1] : "Final Test"}</b>
            <span>{next ? "Complete the next section." : "Run the final gate."}</span>
          </Card>
        </div>

        <section className="panel">
          <h2>Today's Mission</h2>
          <p>Practice deliberately. Complete the checklist, run a scenario, and record what happened.</p>
          <div className="progress">
            <i style={{ width: `${dailyScore}%` }} />
          </div>
          <button onClick={() => setTab("daily")}>CONTINUE TRAINING</button>
        </section>

        <section className="panel">
          <h2>Training path</h2>
          <div className="path">
            {["LEARN", "PRACTICE", "TEST", "PASS", "INTEGRATE", "REAL ACTION", "REPETITION", "STRESS TEST", "REVIEW", "MASTER"].map((x, i) =>
              <span key={x} className={i < Math.max(1, Math.ceil(progress / 10)) ? "on" : ""}>{x}</span>
            )}
          </div>
        </section>
      </>
    );
  }

  function Hero() {
    return (
      <header className="hero">
        <div>
          <div className="eyebrow">EXECUTIVE TRAINING SYSTEM</div>
          <h1>TECH ENTREPRENEUR<br />IDENTITY TRAINING</h1>
          <p>Build the behavior. Practice the behavior. Prove the behavior.</p>
        </div>
        <div className="heroStat">
          <strong>{s.complete ? "COMPLETE" : "PHASE 1"}</strong>
          <span>{streak ? `${streak}-day training streak` : "Start today's training"}</span>
        </div>
      </header>
    );
  }

  function Phase1() {
    return (
      <>
        <Title title="Phase 1 — Identity Profile" sub="Learn each section, practice it, then pass its test." />
        <div className="sectionList">
          {sections.map((x, i) => {
            const passed = s.passed.includes(x[0]);
            const unlocked = i === 0 || s.passed.includes(sections[i - 1][0]);

            return (
              <div className={`sectionRow ${passed ? "passed" : ""} ${!unlocked ? "locked" : ""}`} key={x[0]}>
                <div className="num">{passed ? "✓" : i + 1}</div>
                <div>
                  <h3>{x[1]}</h3>
                  <p>{x[2].join(" • ")}</p>
                </div>
                <button disabled={!unlocked} onClick={() => {
                  setActive(x[0]);
                  setAnswer("");
                  setFeedback("");
                }}>
                  {passed ? "REVIEW" : "OPEN"}
                </button>
              </div>
            );
          })}
        </div>

        {active && <Lesson id={active} />}

        {passedCount === sections.length && (
          <div className="panel">
            <h2>Phase 1 Final Test</h2>
            <p>All ten sections are passed.</p>
            <button onClick={finalTest}>RUN FINAL GATE</button>
            {feedback && <div className="success">{feedback}</div>}
          </div>
        )}
      </>
    );
  }

  function Lesson({ id }) {
    const x = sections.find(a => a[0] === id);
    const l = lessons[id];

    return (
      <div className="modal">
        <div className="modalInner">
          <button className="close" onClick={() => setActive(null)}>×</button>
          <div className="eyebrow">SECTION TRAINING</div>
          <h2>{x[1]}</h2>

          <h4>WHAT YOU ARE LEARNING</h4>
          <p>{l[0]}</p>

          <h4>RULES</h4>
          <ul>{l[1].map(r => <li key={r}>{r}</li>)}</ul>

          <h4>PRACTICE</h4>
          <p>{l[2]}</p>

          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Complete the practice exercise here..."
          />

          <div className="actions">
            <button onClick={() => markLearn(id)}>MARK LEARNING COMPLETE</button>
            <button disabled={!s.learned.includes(id)} onClick={() => test(id)}>SUBMIT TEST</button>
          </div>

          {feedback && <div className={feedback.startsWith("Passed") ? "success" : "error"}>{feedback}</div>}
        </div>
      </div>
    );
  }

  function Daily() {
    return (
      <>
        <Title title="Daily Training" sub="Complete the six daily actions and record your result." />

        <div className="panel">
          <h2>Today's checklist — {dailyScore}%</h2>

          {dailyItems.map((x, i) =>
            <label className="check" key={x}>
              <input
                type="checkbox"
                checked={!!(todayData.items || {})[i]}
                onChange={() => toggleDaily(i)}
              />
              <span>{x}</span>
            </label>
          )}
        </div>

        <div className="panel">
          <h2>End-of-Day Review</h2>
          <p>What did you practice? What happened? What will you repeat tomorrow?</p>

          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="Write your review..."
          />

          <button onClick={saveReview}>SAVE REVIEW</button>

          {todayData.review && (
            <div className="success">Today's review is saved.</div>
          )}
        </div>
      </>
    );
  }

  function Scenarios() {
    const level = Math.min(s.scenarioLevel, scenarios.length - 1);
    const sc = scenarios[level];

    return (
      <>
        <Title title="Scenario Training" sub="Progress through increasingly difficult business situations." />

        <div className="levelbar">
          {scenarios.map((a, i) =>
            <span className={i <= level ? "on" : ""} key={a[0]}>L{i + 1}</span>
          )}
        </div>

        <div className="panel">
          <div className="eyebrow">LEVEL {level + 1} — {sc[0]}</div>
          <h2>{sc[1]}</h2>

          <textarea
            value={scenarioAnswer}
            onChange={e => setScenarioAnswer(e.target.value)}
            placeholder="Type your professional response..."
          />

          <button onClick={submitScenario}>SUBMIT RESPONSE</button>

          {feedback && <div className="success">{feedback}</div>}
        </div>

        <div className="panel">
          <h2>Scenario History</h2>
          {s.scenarioScores.length === 0
            ? <p>No scenario attempts recorded yet.</p>
            : s.scenarioScores.slice(-8).reverse().map((x, i) =>
              <div className="rule" key={i}>
                {x.date} — Level {x.level} — {x.score}%
              </div>
            )
          }
        </div>
      </>
    );
  }

  function Memory() {
    return (
      <>
        <Title title="Memory Training" sub="Recall beats passive reading." />

        <div className="grid">
          <Card title="Rules"><b>Recall</b><span>Review the rules from completed sections.</span></Card>
          <Card title="Learning"><b>Practice</b><span>Recall before looking at the answer.</span></Card>
          <Card title="Applied"><b>Scenarios</b><span>Use the rules under pressure.</span></Card>
        </div>

        <div className="panel">
          <h2>Core Loop</h2>
          <p>IDENTITY → LEARN → PRACTICE → TEST → PASS → REAL ACTION → FEEDBACK → REPETITION</p>
        </div>
      </>
    );
  }

  function Audit() {
    return (
      <>
        <Title title="Identity Audit" sub="Measure observable evidence." />

        <div className="panel">
          {[
            "Customers contacted",
            "Sales conversations",
            "Problems solved",
            "Proposals",
            "Revenue",
            "Skills learned",
            "Systems created",
            "Difficult conversations",
            "Commitments kept"
          ].map(x =>
            <label className="metric" key={x}>
              <span>{x}</span>
              <input type="number" min="0" defaultValue="0" />
            </label>
          )}

          <button onClick={() => setFeedback("Audit recorded for this session.")}>SAVE AUDIT</button>
          {feedback && <div className="success">{feedback}</div>}
        </div>
      </>
    );
  }

  function Final() {
    return (
      <>
        <Title title="Final Test" sub="Complete all Phase 1 sections to run the final gate." />

        <div className="panel">
          <h2>{passedCount === sections.length ? "Ready" : "Locked"}</h2>
          <p>{passedCount}/{sections.length} Phase 1 sections passed.</p>

          <button disabled={passedCount !== sections.length} onClick={finalTest}>
            RUN FINAL GATE
          </button>

          {feedback && <div className="success">{feedback}</div>}
        </div>
      </>
    );
  }

  function Settings() {
    const [prompt, setPrompt] = useState(s.profile?.prompt || "");

    return (
      <>
        <Title title="Settings" sub="Your training data is stored locally in this browser." />

        <div className="panel">
          <h2>Identity Training Prompt</h2>

          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Enter your identity-training prompt..."
          />

          <button onClick={() => {
            update({ profile: { prompt } });
            setFeedback("Identity prompt saved locally.");
          }}>
            SAVE
          </button>

          {feedback && <div className="success">{feedback}</div>}
        </div>

        <div className="panel danger">
          <h2>Reset Training</h2>
          <p>This erases local training progress on this browser.</p>
          <button className="dangerBtn" onClick={reset}>RESET SYSTEM</button>
        </div>
      </>
    );
  }

  function IdentityProfile() {
    const fields = [
      ["mission", "Mission", "What are you building and why?"],
      ["values", "Values", "What principles guide your decisions?"],
      ["standards", "Standards", "What professional standards will you always follow?"],
      ["strengths", "Strengths", "What can you already do well?"],
      ["skills", "Skills to Build", "What skills do you need to develop?"],
      ["goals", "Business Goals", "What specific business results are you working toward?"]
    ];

    return (
      <>
        <Title
          title="Identity Profile"
          sub="Define the professional identity you are building through truthful, repeatable behavior."
        />

        <div className="panel">
          {fields.map(([key, label, placeholder]) => (
            <div key={key}>
              <h2>{label}</h2>
              <textarea
                value={s.profile?.[key] || ""}
                onChange={e =>
                  update({
                    profile: {
                      ...(s.profile || {}),
                      [key]: e.target.value
                    }
                  })
                }
                placeholder={placeholder}
              />
            </div>
          ))}

          <button onClick={() => setFeedback("Identity profile saved locally.")}>
            SAVE PROFILE
          </button>

          {feedback && <div className="success">{feedback}</div>}
        </div>
      </>
    );
  }

  function Card({ title, children }) {
    return (
      <div className="card">
        <small>{title}</small>
        {children}
      </div>
    );
  }

  function Title({ title, sub }) {
    return (
      <div className="title">
        <div className="eyebrow">TRAINING MODULE</div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <aside>
        <div className="brand">TE<span>IS</span></div>
        <div className="brandSub">TECH ENTREPRENEUR<br />IDENTITY SYSTEM</div>

        {[
          ["dashboard", "Dashboard"],
          ["identity", "Identity Profile"],
          ["phase1", "Phase 1 — Identity"],
          ["daily", "Daily Training"],
          ["scenarios", "Scenario Training"],
          ["memory", "Memory Training"],
          ["audit", "Identity Audit"],
          ["final", "Final Test"],
          ["settings", "Settings"]
        ].map(([id, name]) =>
          <button
            className={tab === id ? "nav active" : "nav"}
            key={id}
            onClick={() => {
              setTab(id);
              setFeedback("");
            }}
          >
            {name}
          </button>
        )}

        <div className="sideProgress">
          <small>PHASE 1</small>
          <div className="progress"><i style={{ width: `${progress}%` }} /></div>
          <b>{progress}%</b>
        </div>
      </aside>

      <main>{render()}</main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
