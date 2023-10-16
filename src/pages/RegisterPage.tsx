import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { DefaultEnableRegistration, Routes, SettingKeys } from '../consts';
import { useServerSettings } from '../hooks';
import { AuthService } from '../services';

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const { settings } = useServerSettings();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const from = location.state?.from || Routes.login;

  const enableRegister = settings
    ? parseInt(settings[SettingKeys.EnableRegistration] ?? DefaultEnableRegistration) !== 0
    : DefaultEnableRegistration;

  const [errors, setErrors] = useState({
    username: false,
    password: false,
    passwordConfirm: false,
  });

  const handleRegister = async () => {
    if (!username) {
      setErrors({ ...errors, username: true });
      return;
    }

    if (!password) {
      setErrors({ ...errors, password: true });
      return;
    }

    if (!passwordConfirm) {
      setErrors({ ...errors, passwordConfirm: true });
      return;
    }

    if (password !== passwordConfirm) {
      enqueueSnackbar('Both password fields must match!', { variant: 'error' });
      return;
    }

    const response = await AuthService.register(username, password);
    if (response.status !== 'ok') {
      enqueueSnackbar('Failed to register your user account!', { variant: 'error' });
      return;
    }

    enqueueSnackbar('Successfully registered your user account! Redirecting to login page.', { variant: 'success' });
    window.location.href = from;
  };

  return (
    <Container style={{ height: '35vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper
        style={{
          padding: '20px',
          width: '300px',
          border: '1px solid grey',
          borderRadius: '8px',
        }}
        onKeyUp={async (e) => {
          if (e.key === 'Enter') {
            handleRegister();
            return;
          }            
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Register
        </Typography>
        {!enableRegister ? (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <Typography variant="subtitle1" align="center">
              User account registration has been disabled by the administrator.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href={from}
              sx={{ mt: 3 }}
            >
              Go Back
            </Button>
          </div>
        ) : (
          <>
            <TextField
              autoFocus
              fullWidth
              required
              label="Username"
              variant="outlined"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ marginBottom: '15px' }}
              error={!username && errors.username}
              helperText={!username && errors.username ? 'Username field is required.' : ''}
            />
            <TextField
              fullWidth
              required
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ marginBottom: '15px' }}
              error={!password && errors.password}
              helperText={!password && errors.password ? 'Password field is required.' : ''}
            />
            <TextField
              fullWidth
              required
              label="Confirm Password"
              variant="outlined"
              type="password"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              style={{ marginBottom: '15px' }}
              error={!passwordConfirm && errors.passwordConfirm}
              helperText={!passwordConfirm && errors.passwordConfirm ? 'Confirm Password field is required.' : ''}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleRegister}
            >
              Create Account
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};