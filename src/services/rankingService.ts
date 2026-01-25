import { Player } from '../models/player';

const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_z4_nPfXouAPBrb5eP2u5JqNXsg1aQedaRk25l36isMLJy21nPlxeKE1GvOX75MFp5sCLXjc6BegJ/pub?output=csv';

function parseStringToNumber(position: string, decimal = false): number | string | null {
  try {
    if (decimal) {
      return parseFloat(position).toFixed(2);
    }
    return parseInt(position, 10);
  } catch {
    return null;
  }
}

// Function to load and parse CSV data from the Google Sheet
export async function getRanking(): Promise<{ ranking: Player[]; lastUpdate: string }> {
  try {
    const response = await fetch(SHEET_URL);
    const data = await response.text();
    const rows = data.split('\n');

    // Store all rows for filtering
    const csvParsed = rows.slice(1).filter((row) => row.trim());

    const ranking = csvParsed.map((player) => {
      const columns = player.split(',');
      const [position, name, points, hcp, tournaments, origin, card15, pointsLost, card16, changes, lastUpdate] =
        columns;

      return {
        card15: parseStringToNumber(card15, true),
        card16: parseStringToNumber(card16, true),
        columns,
        hcp: parseStringToNumber(hcp),
        lastUpdate: lastUpdate?.trim() || null,
        name: name?.trim() || '',
        origin: origin?.trim() || '',
        points: parseStringToNumber(points, true),
        pointsLost: parseStringToNumber(pointsLost, true),
        changes: parseStringToNumber(changes),
        position: parseStringToNumber(position),
        tournaments: parseStringToNumber(tournaments),
      };
    }) as Player[];

    // Get lastUpdate from first player - The last update column is the same value for all players
    let lastUpdate = '';

    if (ranking.length > 0) {
      lastUpdate = ranking[0].lastUpdate || '';
    }

    console.log('CSV data loaded and parsed successfully');
    return {
      ranking,
      lastUpdate,
    };
  } catch (error) {
    console.error('Error loading CSV:', error);
    return Promise.reject(error);
  }
}
