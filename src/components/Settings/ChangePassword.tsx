import React, { useState } from 'react';
import {
  Button,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { AuthService, UserService } from '../../services';
import { getUserToken } from '../../stores';

export const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = getUserToken();

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match');
      return;
    }

    const response = await UserService.changePassword(currentUser?.id, currentPassword, confirmPassword);
    if (response.status !== 'ok') {
      enqueueSnackbar('Failed to change the password to your user account.', { variant: 'error' });
      return;
    }

    enqueueSnackbar('Password changed successfully! Logging your out now.', { variant: 'success' });
    AuthService.logout();
  };

  return (
    <>
      <TextField
        fullWidth
        type="password"
        label="Current Password"
        variant="outlined"
        value={currentPassword}
        onChange={e => setCurrentPassword(e.target.value)}
        style={{ marginBottom: '15px' }}
      />
      <TextField
        fullWidth
        type="password"
        label="New Password"
        variant="outlined"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        style={{ marginBottom: '15px' }}
      />
      <TextField
        fullWidth
        type="password"
        label="Confirm New Password"
        variant="outlined"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        error={Boolean(error)}
        helperText={error}
        style={{ marginBottom: '20px' }}
      />
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleSubmit}
      >
        Change Password
      </Button>
    </>
  );
};