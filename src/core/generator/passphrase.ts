import { randomBytes } from '../crypto/random';

export const EFF_SHORT_WORD_LIST = [
  'acid', 'aged', 'aid', 'aim', 'air', 'all', 'ant', 'ape', 'arc', 'are', 'ark', 'arm', 'art', 'ash',
  'ask', 'ate', 'atom', 'awe', 'axe', 'baa', 'bad', 'bag', 'bail', 'bait', 'bake', 'ball', 'band',
  'bank', 'bar', 'bark', 'barn', 'base', 'bath', 'bead', 'beam', 'bean', 'bear', 'beat', 'bed',
  'bee', 'beer', 'bell', 'belt', 'bend', 'bent', 'best', 'bike', 'bill', 'bind', 'bird', 'bite',
  'blame', 'blank', 'blast', 'blaze', 'bleed', 'blend', 'bless', 'blind', 'blink', 'block', 'blood',
  'bloom', 'blow', 'blue', 'blush', 'boar', 'board', 'boat', 'body', 'boil', 'bold', 'bolt', 'bomb',
  'bond', 'bone', 'book', 'boom', 'boot', 'bore', 'born', 'boss', 'both', 'bowl', 'box', 'boy',
  'brain', 'brake', 'brand', 'brass', 'brave', 'bread', 'break', 'breed', 'brick', 'bride', 'brief',
  'bring', 'broad', 'broke', 'brook', 'broom', 'brown', 'brush', 'build', 'built', 'bunch',
  'burst', 'bury', 'bush', 'busy', 'buy', 'buzz', 'cabin', 'cable', 'cage', 'cake', 'call', 'calm',
  'came', 'camp', 'can', 'cane', 'cape', 'cap', 'card', 'care', 'carp', 'car', 'cart', 'case',
  'cash', 'cast', 'cat', 'catch', 'cave', 'cell', 'cent', 'chain', 'chair', 'chalk', 'chance',
  'change', 'chant', 'chaos', 'charm', 'chart', 'chase', 'chat', 'cheap', 'check', 'cheek',
  'cheer', 'chess', 'chest', 'chick', 'chief', 'child', 'chin', 'chip', 'chop', 'chord', 'city',
  'clam', 'clan', 'clap', 'clash', 'clasp', 'class', 'claw', 'clay', 'clean', 'clear', 'clerk',
  'click', 'cliff', 'climb', 'cling', 'clock', 'close', 'cloth', 'cloud', 'clown', 'club', 'clue',
  'clutch', 'coach', 'coal', 'coast', 'coat', 'code', 'coil', 'coin', 'cold', 'colt', 'comb',
  'come', 'cook', 'cool', 'cope', 'copy', 'cord', 'core', 'cork', 'corn', 'cost', 'count',
  'court', 'cover', 'cow', 'crack', 'craft', 'crane', 'crash', 'crate', 'crawl', 'crazy',
  'cream', 'creed', 'creek', 'creep', 'crest', 'crime', 'crisp', 'cross', 'crow', 'crown',
  'crude', 'cruel', 'crush', 'crust', 'cry', 'cub', 'cube', 'cult', 'cup', 'curb', 'cure', 'curl',
  'curse', 'curve', 'cut', 'cute', 'cycle', 'dad', 'damp', 'dance', 'dare', 'dark', 'dart', 'dash',
  'data', 'date', 'dawn', 'day', 'dead', 'deal', 'dean', 'dear', 'death', 'debt', 'deck', 'deed',
  'deem', 'deep', 'deer', 'dell', 'demo', 'den', 'dense', 'dent', 'desk', 'dial', 'dice',
  'died', 'diet', 'dirt', 'disc', 'disk', 'ditch', 'dive', 'dock', 'doe', 'doll', 'dome', 'done',
  'doom', 'door', 'dose', 'dot', 'dove', 'down', 'dozen', 'draft', 'drag', 'drain', 'drake',
  'drama', 'drank', 'draw', 'dread', 'dream', 'dress', 'drew', 'dried', 'drift', 'drill',
  'drink', 'drive', 'drop', 'drown', 'drug', 'drum', 'drunk', 'dry', 'duck', 'dude', 'duel',
  'duet', 'duke', 'dull', 'dumb', 'dump', 'dune', 'dunk', 'dusk', 'dust', 'duty', 'dwarf',
  'dwell', 'each', 'earn', 'ease', 'east', 'easy', 'eat', 'echo', 'edge', 'eel', 'egg', 'ego',
  'elbow', 'elder', 'elect', 'elf', 'elk', 'elm', 'else', 'email', 'emit', 'empty', 'end',
  'enemy', 'enjoy', 'enter', 'entry', 'equal', 'equip', 'era', 'erase', 'error', 'erupt',
  'essay', 'evade', 'even', 'event', 'ever', 'every', 'evil', 'evoke', 'exact', 'exam', 'excel',
  'exist', 'exit', 'expel', 'extra', 'fable', 'face', 'fact', 'fade', 'fail', 'faint', 'fair',
  'fake', 'fall', 'fame', 'fang', 'farm', 'fast', 'fat', 'fault', 'fauna', 'favor', 'fax',
  'faze', 'fear', 'feat', 'feed', 'feel', 'feet', 'fell', 'felt', 'fern', 'fest', 'few',
  'field', 'fiend', 'fierce', 'fig', 'fight', 'file', 'fill', 'film', 'find', 'fine', 'fire',
  'firm', 'first', 'fish', 'fist', 'fit', 'five', 'flag', 'flame', 'flank', 'flash', 'flask',
  'flat', 'flaw', 'flea', 'fled', 'flee', 'flesh', 'flew', 'flex', 'flip', 'flirt', 'float',
  'flock', 'flood', 'floor', 'flour', 'flow', 'flown', 'fluid', 'flush', 'flute', 'fly', 'foam',
  'foe', 'fog', 'foil', 'fold', 'folk', 'fond', 'font', 'food', 'fool', 'foot', 'ford',
  'forest', 'forge', 'fork', 'form', 'fort', 'fossil', 'found', 'fount', 'fox', 'foyer',
  'frail', 'frame', 'frank', 'fraud', 'freak', 'free', 'fresh', 'fried', 'friend', 'frill',
  'frisk', 'frog', 'from', 'front', 'frost', 'frown', 'froze', 'fruit', 'fudge', 'fuel', 'full',
  'fume', 'fund', 'fungi', 'funk', 'fun', 'fur', 'fuse', 'fuss', 'fuzzy',
];

export interface PassphraseOptions {
  wordCount: number;
  separator?: string;
}

export function generatePassphrase(options: PassphraseOptions): string {
  const { wordCount, separator = ' ' } = options;
  const random = randomBytes(wordCount * 2);
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const index = ((random[i * 2] << 8) | random[i * 2 + 1]) % EFF_SHORT_WORD_LIST.length;
    words.push(EFF_SHORT_WORD_LIST[index]);
  }
  return words.join(separator);
}
