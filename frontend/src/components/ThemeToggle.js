import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '..';

const ThemeToggle = () => {
  const { toggleColorMode } = useColorMode();
  
  return (
    <Tooltip title="Toggle light/dark theme">
      <IconButton onClick={toggleColorMode} color="inherit">
        {localStorage.getItem('themePreference') === 'dark' ? (
          <Brightness7Icon />
        ) : (
          <Brightness4Icon />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
