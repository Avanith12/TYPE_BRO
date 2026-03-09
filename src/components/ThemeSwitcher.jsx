import React from 'react';

const THEMES = [
    { id: 'default', name: 'serika dark' },
    { id: 'neon', name: 'neon' },
    { id: 'sepia', name: 'sepia' },
    { id: 'nord', name: 'nord' },
    { id: 'carbon', name: 'carbon' },
    { id: 'hacker', name: 'hacker' },
    { id: 'coder', name: 'coder' },
];

const ThemeSwitcher = ({ currentTheme, onThemeChange }) => {
    return (
        <div className="theme-switcher">
            {THEMES.map((theme) => (
                <button
                    key={theme.id}
                    className={`theme-btn ${currentTheme === theme.id ? 'active' : ''}`}
                    onClick={() => onThemeChange(theme.id)}
                    title={theme.name}
                >
                    {theme.name}
                </button>
            ))}
        </div>
    );
};

export default ThemeSwitcher;
