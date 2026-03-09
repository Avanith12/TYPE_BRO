import React from 'react';

const Character = ({ char, state }) => {
    let className = 'char';
    if (state === 'correct') className += ' correct';
    if (state === 'incorrect') className += ' incorrect';
    if (state === 'extra') className += ' extra';

    return <span className={className}>{char}</span>;
};

const Word = ({ word, typed, active, isFinished }) => {
    const chars = word.split('');
    const typedChars = typed ? typed.split('') : [];

    return (
        <div className={`word ${active ? 'active' : ''} ${isFinished && typed !== word ? 'error' : ''}`}>
            {chars.map((char, i) => {
                let state = 'waiting';
                if (i < typedChars.length) {
                    state = typedChars[i] === char ? 'correct' : 'incorrect';
                }
                return <Character key={i} char={char} state={state} />;
            })}
            {typedChars.slice(chars.length).map((char, i) => (
                <Character key={chars.length + i} char={char} state="extra" />
            ))}
        </div>
    );
};

export default Word;
