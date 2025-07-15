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
  ButtonGroup
} from "@mui/material";
import { CSVLink } from "react-csv";
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
  Payment as PaymentIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Assignment as AssignmentIcon,
  Laptop as LaptopIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Person as PersonIcon
} from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, ComposedChart, Area } from "recharts";
import { faker } from '@faker-js/faker';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PaymentLists from "./PaymentLists"; // Adjust the import path as needed
// Customized theme for professional appearance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Custom blue
    },
    secondary: {
      main: '#f50057', // Custom pink
    },
    background: {
      default: '#f4f6f8', // Light background
      paper: '#ffffff', // Paper color for cards
    },
    text: {
      primary: '#333333', // Dark text for readability
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

// Staff Profile Data
const staffProfile = {
  name: "N/A",
  email: "N/A",
  phone: "N/A",
  position: "N/A",
  department: "N/A",
  startDate: "0000-00-00",
  profilePicture: "",
  skills: ["N/A", "N/A", "N/A", "N/A"]
};

// Generate mock payment data with Indian Rupees and intern IDs
const generateMockPayments = (count) => {
  const statuses = ['Paid', 'Pending', 'Overdue', 'Cancelled'];
  const methods = ['UPI', 'Net Banking', 'Cash'];
  const interns = Array.from({ length: 10 }, (_, i) => ({
    id: `INT${1000 + i}`, // Some empty IDs for sample data
    name: faker.person.fullName()
  }));

  return Array.from({ length: count }, (_, i) => {
    const intern = interns[Math.floor(Math.random() * interns.length)];
    return {
      id: i + 1,
      internId: intern.id,
      internName: intern.name,
      amount: faker.finance.amount(10000, 50000, 0),
      date: faker.date.recent().toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      reference: faker.string.uuid(),
      department: ['Full Stack', 'Machine Learning', 'DevOps', 'UI/UX'][Math.floor(Math.random() * 4)]
    };
  });
};
const initialPayments = generateMockPayments(25);

// Updated payment trend data with both amount and intern count



const paymentMethodData = [
  { name: "Bank Transfer", value: 45 },
  { name: "UPI", value: 30 },
  { name: "Net Banking", value: 20 },
  { name: "Cash", value: 5 }
];
// Helper functions for generating random data
const getRandomAmountForYear = (year) => {
  const baseAmount = 100000 + (year - 2023) * 50000;
  return Math.round(baseAmount * (0.8 + Math.random() * 0.4)); // Ensure integer value using Math.round
};


const getRandomCountForYear = (year) => {
  // Adjust base count based on year to make trends visible
  const baseCount = 5 + (year - 2023) * 2;
  return Math.floor(baseCount * (0.8 + Math.random() * 0.4)); // Random variation
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4ECDC4'];

// Notifications data
const notifications = [
  { id: 1, message: "New payment received from John Doe", time: "2 hours ago", read: false },
  { id: 2, message: "3 payments pending approval", time: "5 hours ago", read: true },
  { id: 3, message: "Payment report for June is ready", time: "1 day ago", read: true },
  { id: 4, message: "Overdue payment from Jane Smith", time: "2 days ago", read: false }
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
  return name.split(' ').map(part => part[0]).join('').toUpperCase();
}

const PayrollDashboard = () => {
  const [payments, setPayments] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
  const [currentActionPayment, setCurrentActionPayment] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const rowsPerPage = 5;
  const navigate = useNavigate();
  const [yearAnchorEl, setYearAnchorEl] = useState(null);
const [dashboardAnchorEl, setDashboardAnchorEl] = useState(null);

const handleYearDropdownClick = (event) => {
  setYearAnchorEl(event.currentTarget);
};

const handleYearDropdownClose = () => {
  setYearAnchorEl(null);
};
const [paymentStatusData, setPaymentStatusData] = useState([]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const getPaymentsByYear = (year) => {
    return payments.filter(payment => {
      const paymentYear = new Date(payment.date).getFullYear();
      return paymentYear === year;
    });
  };

  const handleOpenModal = (payment = null) => {
    setCurrentPayment(payment);
    setOpenModal(true);
  };
  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj =>
      Object.values(obj).map(value =>
        `"${value.toString().replace(/"/g, '""')}"`
      ).join(',')
    );
    return [headers, ...rows].join('\n');
  };
  const downloadCSV = (data, filename) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
          const token = localStorage.getItem("token");
          if (!token) {
            window.location.href = "/login";
            return;
          }
      
          fetchProfileData();
        }, []);

  const handleExportData = () => {
    // Prepare data for CSV export
    const csvData = filteredPayments.map(payment => ({
      "Intern ID": payment.internId,
      "Intern Name": payment.internName,
      "Department": payment.department,
      "Amount (₹)": payment.total_paid,
      "Date": payment.date,
      "Payment Method": payment.paymentMethod,
      "Status": payment.status,
      "Reference": payment.reference
    }));

    return csvData;
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentPayment(null);
  };
  const getPaymentTrendData = (year) => {
    const monthlyData = {};
  
    // Loop through fee records
    payments.forEach((payment) => {
      const paidDate = new Date(payment.date);
      const paymentYear = paidDate.getFullYear();
      const monthIndex = paidDate.getMonth(); // 0-based (0 = Jan)
  
      if (paymentYear === year) {
        const monthName = new Date(0, monthIndex).toLocaleString("default", { month: "short" });
  
        if (!monthlyData[monthName]) {
          monthlyData[monthName] = {
            month: monthName,
            amount: 0,
            interns: new Set()
          };
        }
  
        monthlyData[monthName].amount += parseFloat(payment.amount);
        monthlyData[monthName].interns.add(payment.internId);
      }
    });
  
    // Convert to array and map to get counts
    const trendData = Object.values(monthlyData).map((entry) => ({
      month: entry.month,
      amount: entry.amount,
      interns: entry.interns.size
    }));
  
    // Optional: ensure all 12 months appear even with 0s
    const allMonths = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("default", { month: "short" })
    );
  
    const completeTrend = allMonths.map((month) => {
      const found = trendData.find((d) => d.month === month);
      return found || { month, amount: 0, interns: 0 };
    });
  
    return completeTrend;
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.target);
    const newPayment = {
      id: currentPayment ? currentPayment.id : payments.length + 1,
      internId: currentPayment?.internId || `INT${1000 + Math.floor(Math.random() * 1000)}`,
      internName: formData.get("internName"),
      amount: formData.get("amount"),
      date: formData.get("date"),
      status: formData.get("status"),
      paymentMethod: formData.get("paymentMethod"),
      reference: faker.finance.transactionId(),
      department: formData.get("department")
    };

    // Simulate API call
    setTimeout(() => {
      if (currentPayment) {
        setPayments(payments.map((p) => (p.id === currentPayment.id ? newPayment : p)));
        showSnackbar("Payment updated successfully!");
      } else {
        setPayments([...payments, newPayment]);
        showSnackbar("Payment recorded successfully!");
      }
      setLoading(false);
      handleCloseModal();
    }, 1000);
  };

  const handleDelete = (id) => {
    setPayments(payments.filter((payment) => payment.id !== id));
    showSnackbar("Payment deleted successfully!");
  };

  const handleBulkDelete = () => {
    setPayments(payments.filter((payment) => !selectedPayments.includes(payment.id)));
    setSelectedPayments([]);
    showSnackbar("Selected payments deleted successfully!");
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedPayments(filteredPayments.map((payment) => payment.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (id) => {
    if (selectedPayments.includes(id)) {
      setSelectedPayments(selectedPayments.filter((paymentId) => paymentId !== id));
    } else {
      setSelectedPayments([...selectedPayments, id]);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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

  const handleStatusChange = (paymentId, newStatus) => {
    setPayments(payments.map(payment =>
      payment.id === paymentId ? { ...payment, status: newStatus } : payment
    ));
    showSnackbar(`Payment status updated to ${newStatus}`);
  };

  const handleActionMenuOpen = (event, payment) => {
    setActionMenuAnchorEl(event.currentTarget);
    setCurrentActionPayment(payment);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
    setCurrentActionPayment(null);
  };

  const handleDashboardMenuClick = (event) => {
    setDashboardAnchorEl(event.currentTarget);
  };

  const handleDashboardMenuClose = () => {
    setDashboardAnchorEl(null);
  };

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
      icon: <PeopleIcon />
    },
    {
      id: 'payroll',
      label: 'Payroll Dashboard',
      icon: <AttachMoneyIcon />,
      current: true
    }
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.internName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.internId?.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesStatus = statusFilter ? payment.status === statusFilter : true;
    const matchesMethod = methodFilter ? payment.paymentMethod === methodFilter : true;
  
    return matchesSearch && matchesStatus && matchesMethod;
  });
  
  const paginatedPayments = filteredPayments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Overdue':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const [profileData, setProfileData] = useState({
           username: "",
           email: "",
           phone_no: "",
           role: "",
           startDate: "",
           department: "",
           photo: null,
           aadhar_number: "",
           gender: "",
           shift_timing: "",
           team_name: "",
           reporting_manager: ""
         });
     
   const fetchProfileData = async () => {
          try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8000/Sims/staffs-details/", {
              headers: {
                Authorization: `Token ${token}`,
              },
            });
      
            if (response.data && response.data.length > 0) {
              const staffData = response.data[0]; // Get first staff member (assuming it's the current user)
              const personalData = staffData.details.personal_data;
              const userData = staffData.details.user_data;
      
              setProfileData({
                username: personalData?.username || "N/A",
                email: personalData?.email || "N/A",
                phone_no: personalData?.phone_no || "N/A",
                role: "Staff", // Since this is the staff dashboard
                startDate: userData?.start_date || "N/A",
                department: userData?.domain_name || "N/A",
                photo: personalData?.photo || null,
                aadhar_number: personalData?.aadhar_number || "N/A",
                gender: personalData?.gender === 'M' ? 'Male' : 'Female',
                shift_timing: userData?.shift_timing || "N/A",
                team_name: userData?.team_name || "N/A",
                reporting_manager: userData?.reporting_manager_username || "N/A"
              });
            }
          } catch (error) {
            console.error("Error fetching staff profile data:", error);
            if (error.response && error.response.status === 401) {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }
          }
        };
      
// Add this state at the top


const fetchFeeData = async () => {
  try {
    const token = localStorage.getItem("token");
    
    // Fetch all required data in parallel
    const [feeResponse, userDataResponse] = await Promise.all([
      axios.get("http://localhost:8000/Sims/fees/", {
        headers: { Authorization: `Token ${token}` },
      }),
      axios.get("http://localhost:8000/Sims/user-data/", {
        headers: { Authorization: `Token ${token}` },
      })
    ]);

    const feeData = feeResponse.data;
    const userData = userDataResponse.data;

    // Create a mapping of username to emp_id
    const userEmpIdMap = {};
    userData.forEach(user => {
      userEmpIdMap[user.username] = user.emp_id;
    });

    const formattedPayments = feeData.flatMap((item) =>
      item.payment_details.map((payment) => ({
        id: payment.id,
        internId: userEmpIdMap[item.employee_id] || item.employee_id, // Use emp_id if available
        internName: item.employee_name,
        department: item.domain,
        amount: parseFloat(payment.amount),
        date: payment.paid_date.split("T")[0],
        status: "Paid",
        paymentMethod: payment.payment_method,
        reference: payment.transaction_id || payment.id,
        employee_id: item.employee_id // Keep original employee_id for reference
      }))
    );

    setPayments(formattedPayments);

    // Status calculation logic
    let paid = 0;
    let pending = 0;

    feeData.forEach((item) => {
      const { scheme, summary, payment_details } = item;
      const hasPaid = payment_details.length > 0;
      const isPending = summary.remaining_amount > 0 && scheme !== "FREE";

      if (hasPaid) paid++;
      if (isPending) pending++;
    });

    const statusSummary = [
      { name: "Paid", value: paid },
      { name: "Pending", value: pending },
      { name: "Overdue", value: 0 },
      { name: "Cancelled", value: 0 }
    ];

    setPaymentStatusData(statusSummary);

  } catch (error) {
    console.error("Error fetching payment data:", error);
    showSnackbar("Failed to load payment data", "error");
  }
};
  useEffect(() => {   
    setLoading(true);
    fetchFeeData();
    setLoading(false);
  }, []);  
  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Total Payments Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#3f51b5', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography color="inherit" gutterBottom>
                Total Payments
              </Typography>
              
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" color="inherit">
                ₹{getPaymentsByYear(selectedYear)
                  .reduce((sum, payment) => sum + parseFloat(payment.amount), 0)
                  .toLocaleString('en-IN')}
              </Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <AttachMoneyIcon fontSize="large" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      {/* Year Selection Menu */}
      
      {/* Completed Payments */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#4caf50', color: 'white' }}>
          <CardContent>
            <Typography color="inherit" gutterBottom>
              Completed Payments
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" color="inherit">
                {getPaymentsByYear(selectedYear).filter(p => p.status === 'Paid').length}
              </Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <ReceiptIcon fontSize="large" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Pending Payments */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#ff9800', color: 'white' }}>
          <CardContent>
            <Typography color="inherit" gutterBottom>
              Pending Payments
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" color="inherit">
                {getPaymentsByYear(selectedYear).filter(p => p.status === 'Pending').length}
              </Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <PaymentIcon fontSize="large" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Overdue Payments */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: '#e91e63', color: 'white' }}>
          <CardContent>
            <Typography color="inherit" gutterBottom>
              Overdue Payments
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" color="inherit">
                {getPaymentsByYear(selectedYear).filter(p => p.status === 'Overdue').length}
              </Typography>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <AccountBalanceIcon fontSize="large" />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      {/* Charts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Payment Status</Typography>

            </Box>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
  <Pie
    data={paymentStatusData}
    cx="50%"
    cy="50%"
    labelLine={false}
    outerRadius={80}
    fill="#8884d8"
    dataKey="value"
    label={({ name, percent }) => {
      // Only show label if percentage is significant
      if (percent > 0.05) {
        return `${name}: ${(percent * 100).toFixed(0)}%`;
      }
      return null;
    }}
    paddingAngle={5} // Add padding between segments
  >
    {paymentStatusData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <RechartsTooltip
    formatter={(value, name) => [`${value} payments`, name]}
  />
  <Legend 
    layout="horizontal" 
    verticalAlign="bottom" 
    align="center"
    wrapperStyle={{ paddingTop: '20px' }}
  />
</PieChart>
              </ResponsiveContainer>
            </Box>
            <Box display="flex" justifyContent="center" mt={1} gap={1} flexWrap="wrap">
            {paymentStatusData.map((status, index) => (
  <Chip
    key={status.name}
    label={`${status.name}: ${status.value}`}
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
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Monthly Payment Trend</Typography>
            </Box>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getPaymentTrendData(selectedYear)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip
                    formatter={(value, name) => {
                      if (name === 'Amount') {
                        return [`₹${value.toLocaleString('en-IN')}`, name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="amount"
                    name="Amount (₹)"
                    stroke="#8884d8"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="interns"
                    name="Interns Count"
                    stroke="#82ca9d"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportData}
              >
                Export Data
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Payments */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Recent Payments
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenModal()}
              >
                Record Payment
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Intern</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Intern ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.slice(0, 5).map((payment) => (
                    <TableRow key={payment.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{ width: 40, height: 40, mr: 2, bgcolor: stringToColor(payment.internName) }}
                        >
                          {getInitials(payment.internName)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="medium">{payment.internName}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {payment.department}
                          </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payment.employee_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">
                          ₹{parseFloat(payment.amount).toLocaleString('en-IN')}
                        </Typography>
                      </TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.paymentMethod}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          color={getStatusColor(payment.status)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleActionMenuOpen(e, payment)}
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


  const renderPaymentList = () => (
    <Grid item xs={12}>
        <PaymentLists />
      </Grid>
  );
  const renderModal = () => (
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
          {currentPayment ? "Edit Payment" : "Record New Payment"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Intern Name"
                name="internName"
                defaultValue={currentPayment?.internName}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Intern ID"
                name="internId"
                defaultValue={currentPayment?.internId}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                defaultValue={currentPayment?.amount}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                defaultValue={currentPayment?.date}
                InputLabelProps={{ shrink: true }}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                  label="Department"
                  name="department"
                  defaultValue={currentPayment?.department || ""}
                  required
                >
                  <MenuItem value="Full Stack">Full Stack</MenuItem>
                  <MenuItem value="Machine Learning">Machine Learning</MenuItem>
                  <MenuItem value="DevOps">DevOps</MenuItem>
                  <MenuItem value="UI/UX">UI/UX</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  name="status"
                  defaultValue={currentPayment?.status || "Paid"}
                  required
                >
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  label="Payment Method"
                  name="paymentMethod"
                  defaultValue={currentPayment?.paymentMethod || "UPI"}
                  required
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Net Banking">Net Banking</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box mt={2}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  Upload Receipt
                  <input type="file" hidden />
                </Button>
              </Box>
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
              ) : currentPayment ? (
                "Update Payment"
              ) : (
                "Record Payment"
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
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
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                );

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return renderDashboard();
      case "payments":
        return renderPaymentList();
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
            <PaymentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />

            {/* Dashboard Switcher Dropdown */}
            <Button
              onClick={handleDashboardMenuClick}
              endIcon={<ArrowDropDownIcon />}
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
              Payroll Management
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
                <ToggleButton value="payments">
                  <ReceiptIcon sx={{ mr: 1 }} />
                  Payments
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
                <IconButton color="inherit" onClick={handleMenuOpen}>
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: stringToColor(staffProfile.name) }}
                  >
                    {getInitials(staffProfile.name)}
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
                <MenuItem onClick={handleMenuClose}>
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
                selected={activeView === "payments"}
                onClick={() => {
                  setActiveView("payments");
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary="Payments" />
              </ListItemButton>
              <ListItemButton
                selected={activeView === "profile"}
                onClick={() => {
                  setActiveView("profile");
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </List>
            <Divider />
            <List>
              <ListItemButton onClick={handleMenuClose}>
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

      {/* Action Menu for Payment Rows */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => {
          handleOpenModal(currentActionPayment);
          handleActionMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          setCurrentPayment(currentActionPayment);
          setActiveView("detail");
          handleActionMenuClose();
        }}>
          <ListItemIcon>
            <ReceiptIcon fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          handleDelete(currentActionPayment?.id);
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
          Send Receipt
        </MenuItem>
      </Menu>

      {/* Payment Create/Edit Modal */}
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
            {currentPayment ? "Edit Payment" : "Record New Payment"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Intern Name"
                  name="internName"
                  defaultValue={currentPayment?.internName}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Intern ID"
                  name="internId"
                  defaultValue={currentPayment?.internId}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  defaultValue={currentPayment?.amount}
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  defaultValue={currentPayment?.date}
                  InputLabelProps={{ shrink: true }}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Department</InputLabel>
                  <Select
                    label="Department"
                    name="department"
                    defaultValue={currentPayment?.department || ""}
                    required
                  >
                    <MenuItem value="Full Stack">Full Stack</MenuItem>
                    <MenuItem value="Machine Learning">Machine Learning</MenuItem>
                    <MenuItem value="DevOps">DevOps</MenuItem>
                    <MenuItem value="UI/UX">UI/UX</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    name="status"
                    defaultValue={currentPayment?.status || "Paid"}
                    required
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Overdue">Overdue</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    label="Payment Method"
                    name="paymentMethod"
                    defaultValue={currentPayment?.paymentMethod || "Bank Transfer"}
                    required
                  >
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Net Banking">Net Banking</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box mt={2}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    Upload Receipt
                    <input type="file" hidden />
                  </Button>
                </Box>
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
                ) : currentPayment ? (
                  "Update Payment"
                ) : (
                  "Record Payment"
                )}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

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

export default PayrollDashboard;