import { describe, it, expect } from 'vitest';
import {
  PERIODS,
  toDisplayPeriod,
  getCleanUrl,
  getFilenameFromUrl,
  filterFiles,
  sortFilesByChronology,
} from './fileUtils';

describe('file utils', () => {
  it('maps period values to Greek labels', () => {
    expect(toDisplayPeriod('Xeimerino')).toBe('Ιανουάριος');
    expect(toDisplayPeriod('Earino')).toBe('Ιούνιος');
    expect(toDisplayPeriod('Epanaliptiki')).toBe('Επαναληπτική');
    expect(toDisplayPeriod('Σεπτέμβριος')).toBe('Σεπτέμβριος');
  });

  it('cleans URL and extracts filename', () => {
    const url = 'https://example.com/exams/MathimatikiAnalisi_2024_Earino_Themata.pdf?';
    expect(getCleanUrl(url)).toBe('https://example.com/exams/MathimatikiAnalisi_2024_Earino_Themata.pdf');
    expect(getFilenameFromUrl(url)).toBe('MathimatikiAnalisi_2024_Earino_Themata.pdf');
  });

  it('filters by year and normalized period', () => {
    const files = [
      { year: 2024, period: 'Earino' },
      { year: 2024, period: 'Xeimerino' },
      { year: 2023, period: 'Epanaliptiki' },
    ];
    const res1 = filterFiles(files, 2024, 'Ιούνιος');
    expect(res1).toHaveLength(1);
    expect(res1[0].period).toBe('Earino');

    const res2 = filterFiles(files, '', 'Ιανουάριος');
    expect(res2).toHaveLength(1);
    expect(res2[0].period).toBe('Xeimerino');
  });

  it('sorts by year ascending and then by period order', () => {
    const files = [
      { year: 2024, period: 'Epanaliptiki' },
      { year: 2024, period: 'Earino' },
      { year: 2023, period: 'Xeimerino' },
    ];
    const sorted = sortFilesByChronology(files);
    expect(sorted.map((f) => `${f.year}-${toDisplayPeriod(f.period)}`)).toEqual([
      '2023-Ιανουάριος',
      '2024-Ιούνιος',
      '2024-Επαναληπτική',
    ]);
  });
});


