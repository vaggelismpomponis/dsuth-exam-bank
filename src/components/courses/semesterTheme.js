export const SEMESTER_THEMES = {
  1: { num: 1, label: '1ο Εξάμηνο', year: '1ο Έτος • Χειμερινό', color: '#1a73e8' },
  2: { num: 2, label: '2ο Εξάμηνο', year: '1ο Έτος • Εαρινό', color: '#0f9d58' },
  3: { num: 3, label: '3ο Εξάμηνο', year: '2ο Έτος • Χειμερινό', color: '#e37400' },
  4: { num: 4, label: '4ο Εξάμηνο', year: '2ο Έτος • Εαρινό', color: '#d93025' },
  5: { num: 5, label: '5ο Εξάμηνο', year: '3ο Έτος • Χειμερινό', color: '#7b1fa2' },
  6: { num: 6, label: '6ο Εξάμηνο', year: '3ο Έτος • Εαρινό', color: '#00897b' },
  7: { num: 7, label: '7ο Εξάμηνο', year: '4ο Έτος • Χειμερινό', color: '#3949ab' },
  8: { num: 8, label: '8ο Εξάμηνο', year: '4ο Έτος • Εαρινό', color: '#455a64' },
};

export const getSemesterTheme = (sem) => {
  const n = Number(sem);
  return SEMESTER_THEMES[n] || {
    num: n,
    label: `${sem}ο Εξάμηνο`,
    year: `Εξάμηνο ${sem}`,
    color: '#1a73e8',
  };
};

