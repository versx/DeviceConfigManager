import React, { useState } from 'react';
import {
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  FileCopy as FileCopyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { UserService } from '../../services';
import { clearUserToken, getUserToken, setUserToken } from '../../stores';

export const ApiKeyTextField = (props: any) => {
  const { initialValue } = props;
  const [apiKey, setApiKey] = useState(initialValue);
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = getUserToken();

  const resetApiKey = async () => {
    const result = window.confirm(`You are about to reset your API key, are you sure you want to do this?`);
    if (!result) {
      return;
    }

    const response = await UserService.resetApiKey(currentUser?.id);
    if (response.status !== 'ok') {
      enqueueSnackbar('Error occurred resetting API key!', { variant: 'error' });
      return;
    }

    clearUserToken();
    setUserToken({
      ...currentUser,
      apiKey: response.apiKey,
    });

    setApiKey(response.apiKey);
    enqueueSnackbar('API key was successfully reset!', { variant: 'success' });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    enqueueSnackbar('API key was successfully copied to the clipboard!', { variant: 'success' });
  };

  return (
    <TextField
      disabled
      fullWidth
      label="API Key"
      value={apiKey}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip title="Reset API Key" arrow>
              <IconButton onClick={resetApiKey}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy to Clipboard" arrow>
              <IconButton onClick={copyToClipboard}>
                <FileCopyIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
      variant="outlined"
      style={{ marginBottom: '15px' }}
    />
  );
};