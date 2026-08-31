import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const KEY = 'te_identity_training_v2';

const identityFields = [
  ['mission', 'Mission', 'What are you building and why?'],
  ['values', 'Values', 'What principles guide your decisions?'],
  ['standards', 'Standards', 'What professional standards will you always follow?'],
  ['strengths', 'Strengths', 'What can you already do well?'],
  ['skills', 'Skills to Build', 'What skills do you need to develop?'],
  ['goals', 'Business Goals', 'What specific business results are you working toward?']
];

const trainingAreas = [
  'Professional Identity',
  'Business Knowledge',
  'Communication',
  'Decision Making',
  'Leadership',
  'Sales',
  'Negotiation',
  'Emotional Control',
  'Money',
  'Professional Standards'
];

const scenarios = [
  'Introduce yourself to a new business contact. Explain what you do and ask one useful question.',
  'A business owner says they are too busy to talk. Respond professionally and ask for a better time.',
  'A prospect says, "I already have someone." Respond without arguing.',
  'A prospect says your price is too high. Ask a useful question before responding.',
  'A buyer wants additional work for the same price. Explain your boundary and offer a tradeoff.',
  'A customer is upset about a missed expectation. Respond calmly and propose the next step.',
  'You are asked a technical question you do not know. Answer without pretending to know.'
];

function initialState() {
  return {
    identity: {},
    daily: {},
    scores: {},
    scenarioLevel: 0,
    streak: 0,
    lastTrainingDate: '',
    history: []
  };
}

function App() {
  const [state, setState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || initialState();
    } catch {
      return initialState();
    }
  });

  const [tab, setTab] = useState('dashboard');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const today = new Date().toISOString().slice(0, 10);

  function updateIdentity(key, value) {
    setState(prev => ({
      ...prev,
      identity: {
        ...prev.identity,
        [key]: value
      }
    }));
  }

  function toggleDaily(key) {
    setState(prev => ({
      ...prev,
      daily: {
        ...prev.daily,
        [today]: {
          ...(prev.daily[today] || {}),
          [key]: !(prev.daily[today]?.[key] || false)
        }
      }
    }));
  }

  function saveIdentity() {
    setFeedback('Identity profile saved locally.');
  }

  function completeDaily() {
    const items = state.daily[today] || {};
    const completed = Object.values(items).filter(Boolean).length;

    if (completed < 6) {
      setFeedback('Complete all six daily actions first.');
      return;
    }

    setState(prev => {
      const alreadyToday = prev.lastTrainingDate === today;

      return {
        ...prev,
        streak: alreadyToday ? prev.streak : prev.streak + 1,
        lastTrainingDate: today,
        history: [
          ...prev.history,
          {
            date: today,
            type: 'daily',
            score: 100
          }
        ]
      };
    });

    setFeedback('Daily training completed. 100% recorded.');
  }

  function submitScenario(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const answer = String(form.get('answer') || '').trim();

    if (answer.length < 30) {
      setFeedback('Write a complete response of at least 30 characters.');
      return;
    }

    const nextLevel = Math.min(state.scenarioLevel + 1, scenarios.length - 1);

    setState(prev => ({
      ...prev,
      scenarioLevel: nextLevel,
      history: [
        ...prev.history,
        {
          date: today,
          type: 'scenario',
          level: prev.scenarioLevel + 1
        }
      ]
    }));

    event.currentTarget.reset();
    setFeedback('Response recorded. Move to the next scenario.');
  }

  function resetSystem() {
    if (window.confirm('Erase all local training progress?')) {
      localStorage.removeItem(KEY);
      window.location.reload();
    }
  }

  const todayItems = state.daily[today] || {};
  const dailyKeys = [
    'identity',
    'verbal',
    'scenario',
    'business',
    'behavior',
    'review'
  ];

  const dailyLabels = [
    'Identity review',
    'Verbal practice',
    'Scenario drill',
    'Real-world business action',
    'Behavior of the day',
    'Evening review'
  ];

  const dailyCompleted = dailyKeys.filter(key => todayItems[key]).length;
  const dailyProgress = Math.round((dailyCompleted / 6) * 100);

  function Dashboard() {
    return (
      <>
        <header className="hero">
          <div>
            <div className="eyebrow">EXECUTIVE TRAINING SYSTEM</div>
            <h1>TECH ENTREPRENEUR<br />IDENTITY TRAINING</h1>
            <p>Build the behavior. Practice the behavior. Prove the behavior.</p>
          </div>

          <div className="heroStat">
            <strong>DAILY</strong>
            <span>{today}</span>
          </div>
        </header>

        <div className="grid">
          <Card title="Identity Profile">
            <b>{Object.values(state.identity).filter(Boolean).length}/6</b>
            <span>profile areas completed</span>
          </Card>

          <Card title="Today's Progress">
            <b>{dailyProgress}%</b>
            <span>{dailyCompleted}/6 actions completed</span>
          </Card>

          <Card title="Training Streak">
            <b>{state.streak}</b>
            <span>completed training days</span>
          </Card>
        </div>

        <section className="panel">
          <h2>Today's Training</h2>
          <p>Complete the six actions. The goal is consistent practice.</p>

          <div className="progress">
            <i style={{ width: `${dailyProgress}%` }} />
          </div>

          <button onClick={() => setTab('daily')}>
            CONTINUE TRAINING
          </button>
        </section>

        <section className="panel">
          <h2>Training Areas</h2>

          <div className="path">
            {trainingAreas.map(area => (
              <span key={area}>{area}</span>
            ))}
          </div>
        </section>
      </>
    );
  }

  function Identity() {
    return (
      <>
        <Title
          title="My Entrepreneur Identity"
          sub="Define the standards and behaviors you intend to practice."
        />

        <section className="panel">
          {identityFields.map(([key, title, description]) => (
            <div className="identityField" key={key}>
              <label>{title}</label>
              <p>{description}</p>

              <textarea
                value={state.identity[key] || ''}
                onChange={e => updateIdentity(key, e.target.value)}
                placeholder={`Write your ${title.toLowerCase()}...`}
              />
            </div>
          ))}

          <button onClick={saveIdentity}>
            SAVE IDENTITY
          </button>

          {feedback && <div className="success">{feedback}</div>}
        </section>
      </>
    );
  }

  function Daily() {
    return (
      <>
        <Title
          title="Daily Training"
          sub="Six actions designed to turn knowledge into behavior."
        />

        <section className="panel">
          <h2>Today's Checklist</h2>

          {dailyKeys.map((key, index) => (
            <label className="check" key={key}>
              <input
                type="checkbox"
                checked={!!todayItems[key]}
                onChange={() => toggleDaily(key)}
              />
              <span>{dailyLabels[index]}</span>
            </label>
          ))}

          <div className="progress">
            <i style={{ width: `${dailyProgress}%` }} />
          </div>

          <button onClick={completeDaily}>
            COMPLETE TODAY'S TRAINING
          </button>

          {feedback && <div className="success">{feedback}</div>}
        </section>
      </>
    );
  }

  function Scenarios() {
    const level = state.scenarioLevel;
    const scenario = scenarios[level];

    return (
      <>
        <Title
          title="Scenario Training"
          sub="Practice professional behavior in increasingly difficult situations."
        />

        <div className="levelbar">
          {scenarios.map((_, index) => (
            <span
              key={index}
              className={index <= level ? 'on' : ''}
            >
              L{index + 1}
            </span>
          ))}
        </div>

        <section className="panel">
          <div className="eyebrow">
            LEVEL {level + 1}
          </div>

          <h2>{scenario}</h2>

          <form onSubmit={submitScenario}>
            <textarea
              name="answer"
              placeholder="Write your professional response..."
            />

            <button type="submit">
              SUBMIT RESPONSE
            </button>
          </form>

          {feedback && <div className="success">{feedback}</div>}
        </section>
      </>
    );
  }

  function Progress() {
    return (
      <>
        <Title
          title="Progress"
          sub="Track evidence of repeated training."
        />

        <div className="grid">
          <Card title="Identity">
            <b>{Object.values(state.identity).filter(Boolean).length}/6</b>
            <span>profile areas completed</span>
          </Card>

          <Card title="Daily Actions">
            <b>{dailyCompleted}/6</b>
            <span>completed today</span>
          </Card>

          <Card title="Scenario Level">
            <b>L{state.scenarioLevel + 1}</b>
            <span>current scenario</span>
          </Card>
        </div>

        <section className="panel">
          <h2>Training History</h2>

          {state.history.length === 0 ? (
            <p>No training history recorded yet.</p>
          ) : (
            state.history.slice().reverse().map((item, index) => (
              <div className="rule" key={index}>
                {item.date} — {item.type}
                {item.score ? ` — ${item.score}%` : ''}
                {item.level ? ` — Level ${item.level}` : ''}
              </div>
            ))
          )}
        </section>
      </>
    );
  }

  function Settings() {
    return (
      <>
        <Title
          title="Settings"
          sub="Your training data is stored locally in this browser."
        />

        <section className="panel danger">
          <h2>Reset Training</h2>
          <p>
            This permanently removes the training data stored locally
            in this browser.
          </p>

          <button className="dangerBtn" onClick={resetSystem}>
            RESET SYSTEM
          </button>
        </section>
      </>
    );
  }

  function renderPage() {
    if (tab === 'identity') return <Identity />;
    if (tab === 'daily') return <Daily />;
    if (tab === 'scenarios') return <Scenarios />;
    if (tab === 'progress') return <Progress />;
    if (tab === 'settings') return <Settings />;

    return <Dashboard />;
  }

  return (
    <div className="app">
      <aside>
        <div className="brand">TE<span>IS</span></div>

        <div className="brandSub">
          TECH ENTREPRENEUR<br />
          IDENTITY SYSTEM
        </div>

        {[
          ['dashboard', 'Dashboard'],
          ['identity', 'My Entrepreneur Identity'],
          ['daily', 'Daily Training'],
          ['scenarios', 'Scenario Training'],
          ['progress', 'Progress'],
          ['settings', 'Settings']
        ].map(([id, name]) => (
          <button
            key={id}
            className={tab === id ? 'nav active' : 'nav'}
            onClick={() => {
              setTab(id);
              setFeedback('');
            }}
          >
            {name}
          </button>
        ))}

        <div className="sideProgress">
          <small>TODAY</small>

          <div className="progress">
            <i style={{ width: `${dailyProgress}%` }} />
          </div>

          <b>{dailyProgress}%</b>
        </div>
      </aside>

      <main>{renderPage()}</main>
    </div>
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
      <div>
        <div className="eyebrow">TRAINING MODULE</div>
        <h2>{title}</h2>
        <p>{sub}</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
