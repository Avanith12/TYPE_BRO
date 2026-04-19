import React from 'react';

const QWERTY = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', ',', '?', '"']
];

const Heatmap = ({ keyStats }) => {
    return (
        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', animation: 'smooth-slide 0.5s ease' }}>
            <h3 style={{ color: 'var(--sub-color)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Keyboard Heatmap</h3>
            {QWERTY.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'flex', gap: '0.4rem' }}>
                    {row.map(char => {
                        const stats = keyStats[char] || { total: 0, errors: 0 };
                        const errorRate = stats.total > 0 ? stats.errors / stats.total : 0;

                        // Calculate background intensity: 0 error = generic sub-alt background, high error = bright error color
                        // We use an RGBA approximation of error-color where possible, but safely using pure CSS:
                        // opacity layer trick or just styling background

                        // If there are errors, make it glow red. If no errors but typed, slight glow.
                        let bgString = 'var(--sub-alt-color)';
                        let colorString = 'var(--sub-color)';

                        if (stats.total > 0) {
                            if (errorRate > 0) {
                                // Clamp the visual intensity so even 1 error is visible
                                const intensity = Math.max(0.3, Math.min(1, errorRate * 2));
                                // Using CSS color-mix if supported, or falling back to a fixed red mix
                                bgString = `color-mix(in srgb, var(--error-color) ${Math.round(intensity * 100)}%, var(--sub-alt-color))`;
                                colorString = 'var(--text-color)';
                            } else {
                                // Typed purely perfectly
                                colorString = 'var(--main-color)';
                            }
                        }

                        return (
                            <div
                                key={char}
                                style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: bgString,
                                    color: colorString,
                                    borderRadius: '6px',
                                    fontFamily: 'var(--font-family)',
                                    fontSize: '1.2rem',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.3s ease',
                                    position: 'relative'
                                }}
                            >
                                {char}
                                {stats.errors > 0 && (
                                    <span style={{ position: 'absolute', top: '2px', right: '4px', fontSize: '0.6rem', color: 'var(--text-color)', opacity: 0.8 }}>
                                        {stats.errors}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Heatmap;
