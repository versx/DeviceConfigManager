import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';

import { StorageKeys } from '../consts';
import { http, toArr, toArr2, toObj } from '../modules';
import { SettingsService } from '../services';
import { ServerSettings } from '../types';

export const useServerSettings = () => {
  const [settingsState, setSettingsState] = useState<ServerSettings>(() => {
    const cachedSettings = localStorage.getItem(StorageKeys.ServerSettings);
    return cachedSettings ? JSON.parse(cachedSettings) : null;
  });
  const { enqueueSnackbar } = useSnackbar();

  const setSetting = async (name: string, value: any) => {
    const settingsArr = toArr(settingsState, name, value);
    const response = await SettingsService.setSettings(settingsArr);
    if (response.status !== 'ok') {
      enqueueSnackbar(`Failed to update settings with error: ${response.error}`, { variant: 'error' });
      return;
    }

    const settingsObj = toObj(response.settings);
    setSettingsState(settingsObj);
    enqueueSnackbar(`Updated settings successfully.`, { variant: 'success' });
  };

  const setSettings = async (settings: ServerSettings) => {
    const settingsArr = toArr2(settings);
    const response = await SettingsService.setSettings(settingsArr);
    if (response.status !== 'ok') {
      enqueueSnackbar(`Failed to update settings with error: ${response.error}`, { variant: 'error' });
      return;
    }

    const settingsObj = toObj(response.settings);
    setSettingsState(settingsObj);
    enqueueSnackbar(`Updated settings successfully.`, { variant: 'success' });
  };

  const fetchSettings = useCallback(() => {
    const options = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'If-None-Match': localStorage.getItem(StorageKeys.SettingsETag) as string | undefined,
      },
    };
    http()
      .get('settings', options)
      .then(({ data, headers }) => {
        if (data.status !== 'ok') {
          enqueueSnackbar(`Failed to fetch settings with error: ${data.error}`, { variant: 'error' });
          return;
        }

        const settingsObj = toObj(data.settings);
        setSettingsState(settingsObj);
        localStorage.setItem(StorageKeys.ServerSettings, JSON.stringify(settingsObj));

        const etag = headers.etag?.toString();
        localStorage.setItem(StorageKeys.SettingsETag, etag);
      })
      .catch((err: any) => {
        // 304 is not an error
        if (err.response?.status !== 304) {
          console.error(err);
        }
      });
  }, [enqueueSnackbar]);

  useEffect(() => fetchSettings(), [fetchSettings]);

  return {
    settings: settingsState,
    setSetting,
    setSettings,
  };
};