import { useEffect, useRef } from 'react';

export interface ParsedReference {
  book: string,
  endChapter: number,
  endVerse: number,
  startChapter: number,
  startVerse: number,
}

export const ONE_CHAPTER_BOOKS = [
  'Obadiah',
  'Philemon',
  '2 John',
  '3 John',
  'Jude',
];

export const APP_NAME = 'How Long';
export const API_BASE_URI = process.env.REACT_APP_LAMBDA_ENDPOINT;

export function usePrevious<T>(state: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = state;
  });
  return ref.current;
}

export function prettyPassage(reference: ParsedReference) {
  const { book, endChapter, endVerse, startChapter, startVerse } = reference;
  const oneChapterBook = ONE_CHAPTER_BOOKS.includes(book);
  let [start, end] = ['', ''];
  if (endChapter < 1000 && startChapter !== endChapter) {
    end += endChapter.toString();
  }
  if (endVerse < 1000) {
    if (end) {
      end += ':';
    }
    if (startChapter !== endChapter || startVerse !== endVerse) {
      end += endVerse.toString();
    }
  }

  if (!oneChapterBook && endChapter < 1000) {
    start += startChapter.toString();
  }
  if (endVerse < 1000) {
    if (start) {
      start += ':';
    }
    start += startVerse.toString();
  }

  const result = `${book} ${start}–${end}`.replace(/[ \-–]+$/, '');
  return result;
}
