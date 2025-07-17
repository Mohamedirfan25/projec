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
      const response = await axios.post('http://localhost:8000/Sims/login/', {
        username,
        password,
      });

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        const token = localStorage.getItem('token');
        console.log(token);
        try {
          const responseUser = await axios.get(
            'http://localhost:8000/Sims/temps/',
            { headers: { Authorization: `Token ${token}` } }
          );
      
          const responseUserData = await axios.get(
            'http://localhost:8000/Sims/user-data/',
            { headers: { Authorization: `Token ${token}` } }
          );
      
          const usersArray = Array.isArray(responseUser.data) ? responseUser.data : [];
          const matchingUsers = usersArray.filter(user => user.username === username);
      
          if (matchingUsers.length > 0) {
            const userRoles = matchingUsers.map(user => user.role.toLowerCase());
      
            // 👇 store access flags for dashboard visibility
            const currentUserData = responseUserData.data.find(user => user.username === username);
            if (currentUserData) {
              localStorage.setItem("access_rights", JSON.stringify({
                is_attendance_access: currentUserData.is_attendance_access,
                is_payroll_access: currentUserData.is_payroll_access,
                is_internmanagement_access: currentUserData.is_internmanagement_access,
                is_assert_access: currentUserData.is_assert_access,
              }));
            }
      
            if (userRoles.includes('admin')) {
              navigate('/AdminDashboard');
            } else if (userRoles.includes('staff')) {
              navigate('/Intern');
            } else {
              navigate('/Dash');
            }
          } else {
            navigate('/Dash');
          }
        } catch (err) {
          setError('Failed to fetch user data');
          localStorage.removeItem('token');
        }
        if (!token) {
          setError('Authentication failed');
          return;
        }

        try {
          const responseUser = await axios.get(
            'http://localhost:8000/Sims/temps/',
            { headers: { Authorization: `Token ${token}` } }
          );

          const usersArray = Array.isArray(responseUser.data) ? responseUser.data : [];
          const matchingUsers = usersArray.filter(user => user.username === username);

          if (matchingUsers.length > 0) {
            const userRoles = matchingUsers.map(user => user.role.toLowerCase());
            if (userRoles.includes('admin')) {
              navigate('/AdminDashboard');
            } else if (userRoles.includes('staff')) {
              navigate('/Intern');
            } else {
              navigate('/Dash');
            }
          } else {
            navigate('/Dash');
          }
        } catch (err) {
          setError('Failed to fetch user data');
          localStorage.removeItem('token');
        }
      } else {
        setError(response.data?.message || 'Invalid email or password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
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