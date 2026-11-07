import React from 'react';

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
  mode: 'light',
  themePreference: 'system',
  setThemePreference: () => {},
});
