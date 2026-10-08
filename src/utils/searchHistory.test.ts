import { describe, expect, it } from 'vitest';
import {
  SearchHistory,
  applySearchParam,
  isAppShellNavigation,
  readSearchParam,
  type HistoryDecision,
} from './searchHistory';

function replay(initial: string, raws: string[]) {
  const history = new SearchHistory(initial);
  const stack = [history.term];
  let index = 0;
  const writes: HistoryDecision['write'][] = [];

  for (const raw of raws) {
    const decision = history.onType(raw);
    writes.push(decision.write);
    if (decision.write === 'push') {
      stack.splice(index + 1);
      stack.push(decision.term);
      index += 1;
    } else if (decision.write === 'replace') {
      stack[index] = decision.term;
    } else if (decision.write === 'discard') {
      index -= 1;
      history.onPopState(stack[index] ?? '');
    }
  }

  return { history, stack, index, writes };
}

describe('SearchHistory', () => {
  it('pushes once for a fast "luc" burst and replaces the rest', () => {
    const { stack, writes, history } = replay('', ['l', 'lu', 'luc']);

    expect(writes).toEqual(['push', 'replace', 'replace']);
    expect(stack).toEqual(['', 'luc']);
    expect(history.term).toBe('luc');

    history.onPause();
    const next = history.onType('luca');
    expect(next).toEqual({ write: 'push', term: 'luca' });
  });

  it('does not add an entry when the normalized term is unchanged', () => {
    const history = new SearchHistory('luc');

    expect(history.onType('  LUC  ')).toEqual({ write: 'none', term: 'luc' });
    expect(history.onType('luc')).toEqual({ write: 'none', term: 'luc' });
  });

  it('drops a draft that is deleted back to the previous term', () => {
    const session = replay('', ['l', 'lu', 'luc']);
    session.history.onPause();
    const push = session.history.onType('luca');
    if (push.write === 'push') {
      session.stack.splice(session.index + 1);
      session.stack.push(push.term);
      session.index += 1;
    }
    const discard = session.history.onType('luc');

    expect(push).toEqual({ write: 'push', term: 'luca' });
    expect(discard).toEqual({ write: 'discard', term: 'luc' });
    expect(session.history.term).toBe('luc');

    const cancelled = replay('', ['l', '']);
    expect(cancelled.writes).toEqual(['push', 'discard']);
    expect(cancelled.index).toBe(0);
    expect(cancelled.history.term).toBe('');
  });

  it('steps back through committed searches, including the unfiltered entry', () => {
    const history = new SearchHistory('');
    const stack = [''];
    let index = 0;

    const apply = (decision: HistoryDecision) => {
      if (decision.write === 'push') {
        stack.splice(index + 1);
        stack.push(decision.term);
        index += 1;
      } else if (decision.write === 'replace') {
        stack[index] = decision.term;
      }
    };

    apply(history.onType('lu'));
    history.onPause();
    apply(history.onType('luc'));
    history.onPause();

    expect(stack).toEqual(['', 'lu', 'luc']);

    index -= 1;
    expect(history.onPopState(stack[index] ?? '')).toBe('lu');
    index -= 1;
    expect(history.onPopState(stack[index] ?? '')).toBe('');
    expect(index).toBe(0);

    const again = history.onType('x');
    expect(again.write).toBe('push');
  });

  it('pushes an empty search when a committed term is cleared', () => {
    const history = new SearchHistory('luc');

    expect(history.onType('')).toEqual({ write: 'push', term: '' });
    expect(history.onPause()).toEqual({ write: 'none', term: '' });
  });

  it('adopts a deep-linked term without writing history', () => {
    const history = new SearchHistory('  Ghezzi ');

    expect(history.term).toBe('ghezzi');
    expect(history.onType('ghezzi')).toEqual({ write: 'none', term: 'ghezzi' });
    expect(history.onPopState('')).toBe('');
    expect(history.onType('mosconi').write).toBe('push');
  });
});

describe('search query URLs', () => {
  it('reads and writes ?search= under the Pages base', () => {
    expect(readSearchParam('?search=Luc')).toBe('luc');
    expect(readSearchParam('')).toBe('');

    const href = applySearchParam('https://davidrnr.github.io/ranking-footgolf/#ranking', '  GARCIA Juan ');
    const url = new URL(href);

    expect(url.pathname).toBe('/ranking-footgolf/');
    expect(url.searchParams.get('search')).toBe('garcia juan');
    expect(url.hash).toBe('#ranking');
  });

  it('removes ?search= and keeps unrelated params', () => {
    const href = applySearchParam('https://davidrnr.github.io/ranking-footgolf/?search=luc&utm_source=ig', '');
    const url = new URL(href);

    expect(url.pathname).toBe('/ranking-footgolf/');
    expect(url.searchParams.has('search')).toBe(false);
    expect(url.searchParams.get('utm_source')).toBe('ig');
  });

  it('treats navigations that carry ?search= as the app shell', () => {
    expect(isAppShellNavigation('/ranking-footgolf/')).toBe(true);
    expect(isAppShellNavigation('/ranking-footgolf/?search=luc')).toBe(true);
    expect(isAppShellNavigation('/?search=ghezzi')).toBe(true);
    expect(isAppShellNavigation('/ranking-footgolf/index.html?search=luc')).toBe(true);
  });
});
