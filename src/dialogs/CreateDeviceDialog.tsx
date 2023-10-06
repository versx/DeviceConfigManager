import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';

import { ConfigSelect } from '../components';
import { Config, Device } from '../types';

type CreateDeviceDialogProps = {
  open: boolean;
  device?: Device; // If provided, we're editing an existing device
  configs: Config[];
  onClose: () => void;
  onSave: (isNew: boolean, device: Device) => void;
};

export const CreateDeviceDialog = (props: CreateDeviceDialogProps) => {
  const { open, configs, device, onClose, onSave } = props;
  const [localDevice, setLocalDevice] = useState<Device>({
    uuid: device ? device.uuid : '',
    config: device ? device.config : null,
    model: device ? device.model : null,
    ipAddr: device ? device.ipAddr : null,
    iosVersion: device ? device.iosVersion : null,
    ipaVersion: device ? device.ipaVersion : null,
    notes: device ? device.notes : null,
    lastSeen: device ? device.lastSeen : null,
    enabled: device ? device.enabled : true
  });

  const handleSave = () => {
    if (!open || !localDevice) {
      return;
    }
    onSave(!device?.uuid, localDevice);
    onClose();
  };

  useEffect(() => {
    if (device) {
      setLocalDevice(device);
    }
  }, [device]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        {device ? 'Edit Device' : 'Create Device'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="UUID"
          value={localDevice.uuid || ''}
          onChange={e => setLocalDevice({ ...localDevice, uuid: e.target.value })}
          style={{ marginBottom: 22 }}
        />
        <ConfigSelect
          configs={configs}
          selectedConfig={localDevice.config || null}
          onConfigChange={configName => setLocalDevice({ ...localDevice, config: configName })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Model"
          value={localDevice.model || ''}
          onChange={e => setLocalDevice({ ...localDevice, model: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="IP Address"
          value={localDevice.ipAddr || ''}
          onChange={e => setLocalDevice({ ...localDevice, ipAddr: e.target.value })}
        />
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <TextField
          fullWidth
          margin="normal"
          label="iOS Version"
          value={localDevice.iosVersion || ''}
          onChange={e => setLocalDevice({ ...localDevice, iosVersion: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="IPA Version"
          value={localDevice.ipaVersion || ''}
          onChange={e => setLocalDevice({ ...localDevice, ipaVersion: e.target.value })}
        />
        </div>
        <TextField
          fullWidth
          margin="normal"
          label="Notes"
          value={localDevice.notes || ''}
          onChange={e => setLocalDevice({ ...localDevice, notes: e.target.value })}
        />
        {/* Consider using a date picker for the `lastSeen` property if you allow editing it */}
        <FormControlLabel
          control={<Switch checked={localDevice.enabled} onChange={e => setLocalDevice({ ...localDevice, enabled: e.target.checked })} />}
          label="Enabled"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};