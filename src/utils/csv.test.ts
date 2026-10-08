import { describe, expect, it } from 'vitest';
import { parseCsv } from './csv';

describe('parseCsv', () => {
  it('keeps commas that sit inside quotes', () => {
    const rows = parseCsv('POS,JUGADOR\n1,"GARCIA, JUAN"\n');

    expect(rows).toEqual([
      ['POS', 'JUGADOR'],
      ['1', 'GARCIA, JUAN'],
    ]);
  });

  it('keeps newlines and escaped quotes inside a field', () => {
    const rows = parseCsv('name\n"Line\nBreak ""Hi"""\n');

    expect(rows[1]).toEqual(['Line\nBreak "Hi"']);
  });

  it('accepts CRLF rows and a leading BOM', () => {
    const rows = parseCsv('\uFEFFA,B\r\n1,2\r\n');

    expect(rows).toEqual([
      ['A', 'B'],
      ['1', '2'],
    ]);
  });

  it('returns an empty list for an empty file', () => {
    expect(parseCsv('')).toEqual([]);
    expect(parseCsv('\n')).toEqual([['']]);
  });
});
