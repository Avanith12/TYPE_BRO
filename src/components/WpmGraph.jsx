import React from 'react';

const WpmGraph = ({ data }) => {
    if (!data || data.length < 2) return null;

    const width = 800;
    const height = 200;
    const padding = { top: 20, right: 30, bottom: 40, left: 40 };

    const usableWidth = width - padding.left - padding.right;
    const usableHeight = height - padding.top - padding.bottom;

    const wpms = data.map(d => d.wpm);
    const raws = data.map(d => d.raw);
    const maxWpm = Math.max(...wpms, ...raws, 100);

    // Bezier curve helper (Catmull-Rom to Cubic Bezier)
    const getSmoothPath = (px, py, isArea = false) => {
        if (px.length < 2) return '';

        let path = `M ${px[0]} ${py[0]}`;

        for (let i = 0; i < px.length - 1; i++) {
            const x0 = i > 0 ? px[i - 1] : px[i];
            const y0 = i > 0 ? py[i - 1] : py[i];
            const x1 = px[i];
            const y1 = py[i];
            const x2 = px[i + 1];
            const y2 = py[i + 1];
            const x3 = i < px.length - 2 ? px[i + 2] : x2;
            const y3 = i < px.length - 2 ? py[i + 2] : y2;

            const cp1x = x1 + (x2 - x0) / 6;
            const cp1y = y1 + (y2 - y0) / 6;
            const cp2x = x2 - (x3 - x1) / 6;
            const cp2y = y2 - (y3 - y1) / 6;

            path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x2} ${y2}`;
        }

        if (isArea) {
            const lastX = px[px.length - 1];
            const firstX = px[0];
            const bottomY = padding.top + usableHeight;
            return `${path} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
        }
        return path;
    };

    const xCoords = data.map((_, i) => padding.left + (i / (data.length - 1)) * usableWidth);
    const wpmY = wpms.map(p => padding.top + usableHeight - (p / maxWpm) * usableHeight);
    const rawY = raws.map(p => padding.top + usableHeight - (p / maxWpm) * usableHeight);

    return (
        <div className="graph-wrapper" style={{ margin: '3rem 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '900px' }}>
                <svg
                    width="100%"
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="xMidYMid meet"
                    style={{ overflow: 'visible' }}
                >
                    <defs>
                        <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--main-color)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--main-color)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100, 125, 150].map(v => {
                        const y = padding.top + usableHeight - (v / maxWpm) * usableHeight;
                        if (v > maxWpm && v > 100) return null;
                        return (
                            <g key={v}>
                                <line
                                    x1={padding.left}
                                    y1={y}
                                    x2={padding.left + usableWidth}
                                    y2={y}
                                    stroke="var(--sub-alt-color)"
                                    strokeWidth="1"
                                    strokeOpacity="0.5"
                                />
                                <text
                                    x={padding.left - 10}
                                    y={y + 4}
                                    textAnchor="end"
                                    fontSize="10"
                                    fill="var(--sub-color)"
                                    opacity="0.8"
                                >
                                    {v}
                                </text>
                            </g>
                        );
                    })}

                    {/* Area Fill */}
                    <path
                        d={getSmoothPath(xCoords, wpmY, true)}
                        fill="url(#wpmGradient)"
                    />

                    {/* Raw Line (Dashed) */}
                    <path
                        d={getSmoothPath(xCoords, rawY)}
                        fill="none"
                        stroke="var(--sub-color)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.4"
                    />

                    {/* WPM Line */}
                    <path
                        d={getSmoothPath(xCoords, wpmY)}
                        fill="none"
                        stroke="var(--main-color)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Labels */}
                    <text
                        x={padding.left}
                        y={height - 5}
                        fontSize="10"
                        fill="var(--sub-color)"
                    >
                        0s
                    </text>
                    <text
                        x={padding.left + usableWidth}
                        y={height - 5}
                        textAnchor="end"
                        fontSize="10"
                        fill="var(--sub-color)"
                    >
                        {data.length}s
                    </text>
                </svg>

                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '1rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', background: 'var(--main-color)', borderRadius: '2px' }}></div>
                        <span style={{ color: 'var(--sub-color)' }}>WPM</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', border: '2px dashed var(--sub-color)', borderRadius: '2px' }}></div>
                        <span style={{ color: 'var(--sub-color)' }}>Raw</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WpmGraph;
