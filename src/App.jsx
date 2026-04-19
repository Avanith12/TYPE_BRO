import React, { useState, useEffect } from 'react';
import TypingArea from './components/TypingArea';
import Stats from './components/Stats';
import ThemeSwitcher from './components/ThemeSwitcher';
import WpmGraph from './components/WpmGraph';
import Heatmap from './components/Heatmap';
import Lobby from './components/Lobby';
import { useTypingEngine } from './hooks/useTypingEngine';
import { useMultiplayer } from './hooks/useMultiplayer';
import { generateWords } from './utils/wordGenerator';
import './index.css';

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'default');
  const [zenMode, setZenMode] = useState(false);
  const [testMode, setTestMode] = useState('time'); // 'words' or 'time'
  const [textMode, setTextMode] = useState('words'); // 'words', 'code', 'quote'
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [caretStyle, setCaretStyle] = useState('smooth');
  const [inMultiplayerMenu, setInMultiplayerMenu] = useState(false);
  const [isRacing, setIsRacing] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60); // 30, 60, 120
  const [soundMode, setSoundMode] = useState('mechanical');
  const [suddenDeath, setSuddenDeath] = useState(false);
  const [blindMode, setBlindMode] = useState(false);

  const wordOptions = { count: testMode === 'time' ? 300 : 50, textMode, punctuation, numbers };
  const [initialWords, setInitialWords] = useState(() => generateWords(wordOptions));

  const multiplayer = useMultiplayer();



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
    keyStats,
    timeLeft,
    reset
  } = useTypingEngine(initialWords, testMode, timeLimit, wordOptions, soundMode, suddenDeath);

  // If config changes, immediately restart the test with new words
  useEffect(() => {
    const newWords = generateWords(wordOptions);
    setInitialWords(newWords);
    if (reset) reset(newWords);
  }, [textMode, punctuation, numbers, timeLimit, testMode]); // intentional exclusion of `reset` to avoid infinite loops on mount

  // Sync Multiplayer match start
  const triggerMultiplayerStart = () => {
    const raceWords = generateWords(wordOptions);
    setInitialWords(raceWords);
    if (reset) reset(raceWords);
    multiplayer.sendStartSync({
      words: raceWords,
      mode: testMode,
      timer: timeLimit
    });
    setIsRacing(true);
  };

  // Sync Guest when Host starts
  useEffect(() => {
    if (multiplayer.opponentStartSync) {
      const payload = multiplayer.opponentStartSync;

      if (payload.mode) setTestMode(payload.mode);
      if (payload.timer) setTimeLimit(payload.timer);

      setInitialWords(payload.words);
      if (reset) reset(payload.words);
      setIsRacing(true);
    }
  }, [multiplayer.opponentStartSync]);

  // Broadcast typing progress to opponent
  useEffect(() => {
    if (inMultiplayerMenu && status === 'typing') {
      multiplayer.sendProgress({
        wpm: metrics.wpm,
        index: currWordIndex,
        chars: userInput.length
      });
    }
  }, [metrics.wpm, currWordIndex, userInput.length, status, inMultiplayerMenu]);

  const handleRestart = () => {
    reset(generateWords(wordOptions));
  };

  return (
    <main className={`${zenMode && status === 'typing' ? 'zen-active' : ''} ${blindMode && status === 'typing' ? 'blind-active' : ''}`}>
      <header style={{ marginBottom: '2rem', textAlign: 'center', transition: 'opacity 0.3s' }}>
        <h1 style={{ color: 'var(--sub-color)', fontSize: '1rem', opacity: 0.5 }}>
          TYPE BRO _
        </h1>
        <div className="mode-toggles" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setZenMode(!zenMode)} className={`mode-btn ${zenMode ? 'active' : ''}`}>zen</button>
          <button onClick={() => setTestMode('words')} className={`mode-btn ${testMode === 'words' ? 'active' : ''}`}>words</button>
          <button onClick={() => setTestMode('time')} className={`mode-btn ${testMode === 'time' ? 'active' : ''}`}>time</button>

          {testMode === 'time' && (
            <div style={{ display: 'flex', gap: '0.8rem', background: 'var(--sub-alt-color)', padding: '0.2rem 1rem', borderRadius: '4px' }}>
              <button onClick={() => setTimeLimit(30)} className={`mode-btn ${timeLimit === 30 ? 'active' : ''}`} style={{ padding: 0 }}>30s</button>
              <button onClick={() => setTimeLimit(60)} className={`mode-btn ${timeLimit === 60 ? 'active' : ''}`} style={{ padding: 0 }}>60s</button>
              <button onClick={() => setTimeLimit(120)} className={`mode-btn ${timeLimit === 120 ? 'active' : ''}`} style={{ padding: 0 }}>120s</button>
            </div>
          )}

          <div style={{ width: '1px', background: 'var(--sub-alt-color)', margin: '0 0.5rem' }}></div>
          <button onClick={() => { setInMultiplayerMenu(!inMultiplayerMenu); setIsRacing(false); multiplayer.disconnect(); setZenMode(false); }} className={`mode-btn ${inMultiplayerMenu ? 'active' : ''}`} style={{ color: 'var(--main-color)' }}>multiplayer</button>

          <div style={{ width: '1px', background: 'var(--sub-alt-color)', margin: '0 0.5rem' }}></div>

          <button onClick={() => setTextMode('words')} className={`mode-btn ${textMode === 'words' ? 'active' : ''}`}>@</button>
          <button onClick={() => setTextMode('quote')} className={`mode-btn ${textMode === 'quote' ? 'active' : ''}`}>""</button>
          <button onClick={() => setTextMode('code')} className={`mode-btn ${textMode === 'code' ? 'active' : ''}`}>{"<>"}</button>

          <div style={{ width: '1px', background: 'var(--sub-alt-color)', margin: '0 0.5rem' }}></div>

          <button onClick={() => setPunctuation(!punctuation)} className={`mode-btn ${punctuation ? 'active' : ''}`}>.,?</button>
          <button onClick={() => setNumbers(!numbers)} className={`mode-btn ${numbers ? 'active' : ''}`}>123</button>
        </div>
      </header>

      {/* High Score Notification */}
      {localStorage.getItem('highestWpm') && (
        <div style={{ textAlign: 'center', color: 'var(--main-color)', fontSize: '0.8rem', opacity: 0.8, marginBottom: '2rem' }}>
          👑 Personal Best: {localStorage.getItem('highestWpm')} WPM
        </div>
      )}


      {/* Main Content Area */}
      {inMultiplayerMenu && !isRacing && status === 'waiting' ? (
        <Lobby multiplayer={multiplayer} startMultiplayerTest={triggerMultiplayerStart} />
      ) : status === 'finished' ? (
        <div className="finished-container">
          <Stats metrics={metrics} status={status} />
          <WpmGraph data={chartData} />
          <Heatmap keyStats={keyStats} />
          <button className="restart-btn" onClick={handleRestart}>
            Restart (Press Space)
          </button>
        </div>
      ) : status === 'failed' ? (
        <div className="failed-container">
          <h2 style={{ color: 'var(--error-color)', fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '4px' }}>SUDDEN DEATH</h2>
          <p style={{ color: 'var(--sub-color)', marginBottom: '2rem' }}>You made a typo. Test failed.</p>
          <button className="restart-btn" onClick={handleRestart}>
            Restart (Tab)
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
            caretStyle={caretStyle}
            opponentProgress={inMultiplayerMenu ? multiplayer.opponentData : null}
          />
        </>
      )}

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--sub-alt-color)', fontSize: '0.8rem' }}>
        <p>Type to start • Tab to restart • Space to finish word</p>
        <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => setCaretStyle('smooth')} className={`mode-btn ${caretStyle === 'smooth' ? 'active' : ''}`}>| smooth</button>
          <button onClick={() => setCaretStyle('bar')} className={`mode-btn ${caretStyle === 'bar' ? 'active' : ''}`}>| bar</button>
          <button onClick={() => setCaretStyle('block')} className={`mode-btn ${caretStyle === 'block' ? 'active' : ''}`}>█ block</button>

          <div style={{ width: '1px', background: 'var(--sub-alt-color)', margin: '0 0.5rem' }}></div>

          <button onClick={() => setSoundMode('off')} className={`mode-btn ${soundMode === 'off' ? 'active' : ''}`}>🔇 off</button>
          <button onClick={() => setSoundMode('mechanical')} className={`mode-btn ${soundMode === 'mechanical' ? 'active' : ''}`}>⌨️ mx switch</button>
          <button onClick={() => setSoundMode('typewriter')} className={`mode-btn ${soundMode === 'typewriter' ? 'active' : ''}`}>📠 typewriter</button>
          <button onClick={() => setSoundMode('digital')} className={`mode-btn ${soundMode === 'digital' ? 'active' : ''}`}>🤖 digital</button>

          <div style={{ width: '1px', background: 'var(--sub-alt-color)', margin: '0 0.5rem' }}></div>

          <button onClick={() => setSuddenDeath(!suddenDeath)} className={`mode-btn ${suddenDeath ? 'active' : ''}`} style={{ color: suddenDeath ? 'var(--error-color)' : '' }}>💀 sudden death</button>
          <button onClick={() => setBlindMode(!blindMode)} className={`mode-btn ${blindMode ? 'active' : ''}`}>👁️ blind</button>
        </div>
      </footer>
    </main>
  );
}

export default App;
