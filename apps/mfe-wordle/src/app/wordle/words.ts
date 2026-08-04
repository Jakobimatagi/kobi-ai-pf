// Curated set of common 5-letter words. Used as the answer pool for the
// local fallback and as the valid-guess dictionary.
export const WORDS: string[] = [
  'apple', 'beach', 'bread', 'brain', 'brave', 'bring', 'brown', 'brush', 'chair', 'chalk',
  'charm', 'chase', 'cheap', 'check', 'chess', 'chest', 'chief', 'child', 'clean', 'clear',
  'climb', 'clock', 'cloud', 'coach', 'coast', 'could', 'crane', 'crazy', 'cream', 'crisp',
  'crown', 'dance', 'dealt', 'death', 'depth', 'doubt', 'dozen', 'draft', 'drama', 'drank',
  'dream', 'dress', 'drink', 'drive', 'eagle', 'early', 'earth', 'eight', 'empty', 'enjoy',
  'enter', 'equal', 'exact', 'exist', 'extra', 'faith', 'false', 'fault', 'fiber', 'field',
  'fifth', 'fight', 'final', 'first', 'flame', 'flash', 'float', 'floor', 'flour', 'focus',
  'force', 'frame', 'fresh', 'front', 'fruit', 'funny', 'ghost', 'giant', 'glass', 'globe',
  'grace', 'grade', 'grain', 'grand', 'grant', 'grape', 'grass', 'great', 'green', 'greet',
  'group', 'guard', 'guess', 'guest', 'guide', 'happy', 'heart', 'heavy', 'honey', 'horse',
  'hotel', 'house', 'human', 'humor', 'ideal', 'image', 'index', 'inner', 'input', 'issue',
  'joint', 'judge', 'juice', 'known', 'label', 'labor', 'large', 'laser', 'later', 'laugh',
  'layer', 'learn', 'least', 'leave', 'legal', 'lemon', 'level', 'light', 'limit', 'local',
  'logic', 'loose', 'lucky', 'lunch', 'magic', 'major', 'maker', 'march', 'match', 'maybe',
  'mayor', 'meant', 'medal', 'metal', 'meter', 'might', 'minor', 'mixed', 'model', 'money',
  'month', 'moral', 'motor', 'mount', 'mouse', 'mouth', 'movie', 'music', 'never', 'newly',
  'night', 'noise', 'north', 'novel', 'nurse', 'ocean', 'offer', 'often', 'olive', 'onion',
  'order', 'other', 'ought', 'paint', 'panel', 'paper', 'party', 'peace', 'phase', 'phone',
  'photo', 'piano', 'piece', 'pilot', 'pitch', 'place', 'plain', 'plane', 'plant', 'plate',
  'point', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print', 'prize', 'proof',
  'proud', 'prove', 'queen', 'quick', 'quiet', 'quite', 'radio', 'raise', 'range', 'rapid',
  'reach', 'ready', 'realm', 'rebel', 'refer', 'relax', 'reply', 'rider', 'ridge', 'right',
  'rival', 'river', 'roast', 'robot', 'rough', 'round', 'route', 'royal', 'rugby', 'scale',
  'scene', 'scope', 'score', 'sense', 'serve', 'seven', 'shade', 'shake', 'shall', 'shape',
  'share', 'sharp', 'sheep', 'sheet', 'shelf', 'shell', 'shine', 'shirt', 'shock', 'shoot',
  'short', 'shown', 'sight', 'silly', 'since', 'sixth', 'skill', 'sleep', 'slice', 'slide',
  'small', 'smart', 'smile', 'smoke', 'snake', 'solid', 'solve', 'sorry', 'sound', 'south',
  'space', 'spare', 'speak', 'speed', 'spell', 'spend', 'spice', 'spike', 'split', 'spoke',
  'sport', 'spray', 'squad', 'staff', 'stage', 'stair', 'stand', 'stark', 'start', 'state',
  'steam', 'steel', 'steep', 'stern', 'stick', 'still', 'stock', 'stone', 'stood', 'store',
  'storm', 'story', 'stove', 'style', 'sugar', 'sunny', 'super', 'swear', 'sweet', 'swift',
  'swing', 'sword', 'table', 'taken', 'taste', 'teach', 'thank', 'theme', 'there', 'these',
  'thick', 'thing', 'think', 'third', 'those', 'three', 'throw', 'tiger', 'tight', 'title',
  'toast', 'today', 'token', 'tooth', 'topic', 'total', 'touch', 'tower', 'trace', 'track',
  'trade', 'trail', 'train', 'treat', 'trend', 'trial', 'tribe', 'trick', 'truck', 'truly',
  'trust', 'truth', 'twice', 'twist', 'ultra', 'uncle', 'under', 'union', 'unity', 'until',
  'upper', 'upset', 'urban', 'usage', 'usual', 'valid', 'value', 'video', 'virus', 'visit',
  'vital', 'vocal', 'voice', 'waste', 'watch', 'water', 'wheat', 'wheel', 'where', 'which',
  'while', 'white', 'whole', 'whose', 'woman', 'world', 'worry', 'worse', 'worst', 'worth',
  'would', 'wound', 'write', 'wrong', 'young', 'youth', 'zebra',
];

export const WORD_SET: ReadonlySet<string> = new Set(WORDS);

export function isValidGuess(word: string): boolean {
  return WORD_SET.has(word.toLowerCase());
}
