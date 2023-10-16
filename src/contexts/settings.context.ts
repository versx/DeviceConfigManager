import { createContext, useContext } from 'react';
import { Setting } from '../types';

export const SettingsContext = createContext({
  settings: [],
  getSettings: () => {},
  setSEttings: (settings: Setting[]) => {},
});

export const useSettings = () => useContext(SettingsContext);