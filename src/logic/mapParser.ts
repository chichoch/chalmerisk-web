import type { Country, Continent, MapData } from '../types';

function stripLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));
}

export async function parseMap(url: string): Promise<MapData> {
  const response = await fetch(url);
  const text = await response.text();
  const lines = stripLines(text);

  const backgroundImage = lines[0];
  const countries: Country[] = [];
  const continents: Continent[] = [];

  let i = 1;
  while (i < lines.length) {
    if (lines[i] === '<continent>') {
      const continentName = lines[i + 1];
      const continentValue = parseInt(lines[i + 2], 10);
      const continentCountryIds: number[] = [];
      i += 3;

      while (i < lines.length && lines[i] !== '<continent>') {
        if (lines[i] === '<country>') {
          const name = lines[i + 1];
          const id = parseInt(lines[i + 2], 10);
          const x = parseInt(lines[i + 3], 10);
          const y = parseInt(lines[i + 4], 10);
          const neighbours = lines[i + 5].split(/\s+/).map(n => parseInt(n, 10));

          countries.push({
            id,
            name,
            x,
            y,
            troops: 1,
            neighbours,
            ownerIndex: -1,
            continentName,
            isSelected: false,
          });
          continentCountryIds.push(id);
          i += 6;
        } else {
          i++;
        }
      }

      continents.push({
        name: continentName,
        value: continentValue,
        countryIds: continentCountryIds,
      });
    } else {
      i++;
    }
  }

  return { countries, continents, backgroundImage };
}

export function parseMapFromText(text: string): MapData {
  const lines = stripLines(text);

  const backgroundImage = lines[0];
  const countries: Country[] = [];
  const continents: Continent[] = [];

  let i = 1;
  while (i < lines.length) {
    if (lines[i] === '<continent>') {
      const continentName = lines[i + 1];
      const continentValue = parseInt(lines[i + 2], 10);
      const continentCountryIds: number[] = [];
      i += 3;

      while (i < lines.length && lines[i] !== '<continent>') {
        if (lines[i] === '<country>') {
          const name = lines[i + 1];
          const id = parseInt(lines[i + 2], 10);
          const x = parseInt(lines[i + 3], 10);
          const y = parseInt(lines[i + 4], 10);
          const neighbours = lines[i + 5].split(/\s+/).map(n => parseInt(n, 10));

          countries.push({
            id,
            name,
            x,
            y,
            troops: 1,
            neighbours,
            ownerIndex: -1,
            continentName,
            isSelected: false,
          });
          continentCountryIds.push(id);
          i += 6;
        } else {
          i++;
        }
      }

      continents.push({
        name: continentName,
        value: continentValue,
        countryIds: continentCountryIds,
      });
    } else {
      i++;
    }
  }

  return { countries, continents, backgroundImage };
}
