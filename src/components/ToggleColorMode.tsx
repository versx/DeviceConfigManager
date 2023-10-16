import React, { useMemo, useState } from 'react';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import App from '../App';
import { DefaultUserTheme, StorageKeys } from '../consts';
import { ColorModeContext } from '../contexts';
import { get, set } from '../modules';
import { ThemeColorMode } from '../types';

// Reference: https://mui.com/material-ui/customization/dark-mode/#toggling-color-mode
export const ToggleColorMode = () => {
  const cachedMode = get(StorageKeys.ColorMode, DefaultUserTheme);
  const [mode, setMode] = useState<ThemeColorMode>(cachedMode);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => {
        const newMode = prevMode === 'light' ? 'dark' : 'light';
        set(StorageKeys.ColorMode, newMode);
        return newMode;
      });
    },
    setColorMode: (theme: ThemeColorMode) => {
      setMode(theme);
      set(StorageKeys.ColorMode, theme);
    },
    prefersDarkMode,
    mode: mode,
  }), [mode, prefersDarkMode]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: mode === 'system'
      ? prefersDarkMode ? 'dark' : 'light'
      : mode,
    },
  }), [mode, prefersDarkMode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};