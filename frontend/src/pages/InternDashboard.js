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
  ButtonGroup,

} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
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
  Groups as GroupsIcon,
  Engineering as EngineeringIcon,
  DataObject as DataObjectIcon,
  Science as ScienceIcon,
  DesignServices as DesignServicesIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Add as AddIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowDropDown,
  Person as PersonIcon,
  TableChart,
  TaskAlt,
} from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts";
import { faker } from '@faker-js/faker';
import { useNavigate } from "react-router-dom";
import { CheckCircleOutline as CheckCircleOutlineIcon } from "@mui/icons-material";
import axios from "axios";
import AssetReport from "./AssetReport";
import { Feedback } from "@mui/icons-material";
import PerformanceFeedbackPage from "./PerformanceFeedbackPage";
import TaskManager from "./Tasks"; // Adjust the path as needed
import InternManagementLists from "./InternManagementLists";
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
      paper: '#ffffff' ,
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4ECDC4'];

// Mock data for notifications
const notifications = [
  { id: 1, text: "New intern registered", time: "2 hours ago", read: false },
  { id: 2, text: "System maintenance scheduled for tonight", time: "5 hours ago", read: true },
  { id: 3, text: "Your report is ready for download", time: "1 day ago", read: true },
  { id: 4, text: "3 new applicants for the Full Stack intern position", time: "2 days ago", read: false }
];

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
  if (!name) return '?';
  return name.split(' ').map(part => part[0]).join('').toUpperCase();
}

const InternDashboard = () => {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [currentActionUser, setCurrentActionUser] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({
    offerLetter: null,
    nda: null,
    resume: null
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [dashboardAnchorEl, setDashboardAnchorEl] = useState(null);
  const [internCount, setInternCount] = useState(0);
  const [activeInternCount, setActiveInternCount] = useState(0);
  const [domainData, setDomainData] = useState([]);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone_no: "",
    role: "",
    startDate: "",
    department: "",
  });
  const [performanceData, setPerformanceData] = useState([
    { name: 'Jan', performance: 65 },
    { name: 'Feb', performance: 70 },
    { name: 'Mar', performance: 80 },
    { name: 'Apr', performance: 75 },
    { name: 'May', performance: 85 },
    { name: 'Jun', performance: 90 }
  ]);

  const navigate = useNavigate();
  const rowsPerPage = 5;

  // Dashboard options for dropdown
  const dashboardOptions = [
    {
      id: 'asset',
      label: 'Asset Dashboard',
      icon: <EngineeringIcon />
    },
    {
      id: 'attendance',
      label: 'Attendance Dashboard',
      icon: <AssignmentIcon />
    },
    {
      id: 'intern',
      label: 'Intern Dashboard',
      icon: <PeopleIcon />,
      current: true
    },
    {
      id: 'payroll',
      label: 'Payroll Dashboard',
      icon: <AttachMoneyIcon />
    }
  ];

  // Fetch all necessary data on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchUsers();
    fetchActiveInternCount();
    fetchInternCount();
    fetchDomainData();
    fetchProfileData();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/Sims/register/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const userDataResponse = await axios.get("http://localhost:8000/Sims/user-data/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      // Combine data from both endpoints
      const combinedUsers = response.data.map(registerUser => {
        const userData = userDataResponse.data.find(u => u.username === registerUser.username) || {};

        return {
          id: registerUser.id,
          username: registerUser.username,
          name: `${registerUser.first_name} ${registerUser.last_name}`,
          email: registerUser.email,
          department: userData.domain_name || registerUser.temp?.role || 'N/A',
          position: 'Intern',
          startDate: userData.start_date || registerUser.temp?.created_date,
          endDate: userData.end_date,
          status: userData.user_status ? userData.user_status.charAt(0).toUpperCase() + userData.user_status.slice(1) : 'Active',
          // Removed profilePicture
          lastActive: registerUser.temp?.updated_date,
          emp_id: registerUser.temp?.emp_id,
          domain: userData.domain,
          reporting_manager: userData.reporting_manager_username,
          shift_timing: userData.shift_timing,
          scheme: userData.scheme,
          team_name: userData.team_name
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar("Failed to load users", "error");
    }
  };

  const getNewInternsCount = (month, year) => {
    // This is a mock implementation - replace with your actual data logic
    return users.filter(user => {
      const userDate = new Date(user.startDate);
      return userDate.getMonth() === month &&
        userDate.getFullYear() === year;
    }).length;
  };

  const fetchInternCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/Sims/register/", {
        headers: { Authorization: `Token ${token}` },
      });
      setInternCount(response.data.length);

    } catch (error) {
      console.error("Error fetching intern count:", error);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const fetchActiveInternCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/Sims/user-data/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const activeInterns = response.data.filter(user =>
        user.user_status && user.user_status.toLowerCase() === "active"
      );
      setActiveInternCount(activeInterns.length);
    } catch (error) {
      console.error("Error fetching active intern count:", error);
    }
  };

  const fetchDomainData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/Sims/user-data/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const domainCounter = {};
      response.data.forEach(user => {
        const domain = user.domain_name || "Unknown";
        domainCounter[domain] = (domainCounter[domain] || 0) + 1;
      });

      const formattedData = Object.keys(domainCounter).map(key => ({
        name: key,
        value: domainCounter[key],
      }));

      setDomainData(formattedData);
    } catch (error) {
      console.error("Error fetching domain data:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  };

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("user"); // 👈 Store this at login

      const personalDataResponse = await axios.get("http://localhost:8000/Sims/personal-data/", {
        headers: { Authorization: `Token ${token}` },
      });

      const tempViewResponse = await axios.get("http://localhost:8000/Sims/temps/", {
        headers: { Authorization: `Token ${token}` },
      });

      const userDataResponse = await axios.get("http://localhost:8000/Sims/user-data/", {
        headers: { Authorization: `Token ${token}` },
      });

      const collegeDetailsResponse = await axios.get("http://localhost:8000/Sims/college-details/", {
        headers: { Authorization: `Token ${token}` },
      });

      // Match current user from the array
      const personalData = personalDataResponse.data.find(p => p.username === username) || {};
      const tempView = tempViewResponse.data.find(t => t.username === username) || {};
      const userData = userDataResponse.data.find(u => u.username === username) || {};
      const collegeDetails = collegeDetailsResponse.data.find(c => c.username === username) || {};

      setProfileData({
        username: personalData?.username || "N/A",
        email: personalData?.email || "N/A",
        phone_no: personalData?.phone_no || "N/A",
        role: tempView?.role || "N/A",
        startDate: userData?.start_date || "N/A",
        department: collegeDetails?.department || "N/A",
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };



  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = {
      username: event.target.username.value,
      first_name: event.target.first_name.value,
      last_name: event.target.last_name.value,
      email: event.target.email.value,
      password: event.target.password.value,
      temp: {
        role: event.target.department.value,
        emp_id: Math.floor(Math.random() * 1000) // Generate temporary ID
      }
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:8000/Sims/register/", formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      const newUser = response.data;
      setUsers([...users, {
        id: newUser.id,
        username: newUser.username,
        name: `${newUser.first_name} ${newUser.last_name}`,
        email: newUser.email,
        department: newUser.temp.role,
        position: 'Intern',
        status: 'Active',
        // Removed profilePicture
        emp_id: newUser.temp.emp_id
      }]);

      showSnackbar("Intern created successfully!");
      fetchInternCount();
      fetchActiveInternCount();
      fetchDomainData();
    } catch (error) {
      console.error("Registration error:", error);
      showSnackbar(error.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/Sims/register/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setUsers(users.filter(user => user.id !== id));
      showSnackbar("Intern deleted successfully!");
      fetchInternCount();
      fetchActiveInternCount();
      fetchDomainData();
    } catch (error) {
      console.error("Delete error:", error);
      showSnackbar(error.response?.data?.message || "Delete failed", "error");
    }
  };

  const handleBulkDelete = () => {
    // Implement bulk delete if needed
    showSnackbar("Bulk delete not implemented yet", "warning");
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleAccountMenuClick = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
  };

  const handleDashboardMenuClick = (event) => {
    setDashboardAnchorEl(event.currentTarget);
  };

  const handleDashboardMenuClose = () => {
    setDashboardAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

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

  const handleActionMenuOpen = (event, user) => {
    setActionMenuAnchorEl(event.currentTarget);
    setCurrentActionUser(user);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setCurrentActionUser(null);
  };

  const handleOpenModal = (user = null) => {
    setCurrentUser(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUploadClick = (user) => {
    setCurrentActionUser(user);
    setUploadDialogOpen(true);
  };

  const handleUploadClose = () => {
    setUploadDialogOpen(false);
    setSelectedFiles({ offerLetter: null, nda: null, resume: null });
  };

  const handleFileChange = (event) => {
    setSelectedFiles({
      ...selectedFiles,
      [event.target.name]: event.target.files[0]
    });
    setUploadCompleted(false);
  };

  // Update the handleFileUpload function in InternDashboard.js
  const handleFileUpload = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("Authentication required. Please login again.", "error");
        return;
      }

      setLoading(true);
      setUploadCompleted(false);

      // Helper function to upload a single document with retry logic
      const uploadSingleDocument = async (file, title, description, retries = 3) => {
        if (!file) return null;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('receiver', currentActionUser.emp_id);

        let lastError;

        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            const response = await axios.post(
              "http://localhost:8000/Sims/documents/",
              formData,
              {
                headers: {
                  Authorization: `Token ${token}`,
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
            return response.data;
          } catch (error) {
            lastError = error;
            if (error.response?.status >= 500 && attempt < retries - 1) {
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
              continue;
            }
            throw error;
          }
        }
        throw lastError;
      };

      // Upload files sequentially with proper error handling
      const uploadResults = [];
      const errors = [];

      // Define the files to upload with their metadata
      const filesToUpload = [
        {
          file: selectedFiles.offerLetter,
          title: 'Offer Letter',
          description: `Offer letter for ${currentActionUser.name}`,
          type: 'offerLetter'
        },
        {
          file: selectedFiles.nda,
          title: 'NDA Agreement',
          description: `NDA agreement for ${currentActionUser.name}`,
          type: 'nda'
        },
        {
          file: selectedFiles.resume,
          title: 'Resume/CV',
          description: `Resume for ${currentActionUser.name}`,
          type: 'resume'
        }
      ];

      for (const { file, title, description, type } of filesToUpload) {
        if (!file) continue; // Skip if no file selected for this type

        try {
          const result = await uploadSingleDocument(file, title, description);
          if (result) {
            uploadResults.push({ type, result });
          }
        } catch (error) {
          console.error(`${type} upload failed:`, error);
          errors.push({
            type,
            message: error.response?.data?.message || error.message
          });
        }
      }

      // Update UI based on results
      if (uploadResults.length > 0) {
        // Update user's upload status if at least one file was uploaded
        setUsers(users.map(u =>
          u.id === currentActionUser.id ? { ...u, uploads: true } : u
        ));

        const successMessage = `Successfully uploaded ${uploadResults.length} document(s)`;
        if (errors.length > 0) {
          showSnackbar(`${successMessage} (${errors.length} failed)`, "warning");
        } else {
          showSnackbar(successMessage, "success");
          setUploadCompleted(true);
        }
      } else if (errors.length > 0) {
        showSnackbar("No documents were uploaded successfully", "error");
      } else {
        showSnackbar("No documents selected for upload", "info");
      }

    } catch (error) {
      console.error("Upload process error:", error);
      showSnackbar("An unexpected error occurred during upload", "error");
    } finally {
      setLoading(false);

      // Close dialog after delay if upload was successful or no files were selected
      if (uploadCompleted || Object.values(selectedFiles).every(file => !file)) {
        setTimeout(() => {
          setUploadDialogOpen(false);
          setSelectedFiles({ offerLetter: null, nda: null, resume: null });
        }, 1500);
      }
    }
  };
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.emp_id && user.emp_id.toString().includes(searchTerm)) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? user.status === statusFilter : true;
    const matchesDepartment = departmentFilter ? user.department === departmentFilter : true;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const getDepartmentIcon = (department) => {
    switch (department) {
      case 'Full Stack':
        return <DataObjectIcon />;
      case 'Machine Learning':
        return <ScienceIcon />;
      case 'DevOps':
        return <EngineeringIcon />;
      case 'UI/UX':
        return <DesignServicesIcon />;
      case 'Data Science':
        return <BarChartIcon />;
      case 'Cloud':
        return <CloudIcon />;
      case 'Security':
        return <SecurityIcon />;
      default:
        return <GroupsIcon />;
    }
  };

  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#3f51b5', color: 'white' }}>
          <CardContent>
            <Typography color="inherit" gutterBottom>
              Total Interns
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" color="inherit">{internCount}</Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <GroupsIcon fontSize="large" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#4caf50', color: 'white' }}>
          <CardContent>
            <Typography color="inherit" gutterBottom>
              Active Users
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" color="inherit">{activeInternCount}</Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <PersonIcon fontSize="large" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#ff9800', color: 'white' }}>
          <CardContent>
            <Typography color="inherit" gutterBottom>
              On Leave
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" color="inherit">
                {users.filter(u => u.status === 'On Leave').length}
              </Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <CalendarTodayIcon fontSize="large" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#e91e63', color: 'white' }}>
          <CardContent>
            <Typography color="inherit" gutterBottom>
              Month Basis
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <FormControl variant="standard" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  label="Month"
                  sx={{
                    color: 'white',
                    '&:before': { borderBottomColor: 'rgba(255,255,255,0.42)' },
                    '&:after': { borderBottomColor: 'white' },
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#e91e63',
                        color: 'white',
                        '& .MuiMenuItem-root.Mui-disabled': {
                          color: 'rgba(255,255,255,0.5)'
                        },
                        '& .MuiMenuItem-root': {
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }
                      }
                    }
                  }}
                  displayEmpty
                  renderValue={(selected) => {
                    if (selected === '') {
                      return <em>Select month</em>;
                    }
                    return new Date(selectedYear, selected).toLocaleString('default', { month: 'long' });
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date(selectedYear, i);
                    const monthName = date.toLocaleString('default', { month: 'long' });
                    const isCurrentOrPast = (i <= new Date().getMonth() && selectedYear === new Date().getFullYear()) ||
                      (selectedYear < new Date().getFullYear());

                    return (
                      <MenuItem
                        key={i}
                        value={i}
                        disabled={!isCurrentOrPast}
                      >
                        {monthName}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <Box display="flex" alignItems="center">
                <IconButton
                  size="small"
                  onClick={() => {
                    if (selectedYear > new Date().getFullYear() - 5) {
                      setSelectedYear(prev => prev - 1);
                    }
                  }}
                  disabled={selectedYear <= new Date().getFullYear() - 5}
                  sx={{ color: 'white' }}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2" sx={{ mx: 1 }}>{selectedYear}</Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (selectedYear < new Date().getFullYear()) {
                      setSelectedYear(prev => prev + 1);
                    }
                  }}
                  disabled={selectedYear >= new Date().getFullYear()}
                  sx={{ color: 'white' }}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Typography variant="h4" color="inherit">
                {getNewInternsCount(selectedMonth, selectedYear)}
              </Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <AddIcon fontSize="large" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Department Distribution Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Interns by Domain</Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Box height={240}>
              <ResponsiveContainer width="100%" height="100%">
                {domainData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={domainData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {domainData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name) => [`${value} interns`, name]}
                    />
                  </PieChart>
                ) : (
                  <Typography>No data available</Typography>
                )}
              </ResponsiveContainer>
            </Box>
            <Box display="flex" justifyContent="center" mt={1} gap={1} flexWrap="wrap">
              {domainData.map((domain, index) => (
                <Chip
                  key={domain.name}
                  label={`${domain.name}: ${domain.value}`}
                  size="small"
                  sx={{
                    border: `1px solid ${COLORS[index % COLORS.length]}`,
                    color: 'text.primary'
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Trend Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance Trend
            </Typography>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="performance"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Interns Table */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Interns
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>EMP ID</TableCell> {/* Moved EMP ID to first column */}
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Document Upload</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.slice(0, 5).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.emp_id}</TableCell> {/* Added EMP ID to table cell */}
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {user.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getDepartmentIcon(user.department)}
                          <Typography sx={{ ml: 1 }}>{user.department}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={
                            user.status === 'Active' ? 'success' :
                              user.status === 'On Leave' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {user.uploads ? (
                          <Chip
                            label="Uploaded"
                            color="success"
                            size="small"
                            icon={<CheckCircleOutlineIcon fontSize="small" />}
                          />
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleUploadClick(user)}
                            startIcon={<CloudUploadIcon fontSize="small" />}
                          >
                            Upload
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(e) => handleActionMenuOpen(e, user)}>
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

  const renderUserList = () => (
    <Grid item xs={12}>
            <InternManagementLists />
          </Grid>
  );

  const renderUserProfile = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
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
                  Department
                </Typography>
                <Typography paragraph>
                  {profileData.department || "Not specified"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Position
                </Typography>
                <Typography paragraph>
                  {profileData.role || "Not specified"}
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
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => handleOpenModal(currentUser)}
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
      case "users":
        return renderUserList();
      case "assets": // NEW: Case for Asset Reports
        return <AssetReport />;
      case "feedbacks":
        return <PerformanceFeedbackPage />;
      case "tasks":
        return <TaskManager />;
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
              open={Boolean(dashboardAnchorEl)}
              onClose={handleDashboardMenuClose}
            >
              {dashboardOptions.map((dashboard) => (
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
              Intern Management
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
                <ToggleButton value="users">
                  <PeopleIcon sx={{ mr: 1 }} />
                  Intern Management
                </ToggleButton>
                <ToggleButton value="assets"> {/* NEW: Added Asset Reports option */}
                  <AssignmentIcon sx={{ mr: 1 }} />
                  Asset Reports
                </ToggleButton>
                <ToggleButton value="feedbacks">
                  <PersonIcon sx={{ mr: 1 }} />
                  Feedbacks
                </ToggleButton>
                <ToggleButton value="tasks">
                  <TaskAlt sx={{ mr: 1 }} /> {/* Using TaskAlt icon for tasks */}
                  Tasks
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
                  <Avatar
                    sx={{ width: 32, height: 32 }}
                  >
                    {getInitials(profileData.username)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
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
                <MenuItem onClick={() => {
                  setActiveView("profile");
                  handleMenuClose();
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
                        {notification.text.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={notification.text}
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
                selected={activeView === "users"}
                onClick={() => {
                  setActiveView("users");
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Intern Management" />
              </ListItemButton>
               {/* In your mobile drawer menu */}
              <ListItemButton
                selected={activeView === "assets"}
                onClick={() => {
                  setActiveView("assets");
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText primary="Asset Reports" />
              </ListItemButton>
              <ListItemButton
                selected={activeView === "feedbacks"}
                onClick={() => {
                  setActiveView("feedbacks");
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>
                  <Feedback />
                </ListItemIcon>
                <ListItemText primary="Feedbacks" />
              </ListItemButton>
              <ListItemButton
                selected={activeView === "tasks"}
                onClick={() => {
                  setActiveView("tasks");
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>
                  <TaskAlt />
                </ListItemIcon>
                <ListItemText primary="Tasks" />
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
      </Box>

      {/* Intern Create/Edit Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: '90%', sm: 600 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <Typography variant="h5" gutterBottom>
            {currentUser ? "Edit Intern" : "Add New Intern"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  defaultValue={currentUser?.username}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  defaultValue={currentUser?.name?.split(' ')[0]}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  defaultValue={currentUser?.name?.split(' ')[1]}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={currentUser?.email}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  required={!currentUser}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Department</InputLabel>
                  <Select
                    label="Department"
                    name="department"
                    defaultValue={currentUser?.department || ""}
                    required
                  >
                    <MenuItem value="Full Stack">Full Stack</MenuItem>
                    <MenuItem value="Machine Learning">Machine Learning</MenuItem>
                    <MenuItem value="DevOps">DevOps</MenuItem>
                    <MenuItem value="UI/UX">UI/UX</MenuItem>
                    <MenuItem value="Data Science">Data Science</MenuItem>
                    <MenuItem value="Cloud">Cloud</MenuItem>
                    <MenuItem value="Security">Security</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={handleCloseModal} variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : currentUser ? (
                  "Update Intern"
                ) : (
                  "Add Intern"
                )}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Action Menu for User Rows */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => {
          handleOpenModal(currentActionUser);
          handleActionMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleDelete(currentActionUser?.id);
          handleActionMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Delete</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleActionMenuClose}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          Send Email
        </MenuItem>
        <MenuItem onClick={handleActionMenuClose}>
          <ListItemIcon>
            <CalendarTodayIcon fontSize="small" />
          </ListItemIcon>
          Schedule Meeting
        </MenuItem>
      </Menu>

      {/* Document Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadClose}>
        <DialogTitle>Upload Documents</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Offer Letter (PDF only)
            </Typography>
            <TextField
              type="file"
              fullWidth
              name="offerLetter"
              onChange={handleFileChange}
              InputProps={{
                inputProps: { accept: "application/pdf" }
              }}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              NDA Agreement
            </Typography>
            <TextField
              type="file"
              fullWidth
              name="nda"
              onChange={handleFileChange}
              InputProps={{
                inputProps: { accept: "application/pdf,image/*" }
              }}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Resume/CV
            </Typography>
            <TextField
              type="file"
              fullWidth
              name="resume"
              onChange={handleFileChange}
            />
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {Object.entries(selectedFiles).map(([key, value]) => (
              value && (
                <Chip
                  key={key}
                  label={`${key}: ${value.name}`}
                  onDelete={() => setSelectedFiles(prev => ({ ...prev, [key]: null }))}
                  variant="outlined"
                  sx={{ m: 0.5 }}
                />
              )
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleFileUpload}
            color="primary"
            variant={uploadCompleted ? "contained" : "outlined"}
            startIcon={
              uploadCompleted ? (
                <CheckCircleOutlineIcon fontSize="small" />
              ) : (
                <CloudUploadIcon />
              )
            }
            sx={{
              bgcolor: uploadCompleted ? '#4caf50' : 'inherit',
              '&:hover': {
                bgcolor: uploadCompleted ? '#388e3c' : 'inherit'
              }
            }}
          >
            {uploadCompleted ? 'Uploaded!' : 'Upload Documents'}
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
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default InternDashboard;