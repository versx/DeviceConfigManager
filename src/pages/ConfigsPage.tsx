import React, { useCallback, useEffect, useState } from 'react';
import {
  Container,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { CardGrid } from '../components';
import { ConfigService } from '../services';
import { Config } from '../types';

export const ConfigsPage = () => {
  const [configs, setConfigs] = useState<Config[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const handleReloadConfigs = useCallback(() => {
    ConfigService.getConfigs().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Failed to load configs with error: ${response?.error}`, { variant: 'error' });
        return;
      }
      setConfigs(response.configs);
    });
  }, [enqueueSnackbar]);

  useEffect(() => handleReloadConfigs(), [handleReloadConfigs]);

  return (
    <Container>
      <Typography
        id="tableTitle"
        variant="h4"
        gutterBottom
        sx={{ flex: '1 1 100%' }}
        style={{textAlign: 'center'}}
      >
        Configs
      </Typography>

      <CardGrid
        configs={configs}
        onReload={handleReloadConfigs}
      />
    </Container>
  );
};