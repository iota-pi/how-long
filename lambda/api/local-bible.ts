import fuzz from 'fuzzball';
import rawBible from './bible.json';

const bible: {
  [book: string]: {
    [chapter: string]: {
      [verse: string]: string,
    },
  },
} = rawBible;
const books = Object.keys(bible);

export function normaliseBookName(rawName: string) {
  let bestScore = 70;
  let best: string | null = null;
  const name = rawName.replace(/[^a-z0-9 ]/i, '').toLowerCase();
  for (const book of books) {
    const normalisedName = book.toLowerCase();
    const score = fuzz.partial_ratio(
      name,
      normalisedName.padEnd(name.length + 1, ' '),
      { full_process: false },
    );
    if (score > bestScore) {
      bestScore = score;
      best = book;
    }
  }
  return best as keyof typeof bible | null;
}

interface ParsedReference {
  book: keyof typeof bible,
  endChapter: number,
  endVerse: number,
  startChapter: number,
  startVerse: number,
}

export function parsePassage(passage: string): ParsedReference | null {
  const book = passage.replace(/[\d\s-–:.]*$/, '');
  const reference = (
    passage
      .replace(/^\d*(\s*[a-z]+)+\s*/i, '')
      .replace(/\s*[-–]\s*/g, '-')
      .replace(/[.]/g, ':')
      .trim()
  );
  const bookName = normaliseBookName(book);
  if (!bookName) {
    return null;
  }

  let startChapter = 1;
  let startVerse = 1;
  let endChapter = 1000;
  let endVerse = 1000;
  if (reference) {
    const hasVerseNumber = reference.includes(':');
    const referenceParts = reference.split('-');
    const startParts = referenceParts[0].split(':');
    startChapter = parseInt(startParts[0]);
    startVerse = parseInt(startParts[1]);
    if (referenceParts.length > 1) {
      const endParts = referenceParts[1].split(':');
      if (endParts.length === 2) {
        endChapter = parseInt(endParts[0]);
        endVerse = parseInt(endParts[1]);
      } else if (hasVerseNumber) {
        endChapter = startChapter;
        endVerse = parseInt(endParts[0]);
      } else {
        endChapter = parseInt(endParts[0]);
      }
    } else {
      endChapter = startChapter;
      endVerse = startVerse;
    }
  }

  return {
    book: bookName,
    startChapter,
    startVerse,
    endChapter,
    endVerse,
  };
}

export function getPassageText(ref: ParsedReference) {
  let text = '';
  const book = bible[ref.book];
  for (const [chapter, chapterContent] of Object.entries(book)) {
    if (parseInt(chapter) < ref.startChapter || parseInt(chapter) > ref.endChapter) {
      continue;
    }
    for (const [verse, verseContent] of Object.entries(chapterContent)) {
      if (parseInt(verse) < ref.startVerse || parseInt(verse) > ref.endVerse) {
        continue;
      }
      text += `${verseContent} `;
    }
  }
  return text;
}

export function countWords(text: string) {
  return text.trim().split(/\s+/).length;
}
