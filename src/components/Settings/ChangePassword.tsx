import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';

import { AuthService, UserService } from '../../services';
import { getUserToken } from '../../stores';

export const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = getUserToken();

  const [errors, setErrors] = useState({
    currentPassword: false,
    newPassword: false,
    newPasswordConfirm: false,
  });

  const handleSubmit = async () => {
    if (!currentPassword) {
      setErrors({...errors, currentPassword: true});
      return;
    } else {
      setErrors({...errors, currentPassword: false});
    }

    if (!newPassword) {
      setErrors({...errors, newPassword: true});
      return;
    } else {
      setErrors({...errors, newPassword: false});
    }

    if (!confirmPassword) {
      setErrors({...errors, newPasswordConfirm: true});
      return;
    } else {
      setErrors({...errors, newPasswordConfirm: false});
    }

    if (newPassword !== confirmPassword) {
      setErrors({...errors, newPassword: true, newPasswordConfirm: true});
      return;
    } else {
      setErrors({...errors, newPassword: false, newPasswordConfirm: false});
    }

    const response = await UserService.changePassword(currentUser?.id, currentPassword, confirmPassword);
    if (response?.status !== 'ok') {
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
        required
        type="password"
        label="Current Password"
        variant="outlined"
        value={currentPassword}
        error={!currentPassword && errors.currentPassword}
        helperText={!currentPassword && errors.currentPassword ? 'Current password field is required.' : ''}
        onChange={e => setCurrentPassword(e.target.value)}
        style={{ marginBottom: '15px' }}
      />
      <TextField
        fullWidth
        required
        type="password"
        label="New Password"
        variant="outlined"
        value={newPassword}
        error={!newPassword && errors.newPassword}
        helperText={!newPassword && errors.newPassword ? 'New password field is required.' : ''}
        onChange={e => setNewPassword(e.target.value)}
        style={{ marginBottom: '15px' }}
      />
      <TextField
        fullWidth
        required
        type="password"
        label="Confirm New Password"
        variant="outlined"
        value={confirmPassword}
        error={!confirmPassword && errors.newPasswordConfirm}
        helperText={!confirmPassword && errors.newPasswordConfirm ? 'Confirm new password field is required.' : ''}
        onChange={e => setConfirmPassword(e.target.value)}
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