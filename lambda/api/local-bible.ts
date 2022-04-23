import fuzz from 'fuzzball';
import rawBible from './bible.json';
import rawAbbreviations from './abbreviations.json';
import { ParsedReference, ONE_CHAPTER_BOOKS } from '../../app/src/utils';

const bible: {
  [book: string]: {
    [chapter: string]: {
      [verse: string]: string,
    },
  },
} = rawBible;
const books = Object.keys(bible);
const abbreviations: { [book: string]: string[] } = rawAbbreviations;

export function normaliseBookName(rawName: string) {
  let bestScore = {
    partial: 70,
    full: 0,
  };
  let best: string | null = null;
  const name = rawName.replace(/[^a-z0-9 ]/i, '').toLowerCase();
  for (const book of books) {
    const normalisedName = book.toLowerCase();
    const score = {
      partial: fuzz.partial_ratio(
        name,
        normalisedName.padEnd(name.length + 1, ' '),
        { full_process: false },
      ),
      full: fuzz.ratio(
        name,
        normalisedName,
        { full_process: false },
      ),
    };
    if (
      score.partial > bestScore.partial
      || (score.partial === bestScore.partial && score.full > bestScore.full)
    ) {
      bestScore = score;
      best = book;
    }
  }
  for (const [book, abbrevs] of Object.entries(abbreviations)) {
    const score = Math.max(
      ...abbrevs.map(abbrev => fuzz.ratio(
        name,
        abbrev.toLowerCase(),
        { full_process: false },
      )),
    );
    if (score >= bestScore.partial) {
      bestScore.partial = score;
      best = book;
    }
  }
  return best;
}

export function parsePassage(passage: string): ParsedReference | null {
  const rawBookName = passage.replace(/[\d\s-–:.]*$/, '');
  const reference = (
    passage
      .replace(/^\d*(\s*[a-z]+)+\s*/i, '')
      .replace(/\s*[-–]\s*/g, '-')
      .replace(/[.]/g, ':')
      .trim()
  );
  const book = normaliseBookName(rawBookName);
  if (!book) {
    return null;
  }

  let startChapter = 1;
  let startVerse = 1;
  let endChapter = 1000;
  let endVerse = 1000;
  if (reference) {
    const hasVerseNumber = reference.includes(':');
    const referenceParts = reference.split('-');
    const oneChapterBook = ONE_CHAPTER_BOOKS.includes(book);
    const startParts = referenceParts[0].split(':');
    startChapter = parseInt(startParts[0]);
    startVerse = parseInt(startParts[1]) || 1;
    if (referenceParts.length > 1) {
      const endParts = referenceParts[1].split(':');
      if (endParts.length === 2) {
        endChapter = parseInt(endParts[0]);
        endVerse = parseInt(endParts[1]) || 1000;
      } else if (hasVerseNumber) {
        endChapter = startChapter;
        endVerse = parseInt(endParts[0]);
      } else {
        endChapter = parseInt(endParts[0]);
      }
    } else {
      endChapter = startChapter;
      if (startParts.length === 2) {
        endVerse = startVerse;
      }
    }
    if (oneChapterBook && !hasVerseNumber) {
      startVerse = startChapter;
      endVerse = endChapter;
      startChapter = 1;
      endChapter = 1;
    }
  }

  return {
    book: book,
    startChapter,
    startVerse,
    endChapter,
    endVerse,
  };
}

export function getPassageText(ref: ParsedReference) {
  let text = '';
  const book = bible[ref.book];
  for (const [chapterString, chapterContent] of Object.entries(book)) {
    const chapter = parseInt(chapterString);
    if (chapter < ref.startChapter || chapter > ref.endChapter) {
      continue;
    }
    for (const [verseString, verseContent] of Object.entries(chapterContent)) {
      const verse = parseInt(verseString);
      if (chapter === ref.startChapter && verse < ref.startVerse) {
        continue;
      }
      if (chapter === ref.endChapter && verse > ref.endVerse) {
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
