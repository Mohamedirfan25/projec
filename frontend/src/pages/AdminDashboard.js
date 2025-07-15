import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import InternOnboarding from "./InternOnboarding";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Typography,
  Divider,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  InputAdornment,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Tooltip,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AccountCircle from "@mui/icons-material/AccountCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import Logo from "../assets/vdart.jpeg";
import StaffList from "./StaffList";
import PaymentList from "./PaymentList";
import AssetManagementList from "./AssetManagementlist";
import AssetReportIssueList from "./AssetReportIssueList";
import RegisterPage from "./RegisterPage";
import CombinedForm from "../components/CombinedForm";
import PerformanceFeedbackPage from "./PerformanceFeedbackPage";
import DepartmentManagement from "./department";
import DomainManagement from "./domain";
import DomainIcon from "@mui/icons-material/Domain";
import BusinessIcon from "@mui/icons-material/Business";
import InternLists from "./InternLists";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AdminProfile from "./AdminProfile";
import { useLocation } from 'react-router-dom';

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  RadialLinearScale
);

// Color palette
const colors = {
  primary: "#1976d2",
  secondary: "#9c27b0",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
  info: "#2196f3",
  darkBackground: "#121212",
  lightBackground: "#f5f5f5",
  cardDark: "#1e1e1e",
  cardLight: "#ffffff",
  textDark: "#ffffff",
  textLight: "#333333",
  dividerDark: "rgba(255, 255, 255, 0.12)",
  dividerLight: "rgba(0, 0, 0, 0.12)",
  appBarDark: "#1a1a1a",
  appBarLight: "#ffffff",
  sidebarDark: "#1e1e1e",
  sidebarLight: "#ffffff",
  hoverDark: "rgba(255, 255, 255, 0.08)",
  hoverLight: "rgba(0, 0, 0, 0.04)",
};

// Total Intern Count Component
const TotalInternCount = ({
  internCount,
  maxInternCount,
  darkMode,
  trend,
  onViewDetails,
}) => {
  const percentage = (internCount / maxInternCount) * 100;

  const getStrokeColor = () => {
    if (percentage <= 30) return colors.error;
    else if (percentage <= 70) return colors.warning;
    else return colors.success;
  };

  const getTrendIcon = () => {
    if (trend === "up")
      return (
        <TrendingUpIcon sx={{ color: colors.success, fontSize: "1.5rem" }} />
      );
    else if (trend === "down")
      return (
        <TrendingDownIcon sx={{ color: colors.error, fontSize: "1.5rem" }} />
      );
    else
      return (
        <TrendingFlatIcon sx={{ color: colors.warning, fontSize: "1.5rem" }} />
      );
  };

  const handleViewDetails = () => {
    console.log("View Details clicked");
  };

  return (
    <Tooltip
      title={`Total Intern Count: ${internCount} / ${maxInternCount}`}
      arrow
    >
      <Card
        sx={{
          height: "100%",
          borderRadius: "12px",
          background: darkMode ? colors.cardDark : colors.cardLight,
          boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          padding: "16px",
          transition: "transform 0.3s, box-shadow 0.3s",
          borderLeft: `4px solid ${colors.primary}`,
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px 0 rgba(0, 0, 0, 0.2)",
          },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              color: darkMode ? colors.textDark : colors.textLight,
              fontWeight: "600",
              mb: 3,
            }}
          >
            Total Intern Count
          </Typography>
          <Box
            sx={{
              position: "relative",
              width: "200px",
              height: "100px",
              margin: "auto",
            }}
          >
            <svg width="200" height="100" viewBox="0 0 200 100">
              <path
                d="M 100 100 m -75, 0 a 75,75 0 1,1 150,0"
                stroke={darkMode ? colors.dividerDark : colors.dividerLight}
                strokeWidth="15"
                fill="transparent"
                strokeLinecap="round"
              />
              <path
                d="M 100 100 m -75, 0 a 75,75 0 1,1 150,0"
                stroke={getStrokeColor()}
                strokeWidth="15"
                fill="transparent"
                strokeDasharray="235.5"
                strokeDashoffset={235.5 - (percentage / 100) * 235.5}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>
            <Typography
              variant="h4"
              sx={{
                color: darkMode ? colors.textDark : colors.textLight,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontWeight: "700",
              }}
            >
              {internCount}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 3,
            }}
          >
            {getTrendIcon()}
            <Typography
              variant="body2"
              sx={{
                color: darkMode
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.6)",
                ml: 1,
                fontWeight: "500",
              }}
            >
              {internCount} / {maxInternCount} Interns
            </Typography>
          </Box>
        </CardContent>
        
      </Card>
    </Tooltip>
  );
};

// Average Attendance Component
const AverageAttendance = ({ averageAttendance, selectedDate,onDateChange,darkMode }) => {
  const percentage = averageAttendance;

  const getStrokeColor = () => {
    if (percentage <= 30) return colors.error;
    else if (percentage <= 70) return colors.warning;
    else return colors.success;
  };

  return (
    <Tooltip title={`Average Attendance: ${averageAttendance}%`} arrow>
      <Card
        sx={{
          height: "100%",
          borderRadius: "12px",
          background: darkMode ? colors.cardDark : colors.cardLight,
          boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          padding: "16px",
          transition: "transform 0.3s, box-shadow 0.3s",
          borderLeft: `4px solid ${colors.secondary}`,
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px 0 rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography
              variant="h6"
              sx={{
                color: darkMode ? colors.textDark : colors.textLight,
                fontWeight: "600",
              }}
            >
              Average Attendance
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                type="date"
                size="small"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                sx={{
                  backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                  borderRadius: "8px",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              position: "relative",
              width: "200px",
              height: "200px",
              margin: "auto",
            }}
          >
            <CircularProgress
              variant="determinate"
              value={percentage}
              size={200}
              thickness={5}
              sx={{
                color: getStrokeColor(),
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                color: darkMode ? colors.textDark : colors.textLight,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontWeight: "700",
              }}
            >
              {averageAttendance}%
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
};

// Main App Component
const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [activeAssetManagementComponent, setActiveAssetManagementComponent] = useState("assetManagementList");
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [paymentDetails, setPaymentDetails] = useState({
    completed: 0,
    pending: 0,
    overdue: 0,
    free: 0,
    counts: {
      completed: 0,
      pending: 0,
      overdue: 0,
      free: 0,
      total: 0,
    },
  });
const location = useLocation();
const navigate = useNavigate();

  const fetchAttendanceAndInterns = async (dateToFetch) => {
    try {
      const token = localStorage.getItem("token");
      const usersRes = await axios.get("http://localhost:8000/Sims/user-data/", {
        headers: { Authorization: `Token ${token}` },
      });
  
      const activeInterns = usersRes.data.filter(
        (user) => user.temp_details?.role?.toLowerCase() === "intern" &&
                  user.user_status?.toLowerCase() === "active"
      );
  
      setInternCountData(activeInterns.length);
      const activeInternIds = activeInterns.map((user) => user.emp_id);
  
      const attendanceRes = await axios.get("http://localhost:8000/Sims/attendance", {
        headers: { Authorization: `Token ${token}` },
      });
  
      let presentOnDate = 0;
  
      attendanceRes.data.forEach((userAttendance) => {
        if (!activeInternIds.includes(userAttendance.emp_id)) return;
  
        const record = userAttendance.records.find((r) => {
          const recordDate = r.date || r.check_in?.split("T")[0];
          return recordDate === dateToFetch &&
                 r.present_status?.toLowerCase() === "present";
        });
  
        if (record) presentOnDate += 1;
      });
  
      const avg = activeInterns.length > 0
        ? Math.round((presentOnDate / activeInterns.length) * 100)
        : 0;
  
      setAverageAttendance(avg);
    } catch (error) {
      console.error("Failed to fetch attendance/interns", error);
    }
  };
  
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchAttendanceAndInterns(newDate);
  };
  
  const [internPerformanceData, setInternPerformanceData] = useState({
    labels: [],
    datasets: [
      {
        label: "Intern Count by Department",
        data: [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  });

  const [internCountData, setInternCountData] = useState(0);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const fetchAttendanceAndInterns = async () => {
      try {
        const token = localStorage.getItem("token");

        const usersRes = await axios.get(
          "http://localhost:8000/Sims/user-data/",
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        const activeInterns = usersRes.data.filter(
          (user) =>
            user.temp_details?.role?.toLowerCase() === "intern" &&
            user.user_status &&
            user.user_status.toLowerCase() === "active"
        );

        setInternCountData(activeInterns.length);
        const activeInternIds = activeInterns.map((user) => user.emp_id);

        const attendanceRes = await axios.get(
          "http://localhost:8000/Sims/attendance",
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        const today = new Date().toISOString().split("T")[0];
        let presentToday = 0;

        attendanceRes.data.forEach((userAttendance) => {
          if (!activeInternIds.includes(userAttendance.emp_id)) return;

          const todayRecord = userAttendance.records.find((record) => {
            const recordDate = record.date || record.check_in?.split("T")[0];
            return (
              recordDate === today &&
              record.present_status &&
              record.present_status.toLowerCase() === "present"
            );
          });

          if (todayRecord) presentToday += 1;
        });

        const avg =
          activeInterns.length > 0
            ? Math.round((presentToday / activeInterns.length) * 100)
            : 0;

        setAverageAttendance(avg);
      } catch (error) {
        console.error("Failed to fetch attendance/interns", error);
      }
    };

    const fetchPaymentDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const [feesRes, userRes] = await Promise.all([
          axios.get("http://localhost:8000/Sims/fees/", {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get("http://localhost:8000/Sims/user-data/", {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);

        const fees = feesRes.data;
        const userData = userRes.data;

        let completed = 0;
        let pending = 0;
        let overdue = 0;
        let free = 0;

        fees.forEach((feeItem) => {
          const user = userData.find(
            (u) => u.username === feeItem.employee_name
          );

          if (feeItem.scheme === "FREE") {
            free++;
            return;
          }

          if (!user || !user.end_date) return;

          const endDate = new Date(user.end_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);

          const remainingAmount = feeItem.summary.remaining_amount;

          if (remainingAmount === 0) {
            completed++;
          } else if (remainingAmount > 0) {
            if (endDate > today) {
              pending++;
            } else {
              overdue++;
            }
          }
        });

        const total = completed + pending + overdue + free;

        setPaymentDetails({
          completed: total > 0 ? Math.round((completed / total) * 100) : 0,
          pending: total > 0 ? Math.round((pending / total) * 100) : 0,
          overdue: total > 0 ? Math.round((overdue / total) * 100) : 0,
          free: total > 0 ? Math.round((free / total) * 100) : 0,
          counts: {
            completed,
            pending,
            overdue,
            free,
            total,
          },
        });
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setPaymentDetails({
          completed: 0,
          pending: 0,
          overdue: 0,
          free: 0,
          counts: {
            completed: 0,
            pending: 0,
            overdue: 0,
            free: 0,
            total: 0,
          },
        });
      }
    };

    const fetchInternCountByDepartment = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found!");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8000/Sims/user-data/",
          {
            headers: { Authorization: `Token ${token}` },
          }
        );

        // Filter active interns and group by department
        const activeInterns = response.data.filter(
          (user) =>
            user.temp_details?.role?.toLowerCase() === "intern" &&
            user.user_status?.toLowerCase() === "active"
        );

        const departmentCounts = activeInterns.reduce((acc, user) => {
          const dept = user.department || "Unknown";
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {});

        const departmentLabels = Object.keys(departmentCounts);
        const departmentData = Object.values(departmentCounts);

        setInternPerformanceData((prev) => ({
          ...prev,
          labels: departmentLabels,
          datasets: [
            {
              ...prev.datasets[0],
              label: "Intern Count by Department",
              data: departmentData,
            },
          ],
        }));
      } catch (error) {
        console.error(
          "Error fetching intern count by department:",
          error.response?.data || error
        );
      }
    };
    fetchInternCountByDepartment();
    fetchAttendanceAndInterns();
    fetchPaymentDetails();
  }, []);

  const maxInternCount = 100;

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: colors.primary,
      },
      secondary: {
        main: colors.secondary,
      },
      background: {
        default: darkMode ? colors.darkBackground : colors.lightBackground,
        paper: darkMode ? colors.cardDark : colors.cardLight,
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 24px 0 rgba(0, 0, 0, 0.2)",
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            margin: "4px 0",
            "&:hover": {
              backgroundColor: darkMode ? colors.hoverDark : colors.hoverLight,
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          bgcolor: darkMode ? colors.darkBackground : colors.lightBackground,
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            bgcolor: darkMode ? colors.appBarDark : colors.appBarLight,
            color: darkMode ? colors.textDark : colors.textLight,
            boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.1)",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
  edge="start"
  color="inherit"
  aria-label="logo"
  sx={{ mr: 2 }}
  onClick={() => {
    setActiveComponent("dashboard");
  }}
>
  <img src={Logo} alt="Logo" style={{ height: "40px" }} />
</IconButton>

            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: "600",
                display: { xs: "none", sm: "block" },
              }}
            ></Typography>
            
            <IconButton
              color="inherit"
              onClick={() => alert("Viewing notifications")}
              sx={{
                backgroundColor: darkMode
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
                mr: 1,
              }}
            >
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="inherit"
              onClick={toggleDarkMode}
              sx={{
                backgroundColor: darkMode
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
                mr: 1,
              }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{
                backgroundColor: darkMode
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
              }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={() => {
    setActiveComponent("adminProfile");
    handleProfileMenuClose();
  }}>
    Profile
  </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", flexGrow: 1, mt: 8 }}>
          <Drawer
            variant="permanent"
            sx={{
              width: isSidebarOpen ? 250 : 80,
              flexShrink: 0,
              transition: "width 0.3s ease",
              "& .MuiDrawer-paper": {
                width: isSidebarOpen ? 250 : 80,
                transition: "width 0.3s ease",
                bgcolor: darkMode ? colors.sidebarDark : colors.sidebarLight,
                color: darkMode ? colors.textDark : colors.textLight,
                padding: "16px 8px",
                marginTop: "64px",
                height: `calc(100% - 64px)`,
                borderRight: "none",
                boxShadow: "2px 0 10px 0 rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              {isSidebarOpen && (
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{
                    color: darkMode ? colors.textDark : colors.textLight,
                    fontWeight: "600",
                    pl: 1,
                  }}
                >
                  Menu
                </Typography>
              )}
              <IconButton
                onClick={toggleSidebar}
                color="inherit"
                sx={{
                  backgroundColor: darkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                  borderRadius: "8px",
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <Divider
              sx={{
                borderColor: darkMode
                  ? colors.dividerDark
                  : colors.dividerLight,
                mb: 2,
              }}
            />

            <List>
              {/* Dashboard */}
              <ListItem disablePadding>
                <ListItemButton
  onClick={() => setActiveComponent("dashboard")}
  selected={activeComponent === "dashboard"}
>
  <ListItemIcon>
    <SchoolIcon color={activeComponent === "dashboard" ? "primary" : "inherit"} />
  </ListItemIcon>
  {isSidebarOpen && (
    <ListItemText
      primary="Dashboard"
      primaryTypographyProps={{
        fontWeight: activeComponent === "dashboard" ? "600" : "400",
      }}
    />
  )}
</ListItemButton>

              </ListItem>
              <Divider
                sx={{
                  borderColor: darkMode ? colors.dividerDark : colors.dividerLight,
                  my: 1,
                }}
              />

              {/* Staff Creation */}
              <ListItem disablePadding>
  <ListItemButton
    onClick={() => setActiveComponent("StaffList")}
    selected={activeComponent === "StaffList"}
    sx={{
      "&.Mui-selected": {
        backgroundColor: darkMode
          ? "rgba(25, 118, 210, 0.2)"
          : "rgba(25, 118, 210, 0.1)",
        "&:hover": {
          backgroundColor: darkMode
            ? "rgba(25, 118, 210, 0.3)"
            : "rgba(25, 118, 210, 0.15)",
        },
      },
    }}
  >
    <ListItemIcon>
      <PeopleIcon color={activeComponent === "StaffList" ? "primary" : "inherit"} />
    </ListItemIcon>
    {isSidebarOpen && (
      <ListItemText
        primary="Staff"
        primaryTypographyProps={{
          fontWeight: activeComponent === "StaffList" ? "600" : "400",
        }}
      />
    )}
  </ListItemButton>
</ListItem>

              <Divider
                sx={{
                  borderColor: darkMode ? colors.dividerDark : colors.dividerLight,
                  my: 1,
                }}
              />

              {/* Intern Management */}
              <ListItem disablePadding>
  <ListItemButton
  onClick={() => setActiveComponent("InternLists")}

  selected={activeComponent === "InternOnboarding"}
>
  <ListItemIcon>
    <SchoolIcon color={activeComponent === "InternOnboarding" ? "primary" : "inherit"} />
  </ListItemIcon>
  {isSidebarOpen && (
    <ListItemText
      primary="Intern"
      primaryTypographyProps={{
        fontWeight: activeComponent === "InternOnboarding" ? "600" : "400",
      }}
    />
  )}
</ListItemButton>



</ListItem>
              <Divider
                sx={{
                  borderColor: darkMode ? colors.dividerDark : colors.dividerLight,
                  my: 1,
                }}
              />

              {/* Payment */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setActiveComponent("payment")}


                  selected={activeComponent === "payment"}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: darkMode
                        ? "rgba(25, 118, 210, 0.2)"
                        : "rgba(25, 118, 210, 0.1)",
                      "&:hover": {
                        backgroundColor: darkMode
                          ? "rgba(25, 118, 210, 0.3)"
                          : "rgba(25, 118, 210, 0.15)",
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <CurrencyRupeeIcon color={activeComponent === "payment" ? "primary" : "inherit"} />
                  </ListItemIcon>
                  {isSidebarOpen && (
                    <ListItemText
                      primary="Payment"
                      primaryTypographyProps={{
                        fontWeight: activeComponent === "payment" ? "600" : "400",
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
              <Divider
                sx={{
                  borderColor: darkMode ? colors.dividerDark : colors.dividerLight,
                  my: 1,
                }}
              />

              {/* Asset Management */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setActiveComponent("assetManagement")}
                  selected={activeComponent === "assetManagement"}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: darkMode
                        ? "rgba(25, 118, 210, 0.2)"
                        : "rgba(25, 118, 210, 0.1)",
                      "&:hover": {
                        backgroundColor: darkMode
                          ? "rgba(25, 118, 210, 0.3)"
                          : "rgba(25, 118, 210, 0.15)",
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <InventoryIcon color={activeComponent === "assetManagement" ? "primary" : "inherit"} />
                  </ListItemIcon>
                  {isSidebarOpen && (
                    <ListItemText
                      primary="Asset"
                      primaryTypographyProps={{
                        fontWeight: activeComponent === "assetManagement" ? "600" : "400",
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
              <Divider
                sx={{
                  borderColor: darkMode ? colors.dividerDark : colors.dividerLight,
                  my: 1,
                }}
              />

              {/* Department */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setActiveComponent("department")}
                  selected={activeComponent === "department"}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: darkMode
                        ? "rgba(25, 118, 210, 0.2)"
                        : "rgba(25, 118, 210, 0.1)",
                      "&:hover": {
                        backgroundColor: darkMode
                          ? "rgba(25, 118, 210, 0.3)"
                          : "rgba(25, 118, 210, 0.15)",
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <ApartmentIcon color={activeComponent === "department" ? "primary" : "inherit"} />
                  </ListItemIcon>
                  {isSidebarOpen && (
                    <ListItemText
                      primary="Department"
                      primaryTypographyProps={{
                        fontWeight: activeComponent === "department" ? "600" : "400",
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
              <Divider
                sx={{
                  borderColor: darkMode ? colors.dividerDark : colors.dividerLight,
                  my: 1,
                }}
              />

              

              {/* Feedback */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => setActiveComponent("feedback")}
                  selected={activeComponent === "feedback"}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: darkMode
                        ? "rgba(25, 118, 210, 0.2)"
                        : "rgba(25, 118, 210, 0.1)",
                      "&:hover": {
                        backgroundColor: darkMode
                          ? "rgba(25, 118, 210, 0.3)"
                          : "rgba(25, 118, 210, 0.15)",
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <AssessmentIcon color={activeComponent === "feedback" ? "primary" : "inherit"} />
                  </ListItemIcon>
                  {isSidebarOpen && (
                    <ListItemText
                      primary="Feedback"
                      primaryTypographyProps={{
                        fontWeight: activeComponent === "feedback" ? "600" : "400",
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: darkMode ? colors.darkBackground : colors.lightBackground,
              p: 3,
              overflowY: "auto",
              height: "calc(100vh - 64px)",
            }}
          >
            <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
              {activeComponent === "dashboard" && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6} lg={6}>
                    <TotalInternCount
                      internCount={internCountData}
                      maxInternCount={maxInternCount}
                      darkMode={darkMode}
                      trend="up"
                      onViewDetails={() => setActiveComponent("internLists")}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={6}>
                  <AverageAttendance
  averageAttendance={averageAttendance}
  darkMode={darkMode}
  selectedDate={selectedDate}
  onDateChange={handleDateChange}
/>

                  </Grid>

                  {/* Payment Details */}
                  <Grid item xs={12} md={6} lg={6}>
                    <Tooltip
                      title="Payment Details: Overview of total, pending, and completed payments"
                      arrow
                    >
                      <Card
                        sx={{
                          height: "100%",
                          borderRadius: "12px",
                          background: darkMode
                            ? colors.cardDark
                            : colors.cardLight,
                          boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
                          textAlign: "center",
                          padding: "16px",
                          transition: "transform 0.3s, box-shadow 0.3s",
                          borderLeft: `4px solid ${colors.info}`,
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px 0 rgba(0, 0, 0, 0.2)",
                          },
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              color: darkMode
                                ? colors.textDark
                                : colors.textLight,
                              fontWeight: "600",
                              mb: 3,
                            }}
                          >
                            Payment Details
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                              marginTop: 6,
                            }}
                          >
                            {/* Free Payments */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.9rem",
                                  color: darkMode
                                    ? colors.textDark
                                    : colors.textLight,
                                  minWidth: "120px",
                                  fontWeight: "500",
                                }}
                              >
                                Free:
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={paymentDetails.free || 0}
                                sx={{
                                  height: 10,
                                  flexGrow: 1,
                                  borderRadius: "5px",
                                  backgroundColor: darkMode ? "#555" : "#eee",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: colors.info,
                                    borderRadius: "5px",
                                  },
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.9rem",
                                  color: darkMode
                                    ? colors.textDark
                                    : colors.textLight,
                                  minWidth: "60px",
                                  textAlign: "right",
                                  fontWeight: "500",
                                }}
                              >
                                {paymentDetails.counts?.free}
                              </Typography>
                            </Box>

                            {/* Completed Payments */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.9rem",
                                  color: darkMode
                                    ? colors.textDark
                                    : colors.textLight,
                                  minWidth: "120px",
                                  fontWeight: "500",
                                }}
                              >
                                Completed:
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={paymentDetails.completed || 0}
                                sx={{
                                  height: 10,
                                  flexGrow: 1,
                                  borderRadius: "5px",
                                  backgroundColor: darkMode ? "#555" : "#eee",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: colors.success,
                                    borderRadius: "5px",
                                  },
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.9rem",
                                  color: darkMode
                                    ? colors.textDark
                                    : colors.textLight,
                                  minWidth: "60px",
                                  textAlign: "right",
                                  fontWeight: "500",
                                }}
                              >
                                {paymentDetails.counts?.completed}
                              </Typography>
                            </Box>

                            {/* Pending Payments */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.9rem",
                                  color: darkMode
                                    ? colors.textDark
                                    : colors.textLight,
                                  minWidth: "120px",
                                  fontWeight: "500",
                                }}
                              >
                                Pending:
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={paymentDetails.pending || 0}
                                sx={{
                                  height: 10,
                                  flexGrow: 1,
                                  borderRadius: "5px",
                                  backgroundColor: darkMode ? "#555" : "#eee",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: colors.warning,
                                    borderRadius: "5px",
                                  },
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.9rem",
                                  color: darkMode
                                    ? colors.textDark
                                    : colors.textLight,
                                  minWidth: "60px",
                                  textAlign: "right",
                                  fontWeight: "500",
                                }}
                              >
                                {paymentDetails.counts?.pending}
                              </Typography>
                            </Box>

                            {/* Overdue Payments */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.9rem",
                                  color: darkMode
                                    ? colors.textDark
                                    : colors.textLight,
                                  minWidth: "120px",
                                  fontWeight: "500",
                                }}
                              >
                                Overdue:
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={paymentDetails.overdue || 0}
                                sx={{
                                  height: 10,
                                  flexGrow: 1,
                                  borderRadius: "5px",
                                  backgroundColor: darkMode ? "#555" : "#eee",
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: colors.error,
                                    borderRadius: "5px",
                                  },
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.9rem",
                                  color: darkMode
                                    ? colors.textDark
                                    : colors.textLight,
                                  minWidth: "60px",
                                  textAlign: "right",
                                  fontWeight: "500",
                                }}
                              >
                                {paymentDetails.counts?.overdue}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Tooltip>
                  </Grid>

                  {/* Intern Performance */}
                  <Grid item xs={12} md={6} lg={6}>
                    <Tooltip
                      title="Intern Performance: Count of interns per domain"
                      arrow
                    >
                      <Card
                        sx={{
                          height: "100%",
                          borderRadius: "12px",
                          background: darkMode
                            ? colors.cardDark
                            : colors.cardLight,
                          boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
                          textAlign: "center",
                          padding: "16px",
                          transition: "transform 0.3s, box-shadow 0.3s",
                          borderLeft: `4px solid ${colors.secondary}`,
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 8px 24px 0 rgba(0, 0, 0, 0.2)",
                          },
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              color: darkMode
                                ? colors.textDark
                                : colors.textLight,
                              fontWeight: "600",
                              mb: 3,
                            }}
                          >
                            Intern Count by Department
                          </Typography>
                          <Box sx={{ height: "300px" }}>
                            <Bar
                              data={internPerformanceData}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: "top",
                                    labels: {
                                      color: darkMode
                                        ? colors.textDark
                                        : colors.textLight,
                                    },
                                  },
                                },
                                scales: {
                                  x: {
                                    ticks: {
                                      color: darkMode
                                        ? colors.textDark
                                        : colors.textLight,
                                    },
                                    grid: {
                                      color: darkMode
                                        ? colors.dividerDark
                                        : colors.dividerLight,
                                    },
                                  },
                                  y: {
                                    ticks: {
                                      color: darkMode
                                        ? colors.textDark
                                        : colors.textLight,
                                    },
                                    grid: {
                                      color: darkMode
                                        ? colors.dividerDark
                                        : colors.dividerLight,
                                    },
                                  },
                                },
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Tooltip>
                  </Grid>
                </Grid>
              )}
              {activeComponent === "StaffList" && <StaffList />}
              {activeComponent === "payment" && <PaymentList />}
{activeComponent === "adminProfile" && <AdminProfile />}
              {activeComponent === "feedback" && <PerformanceFeedbackPage />}
              {activeComponent === "assetManagement" && (
                <Box>
                  <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                    <Typography
                      onClick={() => setActiveAssetManagementComponent("assetManagementList")}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: activeAssetManagementComponent === "assetManagementList" ? 'bold' : 'normal',
                        borderBottom: activeAssetManagementComponent === "assetManagementList" ? '2px solid #1976d2' : 'none',
                        pb: 1,
                        color: activeAssetManagementComponent === "assetManagementList" ? '#1976d2' : 'inherit'
                      }}
                    >
                      ASSET MANAGEMENT
                    </Typography>
                    <Typography
                      onClick={() => setActiveAssetManagementComponent("assetReportIssueList")}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: activeAssetManagementComponent === "assetReportIssueList" ? 'bold' : 'normal',
                        borderBottom: activeAssetManagementComponent === "assetReportIssueList" ? '2px solid #1976d2' : 'none',
                        pb: 1,
                        color: activeAssetManagementComponent === "assetReportIssueList" ? '#1976d2' : 'inherit'
                      }}
                    >
                      REPORT ISSUE LIST
                    </Typography>
                  </Box>

                  {/* Render correct component */}
                  {activeAssetManagementComponent === "assetManagementList" && <AssetManagementList />}
                  {activeAssetManagementComponent === "assetReportIssueList" && <AssetReportIssueList />}
                </Box>
              )}
              {activeComponent === "InternLists" && (
  <InternLists />
)}


              {activeComponent === "register" && <RegisterPage />}
              {activeComponent === "department" && <DepartmentManagement />}
            </Box>
          </Box>
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="success"
            sx={{
              width: "100%",
              borderRadius: "8px",
              boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default App;