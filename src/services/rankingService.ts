import type { Player } from '../models/player';
import { parseCsv } from '../utils/csv';

const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_z4_nPfXouAPBrb5eP2u5JqNXsg1aQedaRk25l36isMLJy21nPlxeKE1GvOX75MFp5sCLXjc6BegJ/pub?output=csv';

const HEADERS = {
  position: 'POS',
  name: 'JUGADOR',
  points: 'PUNTOS',
  hcp: 'HCP',
  tournaments: 'TORNEOS',
  origin: 'PROCEDENCIA',
  card15: 'TARJETA 15',
  pointsLost: 'PUNTOS QUE PIERDE',
  card16: 'TARJETA 16',
  changes: 'CAMBIOS',
  lastUpdate: 'ULTIMA ACTUALIZACION',
} as const;

type HeaderKey = keyof typeof HEADERS;

function headerIndex(headers: string[]): Record<HeaderKey, number> {
  const lookup = new Map(headers.map((header, index) => [header.trim().toUpperCase(), index]));

  const read = (name: string): number => {
    const found = lookup.get(name);
    if (found === undefined) {
      throw new Error(`El ranking no incluye la columna ${name}`);
    }
    return found;
  };

  return {
    position: read(HEADERS.position),
    name: read(HEADERS.name),
    points: read(HEADERS.points),
    hcp: read(HEADERS.hcp),
    tournaments: read(HEADERS.tournaments),
    origin: read(HEADERS.origin),
    card15: read(HEADERS.card15),
    pointsLost: read(HEADERS.pointsLost),
    card16: read(HEADERS.card16),
    changes: read(HEADERS.changes),
    lastUpdate: read(HEADERS.lastUpdate),
  };
}

function cell(row: string[], index: number): string {
  return (row[index] ?? '').trim();
}

function parseDecimal(raw: string): number | null {
  if (raw === '') {
    return null;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function parseInteger(raw: string): number | null {
  if (raw === '') {
    return null;
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return null;
  }

  return value;
}

function toPlayer(row: string[], columns: Record<HeaderKey, number>): Player | null {
  if (row.every((value) => value.trim() === '')) {
    return null;
  }

  const name = cell(row, columns.name);
  const position = parseInteger(cell(row, columns.position));

  if (name === '' && position === null) {
    return null;
  }

  const lastUpdate = cell(row, columns.lastUpdate);

  return {
    position,
    name,
    points: parseDecimal(cell(row, columns.points)),
    hcp: parseInteger(cell(row, columns.hcp)),
    tournaments: parseInteger(cell(row, columns.tournaments)),
    origin: cell(row, columns.origin),
    card15: parseDecimal(cell(row, columns.card15)),
    pointsLost: parseDecimal(cell(row, columns.pointsLost)),
    card16: parseDecimal(cell(row, columns.card16)),
    changes: parseInteger(cell(row, columns.changes)),
    lastUpdate: lastUpdate || null,
    columns: row.map((value) => value.trim()),
  };
}

export function parseRankingCsv(csv: string): { ranking: Player[]; lastUpdate: string } {
  const rows = parseCsv(csv).filter((row) => row.some((value) => value.trim() !== ''));

  if (rows.length === 0) {
    throw new Error('El ranking recibido está vacío');
  }

  const [headerRow, ...dataRows] = rows;
  const columns = headerIndex(headerRow);
  const ranking: Player[] = [];

  for (const row of dataRows) {
    const player = toPlayer(row, columns);
    if (player) {
      ranking.push(player);
    }
  }

  const lastUpdate = ranking.find((player) => player.lastUpdate)?.lastUpdate ?? '';

  return {
    ranking,
    lastUpdate,
  };
}

export async function getRanking(): Promise<{ ranking: Player[]; lastUpdate: string }> {
  const response = await fetch(SHEET_URL);

  if (!response.ok) {
    throw new Error(`No se pudo obtener el ranking (HTTP ${response.status})`);
  }

  return parseRankingCsv(await response.text());
}
