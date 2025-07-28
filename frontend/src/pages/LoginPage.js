import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Divider,
  Checkbox,
  FormControlLabel,
  Link,
  CircularProgress,
  Box,
  Paper,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import WelcomeImage from '../assets/Log.png';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    if (!username || !password) {
      setError('Both fields are required');
      setLoading(false);
      return;
    }
  
    try {
      // 1. Get authentication token
      const loginResponse = await axios.post('http://localhost:8000/Sims/login/', {
        username,
        password,
      });
  
      if (!loginResponse.data?.token) {
        throw new Error('No token received');
      }
  
      const { token } = loginResponse.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('isLoggedIn', 'true');
  
      // 2. Get user data including access rights
      const userDataResponse = await axios.get(
        'http://localhost:8000/Sims/all-user-data/',
        { headers: { Authorization: `Token ${token}` } }
      );
      console.log("userDataResponse",userDataResponse.data);
  
      if (userDataResponse.data.status !== 'success') {
        throw new Error('Failed to fetch user data');
      }
  
      // 3. Find current user in the response
      const currentUser = userDataResponse.data.users.find(
        (u) => u.username === username
      );
      console.log( "currentUser",currentUser);
  
      if (!currentUser) {
        throw new Error('User data not found');
      }
  
      // 4. Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(currentUser));
      localStorage.setItem('access_rights', JSON.stringify(currentUser.access_rights || {}));
      localStorage.setItem('role', currentUser.role || 'user');
      localStorage.setItem('is_staff', currentUser.is_staff ? 'true' : 'false');
  
      // 5. Redirect based on role and access rights
      if (currentUser.role === 'admin') {
        navigate('/AdminDashboard');
      } else if (currentUser.role === 'staff') {
        // For staff, check access rights
        const { access_rights } = currentUser;
        
        if (access_rights.is_internmanagement_access) {
          navigate('/Intern');
        } else if (access_rights.is_attendance_access) {
          navigate('/attendance');
        } else if (access_rights.is_payroll_access) {
          navigate('/payroll');
        } else if (access_rights.is_assert_access) {
          navigate('/asset');
        } else {
          navigate('/Dash');
        }
      } else {
        // For other roles (including interns)
        navigate('/Dash');
      }
  
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.response?.data?.message ||
        error.message ||
        'Invalid username or password. Please try again.'
      );
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('isLoggedIn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box style={{ backgroundColor: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="lg">
        <Paper elevation={6} style={{ padding: '40px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={5}>
              <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" height="100%">
                <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                  Welcome to Tracktern
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" style={{ marginTop: '20px' }}>
                  <img src={WelcomeImage} alt="Welcome" style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }} />
                </Box>
              </Box> 
            </Grid>
            <Grid item xs={12} md={1} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Divider orientation="vertical" flexItem />
            </Grid>
            <Grid item xs={12} md={5}>
              <Box>
                <Box display="flex" alignItems="center" justifyContent="center" marginBottom="20px">
                  <LockResetIcon style={{ marginRight: '10px', color: 'black' }} />
                  <Typography variant="h4" gutterBottom style={{ color: 'black', fontWeight: 'bold' }}>
                    Login
                  </Typography>
                </Box>
                <Divider style={{ marginBottom: '20px' }} />
                <form noValidate autoComplete="off" onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Username"
                    variant="outlined"
                    margin="normal"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    error={!!error}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!error}
                  />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <FormControlLabel
                      control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />}
                      label="Remember me"
                    />
                    <Link component={RouterLink} to="/Reset" underline="always">
                      Forgot Password?
                    </Link>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    style={{ marginTop: '20px', backgroundColor: 'black', color: 'white', fontWeight: 'bold' }}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Login'}
                  </Button>
                  {error && (
                    <Typography variant="body2" color="error" align="center" style={{ marginTop: '10px' }}>
                      {error}
                    </Typography>
                  )}
                </form>
                <Box mt={2} display="flex" justifyContent="center">
                  <RouterLink to="/" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}>
                    Back to Home
                  </RouterLink>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;