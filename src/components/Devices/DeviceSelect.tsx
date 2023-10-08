import {
  Autocomplete,
  TextField,
} from '@mui/material';

import { Device } from '../../types';

interface DeviceSelectProps {
  devices: Device[];
  selectedDevices: string[];
  placeholder?: string;
  onDeviceChange: (uuids: string[]) => void;
};

export const DeviceSelect = (props: DeviceSelectProps) => {
  const {
    devices, selectedDevices, placeholder = 'Select Device',
    onDeviceChange,
  } = props;

  return (
    <Autocomplete
      value={selectedDevices}
      fullWidth
      multiple
      onChange={(event: any, newValue: string[]) => onDeviceChange(newValue)}
      options={devices.map((device: Device) => device.uuid)}
      renderInput={(params: any) => (
        <TextField
          {...params}
          label={placeholder}
          variant="outlined"
          fullWidth
        />
      )}
      style={{
        marginBottom: 8,
      }}
    />
  );
};