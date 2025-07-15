import React, { useState } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import InternRegistrationWrapper from './InternRegistrationWrapper';
import InternLists from './InternLists';

const InternManagementDemo = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const handleAddIntern = () => {
    setShowRegistrationForm(true);
  };

  const handleRegistrationComplete = () => {
    setShowRegistrationForm(false);
    // Optionally refresh intern list or show success message
    console.log('Registration completed successfully!');
  };

  const handleRegistrationCancel = () => {
    setShowRegistrationForm(false);
    console.log('Registration cancelled');
  };

  if (showRegistrationForm) {
    return (
      <InternRegistrationWrapper 
        onBack={handleRegistrationComplete}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Intern Management System
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddIntern}
            sx={{ px: 3, py: 1 }}
          >
            Add New Intern
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Click "Add New Intern" to start the multi-step registration process.
          All form data will be stored in frontend until the final submission step.
        </Typography>
      </Paper>

      {/* Show the regular intern list */}
      <InternLists />
    </Box>
  );
};

export default InternManagementDemo;