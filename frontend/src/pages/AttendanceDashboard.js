import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Tabs,
  Tab,
  ThemeProvider,
  createTheme,
  Box,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Checkbox,
  Avatar,
  Badge,
  Popover,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Tooltip,
  Chip,
  Switch,
  FormGroup,
  FormControlLabel,
  Breadcrumbs,
  Link,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Drawer,
  CssBaseline,
  ListItemButton,
  ListItemAvatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  ButtonGrou
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  DateRange as DateRangeIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,
  Star as StarIcon,
  FileDownload as FileDownloadIcon,
  FilterAlt as FilterAltIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  QueryStats as QueryStatsIcon,
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Person as PersonIcon,
  TableChart,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  Engineering as EngineeringIcon,
  DesignServices as DesignServicesIcon,
  ArrowDropDown
} from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area, RadialBarChart, RadialBar } from "recharts";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LeaveList from './LeaveList';

// Customized theme for professional appearance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px 0 rgba(0,0,0,0.12)'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#333333',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }
      }
    }
  }
});

// Helper functions for avatars
function stringToColor(string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function getInitials(name) {
  return name.split(' ').map(part => part[0]).join('').toUpperCase();
}
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

const AttendanceDashboard = () => {
  // User permissions state
  const [userPermissions, setUserPermissions] = useState({
    hasAssetAccess: false,
    hasAttendanceAccess: true, // Default to true since they're in the attendance dashboard
    hasPayrollAccess: false,
    hasInternAccess: false // Add this state
  });

  // Update the getDashboardOptions function to use the component's state
  const getDashboardOptions = () => {
    return [
      {
        id: 'asset',
        label: 'Asset Dashboard',
        icon: <EngineeringIcon />,
        visible: userPermissions.hasAssetAccess
      },
      {
        id: 'attendance',
        label: 'Attendance Dashboard',
        icon: <AssignmentIcon />,
        current: true,
        visible: userPermissions.hasAttendanceAccess
      },
      {
        id: 'intern',
        label: 'Intern Dashboard',
        icon: <PeopleIcon />,
        visible: userPermissions.hasInternAccess // Changed from true to use userPermissions
      },
      {
        id: 'payroll',
        label: 'Payroll Dashboard',
        icon: <AttachMoneyIcon />,
        visible: userPermissions.hasPayrollAccess
      }
    ].filter(option => option.visible);
  };

  // Fetch user permissions when component mounts
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/Sims/user-permissions/", {
          headers: { Authorization: `Token ${token}` }
        });
        setUserPermissions(response.data);
      } catch (error) {
        console.error("Error fetching user permissions:", error);
        // Set default permissions if the API call fails
        setUserPermissions({
          hasAssetAccess: false,
          hasAttendanceAccess: true,
          hasPayrollAccess: false,
          hasInternAccess: false // Add this default value
        });
      }
    };

    fetchUserPermissions();
  }, []);

  // Existing state declarations
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateRange, setDateRange] = useState("month");
  const [currentUser, setCurrentUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [internData, setInternData] = useState([]);
  const [dashboardAnchorEl, setDashboardAnchorEl] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logData, setLogData] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    username: "N/A",
    email: "N/A",
    phone_no: "N/A",
    role: "N/A",
    startDate: "N/A",
    department: "N/A"
  });

  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const actionMenuOpen = Boolean(actionAnchorEl);
  const accountMenuOpen = Boolean(accountAnchorEl);
  const dashboardMenuOpen = Boolean(dashboardAnchorEl);

  // Helper functions for date/time formatting
  const formatTime = (timeStr) => {
    if (!timeStr) return "-";
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // For fetching temp data
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get("http://localhost:8000/Sims/attendance/", {
        headers: { Authorization: `Token ${token}` },
      });

      const formattedData = response.data.flatMap(intern => {
        // Process each intern's records
        return intern.records.map(record => {
          const dateObj = new Date(record.date);
          const day = dateObj.toLocaleString("en-US", { weekday: "short" });

          // Calculate work time if both check-in and check-out exist
          let workTime = "--";
          if (record.check_in && record.check_out) {
            const start = new Date(record.check_in);
            const end = new Date(record.check_out);
            const totalMinutes = Math.round((end - start) / 60000);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            workTime = `${hours}h ${minutes}m`;
          }

          return {
            id: record.id,
            intern: intern.name || "Unknown Intern",
            internId: intern.emp_id,
            date: dateObj.toLocaleDateString("en-US"),
            rawDate: record.date,
            day: day,
            status: record.present_status || "Null",
            checkIn: record.check_in ? formatTime(record.check_in) : "-",
            checkOut: record.check_out ? formatTime(record.check_out) : "--",
            workTime: workTime,
            totalHours: record.total_hours || "--",
            logs: Array.isArray(record.logs) ? record.logs : [],
            firstHalfStatus: record.check_in ? "Present" : "Absent",
            secondHalfStatus: record.check_out ? "Present" : "Absent"
          };
        });
      });

      setAttendanceData(formattedData);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // First fetch staff details
      const staffResponse = await axios.get("http://localhost:8000/Sims/staffs-details/", {
        headers: { Authorization: `Token ${token}` }
      });

      if (staffResponse.data && staffResponse.data.length > 0) {
        const staffData = staffResponse.data[0];
        const personalData = staffData.details.personal_data;
        const userData = staffData.details.user_data;

        // Then fetch additional user data
        const userResponse = await axios.get("http://localhost:8000/Sims/user-data/", {
          headers: { Authorization: `Token ${token}` }
        });

        // Find the current user in the user data
        const currentUserData = userResponse.data.find(user =>
          user.username === personalData?.username
        );

        setProfileData({
          username: personalData?.username || "N/A",
          email: personalData?.email || "N/A",
          phone_no: personalData?.phone_no || "N/A",
          role: "Staff",
          startDate: userData?.start_date || "N/A",
          department: currentUserData?.domain_name || userData?.domain_name || "N/A",
          photo: personalData?.photo || null,
          aadhar_number: personalData?.aadhar_number || "N/A",
          gender: personalData?.gender === 'M' ? 'Male' : 'Female',
          shift_timing: currentUserData?.shift_timing || userData?.shift_timing || "N/A",
          team_name: currentUserData?.team_name || userData?.team_name || "N/A",
          reporting_manager: currentUserData?.reporting_manager_username ||
            userData?.reporting_manager_username || "N/A",
          // Additional fields from user data if needed
          employee_id: currentUserData?.emp_id || "N/A",
          designation: currentUserData?.designation || "N/A"
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  };

  // Update useEffect to fetch profile data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchProfileData();
    fetchAttendanceData();
  }, []);


  // 🔁 Merge checkIn/Out after attendance + logs are loaded
  useEffect(() => {
    if (attendanceData.length === 0 || logData.length === 0) return;

    const updated = attendanceData.map((entry) => {
      const log = logData.find((log) => log.attendance === entry.id);
      return {
        ...entry,
        checkIn: log?.check_in ? formatTime(log.check_in) : "-",
        checkOut: log?.check_out ? formatTime(log.check_out) : "-"
      };
    });

    setMergedData(updated);
  }, [attendanceData, logData]);

  // Filter data based on search and filters
  const filteredData = attendanceData.filter((entry) => {
    const matchesSearch = entry.intern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.internId.toString().includes(searchQuery);

    const matchesStatus = filterStatus ? entry.status === filterStatus : true;

    let matchesDate = true;
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      const entryDateStr = new Date(entry.rawDate).toISOString().split('T')[0];
      matchesDate = entryDateStr === selectedDateStr;
    } else if (dateRange === "today") {
      const today = new Date().toISOString().split('T')[0];
      const entryDateStr = new Date(entry.rawDate).toISOString().split('T')[0];
      matchesDate = entryDateStr === today;
    } else if (dateRange === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      matchesDate = new Date(entry.rawDate) >= oneWeekAgo;
    } else if (dateRange === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      matchesDate = new Date(entry.rawDate) >= oneMonthAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });
  // Handle action menu
  const handleActionMenuClick = (event, record) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedRecord(record);
  };

  const handleActionMenuClose = () => {
    setActionAnchorEl(null);
  };

  // Handle dialogs
  const handleDialogOpen = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    handleActionMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  // Edit handler
  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const payload = {
        present_status: selectedRecord.status,
        // Include other fields if needed
      };

      // Only include check_in/check_out if not a leave request
      if (selectedRecord.status !== "Absent" && !selectedRecord.leaveRequest) {
        if (selectedRecord.logs.length > 0) {
          payload.check_in = selectedRecord.logs[0].check_in;
          if (selectedRecord.logs[0].check_out) {
            payload.check_out = selectedRecord.logs[0].check_out;
          }
        }
      }

      await axios.patch(
        `http://localhost:8000/Sims/attendance/${selectedRecord.id}/`,
        payload,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      await fetchAttendanceData();
      showSnackbar("Attendance record updated successfully");
      handleDialogClose();
    } catch (err) {
      console.error("Error updating attendance:", err);
      showSnackbar(
        err.response?.data?.error ||
        err.response?.data?.present_status?.[0] ||
        "Failed to update record",
        "error"
      );
    }
  };
  // Delete handler
  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.delete(
        `http://localhost:8000/Sims/attendance/${selectedRecord.id}/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      await fetchAttendanceData();
      showSnackbar("Record deleted successfully");
      handleDialogClose();
    } catch (err) {
      console.error("Error deleting attendance:", err);
      showSnackbar(err.response?.data?.error || "Failed to delete record", "error");
    }
  };

  // Handle field change in edit form
  const handleFieldChange = (field, value) => {
    setSelectedRecord(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle export
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `attendance_${dateRange}_${new Date().toISOString().slice(0, 10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showSnackbar("Data exported successfully");
  };

  // Handle account menu
  const handleAccountMenuClick = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
  };

  // Handle dashboard menu
  const handleDashboardMenuClick = (event) => {
    setDashboardAnchorEl(event.currentTarget);
  };

  const handleDashboardMenuClose = () => {
    setDashboardAnchorEl(null);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/Sims/logout/",
        {},
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/loginpage";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle notifications
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  // Handle snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  // Add this with your other state declarations
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New attendance record submitted", time: "2 hours ago", read: false },
    { id: 2, message: "System maintenance scheduled", time: "1 day ago", read: true },
    { id: 3, message: "Your profile has been updated", time: "3 days ago", read: true },
  ]);
  // Add this with your other handler functions
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };


  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterStatus("");
    setDateRange("month");
    setSelectedDate(null);
    setPage(0);
  };
  // Update the calculateAttendanceStats function to remove counts
  const calculateAttendanceStats = () => {
    if (attendanceData.length === 0) {
      return {
        present: 0,
        absent: 0,
        late: 0
      };
    }

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    attendanceData.forEach(record => {
      switch (record.status) {
        case "Present":
          presentCount++;
          break;
        case "Absent":
          absentCount++;
          break;
        case "Late":
          lateCount++;
          break;
        default:
          break;
      }
    });

    const totalRecords = attendanceData.length;

    return {
      present: totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0,
      absent: totalRecords > 0 ? Math.round((absentCount / totalRecords) * 100) : 0,
      late: totalRecords > 0 ? Math.round((lateCount / totalRecords) * 100) : 0
    };
  };
  // Get the stats
  const calculateWeeklyTrends = () => {
    if (attendanceData.length === 0) {
      return [
        { day: "Mon", Present: 0 },
        { day: "Tue", Present: 0 },
        { day: "Wed", Present: 0 },
        { day: "Thu", Present: 0 },
        { day: "Fri", Present: 0 },
        { day: "Sat", Present: 0 }
      ];
    }

    // Group by day of week
    const dayGroups = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: []
    };

    attendanceData.forEach(record => {
      const day = new Date(record.rawDate).toLocaleString("en-US", { weekday: "short" });
      if (dayGroups[day]) {
        dayGroups[day].push(record);
      }
    });

    // Calculate present percentage for each day
    return Object.keys(dayGroups).map(day => {
      const dayRecords = dayGroups[day];
      if (dayRecords.length === 0) return { day, Present: 0 };

      const presentCount = dayRecords.filter(r => r.status === "Present").length;
      const presentPercentage = Math.round((presentCount / dayRecords.length) * 100);

      return {
        day,
        Present: presentPercentage
      };
    });
  };

  // Get the stats
  const attendanceStats = calculateAttendanceStats();
  const weeklyTrendData = calculateWeeklyTrends();

  // Update chart data
  const chartData = [
    { name: "Present", value: attendanceStats.present, color: "#00c853" },
    { name: "Absent", value: attendanceStats.absent, color: "#ff3d00" },
    { name: "Late", value: attendanceStats.late, color: "#ffab00" },
  ];
  const renderDashboard = () => (
    <Grid container spacing={3}>
      {chartData.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{
            bgcolor: index === 0 ? '#4caf50' :
              index === 1 ? '#f44336' : '#ff9800',
            color: 'white',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>
                {item.name} Attendance
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" color="inherit">{item.value}%</Typography>
                <Avatar sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 56,
                  height: 56
                }}>
                  {index === 0 ? <CheckCircleIcon fontSize="large" /> :
                    index === 1 ? <CancelIcon fontSize="large" /> :
                      <QueryStatsIcon fontSize="large" />}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {/* Weekly Trend Chart */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Weekly Attendance Trend (Present Only)</Typography>
            </Box>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyTrendData}
                  margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5E60CE" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#5E60CE" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#2d3748' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#2d3748' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${value}%`, 'Attendance']}
                    labelFormatter={(label) => `Day: ${label}`}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.96)',
                      border: '1px solid #e0e0e0',
                      borderRadius: 4,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Present"
                    stroke="#00c853"
                    fillOpacity={1}
                    fill="url(#colorPresent)"
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Attendance */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Recent Attendance Records
              </Typography>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
              >
                Export Data
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Intern</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Check-In</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Check-Out</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.slice(0, 5).map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              mr: 2,
                              backgroundColor: stringToColor(row.intern),
                              color: 'white',
                              fontSize: '0.875rem'
                            }}
                          >
                            {getInitials(row.intern)}
                          </Avatar>
                          {row.intern}
                        </Box>
                      </TableCell>
                      <TableCell>{row.internId}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={
                            row.status === "Present" ? "success" :
                              row.status === "Absent" ? "error" : "warning"
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {row.logs.length > 0 ? (
                          <Tooltip title={`First check-in at ${formatTime(row.logs[0].check_in)}`}>
                            <span>{formatTime(row.logs[0].check_in)}</span>
                          </Tooltip>
                        ) : row.checkIn}
                      </TableCell>
                      <TableCell>
                        {row.logs.length > 0 ? (
                          <Tooltip title={`Last check-out at ${formatTime(row.logs[row.logs.length - 1].check_out)}`}>
                            <span>
                              {row.logs[row.logs.length - 1].check_out ?
                                formatTime(row.logs[row.logs.length - 1].check_out) : "-"}
                            </span>
                          </Tooltip>
                        ) : row.checkOut}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleActionMenuClick(e, row)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTable = () => (
    <Grid item xs={12}>
      <AttendanceLists />
    </Grid>
  );


  const renderProfile = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            {profileData.photo ? (
              <Avatar
                src={`http://localhost:8000${profileData.photo}`}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  border: '3px solid',
                  borderColor: 'primary.main'
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  bgcolor: stringToColor(profileData.username),
                  fontSize: '2.5rem'
                }}
              >
                {getInitials(profileData.username)}
              </Avatar>
            )}
            <Typography variant="h5" gutterBottom>
              {profileData.username}
            </Typography>
            <Chip
              label={profileData.role}
              color="primary"
              sx={{ mb: 2 }}
            />
            <Typography color="textSecondary" paragraph>
              {profileData.department} Department
            </Typography>

            <Box display="flex" justifyContent="center" gap={2} mb={3}>
              <IconButton color="primary">
                <EmailIcon />
              </IconButton>
              <IconButton color="primary">
                <PhoneIcon />
              </IconButton>
              <IconButton color="primary">
                <CalendarTodayIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Staff Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Username
                </Typography>
                <Typography paragraph>
                  {profileData.username || "Not specified"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                <Typography paragraph>
                  {profileData.email || "Not specified"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Phone
                </Typography>
                <Typography paragraph>
                  {profileData.phone_no || "Not specified"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Aadhar Number
                </Typography>
                <Typography paragraph>
                  {profileData.aadhar_number || "Not specified"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Gender
                </Typography>
                <Typography paragraph>
                  {profileData.gender || "Not specified"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Shift Timing
                </Typography>
                <Typography paragraph>
                  {profileData.shift_timing || "Not specified"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Team Name
                </Typography>
                <Typography paragraph>
                  {profileData.team_name || "Not specified"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Reporting Manager
                </Typography>
                <Typography paragraph>
                  {profileData.reporting_manager || "Not specified"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Start Date
                </Typography>
                <Typography paragraph>
                  {profileData.startDate || "Not specified"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Department
                </Typography>
                <Typography paragraph>
                  {profileData.department || "Not specified"}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => setOpenModal(true)}
              >
                Edit Profile
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return renderDashboard();
      case "table":
        return renderTable();
      case "leave":
        return <LeaveList userRole="staff" />;
      case "profile":
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CssBaseline />

        {/* Top Navigation Bar */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper' }}>
          <Toolbar>
            <WorkIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />

            {/* Dashboard Switcher Dropdown */}
            <Button
              onClick={handleDashboardMenuClick}
              endIcon={<ArrowDropDown />}
              sx={{
                textTransform: 'none',
                color: 'text.primary',
                fontSize: '1rem',
                mr: 2
              }}
            >
              Switch Dashboard
            </Button>
            <Menu
              anchorEl={dashboardAnchorEl}
              open={dashboardMenuOpen}
              onClose={handleDashboardMenuClose}
            >
              {getDashboardOptions().map((dashboard) => (
                <MenuItem
                  key={dashboard.id}
                  onClick={() => {
                    navigate(`/${dashboard.id}`);
                    handleDashboardMenuClose();
                  }}
                  disabled={dashboard.current}
                >
                  <ListItemIcon>
                    {dashboard.icon}
                  </ListItemIcon>
                  <ListItemText primary={dashboard.label} />
                </MenuItem>
              ))}
            </Menu>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Attendance Management
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              <ToggleButtonGroup
                value={activeView}
                exclusive
                onChange={(e, newView) => newView && setActiveView(newView)}
                sx={{ mr: 2 }}
              >
                <ToggleButton value="dashboard">
                  <DashboardIcon sx={{ mr: 1 }} />
                  Dashboard
                </ToggleButton>
                <ToggleButton value="table">
                  <TableChart sx={{ mr: 1 }} />
                  Attendance Table
                </ToggleButton>
                <ToggleButton value="leave">
                  <AssignmentIcon sx={{ mr: 1 }} />
                  Leave List
                </ToggleButton>
              </ToggleButtonGroup>

              <Tooltip title="Notifications">
                <IconButton
                  color="inherit"
                  onClick={handleNotificationMenuOpen}
                  sx={{ mr: 1 }}
                >
                  <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Account">
                <IconButton color="inherit" onClick={handleAccountMenuClick}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {getInitials(profileData.username)}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={accountAnchorEl}
                open={accountMenuOpen}
                onClose={handleAccountMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => {
                  setActiveView("profile");
                  handleAccountMenuClose();
                }}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  My Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToAppIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>

              <Menu
                anchorEl={notificationAnchorEl}
                open={Boolean(notificationAnchorEl)}
                onClose={handleNotificationMenuClose}
                PaperProps={{
                  sx: {
                    width: 360,
                    maxWidth: '100%',
                  }
                }}
              >
                <MenuItem disabled>
                  <ListItemText
                    primary="Notifications"
                    secondary={`${notifications.filter(n => !n.read).length} new`}
                    sx={{ fontWeight: 'bold' }}
                  />
                </MenuItem>
                <Divider />
                {notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={handleNotificationMenuClose}
                    sx={{ bgcolor: notification.read ? 'inherit' : 'action.hover' }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {notification.message.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={notification.message}
                      secondary={notification.time}
                      primaryTypographyProps={{
                        fontWeight: notification.read ? 'normal' : 'bold',
                        color: notification.read ? 'text.secondary' : 'text.primary'
                      }}
                    />
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={handleNotificationMenuClose}>
                  <ListItemText primary="View all notifications" />
                </MenuItem>
              </Menu>
            </Box>

            {/* Mobile menu button */}
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Mobile menu */}
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{ display: { md: 'none' } }}
        >
          <Box sx={{ width: 250, p: 2 }}>
            <List>
              <ListItemButton
                selected={activeView === "dashboard"}
                onClick={() => {
                  setActiveView("dashboard");
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
              <ListItemButton
                selected={activeView === "table"}
                onClick={() => {
                  setActiveView("table");
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>
                  <TableChart />
                </ListItemIcon>
                <ListItemText primary="Attendance Table" />
              </ListItemButton>
              <ListItemButton
                selected={activeView === "leave"}
                onClick={() => {
                  setActiveView("leave");
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText primary="Leave List" />
              </ListItemButton>
            </List>
            <Divider />
            <List>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: { xs: 8, md: 0 } // Add margin top for mobile to account for app bar
          }}
        >
          {renderActiveView()}
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={actionAnchorEl}
          open={actionMenuOpen}
          onClose={handleActionMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => handleDialogOpen("edit")}>
            <EditIcon fontSize="small" sx={{ mr: 1.5 }} /> Edit Record
          </MenuItem>
          <MenuItem onClick={() => handleDialogOpen("delete")}>
            <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Delete Record
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}

        <Dialog open={openDialog && dialogType === "edit"} onClose={handleDialogClose}>
          <DialogTitle>Edit Attendance Record</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Date"
                value={selectedRecord?.date || ''}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Intern Name"
                value={selectedRecord?.intern || ''}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Intern ID"
                value={selectedRecord?.internId || ''}
                disabled
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedRecord?.status || ''}
                  onChange={(e) => handleFieldChange("status", e.target.value)}
                  label="Status"
                >
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Null">Null</MenuItem>
                </Select>
              </FormControl>
              {selectedRecord?.logs?.length > 0 && (
                <>
                  <TextField
                    fullWidth
                    label="First Check-In Time"
                    value={formatTime(selectedRecord.logs[0].check_in) || ''}
                    disabled
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Last Check-Out Time"
                    value={
                      selectedRecord.logs[selectedRecord.logs.length - 1].check_out ?
                        formatTime(selectedRecord.logs[selectedRecord.logs.length - 1].check_out) : '-'
                    }
                    disabled
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={openDialog && dialogType === "delete"} onClose={handleDialogClose}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the attendance record for {selectedRecord?.intern || 'this intern'}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};
export default AttendanceDashboard;