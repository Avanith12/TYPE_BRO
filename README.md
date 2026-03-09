# TYPE BRO Typing
Inspired by [Monkeytype](https://monkeytype.com)

A high-performance, minimalist, and aesthetic typing application built with React and Vite.

## How It Works

**TYPE BRO** is designed with a focus on precision and low-latency interaction. Here's a deep dive into the engine:

### 1. Dynamic Word Selection
The text you type isn't hardcoded. It is generated on-the-fly:
- **The Pool**: We maintain a collection of 100 high-frequency English words in `src/utils/wordGenerator.js`.
- **Randomization**: Every time you start a test, the app "rolls a dice" 50 times to pick a random sequence from this pool. This ensures that no two tests are exactly the same.

### 2. Reactive Typing Engine
The core "loop" of the app runs on a highly optimized React state system:
- **Event Listeners**: We use global `keydown` listeners to capture input the millisecond a key is pressed.
- **State Sync**: As you type, the app instantly compares your `userInput` state against the `targetWord`.
- **Real-time Feedback**: Logic in the `TypingArea` component calculates character states (correct, incorrect, extra) and applies the theme-specific CSS variables instantly.

### 3. High-Precision Metrics
We calculate performance metrics every second using industry-standard formulas:
- **WPM (Words Per Minute)**: Computed as `(Correct Characters / 5) / Time`. We treat every 5 characters as one "word" to normalize for word length.
- **Accuracy**: The percentage of correctly typed characters vs. total keystrokes.
- **Raw Speed**: Every single keystroke is tracked, providing a measure of pure motor speed regardless of errors.

### 4. Advanced Analytics
After the test, we render a **Catmull-Rom smoothed SVG graph**. This visualization plots your WPM and Raw speed second-by-second, allowing you to see exactly where you lost momentum or encountered high-difficulty word sequences.

## Features

- **7 Premium Themes**: Switch between Neon, Hacker, Coder, Nord, and more.
- **Mechanical Sound Engine**: Immersive audio feedback using the Web Audio API.
- **Zen Mode**: A distraction-free mode that fades out UI elements while typing.
- **Mode Toggles**: Support for both "Word Count" and "Timed" sprint modes.

## Credits

TYPE BRO is heavily **inspired by Monkeytype**. It is a tribute to minimalist design and a study in building high-performance web interfaces.

---

## Getting Started

1. Clone the repository.
2. Run `npm install`.
3. Start the dev server with `npm run dev`.

## Deployment

This project is optimized for deployment to **Vercel** or **Netlify**. Simply connect your GitHub repository and build using the default Vite settings.
