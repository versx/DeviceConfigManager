import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useStyles } from '..';

export const LogDetails = (props: any) => {
  const { log } = props;
  const theme = useTheme();
  const classes = useStyles(theme);

  const formattedDate = new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(log.date));
  const logMessage = `[${formattedDate}] ${log.message}`;

  return (
    <div style={classes.logItem}>
      {/*
      <Tooltip
        title={logMessage}
        placement="right-start"
      >
      */}
        <Typography variant="body2" style={classes.logContent}>
          {logMessage}
        </Typography>
      {/*</div></Tooltip>*/}
    </div>
  );
};