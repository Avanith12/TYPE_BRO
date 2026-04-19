import React, { useRef, useEffect, useState } from 'react';
import Word from './Word';

const TypingArea = ({ words, userInput, currWordIndex, history, status, caretStyle = 'smooth', opponentProgress }) => {
    const containerRef = useRef(null);
    const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });
    const [ghostCaretPos, setGhostCaretPos] = useState({ left: 0, top: 0, visible: false });

    // Local Player Caret Logic
    useEffect(() => {
        const activeWordEl = containerRef.current?.querySelector('.word.active');
        if (activeWordEl) {
            const chars = activeWordEl.querySelectorAll('.char');
            const typedLen = userInput.length;

            let targetChar;
            if (typedLen === 0) {
                targetChar = chars[0];
            } else if (typedLen <= chars.length) {
                targetChar = chars[typedLen - 1];
            } else {
                const extras = activeWordEl.querySelectorAll('.char.extra');
                targetChar = extras[extras.length - 1];
            }

            if (targetChar) {
                const parentRect = containerRef.current.getBoundingClientRect();
                const charRect = targetChar.getBoundingClientRect();

                setCaretPos({
                    left: typedLen === 0 ? charRect.left - parentRect.left : charRect.right - parentRect.left,
                    top: charRect.top - parentRect.top + (charRect.height * 0.1)
                });
            }
        }
    }, [userInput, currWordIndex, words]);

    // Opponent Ghost Caret Logic
    useEffect(() => {
        if (!opponentProgress || status === 'finished') {
            setGhostCaretPos(prev => ({ ...prev, visible: false }));
            return;
        }

        const { index, chars } = opponentProgress;
        const wordEls = containerRef.current?.querySelectorAll('.word');

        if (wordEls && wordEls[index]) {
            const wordEl = wordEls[index];
            const charEls = wordEl.querySelectorAll('.char');

            let targetChar;
            if (chars === 0) {
                targetChar = charEls[0];
            } else if (chars <= charEls.length) {
                targetChar = charEls[chars - 1]; // Fallback to last known if overflow
            }

            if (targetChar) {
                const parentRect = containerRef.current.getBoundingClientRect();
                const charRect = targetChar.getBoundingClientRect();

                setGhostCaretPos({
                    left: chars === 0 ? charRect.left - parentRect.left : charRect.right - parentRect.left,
                    top: charRect.top - parentRect.top + (charRect.height * 0.1),
                    visible: true
                });
            }
        }
    }, [opponentProgress, words, status]);

    return (
        <div className="typing-container" ref={containerRef}>
            {status !== 'finished' && (
                <div
                    className={`caret caret-${caretStyle}`}
                    style={{
                        left: `${caretPos.left}px`,
                        top: `${caretPos.top}px`,
                        opacity: status === 'finished' ? 0 : 1
                    }}
                />
            )}
            {ghostCaretPos.visible && status !== 'finished' && (
                <div
                    className={`caret ghost-caret caret-${caretStyle}`}
                    style={{
                        left: `${ghostCaretPos.left}px`,
                        top: `${ghostCaretPos.top}px`,
                        opacity: 0.6,
                        backgroundColor: 'var(--sub-color)'
                    }}
                >
                    <span style={{ position: 'absolute', top: '-1.4rem', left: '-1rem', fontSize: '0.6rem', color: 'var(--sub-color)', whiteSpace: 'nowrap', opacity: 0.8 }}>
                        P2: {opponentProgress.wpm} WPM
                    </span>
                </div>
            )}
            <div className="words-wrapper">
                {words.map((word, i) => {
                    const isHistory = i < currWordIndex;
                    const isCurrent = i === currWordIndex;
                    const typed = isHistory ? history[i].typed : (isCurrent ? userInput : '');

                    return (
                        <Word
                            key={i}
                            word={word}
                            typed={typed}
                            active={isCurrent}
                            isFinished={isHistory}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default TypingArea;
