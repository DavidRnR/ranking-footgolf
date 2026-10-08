import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRanking, parseRankingCsv } from './rankingService';

const HEADER =
  'POS,JUGADOR,PUNTOS,HCP,TORNEOS,PROCEDENCIA,TARJETA 15,PUNTOS QUE PIERDE,TARJETA 16,CAMBIOS,ULTIMA ACTUALIZACION';

function sheet(rows: string[]): string {
  return [HEADER, ...rows].join('\n');
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('parseRankingCsv', () => {
  it('parses quoted commas and a quoted newline into player fields', () => {
    const parsed = parseRankingCsv(
      sheet(['1,"GARCIA, JUAN",2317.90,0,12,"TANDIL, BA",0.00,1.50,0.00,1,07/10/2026', '2,"Line\nBreak",10,,,,,,,-2,']),
    );

    expect(parsed.ranking).toHaveLength(2);
    expect(parsed.lastUpdate).toBe('07/10/2026');
    expect(parsed.ranking[0]).toMatchObject({
      position: 1,
      name: 'GARCIA, JUAN',
      origin: 'TANDIL, BA',
      points: 2317.9,
      hcp: 0,
      tournaments: 12,
      card15: 0,
      pointsLost: 1.5,
      changes: 1,
      lastUpdate: '07/10/2026',
    });
    expect(parsed.ranking[0].columns).toContain('GARCIA, JUAN');
    expect(parsed.ranking[1]).toMatchObject({
      name: 'Line\nBreak',
      points: 10,
      hcp: null,
      tournaments: null,
      origin: '',
      card15: null,
      pointsLost: null,
      card16: null,
      changes: -2,
      lastUpdate: null,
    });
  });

  it('turns invalid numbers into null and keeps whole-number decimals as integers', () => {
    const parsed = parseRankingCsv(sheet(['3,PEREZ,abc,1.00,1.5,CABA,nope,0, ,+4,']));

    expect(parsed.ranking[0]).toMatchObject({
      points: null,
      hcp: 1,
      tournaments: null,
      card15: null,
      pointsLost: 0,
      card16: null,
      changes: 4,
      lastUpdate: null,
    });
    expect(parsed.lastUpdate).toBe('');
  });

  it('skips rows that have neither a name nor a position', () => {
    const parsed = parseRankingCsv(sheet([',,,,,,,,,,']));

    expect(parsed.ranking).toEqual([]);
  });

  it('throws when the sheet is empty or a required column is missing', () => {
    expect(() => parseRankingCsv('')).toThrow(/vacío/);
    expect(() => parseRankingCsv('POS,JUGADOR\n1,ANA\n')).toThrow(/columna PUNTOS/);
  });
});

describe('getRanking', () => {
  it('throws when the sheet response is not ok and does not parse the body', async () => {
    const fetchMock = vi.fn(async () => new Response('<html>nope</html>', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getRanking()).rejects.toThrow('No se pudo obtener el ranking (HTTP 503)');
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('docs.google.com/spreadsheets'));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('output=csv'));
  });

  it('returns players from a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () => new Response(sheet(['1,GHEZZI MARCOS (47),2317.90,0,12,TANDIL (BA),0.00,0.00,0.00,0,07/10/2026'])),
      ),
    );

    const result = await getRanking();

    expect(result.lastUpdate).toBe('07/10/2026');
    expect(result.ranking[0]).toMatchObject({
      position: 1,
      name: 'GHEZZI MARCOS (47)',
      points: 2317.9,
      origin: 'TANDIL (BA)',
    });
  });
});
