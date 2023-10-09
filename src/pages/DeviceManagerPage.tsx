import { Buffer } from 'buffer';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Container,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

import { DefaultWebServerPort } from '../consts';
import { DeviceService } from '../services';
import { Device } from '../types';

// @ts-ignore
window.Buffer = Buffer;

const imageHeader = 'data:image/png;base64,';

export const DeviceManagerPage = () => {
  const { uuid } = useParams();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>('none');
  const [response, setResponse] = useState<any>('');
  const [error, setError] = useState<string | null>('');
  const [screenshot, setScreenshot] = useState<string>();

  const sendRequest = async (actionType: string) => {
    try {
      const url = `http://${selectedDevice}:${DefaultWebServerPort}/${actionType}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain; charset=x-user-defined',
        },
      });

      let responseData: string = '';
      switch (actionType) {
        case 'screen':
          const arrayBuffer = await response.arrayBuffer();
          if (arrayBuffer.byteLength <= 0) {
            setScreenshot(imageHeader);
            return;
          }

          const base64 = imageHeader + Buffer.from(arrayBuffer).toString('base64');
          setScreenshot(base64);
          // TODO: Send screenshot to backend to save
          break;
        case 'restart':
          responseData = await response.text();
          break;
        default:
          responseData = await response.json();
          break;
      }

      setResponse(responseData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReload = useCallback(() => {
    DeviceService.getDevices().then((response: any) => {
      if (response?.status !== 'ok') {
        return;
      }

      setDevices(response.devices);
      const selected = response.devices.find((device: Device) => device.uuid === uuid);
      setSelectedDevice(selected?.ipAddr ? selected.ipAddr : 'none');
    });
  }, [uuid]);

  useEffect(() => handleReload(), [handleReload]);

  return (
    <Container>
      <Typography
        id="tableTitle"
        variant="h4"
        gutterBottom
        sx={{ flex: '1 1 100%' }}
        style={{textAlign: 'center'}}
      >
        Manage Device {uuid}
      </Typography>

      <Select
        value={selectedDevice || 'none'}
        variant="outlined"
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
        style={{ marginTop: 8, marginBottom: 8 }}
      >
        <Button
          variant="contained"
          onClick={() => sendRequest('screen')}
        >
          Screenshot
        </Button>
        <Button
          variant="contained"
          onClick={() => sendRequest('account')}
        >
          Account
        </Button>
        <Button
          variant="contained"
          onClick={() => sendRequest('restart')}
        >
          Restart Game
        </Button>
        <Button
          variant="contained"
          onClick={() => sendRequest('reboot')}
        >
          Reboot Device
        </Button>
      </ButtonGroup>

      <br />
      {response && <Typography variant="body1">{JSON.stringify(response)}</Typography>}
      {<img src={screenshot} alt="" width="250" height="550" />}
      {error && <Typography color="error">{error}</Typography>}

    </Container>
  );
};