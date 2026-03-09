import React from 'react';

const StatItem = ({ label, value }) => (
    <div className="stat-item">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
    </div>
);

const Stats = ({ metrics, status }) => {
    if (status === 'waiting') return null;

    return (
        <div className="stats-container">
            <StatItem label="wpm" value={metrics.wpm} />
            <StatItem label="acc" value={`${metrics.accuracy}%`} />
            {status === 'finished' && (
                <>
                    <StatItem label="raw" value={metrics.raw} />
                    <StatItem label="chars" value={metrics.characters} />
                </>
            )}
        </div>
    );
};

export default Stats;
