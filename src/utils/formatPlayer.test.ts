import { describe, expect, it } from 'vitest';
import { formatPlayerField } from './formatPlayer';

describe('formatPlayerField', () => {
  it('prints decimal fields with two fraction digits and integers without them', () => {
    expect(formatPlayerField('points', 2317.9)).toBe('2317.90');
    expect(formatPlayerField('hcp', 0)).toBe('0');
    expect(formatPlayerField('changes', -2)).toBe('-2');
  });

  it('renders missing values as an empty string', () => {
    expect(formatPlayerField('points', null)).toBe('');
    expect(formatPlayerField('origin', '')).toBe('');
  });
});
