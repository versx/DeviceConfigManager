
import {
  Card,
  CardActions,
  CardContent,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Theme, useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';

import { IOSSwitch } from '..';
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

interface ConfigCardProps {
  config: Config;
  onView: (config: Config) => void;
  onEdit: (config: Config) => void;
  onDelete: (name: string) => void;
  onReload: () => void;
};

export const ConfigCard = (props: ConfigCardProps) => {
  const { config, onView, onEdit, onDelete, onReload } = props;

  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const classes = useStyles(theme);

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
    <Tooltip
      title={`Click or tap to view device config ${config.name}`}
      placement="left-start"
      arrow
    >
    <Card
      variant="elevation"
      elevation={3}
      style={{...classes.card, borderRadius: 16}}
    >
      <Container component={Paper} elevation={3}>
        <CardContent>
          <Grid container spacing={0}>
            <Grid item xs={8}>
              <Typography gutterBottom variant="h5" component="h2">
                {config.name}
              </Typography>
            </Grid>
            <Grid item xs={4} container style={{justifyContent: 'flex-end'}}>
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
            <Grid item xs={12} style={{marginBottom: 8}}>
              <Typography variant="body2" color="textSecondary" component="p">
                {config.provider}
              </Typography>
            </Grid>
            <Grid item xs={12} style={{marginBottom: 8}}>
              <Typography variant="body2" color="textSecondary" component="p">
                Backend URL:<br />
                {config.backendUrl}
              </Typography>
            </Grid>
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
              <IconButton size="small" onClick={() => onView(config)}>
                <ViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Config" arrow>
              <IconButton color="primary" size="small" onClick={() => onEdit(config)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Config" arrow>
              <IconButton color="error" size="small" onClick={() => onDelete(config.name)}>
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
    </Tooltip>
  );
};