import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';

import { Config } from '../types';

interface CreateConfigDialogProps {
  open: boolean;
  config?: Config;
  onClose: () => void;
  onSave: (isNew: boolean, config: Config) => void;
};

export const CreateConfigDialog = (props: CreateConfigDialogProps) => {
  const { open, config, onClose, onSave } = props;
  const [localConfig, setLocalConfig] = useState<Config>(config || { 
    name: '',
    provider: '',
    backendUrl: '',
    dataEndpoints: [],
    bearerToken: null,
    default: false,
    enabled: true,
  });

  const handleSave = () => {
    if (!open || !localConfig) {
      return;
    }
    onSave(!config?.name, localConfig);
    onClose();
  };

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">
        {config
          ? 'Edit Config'
          : 'Add New Config'
        }
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {config ?
            'Modify the configuration details below.'
            : 'Fill out the details for the new configuration.'
          }
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          value={localConfig?.name}
          onChange={(e) => setLocalConfig({ ...localConfig, name: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Provider"
          type="text"
          fullWidth
          value={localConfig?.provider}
          onChange={(e) => setLocalConfig({ ...localConfig, provider: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Backend URL"
          type="text"
          fullWidth
          value={localConfig?.backendUrl}
          onChange={(e) => setLocalConfig({ ...localConfig, backendUrl: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Data Endpoints (comma-separated)"
          type="text"
          fullWidth
          value={localConfig?.dataEndpoints.join(', ')}
          onChange={(e) => setLocalConfig({ ...localConfig, dataEndpoints: e.target.value.split(', ') })}
        />
        <TextField
          margin="dense"
          label="Bearer Token"
          type="text"
          fullWidth
          value={localConfig?.bearerToken || ''}
          onChange={(e) => setLocalConfig({ ...localConfig, bearerToken: e.target.value })}
        />
        <FormControlLabel
          control={
            <Switch
              checked={localConfig?.default}
              onChange={(e) => setLocalConfig({ ...localConfig, default: e.target.checked })}
              color="primary"
            />
          }
          label="Default"
        />
        <FormControlLabel
          control={
            <Switch
              checked={localConfig?.enabled}
              onChange={(e) => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
              color="primary"
            />
          }
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