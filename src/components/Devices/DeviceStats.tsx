import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { DeviceStat } from '../../types';

interface DeviceStatsProps {
  stats: DeviceStat[];
};

export const DeviceStats = (props: DeviceStatsProps) => {
  const { stats } = props;

  return (
    <Paper elevation={3} style={{ marginTop: 16 }}>
      <Typography variant="h6" style={{ textAlign: 'center', padding: '16px' }}>
        Device Restart Statistics
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Device UUID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Restarts</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats?.map((stat: DeviceStat, index: number) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">{stat.uuid}</TableCell>
              <TableCell>{new Date(stat.date).toLocaleDateString()}</TableCell>
              <TableCell align="right">{stat.restarts}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};