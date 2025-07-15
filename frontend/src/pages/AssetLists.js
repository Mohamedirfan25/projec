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
  List,
  ListItem,
  ListItemText,
  Divider
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
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

const AssetLists = () => {
  const [activeTab, setActiveTab] = useState('InProgress');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [interns, setInterns] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    scheme: '',
    domain: ''
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [addAssetDialogOpen, setAddAssetDialogOpen] = useState(false);
  const [editAssetDialogOpen, setEditAssetDialogOpen] = useState(false);
  const [assetForm, setAssetForm] = useState({
    model: '',
    type: '',
    department: '',
    assignedTo: '',
    status: ''
  });

  // Asset list state and filters
  const [assetPage, setAssetPage] = useState(1);
  const [assetRowsPerPage, setAssetRowsPerPage] = useState(5);
  const [assetFilterAnchorEl, setAssetFilterAnchorEl] = useState(null);
  const [assetFilters, setAssetFilters] = useState({
    assetType: '',
    assetStatus: ''
  });
  const [assets, setAssets] = useState([
    { id: 'Laptop-001', type: 'Laptop', assignedTo: 'Intern 1', status: 'Assigned', date: '2023-01-15' },
    { id: 'Mouse-005', type: 'Mouse', assignedTo: 'Intern 1', status: 'Assigned', date: '2023-01-15' },
    { id: 'Keyboard-012', type: 'Keyboard', assignedTo: 'Intern 2', status: 'Assigned', date: '2023-02-20' },
    { id: 'Monitor-008', type: 'Monitor', assignedTo: '', status: 'Available', date: '2023-03-10' },
    { id: 'Laptop-002', type: 'Laptop', assignedTo: 'Intern 3', status: 'Assigned', date: '2023-04-05' },
    { id: 'Headset-003', type: 'Headset', assignedTo: '', status: 'Maintenance', date: '2023-04-18' },
  ]);

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const token = localStorage.getItem("token");
    
        // Fetch all required data in parallel
        const [userDataRes, registerRes, tempRes] = await Promise.all([
          axios.get("http://localhost:8000/Sims/user-data/", {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/Sims/register/", {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get("http://localhost:8000/Sims/temps/", {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);
    
        console.log("User Data:", userDataRes.data);
    
        // Get intern usernames from temp data
        const internUsernames = new Set(
          tempRes.data
            .filter((entry) => entry.role === "intern")
            .map((entry) => entry.username)
        );
    
        // Filter only intern users
        const internUsers = userDataRes.data.filter((user) =>
          internUsernames.has(user.username)
        );
    
        // Combine intern data with registration info
        const combinedData = internUsers.map((user) => {
          const registerInfo = registerRes.data.find(
            (reg) => reg.id === user.user
          ) || {};
          return {
            ...user,
            ...registerInfo,
            firstName: registerInfo.first_name || "",
            lastName: registerInfo.last_name || "",
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
            firstName: item.first_name || item.firstName || "",
            lastName: item.last_name || item.lastName || "",
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
            teamName: item.team_name || "-",
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

  const handleAssetFilterClick = (event) => {
    setAssetFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleAssetFilterClose = () => {
    setAssetFilterAnchorEl(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssetFilterChange = (e) => {
    const { name, value } = e.target;
    setAssetFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      scheme: '',
      domain: ''
    });
  };

  const clearAssetFilters = () => {
    setAssetFilters({
      assetType: '',
      assetStatus: ''
    });
  };

  const handleMenuClick = (event, intern) => {
    setAnchorEl(event.currentTarget);
    setSelectedIntern(intern);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    // Handle delete logic here
    console.log('Delete intern:', selectedIntern);
    handleMenuClose();
  };

  const handleEdit = () => {
    // Handle edit logic here
    console.log('Edit intern:', selectedIntern);
    handleMenuClose();
  };

  const handleInternClick = (intern) => {
    setSelectedIntern(intern);
    setAssetDialogOpen(true);
  };

  const handleAddAsset = () => {
    setAddAssetDialogOpen(true);
  };

  const handleEditAsset = () => {
    setEditAssetDialogOpen(true);
  };

  const handleAssetFormChange = (e) => {
    const { name, value } = e.target;
    setAssetForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssetSubmit = () => {
    // Handle asset submission logic here
    console.log('Asset submitted:', assetForm);
    setAddAssetDialogOpen(false);
    setAssetForm({
      model: '',
      type: '',
      department: '',
      assignedTo: '',
      status: ''
    });
  };

  const handleAssetEditSubmit = () => {
    // Handle asset edit submission logic here
    console.log('Asset edited:', assetForm);
    setEditAssetDialogOpen(false);
  };

  const filteredInterns = interns.filter(intern => 
    intern.status === activeTab &&
    (intern.id.toString().includes(searchTerm) ||
    intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.scheme.toLowerCase().includes(searchTerm.toLowerCase()) ||
    intern.domain.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filters.department === '' || intern.department === filters.department) &&
    (filters.scheme === '' || intern.scheme === filters.scheme) &&
    (filters.domain === '' || intern.domain === filters.domain)
  );

  // Filter assets based on selected intern and filters
  const filteredAssets = assets.filter(asset => {
    const matchesIntern = !selectedIntern || asset.assignedTo === selectedIntern.name || asset.assignedTo === '';
    const matchesType = assetFilters.assetType === '' || asset.type === assetFilters.assetType;
    const matchesStatus = assetFilters.assetStatus === '' || asset.status === assetFilters.assetStatus;
    
    return matchesIntern && matchesType && matchesStatus;
  });

  const columns = [
    'Intern ID', 'Intern Name', 'Email ID', 'Department', 'Scheme', 'Domain', 'Start Date', 'End Date', 'Status', 'Action'
  ];

  // Get unique values for filters
  const departments = [...new Set(interns.map(intern => intern.department))];
  const schemes = [...new Set(interns.map(intern => intern.scheme))];
  const domains = [...new Set(interns.map(intern => intern.domain))];
  const assetTypes = [...new Set(assets.map(asset => asset.type))];
  const assetStatuses = [...new Set(assets.map(asset => asset.status))];

  // Pagination logic for main table
  const count = Math.ceil(filteredInterns.length / rowsPerPage);
  const paginatedInterns = filteredInterns.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Pagination logic for asset table
  const assetCount = Math.ceil(filteredAssets.length / assetRowsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (assetPage - 1) * assetRowsPerPage,
    assetPage * assetRowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleAssetChangePage = (event, newPage) => {
    setAssetPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleAssetChangeRowsPerPage = (event) => {
    setAssetRowsPerPage(parseInt(event.target.value, 10));
    setAssetPage(1);
  };

  const schemeColors = {
    'Free': { bg: '#e3f2fd', text: '#1976d2' },
    'Project': { bg: '#e8f5e9', text: '#388e3c' },
    'Course': { bg: '#fff3e0', text: '#ffa000' }
  };

  const domainColors = {
    'Full Stack': { bg: '#e3f2fd', text: '#1976d2' },
    'Machine Learning': { bg: '#f3e5f5', text: '#8e24aa' },
    'Cloud Computing': { bg: '#e0f7fa', text: '#00acc1' },
    'Mobile Development': { bg: '#e8f5e9', text: '#43a047' },
    'Data Analytics': { bg: '#f1f8e9', text: '#7cb342' },
    'Design Systems': { bg: '#fff8e1', text: '#ffb300' }
  };

  const statusColors = {
    'Assigned': { bg: 'rgba(76, 175, 80, 0.1)', text: '#388e3c' },
    'Available': { bg: 'rgba(33, 150, 243, 0.1)', text: '#1976d2' },
    'Maintenance': { bg: 'rgba(255, 152, 0, 0.1)', text: '#ff9800' }
  };

  const open = Boolean(filterAnchorEl);
  const assetFilterOpen = Boolean(assetFilterAnchorEl);

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
            Asset List
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
        Add Asset
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAsset}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1
          }}
        >
        Add Asset
        </Button>
      </Box>

      {/* Main Filter Popover */}
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
              value={filters.department}
              onChange={handleFilterChange}
              displayEmpty
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
          Add Asset
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 1 }}>Scheme</Typography>
            <Select
              name="scheme"
              value={filters.scheme}
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
              value={filters.domain}
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
      Add Asset
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
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
                    color: 'text.primary',
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: '#f5f5f5'
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
                  <Button 
                    onClick={() => handleInternClick(intern)}
                    sx={{ 
                      textTransform: 'none', 
                      color: 'text.primary',
                      fontWeight: 700,
                      p: 0,
                      minWidth: 'auto',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {intern.id}
                  </Button>
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
                      <Typography variant="body2" fontWeight={500}>
                        {intern.name}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {intern.email}
                  </Typography>
                </TableCell>
                <TableCell>{intern.department}</TableCell>
                <TableCell>
                  <Chip
                    label={intern.scheme}
                    size="small"
                    sx={{
                      backgroundColor: schemeColors[intern.scheme]?.bg || '#f5f5f5',
                      color: schemeColors[intern.scheme]?.text || 'text.primary',
                      fontWeight: 500,
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
                      color: domainColors[intern.domain]?.text || 'text.primary',
                      fontWeight: 500
                    }}
                  />
                </TableCell>
                <TableCell>{intern.startDate}</TableCell>
                <TableCell>{intern.endDate}</TableCell>
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
                      fontWeight: 500
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, intern)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <List>
                      <ListItem button onClick={handleEdit}>
                        <EditIcon color="primary" sx={{ mr: 1 }} />
                        <ListItemText primary="Edit" />
                      </ListItem>
                      <ListItem button onClick={handleDelete}>
                        <DeleteIcon color="error" sx={{ mr: 1 }} />
                        <ListItemText primary="Delete" />
                      </ListItem>
                    </List>
                  </Popover>
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

      {/* Asset List Dialog */}
      <Dialog 
        open={assetDialogOpen} 
        onClose={() => setAssetDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" fontWeight={700}>
            Asset List for {selectedIntern?.name} (ID: {selectedIntern?.id})
          </Typography>
          <Box>
            <IconButton
              onClick={handleAssetFilterClick}
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
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', backgroundColor: '#f5f5f5' }}>Asset ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', backgroundColor: '#f5f5f5' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', backgroundColor: '#f5f5f5' }}>Assigned To</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', backgroundColor: '#f5f5f5' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', backgroundColor: '#f5f5f5' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.primary', backgroundColor: '#f5f5f5' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAssets.map((asset) => (
                  <TableRow hover key={asset.id}>
                    <TableCell>{asset.id}</TableCell>
                    <TableCell>{asset.type}</TableCell>
                    <TableCell>{asset.assignedTo || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={asset.status} 
                        size="small" 
                        sx={{
                          backgroundColor: statusColors[asset.status]?.bg,
                          color: statusColors[asset.status]?.text,
                          fontWeight: 500
                        }}
                      />
                    </TableCell>
                    <TableCell>{asset.date}</TableCell>
                    <TableCell>
                      <IconButton onClick={handleEditAsset}>
                        <EditIcon color="primary" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fafafa',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedAssets.length} of {filteredAssets.length} assets
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }} color="text.secondary">
              Rows per page:
            </Typography>
            <FormControl variant="standard" size="small">
              <Select
                value={assetRowsPerPage}
                onChange={handleAssetChangeRowsPerPage}
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
              count={assetCount}
              page={assetPage}
              onChange={handleAssetChangePage}
              shape="rounded"
              sx={{ ml: 2 }}
            />
          </Box>
        </DialogActions>
      </Dialog>

      {/* Asset Filter Popover */}
      <Popover
        id="asset-filter-popover"
        open={assetFilterOpen}
        anchorEl={assetFilterAnchorEl}
        onClose={handleAssetFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
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
        <Typography variant="h6" sx={{ mb: 2 }}>Asset Filters</Typography>
        
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 1 }}>Asset Type</Typography>
            <Select
              name="assetType"
              value={assetFilters.assetType}
              onChange={handleAssetFilterChange}
              displayEmpty
            >
              <MenuItem value="">All Types</MenuItem>
              {assetTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 1 }}>Status</Typography>
            <Select
              name="assetStatus"
              value={assetFilters.assetStatus}
              onChange={handleAssetFilterChange}
              displayEmpty
            >
              <MenuItem value="">All Statuses</MenuItem>
              {assetStatuses.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              onClick={clearAssetFilters}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Clear
            </Button>
            <Button 
              onClick={handleAssetFilterClose}
              variant="contained"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Apply
            </Button>
          </Box>
        </Stack>
      </Popover>

      {/* Add Asset Dialog */}
      <Dialog 
        open={addAssetDialogOpen} 
        onClose={() => setAddAssetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2
        }}>
          <Typography variant="h6" fontWeight={700}>
            Add New Asset
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Intern ID"
              variant="outlined"
              size="small"
              sx={{ backgroundColor: '#fff' }}
            />
            <TextField
              fullWidth
              label="Intern Name"
              variant="outlined"
              size="small"
              sx={{ backgroundColor: '#fff' }}
            />
            <TextField
              fullWidth
              label="Model"
              variant="outlined"
              size="small"
              name="model"
              value={assetForm.model}
              onChange={handleAssetFormChange}
              sx={{ backgroundColor: '#fff' }}
            />
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Type</Typography>
              <Select
                name="type"
                value={assetForm.type}
                onChange={handleAssetFormChange}
                displayEmpty
                sx={{ 
                  '& .MuiSelect-select': {
                    py: 1
                  }
                }}
              >
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="Laptop">Laptop</MenuItem>
                <MenuItem value="Desktop">Desktop</MenuItem>
                <MenuItem value="Mouse">Mouse</MenuItem>
                <MenuItem value="Keyboard">Keyboard</MenuItem>
                <MenuItem value="Printer">Printer</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Department</Typography>
              <Select
                name="department"
                value={assetForm.department}
                onChange={handleAssetFormChange}
                displayEmpty
                sx={{ 
                  '& .MuiSelect-select': {
                    py: 1
                  }
                }}
              >
                <MenuItem value="">Select Department</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Academy">Academy</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Assigned To"
              variant="outlined"
              size="small"
              name="assignedTo"
              value={assetForm.assignedTo}
              onChange={handleAssetFormChange}
              sx={{ backgroundColor: '#fff' }}
            />
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Status</Typography>
              <Select
                name="status"
                value={assetForm.status}
                onChange={handleAssetFormChange}
                displayEmpty
                sx={{ 
                  '& .MuiSelect-select': {
                    py: 1
                  }
                }}
              >
                <MenuItem value="">Select Status</MenuItem>
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fafafa'
        }}>
          <Button 
            onClick={() => setAddAssetDialogOpen(false)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAssetSubmit}
            disabled={!assetForm.model || !assetForm.type}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Asset Dialog */}
      <Dialog 
        open={editAssetDialogOpen} 
        onClose={() => setEditAssetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2
        }}>
          <Typography variant="h6" fontWeight={700}>
            Edit Asset
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Asset ID"
              variant="outlined"
              size="small"
              value="Laptop-001"
              disabled
              sx={{ backgroundColor: '#fff' }}
            />
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Type</Typography>
              <Select
                name="type"
                value="Laptop"
                onChange={handleAssetFormChange}
                sx={{ 
                  '& .MuiSelect-select': {
                    py: 1
                  }
                }}
              >
                <MenuItem value="Laptop">Laptop</MenuItem>
                <MenuItem value="Desktop">Desktop</MenuItem>
                <MenuItem value="Mouse">Mouse</MenuItem>
                <MenuItem value="Keyboard">Keyboard</MenuItem>
                <MenuItem value="Printer">Printer</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Assigned To"
              variant="outlined"
              size="small"
              value={selectedIntern?.name || ''}
              disabled
              sx={{ backgroundColor: '#fff' }}
            />
            <FormControl fullWidth size="small" sx={{ backgroundColor: '#fff' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Status</Typography>
              <Select
                name="status"
                value="Assigned"
                onChange={handleAssetFormChange}
                sx={{ 
                  '& .MuiSelect-select': {
                    py: 1
                  }
                }}
              >
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fafafa'
        }}>
          <Button 
            onClick={() => setEditAssetDialogOpen(false)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAssetEditSubmit}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssetLists;