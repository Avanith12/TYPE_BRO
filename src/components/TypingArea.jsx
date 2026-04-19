import React, { useRef, useEffect, useState } from 'react';
import Word from './Word';

const TypingArea = ({ words, userInput, currWordIndex, history, status, caretStyle = 'smooth' }) => {
    const containerRef = useRef(null);
    const [caretPos, setCaretPos] = useState({ left: 0, top: 0 });

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
                // Extra characters
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
