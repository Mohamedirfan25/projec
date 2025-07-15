import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Tabs, 
  Tab, 
  Typography,
  InputAdornment,
  Avatar,
  Pagination, 
  Select,
  MenuItem,
  FormControl,
  Chip,
  Button,
  IconButton,
  Popover,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  ListItemText,
  Menu,
  Divider,
  Grid  // Added Grid import
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Work as WorkIcon, 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  UploadFile as UploadFileIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Business as BusinessIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';

const InternManagementLists = () => {
  const [activeTab, setActiveTab] = useState('InProgress');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [interns, setInterns] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [openInternDialog, setOpenInternDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: ''
  });
  const [uploadedDocs, setUploadedDocs] = useState({
    offerLetter: false,
    ndaAgreement: false,
    resume: false
  });
  const [deletedIntern, setDeletedIntern] = useState(null);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);

  const filters = {
    department: '',
    scheme: '',
    domain: ''
  };
  const [activeFilters, setActiveFilters] = useState(filters);

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch user data
        const userDataRes = await axios.get("http://localhost:8000/Sims/user-data/", {
          headers: { Authorization: `Token ${token}` },
        });
        
        // Fetch registration data
        const registerRes = await axios.get("http://127.0.0.1:8000/Sims/register/", {
          headers: { Authorization: `Token ${token}` },
        });

        // Combine data from both APIs
        const combinedData = userDataRes.data.map(user => {
          const registerInfo = registerRes.data.find(reg => reg.id === user.user) || {};
          return {
            ...user,
            ...registerInfo,
            firstName: registerInfo.first_name || '',
            lastName: registerInfo.last_name || ''
          };
        });

        const today = new Date();

        const formatted = combinedData.map((item) => {
          const endDate = item.end_date ? new Date(item.end_date) : null;

          let status = "InProgress";
          if (item.user_status?.toLowerCase() === "discontinued") {
            status = "Discontinued";
          } else if (endDate && endDate < today) {
            status = "Completed";
          }

          return {
            id: item.emp_id,
            name: item.username,
            firstName: item.first_name || item.firstName || '',
            lastName: item.last_name || item.lastName || '',
            email: item.email || `${item.username}@example.com`,
            department: item.department || "-",
            scheme: item.scheme || "-",
            domain: item.domain || "-",
            startDate: item.start_date || "-",
            endDate: item.end_date || "-",
            status,
            reportingManager: item.reporting_manager_username || "-",
            reportingSupervisor: item.reporting_supervisor_username || "-",
            duration: item.duration || "-",
            shiftTiming: item.shift_timing || "-",
            teamName: item.team_name || "-"
          };
        });

        setInterns(formatted);
      } catch (error) {
        console.error("Failed to fetch interns:", error);
      }
    };

    fetchInterns();
  }, []);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setActiveFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setActiveFilters(filters);
  };

  const filteredInterns = interns.filter(intern => 
    intern.status === activeTab &&
    (intern.id.toString().includes(searchTerm) ||
    intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.scheme.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.domain.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeFilters.department === '' || intern.department === activeFilters.department) &&
    (activeFilters.scheme === '' || intern.scheme === activeFilters.scheme) &&
    (activeFilters.domain === '' || intern.domain === activeFilters.domain)
  );

  const columns = [
    'Intern ID', 'Intern Name', 'Email ID', 'Department', 'Scheme', 'Domain', 'Start Date', 'End Date', 'Status', 'Action'
  ];

  // Get unique values for filters
  const departments = [...new Set(interns.map(intern => intern.department))];
  const schemes = [...new Set(interns.map(intern => intern.scheme))];
  const domains = [...new Set(interns.map(intern => intern.domain))];

  // Pagination logic
  const count = Math.ceil(filteredInterns.length / rowsPerPage);
  const paginatedInterns = filteredInterns.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const schemeColors = {
    'FREE': { bg: '#e3f2fd', text: '#1976d2' },
    'COURSE': { bg: '#e8f5e9', text: '#388e3c' },
    'PROJECT': { bg: '#fff3e0', text: '#ffa000' }
  };

  const domainColors = {
    'Full Stack': { bg: '#e3f2fd', text: '#1976d2' },
    'Machine Learning': { bg: '#f3e5f5', text: '#8e24aa' },
    'Cloud Computing': { bg: '#e0f7fa', text: '#00acc1' },
    'Mobile Development': { bg: '#e8f5e9', text: '#43a047' },
    'Data Analytics': { bg: '#f1f8e9', text: '#7cb342' },
    'Design Systems': { bg: '#fff8e1', text: '#ffb300' }
  };

  const handleInternClick = (intern) => {
    setSelectedIntern(intern);
    setOpenInternDialog(true);
  };

  const handleCloseInternDialog = () => {
    setOpenInternDialog(false);
    setSelectedIntern(null);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleOpenDocumentDialog = () => {
    setOpenDocumentDialog(true);
  };

  const handleCloseDocumentDialog = () => {
    setOpenDocumentDialog(false);
  };

  const handleMenuClick = (event, intern) => {
    setAnchorEl(event.currentTarget);
    setSelectedIntern(intern);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedIntern(null);
  };

  const handleDeleteClick = async () => {
    if (!selectedIntern) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:8000/Sims/temps/${selectedIntern.id}/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      
      if (response.status === 200) {
        // Remove the deleted intern from the local state
        setInterns(prevInterns => 
          prevInterns.filter(intern => intern.id !== selectedIntern.id)
        );
        
        // Show success message (you can add a snackbar here)
        console.log('Intern deleted successfully');
        
        // Show undo option
        setDeletedIntern(selectedIntern);
        setShowUndoSnackbar(true);
        
        // Auto-hide undo option after 10 seconds
        setTimeout(() => {
          setShowUndoSnackbar(false);
          setDeletedIntern(null);
        }, 10000);
      }
    } catch (error) {
      console.error('Failed to delete intern:', error);
      // Show error message
    }
    
    handleMenuClose();
  };
  
  const handleUndoDelete = async () => {
    if (!deletedIntern) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:8000/Sims/temps/${deletedIntern.id}/`,
        {},
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      
      if (response.status === 200) {
        // Add the intern back to the local state
        setInterns(prevInterns => [...prevInterns, deletedIntern]);
        
        // Hide the undo snackbar
        setShowUndoSnackbar(false);
        setDeletedIntern(null);
        
        console.log('Intern restored successfully');
      }
    } catch (error) {
      console.error('Failed to restore intern:', error);
    }
  };
  
  const handleCloseUndoSnackbar = () => {
    setShowUndoSnackbar(false);
    setDeletedIntern(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSave = () => {
    // Save logic here
    setEditMode(false);
  };

  const handleAddSubmit = () => {
    // Add intern logic here
    setOpenAddDialog(false);
  };

  const handleDocUpload = (docType) => {
    setUploadedDocs(prev => ({
      ...prev,
      [docType]: true
    }));
  };

  const open = Boolean(filterAnchorEl);
  const filterOpen = Boolean(anchorEl);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        backgroundColor: 'background.paper',
        p: 3,
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Intern List
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Search by name, ID, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              width: 350,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fieldset: {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            onClick={handleFilterClick}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1,
              color: 'primary.main'
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1
          }}
        >
          Add Intern
        </Button>
      </Box>

      <Popover
        id="filter-popover"
        open={open}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 3,
            width: 300,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
        
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 1 }}>Department</Typography>
            <Select
              name="department"
              value={activeFilters.department}
              onChange={handleFilterChange}
              displayEmpty
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 1 }}>Scheme</Typography>
            <Select
              name="scheme"
              value={activeFilters.scheme}
              onChange={handleFilterChange}
              displayEmpty
            >
              <MenuItem value="">All Schemes</MenuItem>
              {schemes.map((scheme) => (
                <MenuItem key={scheme} value={scheme}>{scheme}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 1 }}>Domain</Typography>
            <Select
              name="domain"
              value={activeFilters.domain}
              onChange={handleFilterChange}
              displayEmpty
            >
              <MenuItem value="">All Domains</MenuItem>
              {domains.map((domain) => (
                <MenuItem key={domain} value={domain}>{domain}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              onClick={clearFilters}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Clear
            </Button>
            <Button 
              onClick={handleFilterClose}
              variant="contained"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Apply
            </Button>
          </Box>
        </Stack>
      </Popover>

      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => {
          setActiveTab(newValue);
          setPage(1);
        }}
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: 3
          }
        }}
        variant="fullWidth"
      >
        <Tab 
          label="In Progress" 
          value="InProgress" 
          icon={<WorkIcon fontSize="small" />} 
          iconPosition="start"
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 48
          }}
        />
        <Tab 
          label="Completed" 
          value="Completed" 
          icon={<CheckCircleIcon fontSize="small" />} 
          iconPosition="start"
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 48
          }}
        />
        <Tab 
          label="Discontinued" 
          value="Discontinued" 
          icon={<CancelIcon fontSize="small" />} 
          iconPosition="start"
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 48
          }}
        />
      </Tabs>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 3, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column} 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#000',
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedInterns.map((intern) => (
              <TableRow 
                key={intern.id} 
                hover
                sx={{ 
                  '&:last-child td': { borderBottom: 0 },
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <TableCell>
                  <Typography 
                    onClick={() => handleInternClick(intern)}
                    sx={{ 
                      fontWeight: 600, 
                      color: '#000',
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {intern.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 36, 
                        height: 36, 
                        mr: 2,
                        bgcolor: 'primary.main',
                        color: 'common.white'
                      }}
                    >
                      {intern.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="#000">
                        {intern.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {intern.firstName} {intern.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} color="#000">
                    {intern.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} color="#000">
                    {intern.department}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={intern.scheme}
                    size="small"
                    sx={{
                      backgroundColor: schemeColors[intern.scheme]?.bg || '#f5f5f5',
                      color: schemeColors[intern.scheme]?.text || '#000',
                      fontWeight: 600,
                      minWidth: 80
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={intern.domain}
                    size="small"
                    sx={{
                      backgroundColor: domainColors[intern.domain]?.bg || '#f5f5f5',
                      color: domainColors[intern.domain]?.text || '#000',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} color="#000">
                    {intern.startDate}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} color="#000">
                    {intern.endDate}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={intern.status}
                    size="small"
                    sx={{
                      backgroundColor: 
                        intern.status === 'InProgress' ? 'rgba(33, 150, 243, 0.1)' :
                        intern.status === 'Completed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                      color: 
                        intern.status === 'InProgress' ? 'primary.main' :
                        intern.status === 'Completed' ? 'success.main' : 'error.main',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => handleMenuClick(e, intern)}
                    sx={{ color: '#000' }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredInterns.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          p: 5, 
          color: 'text.secondary',
          backgroundColor: 'background.paper',
          borderRadius: 3,
          mt: 2,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Typography variant="h6">No interns found</Typography>
          <Typography variant="body2" mt={1}>
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mt: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedInterns.length} of {filteredInterns.length} interns
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }} color="text.secondary">
              Rows per page:
            </Typography>
            <FormControl variant="standard" size="small">
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                IconComponent={ArrowDropDownIcon}
                sx={{
                  '& .MuiSelect-select': {
                    py: 1,
                    pl: 1.5,
                    pr: 3
                  }
                }}
              >
                {[5, 10, 25].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Pagination
              count={count}
              page={page}
              onChange={handleChangePage}
              shape="rounded"
              sx={{ ml: 2 }}
            />
          </Box>
        </Box>
      )}

      {/* Intern Detail Dialog */}
      <Dialog
        open={openInternDialog}
        onClose={handleCloseInternDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3
        }}>
          <Typography variant="h6" fontWeight={600}>
            Intern Details
          </Typography>
          <IconButton onClick={handleCloseInternDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedIntern && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    mr: 3,
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    fontSize: '1.5rem'
                  }}
                >
                  {selectedIntern.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {selectedIntern.firstName} {selectedIntern.lastName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedIntern.name}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'background.paper', 
                    p: 2, 
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Intern ID
                        </Typography>
                        <Typography variant="body1">
                          {selectedIntern.id}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {selectedIntern.email}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={selectedIntern.status}
                          size="small"
                          sx={{
                            backgroundColor: 
                              selectedIntern.status === 'InProgress' ? 'rgba(33, 150, 243, 0.1)' :
                              selectedIntern.status === 'Completed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                            color: 
                              selectedIntern.status === 'InProgress' ? 'primary.main' :
                              selectedIntern.status === 'Completed' ? 'success.main' : 'error.main',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Work Information
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'background.paper', 
                    p: 2, 
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body1">
                          {selectedIntern.department}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Domain
                        </Typography>
                        <Typography variant="body1">
                          {selectedIntern.domain}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Scheme
                        </Typography>
                        <Typography variant="body1">
                          {selectedIntern.scheme}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Timeline
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'background.paper', 
                    p: 2, 
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Start Date
                        </Typography>
                        <Typography variant="body1">
                          {selectedIntern.startDate}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          End Date
                        </Typography>
                        <Typography variant="body1">
                          {selectedIntern.endDate}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1">
                          {selectedIntern.duration}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Reporting
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: 'background.paper', 
                    p: 2, 
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Reporting Manager
                        </Typography>
                        <Typography variant="body1">
                          {selectedIntern.reportingManager}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Reporting Supervisor
                        </Typography>
                        <Typography variant="body1">
                          {selectedIntern.reportingSupervisor}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Team
                        </Typography>
                        <Typography variant="body1">
                          {selectedIntern.teamName}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid #e0e0e0',
          p: 2,
          justifyContent: 'flex-end'
        }}>
          <Button 
            onClick={handleCloseInternDialog}
            variant="outlined"
            sx={{ 
              textTransform: 'none',
              mr: 2,
              borderRadius: 2
            }}
          >
            Close
          </Button>
          <Button 
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={handleOpenDocumentDialog}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Upload Documents
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog
        open={openDocumentDialog}
        onClose={handleCloseDocumentDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3
        }}>
          <Typography variant="h6" fontWeight={600}>
            Document Upload
          </Typography>
          <IconButton onClick={handleCloseDocumentDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Offer Letter
                </Typography>
                {uploadedDocs.offerLetter && <CheckIcon color="success" />}
              </Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                fullWidth
                sx={{
                  py: 2,
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
                onClick={() => handleDocUpload('offerLetter')}
              >
                Upload Offer Letter
                <input type="file" hidden />
              </Button>
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  NDA Agreement
                </Typography>
                {uploadedDocs.ndaAgreement && <CheckIcon color="success" />}
              </Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                fullWidth
                sx={{
                  py: 2,
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
                onClick={() => handleDocUpload('ndaAgreement')}
              >
                Upload NDA Agreement
                <input type="file" hidden />
              </Button>
            </Box>
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Resume / CV
                </Typography>
                {uploadedDocs.resume && <CheckIcon color="success" />}
              </Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileIcon />}
                fullWidth
                sx={{
                  py: 2,
                  borderRadius: 2,
                  borderStyle: 'dashed',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
                onClick={() => handleDocUpload('resume')}
              >
                Upload Resume/CV
                <input type="file" hidden />
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid #e0e0e0',
          p: 2
        }}>
          <Button 
            onClick={handleCloseDocumentDialog}
            variant="outlined"
            sx={{ 
              textTransform: 'none',
              mr: 2,
              borderRadius: 2
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            sx={{ 
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Save Documents
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Intern Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3
        }}>
          <Typography variant="h6" fontWeight={600}>
            Add New Intern
          </Typography>
          <IconButton onClick={handleCloseAddDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={editData.username}
              onChange={handleEditChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={editData.firstName}
                onChange={handleEditChange}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={editData.lastName}
                onChange={handleEditChange}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={editData.email}
              onChange={handleEditChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={editData.password}
              onChange={handleEditChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            
            <FormControl fullWidth variant="outlined">
              <TextField
                label="Department"
                name="department"
                value={editData.department}
                onChange={handleEditChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid #e0e0e0',
          p: 2
        }}>
          <Button 
            onClick={handleCloseAddDialog}
            variant="outlined"
            sx={{ 
              textTransform: 'none',
              mr: 2,
              borderRadius: 2
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddSubmit}
            variant="contained"
            sx={{ 
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={filterOpen}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: 200,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon color="primary" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Undo Delete Snackbar */}
      <Snackbar
        open={showUndoSnackbar}
        onClose={handleCloseUndoSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseUndoSnackbar}
          severity="info"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleUndoDelete}
              sx={{ fontWeight: 600 }}
            >
              UNDO
            </Button>
          }
          sx={{
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '0.875rem'
            }
          }}
        >
          Intern {deletedIntern?.name} deleted
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InternManagementLists;