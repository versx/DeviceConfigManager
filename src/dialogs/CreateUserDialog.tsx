import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { IOSSwitch } from '../components';
import { UserService } from '../services';
import { User } from '../types';

interface CreateUserDialogProps {
  open: boolean;
  editMode: boolean;
  model: User | undefined;
  onSubmit: () => void;
  onClose: () => void;
};

interface CreateUserDialogState {
  username: string;
  password: string;
  enabled: boolean;
  root: boolean;
};

export const CreateUserDialog = (props: CreateUserDialogProps) => {
  const { open, editMode = false, model, onSubmit, onClose } = props;

  const [state, setState] = useState<CreateUserDialogState>({
    username: editMode ? model?.username ?? '' : '',
    password: editMode ? model?.password ?? '' : '',
    enabled: editMode ? model?.enabled ?? true : true,
    root: editMode ? model?.root ?? false : false,
  });
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    const response = editMode
      ? await UserService.updateAccount(model?.id!, state)
      : await UserService.createAccount(state);
    if (response.status !== 'ok') {
      enqueueSnackbar(`Failed to ${editMode ? 'update' : 'create'} user account.`, { variant: 'error' });
      return;
    }

    setState({ username: '', password: '', root: false, enabled: true });
    onSubmit && onSubmit();
  };

  const handleClose = () => {
    setState({ username: '', password: '', root: false, enabled: true });
    onClose && onClose();
  };

  useEffect(() => {
    // Sync state with model prop when in edit mode and the model changes
    if (editMode && model) {
      setState({
        username: model?.username ?? '',
        password: model?.password ?? '',
        root: model?.root ?? false,
        enabled: model?.enabled ?? true,
      });
    }
  }, [editMode, model]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle align="center">
        {editMode
          ? 'Edit User Account'
          : 'Create User Account'
        }
      </DialogTitle>
      <DialogContent>
        <DialogContentText style={{ marginBottom: 10 }}>
          Setting the password field will change the password to whatever
          is specified. Leave it blank to keep the current password.
        </DialogContentText>
        <TextField
          error={!state.username}
          helperText={!state.username ? 'Username field is required.' : ''}
          fullWidth
          required
          label="Username"
          variant="outlined"
          value={state.username}
          onChange={e => setState({...state, username: e.target.value})}
          style={{
            marginBottom: 10,
          }}
        />
        <TextField
          error={!editMode && !state.password}
          helperText={!editMode && !state.password ? 'Password field is required.' : ''}
          fullWidth
          required={!editMode}
          multiline
          label="Password"
          variant="outlined"
          type="password"
          value={state.password}
          onChange={e => setState({...state, password: e.target.value})}
          style={{
            marginBottom: 10,
          }}
        />
        <FormControlLabel
          control={<IOSSwitch sx={{ m: 1 }} checked={state.enabled} onChange={(e => setState({...state, enabled: e.target.checked }))} />}
          label="Enabled"
        />
        <FormControlLabel
          control={<IOSSwitch sx={{ m: 1 }} checked={state.root} onChange={(e => setState({...state, root: e.target.checked }))} />}
          label="Is Root"
        />
      </DialogContent>
      <DialogActions style={{ padding: '20px', paddingTop: '0px' }}>
        <Button
          title="Cancel"
          color="inherit"
          variant="contained"
          size="small"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          title={editMode ? "Save changes to user account" : "Create user account"}
          color="primary"
          variant="contained"
          size="small"
          onClick={handleSubmit}
        >
          {editMode
            ? 'Save'
            : 'Create'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};