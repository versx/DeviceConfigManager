import {
  Card,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import moment from 'moment';

import { Never, NotAssigned, UnknownModel } from '../../consts';
import { Device } from '../../types';

interface DeviceDetailsProps {
  device: Device | null;
};

export const DeviceDetails = (props: DeviceDetailsProps) => {
  const { device } = props;
  if (!device) return null;

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6">Device Details</Typography>
        <Divider />
        <Typography variant="body1">
          <strong>UUID:</strong> {device.uuid}
        </Typography>
        <Typography variant="body1">
          <strong>Config:</strong> {device.config || NotAssigned}
        </Typography>
        <Typography variant="body1">
          <strong>Model:</strong> {device.model || UnknownModel}
        </Typography>
        <Typography variant="body1">
          <strong>iOS Version:</strong> {device.iosVersion || '--'}
        </Typography>
        <Typography variant="body1">
          <strong>IPA Version:</strong> {device.ipaVersion || '--'}
        </Typography>
        <Typography variant="body1">
          <strong>Last Seen:</strong> {device.lastSeen ? moment(device.lastSeen).calendar() : Never}
        </Typography>
        <Typography variant="body1">
          <strong>Enabled:</strong> {device.enabled ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body1">
          <strong>Notes:</strong> {device.notes || '--'}
        </Typography>
      </CardContent>
    </Card>
  );
};