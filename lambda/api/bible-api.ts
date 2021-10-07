import axios, { AxiosError } from 'axios';
import { getBookId } from './books';
import secrets from '../.secrets';

const FUMS_DEVICE_ID = Math.random();

const api = axios.create({
  baseURL: 'https://api.scripture.api.bible/v1',
  headers: { 'api-key': secrets.bibleAPIKey },
});

interface Bible {
  name: string,
  id: string,
}
type BibleAbbrev = 'kjv' | 'asv';
const AVAILABLE_BIBLES: Record<BibleAbbrev, Bible> = {
  kjv: {
    name: 'KJV',
    id: 'de4e12af7f28f599-02',
  },
  asv: {
    name: 'ASV',
    id: '06125adad2d5898a-01',
  },
}
const DEFAULT_BIBLE = AVAILABLE_BIBLES['asv'];

export function getPassageId(passage: string) {
  const book = passage.replace(/[\d\s-–:;,.]*$/, '');
  console.log(book);
  const reference = (
    passage
      .replace(/^\d*(\s*[a-z]+)+\s*/i, '')
      .replace(/\s*[-–]\s*/g, '-')
      .replace(/[:;,]/g, '.')
      .trim()
  );
  const bookId = getBookId(book);
  if (!reference || !bookId) {
    return bookId;
  }
  const referenceParts = reference.split('-');
  const hasVerseNumbers = reference.includes('.');
  console.log(book, referenceParts);
  const firstChapter = referenceParts[0].replace(/\..*/, '');
  const withBookAndChapter = referenceParts.map((part, index) => {
    if (part.includes('.') || !hasVerseNumbers) {
      return `${bookId}.${part}`;
    }
    if (index === 0) {
      return `${bookId}.${part}.1`;
    }
    return `${bookId}.${firstChapter}.${part}`;
  });
  return withBookAndChapter.join('-');
}

function getURI(base: string, params?: { [name: string]: string | number | boolean }) {
  const paramEntries = Object.entries(params || {});
  const paramString = paramEntries.map(
    ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`,
  ).join('&');
  const joiner = paramString.length > 0 ? '?' : '';
  return base + joiner + paramString;
}

export async function getPassageChunk(passageId: string) {
  const uri = getURI(
    `/bibles/${DEFAULT_BIBLE.id}/passages/${passageId}`,
    {
      'content-type': 'text',
      'include-titles': false,
      'include-verse-numbers': false,
    },
  );
  const result = await api.get(uri);
  const content = result.data.data.content.trim();
  const words = content.split(/\s+/).length;
  const reference = result.data.data.reference;
  let fumsPromise: Promise<any> | undefined;
  if (words) {
    const token = result.data.meta.fumsToken;
    fumsPromise = axios.get(
      `https://fums.api.bible/f3?t=${token}&dId=${FUMS_DEVICE_ID}&sId=${FUMS_DEVICE_ID}`,
    ).catch(console.error);
  }
  return {
    fumsPromise,
    reference,
    words,
  };
}
