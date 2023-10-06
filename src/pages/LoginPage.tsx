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

import { Routes } from '../consts';
import { AuthService } from '../services';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    username: false,
    password: false,
  });

  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const handleLogin = async () => {
    if (!username) {
      setErrors({...errors, username: true});
      return;
    }

    if (!password) {
      setErrors({...errors, password: true});
      return;
    }

    const response = await AuthService.login(username, password);
    if (response.status !== 'ok') {
      enqueueSnackbar('Failed to login!', { variant: 'error' });
      return;
    }

    enqueueSnackbar('Successfully logged in!', { variant: 'success' });
    localStorage.setItem('isAuthenticated', 'true');
    window.location.href = location.state?.from || Routes.dashboard;
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
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            handleLogin();
            return;
          }            
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>
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
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleLogin}
        >
          Login
        </Button>
      </Paper>
    </Container>
  );
};