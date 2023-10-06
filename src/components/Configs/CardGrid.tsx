import React, { useState } from 'react';
import {
  Card,
  CardActions,
  CardContent,
  Container,
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Theme, useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';

import { IOSSwitch } from '..';
import { CreateConfigDialog } from '../../dialogs';
import { ConfigService } from '../../services';
import { Config } from '../../types';

const useStyles: any = (theme: Theme) => ({
  card: {
    borderRadius: 16,
  },
  element: {
    marginBottom: 15,
    marginRight: 0,
    //margin: theme.spacing(1, 0),
  },
  enabled: {
    display: 'flex',
    position: 'absolute',
    alignItems: 'end',
    justifyContent: 'end',
    whiteSpace: 'nowrap',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // optional, depends on your desired layout
  },
});

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
  const theme = useTheme();
  const classes = useStyles(theme);

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

  const setEnableConfig = async (config: Config, enabled: boolean) => {
    const response = await ConfigService.updateConfig(config.name, { ...config, enabled });
    if (response?.status !== 'ok') {
      enqueueSnackbar(`Failed to ${enabled ? 'enable' : 'disable'} config with error: ${response?.error}`, { variant: 'error' });
      return;
    }

    enqueueSnackbar(`Config ${enabled ? 'enabled' : 'disabled'} successfully!`, { variant: 'success' });
    onReload();
  };

  const setDefaultConfig = async (name: string) => {
    const response = await ConfigService.setDefaultConfig(name);
    if (response?.status !== 'ok') {
      enqueueSnackbar(`Failed to set default config with error: ${response?.error}`, { variant: 'error' });
      return;
    }

    enqueueSnackbar(`Config set as default successfully!`, { variant: 'success' });
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
          <Card style={classes.card}>
            <Container component={Paper} elevation={3}>
              <CardContent>
                <Grid container spacing={0}>
                  <Grid item xs={8}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {config.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} container justifyContent="flex-end">
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          sx={{ m: 1 }}
                          name="enabled"
                          checked={config.enabled}
                          size="small"
                          onChange={e => setEnableConfig(config, e.target.checked)}
                        />
                      }
                      label="Enabled"
                      style={{...classes.element, fontSize: 12}}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" component="p">
                      {config.provider}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Backend URL:<br />
                      {config.backendUrl}
                    </Typography>
                  </Grid>
                  <br />
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Data Endpoints:<br />
                      {config.dataEndpoints.map((endpoint: string, index: number) => (
                        endpoint.split(',').map((e: string, i: number) => (
                          <span key={i}>{e}<br /></span>
                        ))
                      ))}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" component="p">
                      {config.bearerToken}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions style={{ justifyContent: 'space-between', whiteSpace: 'nowrap' }}>
                <div style={{ flex: 1 }}>
                  <Tooltip title="View Config" arrow>
                    <IconButton color="primary" onClick={() => {
                        // TODO: Change view to when clicked
                        setModelState({
                          open: true,
                          editModel: config,
                        });
                      }}>
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Config" arrow>
                    <IconButton color="primary" onClick={() => {
                        setModelState({
                          open: true,
                          editModel: config,
                        });
                      }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Config" arrow>
                    <IconButton color="error" onClick={() => console.log('delete')}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </div>
                <FormControlLabel
                  control={
                    <IOSSwitch
                      sx={{ m: 1 }}
                      name="default"
                      checked={config.default}
                      size="small"
                      onChange={e => setDefaultConfig(config.name)}
                    />
                  }
                  label="Default"
                />
              </CardActions>
            </Container>
          </Card>
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