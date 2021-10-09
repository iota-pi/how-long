import { normaliseBookName } from './local-bible';

it.each([
  ['ex', 'Exodus'],
  ['php', 'Philippians'],
  ['phil', 'Philippians'],
  ['phile', 'Philemon'],
  ['Hebrews', 'Hebrews'],
  ['gn', 'Genesis'],
  ['1ki', '1 Kings'],
  ['3jn', '3 John'],
  ['3 jn', '3 John'],
  ['II John', '2 John'],
  ['jud', 'Jude'],
  ['Ti', 'Titus'],
  ['1 Ti', '1 Timothy'],
])('normaliseBookName', (search, name) => {
  expect(normaliseBookName(search)).toEqual(name);
});
