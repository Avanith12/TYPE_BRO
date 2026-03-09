import React, { useState, useEffect } from 'react';
import TypingArea from './components/TypingArea';
import Stats from './components/Stats';
import ThemeSwitcher from './components/ThemeSwitcher';
import WpmGraph from './components/WpmGraph';
import { useTypingEngine } from './hooks/useTypingEngine';
import { generateWords } from './utils/wordGenerator';
import './index.css';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'default');
  const [zenMode, setZenMode] = useState(false);
  const [testMode, setTestMode] = useState('words'); // 'words' or 'time'
  const [initialWords] = useState(() => generateWords(50));

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.title = 'TYPE BRO _';
  }, [theme]);

  const {
    words,
    userInput,
    currWordIndex,
    history,
    status,
    metrics,
    chartData,
    timeLeft,
    reset
  } = useTypingEngine(initialWords, testMode, 30);

  const handleRestart = () => {
    reset(generateWords(50));
  };

  return (
    <main className={zenMode && status === 'typing' ? 'zen-active' : ''}>
      <header style={{ marginBottom: '2rem', textAlign: 'center', transition: 'opacity 0.3s' }}>
        <h1 style={{ color: 'var(--sub-color)', fontSize: '1rem', opacity: 0.5 }}>
          TYPE BRO _
        </h1>
        <div className="mode-toggles" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => setZenMode(!zenMode)} className={`mode-btn ${zenMode ? 'active' : ''}`}>zen</button>
          <button onClick={() => setTestMode('words')} className={`mode-btn ${testMode === 'words' ? 'active' : ''}`}>words</button>
          <button onClick={() => setTestMode('time')} className={`mode-btn ${testMode === 'time' ? 'active' : ''}`}>time</button>
        </div>
      </header>

      {status === 'finished' ? (
        <div className="finished-container">
          <Stats metrics={metrics} status={status} />
          <WpmGraph data={chartData} />
          <button className="restart-btn" onClick={handleRestart}>
            Restart (Press Space)
          </button>
        </div>
      ) : (
        <>
          <div className="stats-wrapper" style={{ opacity: zenMode && status === 'typing' ? 0 : 1 }}>
            {testMode === 'time' && status === 'typing' && (
              <div style={{ color: 'var(--main-color)', fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                {timeLeft}s
              </div>
            )}
            <Stats metrics={metrics} status={status} />
          </div>
          <WpmGraph data={chartData} />
          <TypingArea
            words={words}
            userInput={userInput}
            currWordIndex={currWordIndex}
            history={history}
            status={status}
          />
        </>
      )}

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--sub-alt-color)', fontSize: '0.8rem' }}>
        <p>Type to start • Tab to restart • Space to finish word</p>
        <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
      </footer>
    </main>
  );
}

export default App;
