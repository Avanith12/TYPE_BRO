import { useState, useEffect, useCallback, useRef } from 'react';
import { generateWords } from '../utils/wordGenerator';

export const useTypingEngine = (initialWords, mode = 'words', timeLimit = 30, wordOptions = {}) => {
    const [words, setWords] = useState(initialWords);
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [currWordIndex, setCurrWordIndex] = useState(0);
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState('waiting');
    const [metrics, setMetrics] = useState({ wpm: 0, accuracy: 0, raw: 0, characters: 0, errors: 0 });
    const [chartData, setChartData] = useState([]);
    const [keyStats, setKeyStats] = useState({});
    const [timeLeft, setTimeLeft] = useState(timeLimit);

    const audioCtx = useRef(null);
    const playClick = useCallback(() => {
        try {
            if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
            const osc = audioCtx.current.createOscillator();
            const gain = audioCtx.current.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, audioCtx.current.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, audioCtx.current.currentTime + 0.1);
            gain.gain.setValueAtTime(0.05, audioCtx.current.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.current.destination);
            osc.start();
            osc.stop(audioCtx.current.currentTime + 0.1);
        } catch (e) { /* ignore audio errors */ }
    }, []);

    const calculateMetrics = useCallback((isFinal = false) => {
        if (!startTime) return null;
        const now = (isFinal && endTime) ? endTime : Date.now();
        const durationInMinutes = (now - startTime) / 60000;
        if (durationInMinutes <= 0) return null;

        let correctChars = 0;
        let totalTypedChars = 0;
        let totalErrors = 0;

        history.forEach((wordObj, idx) => {
            const target = words[idx];
            const typed = wordObj.typed;
            totalTypedChars += typed.length + 1;
            for (let i = 0; i < typed.length; i++) {
                if (typed[i] === target[i]) correctChars++;
                else totalErrors++;
            }
            correctChars++;
        });

        totalTypedChars += userInput.length;
        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] === words[currWordIndex][i]) correctChars++;
            else totalErrors++;
        }

        const wpm = Math.round((correctChars / 5) / durationInMinutes);
        const raw = Math.round((totalTypedChars / 5) / durationInMinutes);
        const accuracy = totalTypedChars > 0 ? Math.round((correctChars / totalTypedChars) * 100) : 100;

        const currentMetrics = { wpm, accuracy, raw, characters: totalTypedChars, errors: totalErrors };
        setMetrics(currentMetrics);
        return currentMetrics;
    }, [history, words, userInput, currWordIndex, startTime, endTime]);

    const finishTest = useCallback(() => {
        setEndTime(Date.now());
        setStatus('finished');

        const m = calculateMetrics(true);
        if (m) {
            const currentHighest = parseInt(localStorage.getItem('highestWpm') || '0', 10);
            if (m.wpm > currentHighest) {
                localStorage.setItem('highestWpm', m.wpm.toString());
            }
        }
    }, [calculateMetrics]);

    const reset = useCallback((newWords) => {
        setWords(newWords);
        setUserInput('');
        setStartTime(null);
        setEndTime(null);
        setCurrWordIndex(0);
        setHistory([]);
        setStatus('waiting');
        setMetrics({ wpm: 0, accuracy: 0, raw: 0, characters: 0, errors: 0 });
        setChartData([]);
        setKeyStats({});
        setTimeLeft(timeLimit);
    }, [timeLimit]);

    const handleKeyDown = useCallback((e) => {
        // Global Tab to restart (standard in typing apps)
        if (e.key === 'Tab') {
            e.preventDefault();
            reset(generateWords(wordOptions));
            return;
        }

        if (status === 'finished') {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                reset(generateWords(wordOptions));
            }
            return;
        }

        if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
            playClick();
        }

        if (status === 'waiting' && e.key.length === 1) {
            setStartTime(Date.now());
            setStatus('typing');
        }

        if (e.key === ' ') {
            e.preventDefault();
            if (userInput.length > 0) {
                setHistory(prev => [...prev, { typed: userInput, word: words[currWordIndex] }]);

                if (currWordIndex + 1 === words.length) {
                    finishTest();
                } else {
                    setCurrWordIndex(prev => prev + 1);
                    setUserInput('');
                }
            }
        } else if (e.key === 'Backspace') {
            setUserInput(prev => prev.slice(0, -1));
        } else if (e.key.length === 1) {
            const nextInput = userInput + e.key;
            setUserInput(nextInput);

            // HEATMAP TRACKING
            const targetChar = words[currWordIndex][userInput.length]?.toLowerCase();
            if (targetChar) { // Track everything including punctuation
                setKeyStats(prev => {
                    const current = prev[targetChar] || { total: 0, errors: 0 };
                    return {
                        ...prev,
                        [targetChar]: {
                            total: current.total + 1,
                            errors: current.errors + (e.key.toLowerCase() === targetChar ? 0 : 1)
                        }
                    };
                });
            }

            // AUTO-FINISH LOGIC:
            // If we are on the last word and the input matches the word exactly
            if (mode === 'words' && currWordIndex === words.length - 1) {
                if (nextInput === words[currWordIndex]) {
                    finishTest();
                }
            }
        }
    }, [status, userInput, words, currWordIndex, playClick, mode, finishTest, reset, wordOptions]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (status === 'typing') {
            const interval = setInterval(() => {
                const m = calculateMetrics();
                if (m) {
                    setChartData(prev => [...prev, { wpm: m.wpm, raw: m.raw }]);
                }

                if (mode === 'time') {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            finishTest();
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [status, calculateMetrics, mode, finishTest]);

    return {
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
    };
};
