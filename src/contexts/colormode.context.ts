import { createContext, useContext } from 'react';

import { DefaultUserTheme } from '../consts';
import { ThemeColorMode } from '../types';

export const ColorModeContext = createContext({
  mode: DefaultUserTheme,
  prefersDarkMode: false,
  toggleColorMode: () => {},
  setColorMode: (mode: ThemeColorMode) => {},
});

export const useColorMode = () => useContext(ColorModeContext);