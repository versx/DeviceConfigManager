import {
  ButtonGroup,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Article as LogsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material'

import { ActiveMenuItemColor } from '../../consts';
import { Config, Device, User } from '../../types';

export interface ActionsButtonGroupProps<T, TKey> {
  model: T;
  onEdit: (model: T) => void;
  onDelete: (id: TKey) => void;
  onViewLogs?: (event: any, id: TKey) => void;
}

export const ConfigActionsButtonGroup = (props: ActionsButtonGroupProps<Config, string>) => {
  const { model, onEdit, onDelete } = props;

  return (
    <ButtonGroup variant="outlined">
      <Tooltip title="Edit config" arrow>
        <IconButton
          size="small"
          onClick={() => onEdit(model)}
          style={{ color: ActiveMenuItemColor }}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete config" arrow>
        <IconButton
          size="small"
          onClick={() => onDelete(model.name)}
        >
          <DeleteIcon color="error" />
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );
};

export const DeviceActionsButtonGroup = (props: ActionsButtonGroupProps<Device, string>) => {
  const { model, onEdit, onDelete, onViewLogs } = props;

  return (
    <ButtonGroup variant="outlined">
      <Tooltip title="View device logs" arrow>
        <IconButton
          size="small"
          onClick={(e) => onViewLogs && onViewLogs(e, model.uuid)}
        >
          <LogsIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit device" arrow>
        <IconButton
          size="small"
          onClick={() => onEdit(model)}
          style={{ color: ActiveMenuItemColor }}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete device" arrow>
        <IconButton
          size="small"
          onClick={(e) => onDelete(model.uuid)}
        >
          <DeleteIcon color="error" />
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );
};

export const UserActionsButtonGroup = (props: ActionsButtonGroupProps<User, number>) => {
  const { model, onEdit, onDelete } = props;

  return (
    <ButtonGroup variant="outlined">
      <Tooltip title="Edit short URL" arrow>
        <IconButton
          size="small"
          onClick={() => onEdit(model)}
          style={{ color: ActiveMenuItemColor }}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete short URL" arrow>
        <IconButton
          size="small"
          onClick={() => onDelete(model.id!)}
        >
          <DeleteIcon color="error" />
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );
};