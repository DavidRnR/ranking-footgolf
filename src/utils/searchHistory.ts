/**
 * Search is the only piece of state stored in the URL.
 *
 * The list/table switch stays in memory. Below 1366px the table is hidden, so
 * a `view` query would not match what a phone shows, and Back would toggle
 * layout instead of stepping through searches or leaving the app.
 *
 * A typing burst pushes once, on the first change, so the previous search
 * remains behind it. Later keystrokes replace that same entry. After a pause
 * the burst closes and the next change pushes again. Deleting back to the
 * term the burst started from drops the draft (`discard`) instead of leaving
 * two identical entries.
 */

export const SEARCH_PARAM = 'search';

/** Workbox NavigationRoute tests pathname + search. This matches both `/` and `/ranking-footgolf/?search=`. */
export const APP_SHELL_NAVIGATION = /^\//;

export const SEARCH_HISTORY_PAUSE_MS = 300;

export type HistoryWrite = 'push' | 'replace' | 'discard' | 'none';

export interface HistoryDecision {
  write: HistoryWrite;
  term: string;
}

export function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

export function readSearchParam(search: string): string {
  return normalizeSearchTerm(new URLSearchParams(search).get(SEARCH_PARAM) ?? '');
}

/** Keeps the path (including a GitHub Pages base), hash, and every param other than `search`. */
export function applySearchParam(href: string, searchTerm: string): string {
  const url = new URL(href);
  const term = normalizeSearchTerm(searchTerm);
  if (term) {
    url.searchParams.set(SEARCH_PARAM, term);
  } else {
    url.searchParams.delete(SEARCH_PARAM);
  }
  return url.href;
}

export function isAppShellNavigation(pathnameAndSearch: string): boolean {
  return APP_SHELL_NAVIGATION.test(pathnameAndSearch);
}

export class SearchHistory {
  /** Term represented by the current history entry. */
  term: string;
  private burstOpen = false;
  private baseline = '';

  constructor(initialTerm: string) {
    this.term = normalizeSearchTerm(initialTerm);
    this.baseline = this.term;
  }

  onType(raw: string): HistoryDecision {
    const next = normalizeSearchTerm(raw);

    if (!this.burstOpen) {
      if (next === this.term) {
        return { write: 'none', term: this.term };
      }
      this.baseline = this.term;
      this.burstOpen = true;
      this.term = next;
      return { write: 'push', term: next };
    }

    if (next === this.baseline) {
      this.term = this.baseline;
      this.burstOpen = false;
      return { write: 'discard', term: this.baseline };
    }

    if (next === this.term) {
      return { write: 'none', term: this.term };
    }

    this.term = next;
    return { write: 'replace', term: next };
  }

  /** Closes the burst so the next edit creates a new history entry. */
  onPause(): HistoryDecision {
    this.burstOpen = false;
    this.baseline = this.term;
    return { write: 'none', term: this.term };
  }

  /** Browser Back/Forward. The URL wins; this does not write history. */
  onPopState(raw: string): string {
    const next = normalizeSearchTerm(raw);
    this.term = next;
    this.baseline = next;
    this.burstOpen = false;
    return next;
  }
}
