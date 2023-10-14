import { Buffer } from 'buffer';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Card,
  Container,
  Divider,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

import { DeviceDetails, LineChart } from '../components';
import { SettingKeys } from '../consts';
import { useServerSettings } from '../hooks';
import { DeviceService } from '../services';
import { Device, DeviceStat } from '../types';

// @ts-ignore
window.Buffer = Buffer;

export const DeviceManagerPage = () => {
  const { uuid } = useParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>('none');
  const [response, setResponse] = useState<any>('');
  const [error, setError] = useState<string | null>('');
  const [screenshot, setScreenshot] = useState<string>();

  const [deviceStats, setDeviceStats] = useState<DeviceStat[]>([]);
  //const [date, setDate] = useState('');

  const { settings } = useServerSettings();
  const remoteAgentUrls = settings[SettingKeys.AgentUrls]?.split(',') ?? [];
  const deviceDetails = devices.find(device => device.ipAddr === selectedDevice);

  ChartJS.register(
    ArcElement, BarElement, CategoryScale,
    Filler, Legend, LinearScale,
    LineElement, PointElement,
    Title, Tooltip,
  );

  const handleReloadStats = useCallback(() => {
    DeviceService.getDeviceStats(uuid!, '').then((response: any) => {
      if (response?.status !== 'ok') {
        enqueueSnackbar(`Failed to fetch device stats with error: ${response?.error}`, { variant: 'error' });
        return;
      }
      setDeviceStats(response.stats);
    });
  }, [uuid]);

  const handleReload = useCallback(() => {
    DeviceService.getDevices().then((response: any) => {
      if (response?.status !== 'ok') {
        return;
      }

      setDevices(response.devices);
      const selected = response.devices.find((device: Device) => device.uuid === uuid);
      setSelectedDevice(selected?.ipAddr ? selected.ipAddr : 'none');
    });

    handleReloadStats();
  }, [uuid, handleReloadStats]);

  useEffect(() => handleReload(), [handleReload]);

  return (
    <Container>
      <Typography
        id="tableTitle"
        variant="h4"
        gutterBottom
        sx={{ flex: '1 1 100%', marginBottom: 4 }}
        style={{ textAlign: 'center' }}
      >
        Manage Device {uuid}
      </Typography>

      {/*
      <TextField
        //fullWidth
        margin="normal"
        label="Date"
        type="date"
        value={date ? formatDate(new Date(date)) : ''}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={e => handleDateChange(e.target.value)}
        style={{
          marginBottom: 10,
        }}
      />
      */}
      <LineChart
        title="Device Restart History"
        stats={deviceStats}
      />

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        {/* Control Panel */}
        <Card elevation={3} style={{ flex: 1, padding: '16px' }}>
          <Select
            fullWidth
            value={selectedDevice || 'none'}
            variant="outlined"
            size="small"
            onChange={(e) => setSelectedDevice(e.target.value as string)}
          >
            <MenuItem key="none" value="none" selected disabled>Select a device</MenuItem>
            {devices.map((device: Device, index: number) => (
              <MenuItem key={index} value={device.ipAddr!}>{device.uuid}</MenuItem>
            ))}
          </Select>
          <br />

          <ButtonGroup
            variant="contained"
            aria-label="outlined primary button group"
            size="small"
            style={{ marginTop: 8, marginBottom: 8 }}
          >
            <Button
              variant="contained"
              onClick={async () => {
                const response = await DeviceService.sendDeviceRequest(selectedDevice!, 8080, 'screen');
                if (response?.error) {
                  setError(response.message);
                } else {
                  setError('');
                  setScreenshot(response.data);
                }
              }}
            >
              Screenshot
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                const response = await DeviceService.sendDeviceRequest(selectedDevice!, 8080, 'account');
                if (response?.error) {
                  setError(response.message);
                } else {
                  setError('');
                  setResponse(response.data);
                }
              }}
            >
              Account
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                const response = await DeviceService.sendDeviceRequest(selectedDevice!, 8080, 'restart');
                if (response?.error) {
                  setError(response.message);
                } else {
                  setError('');
                  setResponse(response.data);
                }
              }}
            >
              Restart Game
            </Button>
            <Button
              variant="contained"
              onClick={async () => await DeviceService.sendAgentRequest({ type: 'reboot', device: uuid }, remoteAgentUrls)}
            >
              Reboot Device
            </Button>
          </ButtonGroup>
        </Card>

        {/* Device Details */}
        <Card elevation={3} style={{ minWidth: '280px', maxWidth: '320px' }}>
          <DeviceDetails device={deviceDetails!} />
        </Card>
      </div>

      {/* Response and Screenshot */}
      {response && 
        <Card elevation={3} style={{ marginBottom: '16px', padding: '16px' }}>
          <Typography variant="h6">Response</Typography>
          <Divider style={{ marginBottom: '8px' }} />
          <Typography variant="body1">{JSON.stringify(response)}</Typography>
        </Card>
      }
      {screenshot && 
        <Card elevation={3} style={{ marginBottom: '16px', padding: '16px' }}>
          <Typography variant="h6">Screenshot</Typography>
          <Divider style={{ marginBottom: '8px' }} />
          <img src={screenshot} alt="Device Screenshot" width="auto" height="550" />
        </Card>
      }
      {error && <Typography color="error">{error}</Typography>}
    </Container>
  );
};