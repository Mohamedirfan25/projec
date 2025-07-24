import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip, 
  CircularProgress,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Public as DomainIcon,
  People as InternsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const initialDomains = [
  {
    id: 'DOM001',
    name: 'Engineering',
    description: 'Software development and engineering domain',
    internCount: 5,
    color: '#6a11cb',
    icon: '👨‍💻',
    interns: [
      { id: 'INT001', name: 'John Doe' },
      { id: 'INT002', name: 'Jane Smith' }
    ]
  },
  {
    id: 'DOM002',
    name: 'Marketing',
    description: 'Digital marketing and communications',
    internCount: 3,
    color: '#11998e',
    icon: '📈',
    interns: [
      { id: 'INT003', name: 'Alex Johnson' }
    ]
  }
];

// Mock database of interns
const internDatabase = [
  { id: 'INT001', name: 'John Doe', email: 'john.doe@example.com', department: 'Frontend', university: 'Tech University', joinDate: '2023-05-15' },
  { id: 'INT002', name: 'Jane Smith', email: 'jane.smith@example.com', department: 'Backend', university: 'State College', joinDate: '2023-06-01' },
  { id: 'INT003', name: 'Alex Johnson', email: 'alex.johnson@example.com', department: 'Marketing', university: 'Business School', joinDate: '2023-04-10' },
  { id: 'INT004', name: 'Sarah Williams', email: 'sarah.w@example.com', department: 'Data Science', university: 'Data Institute', joinDate: '2023-07-20' }
];

// Styled components
const DomainCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(145deg, ${color}10, ${theme.palette.background.paper})`,
  borderLeft: `5px solid ${color}`,
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: theme.shadows[2],
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
    '& .domain-actions': {
      opacity: 1
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: `linear-gradient(90deg, ${color}, ${color}80)`
  }
}));

const AddDomainCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  height: '100%',
  minHeight: 260,
  borderRadius: '12px',
  border: `2px dashed ${theme.palette.divider}`,
  '&:hover': {
    background: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200],
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
    '& .add-icon': {
      transform: 'scale(1.1)',
      color: theme.palette.primary.main
    }
  }
}));


const CountBadge = ({ value, label, color, icon }) => {
  const theme = useTheme();
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: 1.5,
      borderRadius: '8px',
      background: theme.palette.mode === 'dark' ? `${color}20` : `${color}10`,
      minWidth: 90,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '3px',
        height: '100%',
        backgroundColor: color
      }
    }}>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {icon && React.cloneElement(icon, { 
          fontSize: 'small',
          sx: { color: `${color}` }
        })}
        <Typography variant="h6" fontWeight="bold" color={color}>
          {value}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
        {label}
      </Typography>
    </Box>
  );
};

const ColorOption = styled(Box)(({ color }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: color,
  marginRight: 8,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  border: '1px solid rgba(0,0,0,0.1)'
}));

const DomainManagement = () => {
  const theme = useTheme();
  const [domains, setDomains] = useState(initialDomains);
  const [openDialog, setOpenDialog] = useState(false);
  const [openInternDialog, setOpenInternDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDomain, setCurrentDomain] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchDomains = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Token ${token}` },
      };
  
      try {
        console.log('Fetching domains from API...');
        const [domainRes, userRes] = await Promise.all([
          axios.get("http://localhost:8000/Sims/domains/", config),
          axios.get("http://localhost:8000/Sims/user-data/", config),
        ]);
  
        console.log('Domain API response:', domainRes.data);
        console.log('User API response:', userRes.data);
        
        const domainList = domainRes.data;
        const users = userRes.data;
  
        const domainMap = {};
  
        domainList.forEach((dom, i) => {
          domainMap[dom.domain] = {
            id: dom.id,
            name: dom.domain,
            description: dom.description || "",
            color: dom.color || colorOptions[i % colorOptions.length].value,
            icon: dom.icon || iconOptions[i % iconOptions.length],
            internCount: 0,
            interns: [],
          };
        });
  
        users.forEach((user) => {
          const domain = user.domain;
          const role = user.temp_details?.role;
          if (domain && domainMap[domain] && role === "intern") {
            domainMap[domain].internCount += 1;
            domainMap[domain].interns.push({
              id: user.id,
              name: user.username,
            });
          }
        });
  
        console.log('Final domain map:', domainMap);
        setDomains(Object.values(domainMap));
      } catch (err) {
        console.error("Error fetching domain/user data:", err);
        console.error("Error details:", err.response?.data);
      }
  
      setLoading(false);
    };
  
    fetchDomains();
  }, []);
  
  
  // Form states
  const [domainForm, setDomainForm] = useState({
    name: '',
    description: '',
    color: '#6a11cb',
    icon: '👨‍💻'
  });
  
  const [internForm, setInternForm] = useState({
    id: '',
    name: '',
    email: '',
    department: '',
    university: '',
    joinDate: '',
    domainId: ''
  });

  const colorOptions = [
    { value: '#6a11cb', label: 'Violet' },
    { value: '#11998e', label: 'Teal' },
    { value: '#3a7bd5', label: 'Blue' },
    { value: '#a8ff78', label: 'Green' },
    { value: '#f857a6', label: 'Pink' },
    { value: '#ff5858', label: 'Red' },
  ];

  const iconOptions = ['👨‍💻', '📈', '🎨', '🔬', '📊', '💡', '🌐', '🔐', '💻', '📱'];

  const departmentOptions = ['Frontend', 'Backend', 'Fullstack', 'Data Science', 'Marketing', 'Design', 'Product'];

  const handleOpenAddDomain = () => {
    setEditMode(false);
    setDomainForm({ 
      name: '', 
      description: '', 
      color: '#6a11cb', 
      icon: '👨‍💻'
    });
    setOpenDialog(true);
  };

  const handleOpenEditDomain = (domain) => {
    setEditMode(true);
    setCurrentDomain(domain);
    setDomainForm({ 
      name: domain.name, 
      description: domain.description,
      color: domain.color, 
      icon: domain.icon
    });
    setOpenDialog(true);
  };

  const handleOpenAddIntern = (domainId) => {
    setInternForm({
      id: '',
      name: '',
      email: '',
      department: '',
      university: '',
      joinDate: '',
      domainId: domainId
    });
    setOpenInternDialog(true);
  };

  const handleInternIdChange = (id) => {
    const foundIntern = internDatabase.find(intern => intern.id === id);
    if (foundIntern) {
      setInternForm({
        ...internForm,
        id,
        name: foundIntern.name,
        email: foundIntern.email,
        department: foundIntern.department,
        university: foundIntern.university,
        joinDate: foundIntern.joinDate
      });
    } else {
      setInternForm({
        ...internForm,
        id,
        name: '',
        email: '',
        department: '',
        university: '',
        joinDate: ''
      });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenInternDialog(false);
    setCurrentDomain(null);
  };

  const handleDomainSubmit = async () => {
    setLoading(true);
  
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    };
  
    try {
      if (editMode) {
        await axios.patch(
          `http://localhost:8000/Sims/domains/${currentDomain.id}/`,
          {
            domain: domainForm.name,
            description: domainForm.description || "",
            color: domainForm.color,
            icon: domainForm.icon,
          },
          config
        );
  
        setDomains(
          domains.map((dom) =>
            dom.id === currentDomain.id
              ? {
                  ...dom,
                  name: domainForm.name,
                  description: domainForm.description,
                  color: domainForm.color,
                  icon: domainForm.icon,
                }
              : dom
          )
        );
  
        setSnackbar({
          open: true,
          message: "Domain updated successfully!",
          severity: "success",
        });
      } else {
        const res = await axios.post(
          "http://localhost:8000/Sims/domains/",
          {
            domain: domainForm.name,
            description: domainForm.description || "",
            color: domainForm.color,
            icon: domainForm.icon,
          },
          config
        );
  
        const newDomain = {
          id: res.data.id,
          name: res.data.domain,
          description: res.data.description,
          color: res.data.color,
          icon: res.data.icon,
          internCount: 0,
          interns: [],
        };
  
        setDomains([...domains, newDomain]);
  
        setSnackbar({
          open: true,
          message: "Domain created successfully!",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Error saving domain:", err);
      setSnackbar({
        open: true,
        message: "Error creating domain!",
        severity: "error",
      });
    }
  
    setLoading(false);
    handleCloseDialog();
  };



  const handleAddIntern = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setDomains(domains.map(domain => {
        if (domain.id === internForm.domainId) {
          return {
            ...domain,
            internCount: domain.internCount + 1,
            interns: [...domain.interns, {
              id: internForm.id,
              name: internForm.name
            }]
          };
        }
        return domain;
      }));
      setSnackbar({ 
        open: true, 
        message: `Intern ${internForm.name} added successfully!`, 
        severity: 'success' 
      });
      setLoading(false);
      handleCloseDialog();
    }, 800);
  };

  const handleDeleteDomain = (id) => {
    if (window.confirm('Are you sure you want to delete this domain? All associated interns will be removed.')) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setDomains(domains.filter(domain => domain.id !== id));
        setSnackbar({ open: true, message: 'Domain deleted successfully!', severity: 'success' });
        setLoading(false);
      }, 800);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            mb: 1
          }}>
            <DomainIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            Domain Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your organization's domains and interns
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDomain}
          sx={{
            height: 'fit-content',
            borderRadius: '8px',
            px: 3,
            py: 1.5,
            fontSize: '0.875rem'
          }}
        >
          New Domain
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      )}

      <Grid container spacing={3}>
        {domains.map((domain) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={domain.id}>
            <DomainCard color={domain.color}>
              <CardContent sx={{ position: 'relative', flexGrow: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ 
                      bgcolor: `${domain.color}20`, 
                      color: domain.color,
                      width: 48,
                      height: 48,
                      fontSize: 24
                    }}>
                      {domain.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {domain.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {domain.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className="domain-actions" sx={{ opacity: { xs: 1, sm: 0 }, transition: 'opacity 0.2s' }}>
                    <Tooltip title="More options">
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(1, 1fr)',
                  gap: 1.5,
                  mt: 3,
                  mb: 3
                }}>
                  <CountBadge 
                    value={domain.internCount} 
                    label="Interns" 
                    color={domain.color}
                    icon={<InternsIcon />}
                  />
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  pt: 1,
                  borderTop: `1px solid ${theme.palette.divider}`,
                  mt: 'auto'
                }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    fullWidth
                    startIcon={<InternsIcon />}
                    onClick={() => handleOpenAddIntern(domain.id)}
                    sx={{ 
                      color: domain.color,
                      borderColor: `${domain.color}50`,
                      '&:hover': { 
                        borderColor: domain.color,
                        backgroundColor: `${domain.color}10`
                      }
                    }}
                  >
                    Add Intern
                  </Button>
                </Box>
                
                <Box sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}>
                  <Tooltip title="Edit domain">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditDomain(domain);
                      }}
                      sx={{ 
                        backgroundColor: `${domain.color}20`,
                        color: domain.color,
                        '&:hover': {
                          backgroundColor: `${domain.color}30`
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete domain">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDomain(domain.id);
                      }}
                      sx={{ 
                        backgroundColor: `${theme.palette.error.light}20`,
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: `${theme.palette.error.light}30`
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </DomainCard>
          </Grid>
        ))}
        
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <AddDomainCard onClick={handleOpenAddDomain}>
            <Box sx={{ 
              textAlign: 'center',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}>
              <AddIcon 
                className="add-icon"
                color="action" 
                fontSize="large" 
                sx={{ 
                  transition: 'all 0.3s ease',
                  fontSize: 40
                }} 
              />
              <Typography variant="subtitle1" fontWeight="medium">
                Create New Domain
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add a new business domain
              </Typography>
            </Box>
          </AddDomainCard>
        </Grid>
      </Grid>

      {/* Add/Edit Domain Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: `linear-gradient(135deg, ${domainForm.color}, ${domainForm.color}cc)`,
          color: 'white',
          py: 2,
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ 
              bgcolor: 'white', 
              color: domainForm.color,
              width: 36,
              height: 36
            }}>
              {domainForm.icon}
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              {editMode ? `Edit ${domainForm.name}` : 'Create New Domain'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Domain Name"
                fullWidth
                variant="outlined"
                value={domainForm.name}
                onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={domainForm.description}
                onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Color Theme"
                fullWidth
                variant="outlined"
                value={domainForm.color}
                onChange={(e) => setDomainForm({ ...domainForm, color: e.target.value })}
              >
                {colorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ColorOption color={option.value} />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Icon"
                fullWidth
                variant="outlined"
                value={domainForm.icon}
                onChange={(e) => setDomainForm({ ...domainForm, icon: e.target.value })}
              >
                {iconOptions.map((icon, index) => (
                  <MenuItem key={index} value={icon}>
                    <Box component="span" sx={{ fontSize: 20, mr: 1 }}>{icon}</Box>
                    <Box component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {icon}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDomainSubmit} 
            variant="contained"
            disabled={!domainForm.name || loading}
            sx={{ 
              borderRadius: '8px',
              px: 3,
              background: `linear-gradient(135deg, ${domainForm.color}, ${domainForm.color}cc)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${domainForm.color}, ${domainForm.color}dd)`
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : editMode ? (
              'Update Domain'
            ) : (
              'Create Domain'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Intern Dialog */}
      <Dialog open={openInternDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: `linear-gradient(135deg, #3a7bd5, #00d2ff)`,
          color: 'white',
          py: 2,
          px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <InternsIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              Add New Intern
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Intern ID"
                fullWidth
                variant="outlined"
                value={internForm.id}
                onChange={(e) => handleInternIdChange(e.target.value)}
                helperText="Enter existing intern ID to autofill details"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Full Name"
                fullWidth
                variant="outlined"
                value={internForm.name}
                onChange={(e) => setInternForm({...internForm, name: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Email"
                fullWidth
                variant="outlined"
                value={internForm.email}
                onChange={(e) => setInternForm({...internForm, email: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                margin="dense"
                label="Department"
                fullWidth
                variant="outlined"
                value={internForm.department}
                onChange={(e) => setInternForm({...internForm, department: e.target.value})}
              >
                {departmentOptions.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="University"
                fullWidth
                variant="outlined"
                value={internForm.university}
                onChange={(e) => setInternForm({...internForm, university: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Join Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={internForm.joinDate}
                onChange={(e) => setInternForm({...internForm, joinDate: e.target.value})}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                select
                margin="dense"
                label="Domain"
                fullWidth
                variant="outlined"
                value={internForm.domainId}
                onChange={(e) => setInternForm({...internForm, domainId: e.target.value})}
              >
                {domains.map((domain) => (
                  <MenuItem key={domain.id} value={domain.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ color: domain.color }}>{domain.icon}</Box>
                      {domain.name}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ borderRadius: '8px', px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddIntern} 
            variant="contained"
            disabled={!internForm.id || !internForm.name || loading}
            sx={{ 
              borderRadius: '8px',
              px: 3,
              background: `linear-gradient(135deg, #3a7bd5, #00d2ff)`,
              '&:hover': {
                background: `linear-gradient(135deg, #3a7bd5, #00d2ffcc)`
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Add Intern'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            boxShadow: theme.shadows[6],
            alignItems: 'center'
          }}
          variant="filled"
        >
          <Typography variant="subtitle2">
            {snackbar.message}
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DomainManagement;