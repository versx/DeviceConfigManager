import { Theme } from '@mui/material/styles';

export const useStyles: any = ((theme: Theme) => ({
  logsContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    maxHeight: 480,
    padding: theme.spacing(3),
  },
  logContent: {
    display: 'inline-block',
    //maxWidth: '90%',  // Adjust as needed
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    //textOverflow: 'ellipsis',
    fontSize: 12,
  },
  logItem: {
    //padding: theme.spacing(1),
    borderBottom: '1px solid rgba(128, 128, 128, 0.3)',
    display: 'flex',
    alignItems: 'center',
  },
  logLevel: {
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
  },
  controls: {
    marginBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
  },
}));