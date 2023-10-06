import React, { useState } from 'react';
import {
  Fab,
  Grid,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

import { ConfigCard } from '..';
import { CreateConfigDialog } from '../../dialogs';
import { ConfigService } from '../../services';
import { Config } from '../../types';

interface CardGridProps {
  configs: Config[];
  onReload: () => void;
};

interface CardGridModelState {
  open: boolean;
  editModel: Config | undefined;
};

export const CardGrid = (props: CardGridProps) => {
  const { configs, onReload } = props;
  const [modelState, setModelState] = useState<CardGridModelState>({
    open: false,
    editModel: undefined,
  });
  const { enqueueSnackbar } = useSnackbar();

  const handleOpen = () => setModelState({open: true, editModel: undefined});
  const handleClose = () => setModelState({open: false, editModel: undefined});

  const handleSubmit = async (isNew: boolean, config: Config) => {
    const response = isNew
      ? await ConfigService.createConfig(config)
      : await ConfigService.updateConfig(config.name, config);
    if (response?.status !== 'ok') {
      enqueueSnackbar(`Failed to ${isNew ? 'create' : 'update'} config with error: ${response?.error}`, { variant: 'error' });
      return;
    }

    enqueueSnackbar(`Config ${isNew ? 'created' : 'updated'} successfully!`, { variant: 'success' });
    setModelState({open: false, editModel: undefined});
    onReload();
  };

  const handleView = async (config: Config) => {
    console.log('handleView:', config);
  };

  const handleEdit = async (config: Config) => {
    setModelState({
      open: true,
      editModel: config,
    });
  };

  const handleDelete = async (name: string) => {
    const result = window.confirm(`Are you sure you want to delete config: ${name}?`);
    if (!result) {
      return;
    }

    const response = await ConfigService.deleteConfig(name);
    if (response?.status !== 'ok') {
      enqueueSnackbar(`Failed to delete config with error: ${response?.error}`, { variant: 'error' });
      return;
    }

    enqueueSnackbar(`Config deleted successfully!`, { variant: 'success' });
    onReload();
  };

  return (
    <Grid container spacing={4}>
      <Tooltip title="Create new device config" arrow>
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleOpen}
          style={{
            margin: '0px',
            top: 'auto',
            right: '32px',
            bottom: '32px',
            left: 'auto',
            position: 'fixed',
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {configs?.map((config: Config, index: number) => (
        <Grid item key={index} xs={12} sm={6} md={4}>
          <ConfigCard
            config={config}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReload={onReload}
          />
        </Grid>
      ))}

      <CreateConfigDialog
        open={modelState.open}
        config={modelState.editModel}
        onClose={handleClose}
        onSave={handleSubmit}
      />
    </Grid>
  );
};