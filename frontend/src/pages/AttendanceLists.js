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
  Menu
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Work as WorkIcon, 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowDropDown as ArrowDropDownIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const AttendanceLists = () => {
  const [activeTab, setActiveTab] = useState('InProgress');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [interns, setInterns] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [editAttendanceDialogOpen, setEditAttendanceDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    scheme: '',
    domain: ''
  });

  // Attendance list states
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceRowsPerPage, setAttendanceRowsPerPage] = useState(5);
  const [attendanceFilterAnchorEl, setAttendanceFilterAnchorEl] = useState(null);
  const [attendanceFilters, setAttendanceFilters] = useState({
    status: '',
    date: ''
  });

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const token = localStorage.getItem("token");
  
        const res = await axios.get("http://localhost:8000/Sims/user-data/", {
          headers: { Authorization: `Token ${token}` },
        });
  
        const today = new Date();
  
        const filtered = res.data.filter((user) =>
          user.username?.toLowerCase().includes("intern")
        );
  
        const formatted = filtered.map((item) => {
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
            email: `${item.username}@example.com`,
            department: item.department || "-",
            scheme: item.scheme || "-",
            domain: item.domain || "-",
            startDate: item.start_date,
            endDate: item.end_date || "-",
            status,
          };
        });
  
        setInterns(formatted);
      } catch (error) {
        console.error("Failed to fetch interns:", error);
      }
    };
  
    fetchInterns();
  }, []);

  // Mock attendance data
  const attendanceData = [
    { id: 1, date: '2023-05-01', intern: selectedIntern?.name, status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
    { id: 2, date: '2023-05-02', intern: selectedIntern?.name, status: 'Present', checkIn: '09:15 AM', checkOut: '06:30 PM' },
    { id: 3, date: '2023-05-03', intern: selectedIntern?.name, status: 'Absent', checkIn: '-', checkOut: '-' },
    { id: 4, date: '2023-05-04', intern: selectedIntern?.name, status: 'Present', checkIn: '09:05 AM', checkOut: '05:45 PM' },
    { id: 5, date: '2023-05-05', intern: selectedIntern?.name, status: 'Present', checkIn: '08:45 AM', checkOut: '06:15 PM' },
    { id: 6, date: '2023-05-08', intern: selectedIntern?.name, status: 'Present', checkIn: '09:10 AM', checkOut: '06:05 PM' },
    { id: 7, date: '2023-05-09', intern: selectedIntern?.name, status: 'Absent', checkIn: '-', checkOut: '-' },
    { id: 8, date: '2023-05-10', intern: selectedIntern?.name, status: 'Present', checkIn: '08:50 AM', checkOut: '05:55 PM' },
  ];

  // Filtered attendance data
  const filteredAttendanceData = attendanceData.filter(record => 
    (attendanceFilters.status === '' || record.status === attendanceFilters.status) &&
    (attendanceFilters.date === '' || record.date.includes(attendanceFilters.date))
  );

  // Attendance pagination
  const attendanceCount = Math.ceil(filteredAttendanceData.length / attendanceRowsPerPage);
  const paginatedAttendance = filteredAttendanceData.slice(
    (attendancePage - 1) * attendanceRowsPerPage,
    attendancePage * attendanceRowsPerPage
  );

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
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

  // Attendance filter handlers
  const handleAttendanceFilterClick = (event) => {
    setAttendanceFilterAnchorEl(event.currentTarget);
  };

  const handleAttendanceFilterClose = () => {
    setAttendanceFilterAnchorEl(null);
  };

  const handleAttendanceFilterChange = (e) => {
    const { name, value } = e.target;
    setAttendanceFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearAttendanceFilters = () => {
    setAttendanceFilters({
      status: '',
      date: ''
    });
  };

  const handleMenuClick = (event, intern) => {
    setAnchorEl(event.currentTarget);
    setSelectedIntern(intern);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewAttendance = () => {
    setAttendanceDialogOpen(true);
    handleMenuClose();
  };

  const handleEditIntern = () => {
    handleMenuClose();
    // Edit logic here
  };

  const handleDeleteIntern = () => {
    handleMenuClose();
    // Delete logic here
  };

  const handleEditAttendance = () => {
    setEditAttendanceDialogOpen(true);
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

  const open = Boolean(filterAnchorEl);
  const id = open ? 'filter-popover' : undefined;

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
            Attendance  List
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
      </Box>

      <Popover
        id={id}
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
                    onClick={() => {
                      setSelectedIntern(intern);
                      setAttendanceDialogOpen(true);
                    }}
                    sx={{ 
                      fontWeight: 700, 
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
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedIntern?.id === intern.id}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleEditIntern}>
                      <EditIcon color="primary" sx={{ mr: 1 }} />
                      Edit
                    </MenuItem>
                    <MenuItem onClick={handleDeleteIntern}>
                      <DeleteIcon color="error" sx={{ mr: 1 }} />
                      Delete
                    </MenuItem>
                    <MenuItem onClick={handleViewAttendance}>
                      <WorkIcon color="action" sx={{ mr: 1 }} />
                      View Attendance
                    </MenuItem>
                  </Menu>
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

      {/* Attendance Dialog */}
      <Dialog
        open={attendanceDialogOpen}
        onClose={() => setAttendanceDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          py: 2,
          px: 3
        }}>
          <Typography variant="h6" fontWeight={700}>
            Attendance List - {selectedIntern?.name}
          </Typography>
          <IconButton 
            onClick={() => setAttendanceDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#fafafa'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={handleAttendanceFilterClick}
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
              <Popover
                open={Boolean(attendanceFilterAnchorEl)}
                anchorEl={attendanceFilterAnchorEl}
                onClose={handleAttendanceFilterClose}
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
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Attendance Filters</Typography>
                <Stack spacing={3}>
                  <FormControl fullWidth size="small">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Status</Typography>
                    <Select
                      name="status"
                      value={attendanceFilters.status}
                      onChange={handleAttendanceFilterChange}
                      displayEmpty
                      sx={{
                        '& .MuiSelect-select': {
                          py: 1
                        }
                      }}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="Present">Present</MenuItem>
                      <MenuItem value="Absent">Absent</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Date</Typography>
                    <TextField
                      type="date"
                      name="date"
                      value={attendanceFilters.date}
                      onChange={handleAttendanceFilterChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={{
                        '& .MuiInputBase-input': {
                          py: 1.5
                        }
                      }}
                    />
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button 
                      onClick={clearAttendanceFilters}
                      variant="outlined"
                      size="small"
                      sx={{ 
                        textTransform: 'none',
                        px: 2,
                        py: 0.5
                      }}
                    >
                      Clear
                    </Button>
                    <Button 
                      onClick={handleAttendanceFilterClose}
                      variant="contained"
                      size="small"
                      sx={{ 
                        textTransform: 'none',
                        px: 2,
                        py: 0.5
                      }}
                    >
                      Apply
                    </Button>
                  </Box>
                </Stack>
              </Popover>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Rows per page:
              </Typography>
              <FormControl variant="standard" size="small">
                <Select
                  value={attendanceRowsPerPage}
                  onChange={(e) => {
                    setAttendanceRowsPerPage(parseInt(e.target.value, 10));
                    setAttendancePage(1);
                  }}
                  IconComponent={ArrowDropDownIcon}
                  sx={{
                    '& .MuiSelect-select': {
                      py: 0.5,
                      pl: 1,
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
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f5f5f5', color: '#000' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f5f5f5', color: '#000' }}>Intern</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f5f5f5', color: '#000' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f5f5f5', color: '#000' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f5f5f5', color: '#000' }}>Check-In</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f5f5f5', color: '#000' }}>Check-Out</TableCell>
                  <TableCell sx={{ fontWeight: 700, backgroundColor: '#f5f5f5', color: '#000' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAttendance.map((row) => (
                  <TableRow 
                    key={row.id} 
                    hover
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        cursor: 'pointer'
                      } 
                    }}
                  >
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.intern}</TableCell>
                    <TableCell>{selectedIntern?.id}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          backgroundColor: row.status === 'Present' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                          color: row.status === 'Present' ? 'success.main' : 'error.main',
                          fontWeight: 500,
                          width: 80
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.checkIn}</TableCell>
                    <TableCell>{row.checkOut}</TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={handleEditAttendance} 
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                      >
                        <EditIcon color="primary" fontSize="small" />
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
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafafa'
        }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedAttendance.length} of {filteredAttendanceData.length} records
          </Typography>
          <Pagination
            count={attendanceCount}
            page={attendancePage}
            onChange={(e, newPage) => setAttendancePage(newPage)}
            shape="rounded"
            color="primary"
            size="small"
          />
        </DialogActions>
      </Dialog>

      {/* Edit Attendance Dialog */}
      <Dialog
        open={editAttendanceDialogOpen}
        onClose={() => setEditAttendanceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          py: 2,
          px: 3
        }}>
          <Typography variant="h6" fontWeight={700}>
            Edit Attendance
          </Typography>
          <IconButton 
            onClick={() => setEditAttendanceDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <Typography variant="body2" fontWeight={500} mb={1}>Date</Typography>
              <TextField 
                variant="outlined"
                size="small"
                value="2023-05-01"
                disabled
                sx={{
                  '& .MuiInputBase-input': {
                    py: 1.5
                  }
                }}
              />
            </FormControl>
            
            <FormControl fullWidth>
              <Typography variant="body2" fontWeight={500} mb={1}>Intern</Typography>
              <TextField 
                variant="outlined"
                size="small"
                value={selectedIntern?.name}
                disabled
                sx={{
                  '& .MuiInputBase-input': {
                    py: 1.5
                  }
                }}
              />
            </FormControl>
            
            <FormControl fullWidth>
              <Typography variant="body2" fontWeight={500} mb={1}>ID</Typography>
              <TextField 
                variant="outlined"
                size="small"
                value={selectedIntern?.id}
                disabled
                sx={{
                  '& .MuiInputBase-input': {
                    py: 1.5
                  }
                }}
              />
            </FormControl>
            
            <FormControl fullWidth>
              <Typography variant="body2" fontWeight={500} mb={1}>Status</Typography>
              <Select
                value="Present"
                size="small"
                sx={{
                  '& .MuiSelect-select': {
                    py: 1.5
                  }
                }}
              >
                <MenuItem value="Present">Present</MenuItem>
                <MenuItem value="Absent">Absent</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <Typography variant="body2" fontWeight={500} mb={1}>Check-In</Typography>
              <TextField 
                variant="outlined"
                size="small"
                value="09:00 AM"
                sx={{
                  '& .MuiInputBase-input': {
                    py: 1.5
                  }
                }}
              />
            </FormControl>
            
            <FormControl fullWidth>
              <Typography variant="body2" fontWeight={500} mb={1}>Check-Out</Typography>
              <TextField 
                variant="outlined"
                size="small"
                value="06:00 PM"
                sx={{
                  '& .MuiInputBase-input': {
                    py: 1.5
                  }
                }}
              />
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#fafafa'
        }}>
          <Button 
            onClick={() => setEditAttendanceDialogOpen(false)}
            variant="outlined"
            sx={{ 
              textTransform: 'none',
              px: 3,
              py: 1
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => setEditAttendanceDialogOpen(false)}
            variant="contained"
            sx={{ 
              textTransform: 'none',
              px: 3,
              py: 1
            }}
            startIcon={<CheckIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceLists;