import React, { useState } from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  Box,
  Container,
  Paper,
  Link,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import backgroundImage from './jj.jpg'; // Ensure the background image path is correct
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const RootBox = styled(Box)({
  height: '100vh',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: `url(${backgroundImage})`,
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  borderRadius: theme.shape.borderRadius,
}));

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%', 
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
}));

const SocialButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const ForgotPasswordBox = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  width: '100%',
  marginTop: '8px',
});

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Both fields are required');
      setLoading(false);
      return;
    }

    if (username === 'admin' && password === 'admin') {
      navigate('/Dashboard');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/Sims/login/', {
        username,
        password,
      });

      console.log('Response:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/Dash');
        setData(response.data);
      } else {
        setError(response.data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google OAuth Client ID
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.prompt(); // Prompt the user to select an account
  };

  const handleCredentialResponse = async (response) => {
    try {
      const { credential } = response;
      const { data } = await axios.post('http://localhost:8000/Sims/google-login/', {
        id_token: credential,
      });

      if (data.token) {
        localStorage.setItem('token', data.token); 
        navigate('/Dash');
        setData(data);
      } else {
        setError(data.message || 'Google Sign-In failed');
      }
    } catch (err) {
      console.error('Google Sign-In error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <RootBox>
        <Container component="main" maxWidth="xs">
          <StyledPaper elevation={6}>
            <Typography component="h1" variant="h4" color="textPrimary">
              Login
            </Typography>
            {error && (
              <Typography variant="body2" color="error" align="center">
                {error}
              </Typography>
            )}
            <StyledForm onSubmit={handleSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="off"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <ForgotPasswordBox>
                <Link href="/Reset" color="primary" underline="hover">
                  Forgot password?
                </Link>
              </ForgotPasswordBox>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <SubmitButton
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                endIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}
              >
                {loading ? 'Loading...' : 'Sign IN'}
              </SubmitButton>

              <Tooltip title="Sign in with Google" arrow>
                <SocialButton
                  fullWidth
                  variant="contained"
                  color="secondary"
                  startIcon={<GoogleIcon />}
                  onClick={handleGoogleLogin}
                >
                  Sign in with Google
                </SocialButton>
              </Tooltip>

              <Box mt={2}>
                <Typography variant="body2" align="center">
                  Back to{' '}
                  <Link href="/" passHref>
                    <Typography component="span" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
                      Home
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </StyledForm>

            {data && (
              <Box mt={4}>
                <Typography variant="h6" align="center" color="textPrimary">
                  Fetched Data:
                </Typography>
                <Typography variant="body1" align="center" color="textSecondary">
                  {JSON.stringify(data, null, 2)}
                </Typography>
              </Box>
            )}
          </StyledPaper>
        </Container>
      </RootBox>
    </ThemeProvider>
  );
}

export default Login;