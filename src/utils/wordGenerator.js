const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

const CODE_WORDS = [
  "function", "const", "let", "var", "return", "if", "else", "for", "while", "class", "this", "console.log", "import", "from",
  "export", "default", "async", "await", "Promise", "resolve", "reject", "try", "catch", "throw", "new", "document", "window",
  "true", "false", "null", "undefined", "NaN", "Object", "Array", "String", "Number", "Boolean", ".map", ".filter", ".reduce", ".forEach",
  "react", "Component", "useState", "useEffect", "props", "=>", "<div>", "</span>", "</button>"
];

const QUOTES = [
  "The quick brown fox jumps over the lazy dog.",
  "To be or not to be, that is the question.",
  "I think, therefore I am.",
  "May the Force be with you.",
  "Houston, we have a problem.",
  "There's no place like home.",
  "Frankly, my dear, I don't give a damn.",
  "You talking to me?",
  "I'm gonna make him an offer he can't refuse.",
  "E.T. phone home.",
  "Here's looking at you, kid.",
  "Go ahead, make my day.",
  "I'll be back.",
  "You can't handle the truth!"
];

export const generateWords = (options = {}) => {
  const count = options.count || 50;
  const textMode = options.textMode || 'words'; // 'words', 'code', 'quote'
  const punctuation = options.punctuation || false;
  const numbers = options.numbers || false;

  if (textMode === 'quote') {
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return randomQuote.split(' ');
  }

  const words = [];
  const bank = textMode === 'code' ? CODE_WORDS : COMMON_WORDS;

  for (let i = 0; i < count; i++) {
    let word = bank[Math.floor(Math.random() * bank.length)];

    if (punctuation && Math.random() > 0.6) {
      const puncs = [".", ",", "!", "?", ";", ":", '"', "'", "(", ")"];
      const p = puncs[Math.floor(Math.random() * puncs.length)];
      if (["\"", "'", "(", ")"].includes(p)) {
        if (p === "(") word = "(" + word + ")";
        else word = p + word + p;
      } else {
        word = word + p;
      }
    }

    if (numbers && Math.random() > 0.8) {
      const num = Math.floor(Math.random() * 1000);
      word = Math.random() > 0.5 ? `${num}` : `${word}${num}`;
    }

    if (punctuation && Math.random() > 0.8) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    words.push(word);
  }
  return words;
};
