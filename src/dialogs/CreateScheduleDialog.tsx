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

import { ConfigSelect, DeviceSelect } from '../components';
import { formatDateForDateTimeInput } from '../modules';
import { Config, Device, Schedule } from '../types';

type CreateScheduleDialogProps = {
  open: boolean;
  configs: Config[];
  devices: Device[];
  schedule?: Schedule | null; // If provided, we're editing an existing device
  onClose: () => void;
  onSave: (isNew: boolean, device: Schedule) => void;
};

export const CreateScheduleDialog = (props: CreateScheduleDialogProps) => {
  const { open, configs, devices, schedule, onClose, onSave } = props;
  const [localSchedule, setLocalSchedule] = useState<Schedule>({
    name: schedule ? schedule.name : '',
    config: schedule ? schedule.config : '',
    startTime: schedule ? schedule.startTime : '',
    endTime: schedule ? schedule.endTime : '',
    uuids: schedule ? schedule.uuids ?? [] : [],
    timezoneOffset: schedule ? schedule.timezoneOffset : 0,
    nextConfig: schedule ? schedule.nextConfig : '',
    enabled: schedule ? schedule.enabled : true
  });

  const handleSave = () => {
    if (!open || !localSchedule) {
      return;
    }
    onSave(!schedule?.name, localSchedule);
    onClose();
  };

  useEffect(() => {
    if (schedule) {
      setLocalSchedule(schedule);
    }
  }, [schedule]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        {schedule ? 'Edit Schedule' : 'Create Schedule'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          value={localSchedule.name || ''}
          onChange={e => setLocalSchedule({ ...localSchedule, name: e.target.value })}
          style={{ marginBottom: 16 }}
        />
        <ConfigSelect
          configs={configs}
          selectedConfig={localSchedule.config || null}
          placeholder="Select Config"
          onConfigChange={configName => setLocalSchedule({ ...localSchedule, config: configName ?? '' })}
        />
        <DeviceSelect
          devices={devices}
          selectedDevices={localSchedule.uuids || null}
          placeholder="Select Device(s)"
          onDeviceChange={uuids => setLocalSchedule({ ...localSchedule, uuids: uuids ?? [] })}
        />
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <TextField
            fullWidth
            margin="normal"
            label="Start Time"
            type="datetime-local"
            value={localSchedule.startTime ? formatDateForDateTimeInput(new Date(localSchedule.startTime)) : ''}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={e => setLocalSchedule({ ...localSchedule, startTime: new Date(e.target.value) })}
            style={{
              marginBottom: 10,
            }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="End Time"
            type="datetime-local"
            value={localSchedule.endTime ? formatDateForDateTimeInput(new Date(localSchedule.endTime)) : ''}
            InputLabelProps={{
              shrink: true,
            }}
            onChange={e => setLocalSchedule({ ...localSchedule, endTime: new Date(e.target.value) })}
            style={{
              marginBottom: 10,
            }}
          />
        </div>
        <ConfigSelect
          configs={configs}
          selectedConfig={localSchedule.nextConfig || null}
          placeholder="Select Next Config"
          onConfigChange={configName => setLocalSchedule({ ...localSchedule, nextConfig: configName ?? '' })}
        />
        <FormControlLabel
          control={<Switch checked={localSchedule.enabled} onChange={e => setLocalSchedule({ ...localSchedule, enabled: e.target.checked })} />}
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