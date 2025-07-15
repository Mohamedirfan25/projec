import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  InputAdornment,
  Divider,
  Chip,
  styled
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon
} from '@mui/icons-material';

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
  color: 'white',
  fontWeight: 'bold',
  padding: '12px 24px',
  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .2)',
  '&:hover': {
    background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'white',
  border: '1px solid rgba(0, 0, 0, 0.05)'
}));

const SimplePaymentPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    internId: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.name || !formData.internId || !formData.amount) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      console.log('Payment submitted:', formData);
    }, 1500);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <StyledPaper>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            width: 60, 
            height: 60,
            mx: 'auto',
            mb: 2
          }}>
            <PaymentIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 1
          }}>
            Intern Payment Portal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Secure payment processing for Smart Intern Management
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon fontSize="inherit" />}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography>Payment submitted successfully!</Typography>
              <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
                Transaction ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </Typography>
            </Box>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Intern Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Intern ID"
                name="internId"
                value={formData.internId}
                onChange={handleChange}
                variant="outlined"
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                variant="outlined"
                size="medium"
                InputProps={{
                  inputProps: { 
                    min: 1,
                    step: "any"
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, mb: 3 }}>
            <Divider sx={{ mb: 3 }}>
              <Chip label="Payment Summary" color="primary" />
            </Divider>
            <Box sx={{ 
              bgcolor: 'background.paper',
              borderRadius: '12px',
              p: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Amount:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {formData.amount || '0.00'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">Transaction Fee:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {(formData.amount * 0.02).toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {(Number(formData.amount) + (formData.amount * 0.02)).toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <GradientButton
            type="submit"
            fullWidth
            disabled={loading}
            sx={{ 
              mt: 2,
              height: '48px'
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                Processing Payment...
              </>
            ) : (
              <>
                <PaymentIcon sx={{ mr: 1 }} />
                Pay Now
              </>
            )}
          </GradientButton>

          <Box sx={{ 
            mt: 3, 
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <LockIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Secure SSL encrypted payment
            </Typography>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default SimplePaymentPage;    