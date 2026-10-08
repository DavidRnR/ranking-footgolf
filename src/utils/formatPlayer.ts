import type { Player } from '@models/player';

const DECIMAL_FIELDS = new Set<keyof Player>(['points', 'card15', 'card16', 'pointsLost']);

export function formatPlayerField(field: keyof Player, value: Player[keyof Player]): string {
  if (value == null) {
    return '';
  }

  if (typeof value === 'number') {
    return DECIMAL_FIELDS.has(field) ? value.toFixed(2) : String(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.join(', ');
}
