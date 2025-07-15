import React, { useState } from 'react';
import { 
  Container, 
  Stepper, 
  Step, 
  StepLabel, 
  Paper,
  Box,
  Typography,
  Button
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

// Import the MultiStepForm component from InternLists which contains all the form steps
import InternLists from './InternLists';

// Modern theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#4361ee',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3f37c9',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: '#3a56e8',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-completed': {
            color: '#4caf50',
          },
          '&.Mui-active': {
            color: '#4361ee',
          },
        },
      },
    },
  },
});

const InternRegistrationFlow = ({ onBack }) => {
  const [showForm, setShowForm] = useState(true);

  const handleFormComplete = () => {
    setShowForm(false);
    if (onBack) {
      onBack(); // Return to intern list
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    if (onBack) {
      onBack(); // Return to intern list
    }
  };

  if (!showForm) {
    return null; // Component will be unmounted by parent
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back button to return to intern list */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={handleFormCancel}
            sx={{ mb: 2 }}
          >
            Back to Intern List
          </Button>
        </Box>

        {/* Use the MultiStepForm from InternLists */}
        <InternLists 
          showAddForm={true}
          onFormComplete={handleFormComplete}
          onFormCancel={handleFormCancel}
        />
      </Container>
    </ThemeProvider>
  );
};

export default InternRegistrationFlow;