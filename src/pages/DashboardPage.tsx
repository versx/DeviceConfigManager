import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import {
  DevicesOther as DevicesOtherIcon,
  EventNote as EventNoteIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { ConfigService, DeviceService, ScheduleService } from '../services';
import { Config, Device, Schedule } from '../types';

export const DashboardPage = () => {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const handleReload = useCallback(() => {
    ScheduleService.getSchedules().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Failed to get schedules with error: ${response?.error}`, { variant: 'error' });
        return;
      }

      setSchedules(response.schedules);
    });

    ConfigService.getConfigs().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Failed to get configs with error: ${response?.error}`, { variant: 'error' });
        return;
      }

      setConfigs(response.configs);
    });

    DeviceService.getDevices().then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Failed to get devices with error: ${response?.error}`, { variant: 'error' });
        return;
      }

      setDevices(response.devices);
    });
  }, [enqueueSnackbar]);

  useEffect(() => handleReload(), [handleReload]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom style={{textAlign: 'center'}}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <DashboardItem
            title="Total Configs"
            value={configs.length.toLocaleString()}
            icon={SettingsIcon}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <DashboardItem
            title="Total Devices"
            value={devices.length.toLocaleString()}
            icon={DevicesOtherIcon}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <DashboardItem
            title="Total Schedules"
            value={schedules.length.toLocaleString()}
            icon={EventNoteIcon}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export const DashboardItem = (props: any) => {
  const { title, value, icon } = props;
  const Icon = icon;

  return (
    <Card variant="outlined">
    <CardContent>
      <Typography variant="h4" align="center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Icon fontSize="large" style={{marginRight: 8}} />
        {value}
      </Typography>
      <Typography variant="h6" align="center">
        {title}
      </Typography>
    </CardContent>
  </Card>
  );
};