import { describe, it, expect } from 'vitest';
import { parseMapFromText } from '../src/logic/mapParser';

const TEST_MAP = `testfile

<continent>
cont1
5

<country>
test1
1
100
100
1 2 3 10

<country>
test2
2
100
100
1 2 3 10

<continent>
cont2
5

<country>
test3
3
100
100
1 2 3 10

<country>
test4
4
100
100
1 2 3 10
`;

describe('mapParser', () => {
  it('parses the background image', () => {
    const result = parseMapFromText(TEST_MAP);
    expect(result.backgroundImage).toBe('testfile');
  });

  it('parses the correct number of continents', () => {
    const result = parseMapFromText(TEST_MAP);
    expect(result.continents).toHaveLength(2);
  });

  it('parses the correct number of countries', () => {
    const result = parseMapFromText(TEST_MAP);
    expect(result.countries).toHaveLength(4);
  });

  it('parses country names correctly', () => {
    const result = parseMapFromText(TEST_MAP);
    expect(result.countries.find((c) => c.id === 1)?.name).toBe('test1');
  });

  it('parses country neighbours correctly', () => {
    const result = parseMapFromText(TEST_MAP);
    const c1 = result.countries.find((c) => c.id === 1);
    expect(c1?.neighbours).toEqual([1, 2, 3, 10]);
  });

  it('parses continent values', () => {
    const result = parseMapFromText(TEST_MAP);
    expect(result.continents[0].value).toBe(5);
    expect(result.continents[1].value).toBe(5);
  });

  it('assigns countries to correct continents', () => {
    const result = parseMapFromText(TEST_MAP);
    expect(result.continents[0].countryIds).toEqual([1, 2]);
    expect(result.continents[1].countryIds).toEqual([3, 4]);
  });

  it('strips blank lines and comments', () => {
    const text = `bgimage

# this is a comment

<continent>
TestContinent
3

<country>
C1
1
50
50
2
`;
    const result = parseMapFromText(text);
    expect(result.backgroundImage).toBe('bgimage');
    expect(result.countries).toHaveLength(1);
    expect(result.countries[0].name).toBe('C1');
  });

  it('sets initial troops to 1 and ownerIndex to -1', () => {
    const result = parseMapFromText(TEST_MAP);
    for (const c of result.countries) {
      expect(c.troops).toBe(1);
      expect(c.ownerIndex).toBe(-1);
    }
  });
});
