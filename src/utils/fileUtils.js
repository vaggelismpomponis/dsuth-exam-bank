// Utility helpers for files: URL cleaning, filename extraction, period mapping,
// filtering and chronological sorting.

export const PERIODS = ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος', 'Επαναληπτική'];

// Mapping from various stored period values to Greek UI labels
export const periodDisplayMap = {
  'Ιανουάριος': 'Ιανουάριος',
  'Ιουνιος': 'Ιούνιος',
  'Ιούνιος': 'Ιούνιος',
  'Σεπτέμβριος': 'Σεπτέμβριος',
  'Σεπτεμβριος': 'Σεπτέμβριος',
  'Επαναληπτική': 'Επαναληπτική',
  Epanaliptiki: 'Επαναληπτική',
  Xeimerino: 'Ιανουάριος',
  'Χειμερινό': 'Ιανουάριος',
  Earino: 'Ιούνιος',
  'Εαρινό': 'Ιούνιος',
  September: 'Σεπτέμβριος',
  Septemvrios: 'Σεπτέμβριος',
};

export function toDisplayPeriod(value) {
  return periodDisplayMap[value] || value;
}

export function getCleanUrl(url) {
  return url ? url.trim().replace(/\?$/, '') : '';
}

export function getFilenameFromUrl(url) {
  const lastPart = url.split('/').pop().split('?')[0];
  return lastPart;
}

export function filterFiles(files, yearFilter, periodFilter) {
  return files.filter((f) => {
    const displayPeriod = toDisplayPeriod(f.period);
    return (
      (!yearFilter || String(f.year) === String(yearFilter)) &&
      (!periodFilter || displayPeriod === periodFilter)
    );
  });
}

export function getPeriodIndex(periodValue) {
  const idx = PERIODS.indexOf(toDisplayPeriod(periodValue));
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

export function sortFilesByChronology(files) {
  return [...files].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year; // ascending year
    return getPeriodIndex(a.period) - getPeriodIndex(b.period);
  });
}


