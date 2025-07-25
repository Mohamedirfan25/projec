import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
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
    ButtonGroup,
    CssBaseline,
    ListItemButton,
    ListItemAvatar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Rating,
    Skeleton,
    ToggleButtonGroup,
    ToggleButton
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
    Mouse as MouseIcon,
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
    Laptop as LaptopIcon,
    Print as PrinterIcon,
    PhoneIphone as MobileIcon,
    DevicesOther as DeviceIcon,
    Storage as StorageIcon,
    DesktopMac as DesktopIcon,
    Router as NetworkIcon,
    Build as MaintenanceIcon,
    Assignment as AssignmentIcon,
    AttachMoney as AttachMoneyIcon,
    ArrowDropDown as ArrowDropDownIcon,
    Person as PersonIcon
} from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { faker } from '@faker-js/faker';
import axios from 'axios';
import AssetManagement from "./AssetManagementlist";
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

// Sample employee/intern data
const employees = [
    { id: 'INT-001', name: 'John Doe', type: 'Employee', department: 'IT' },
    { id: 'INT-002', name: 'Jane Smith', type: 'Employee', department: 'Engineering' },
    { id: 'INT-004', name: 'Mike Johnson', type: 'Intern', department: 'Design' },
    { id: 'INT-005', name: 'Sarah Williams', type: 'Intern', department: 'Marketing' },
    { id: 'INT-003', name: 'Robert Brown', type: 'Employee', department: 'Finance' }
];

// Generate mock asset data with faker
const generateMockAssets = (count) => {
    const types = ['Laptop', 'Desktop', 'Mouse', 'Tablet'];
    const statuses = ['Assigned', 'Available', 'Maintenance'];
    const brands = ['Dell', 'HP', 'Lenovo', 'Apple', 'Samsung', 'Cisco', 'Asus'];

    return Array.from({ length: count }, (_, i) => {
        const status = faker.helpers.arrayElement(statuses);
        const assignedTo = status === 'Assigned' ? faker.helpers.arrayElement(employees).id : null;

        return {
            id: `AST-${faker.string.uuid().substring(0, 8).toUpperCase()}`,
            name: `${faker.helpers.arrayElement(brands)} ${faker.helpers.arrayElement(['XPS', 'Pro', 'Air', 'ThinkPad', 'Elite', 'Galaxy'])} ${faker.number.int({ min: 1000, max: 9999 })}`,
            type: faker.helpers.arrayElement(types),
            assignedTo: assignedTo,
            department: faker.helpers.arrayElement(['IT', 'Engineering', 'Design', 'Marketing', 'Finance', 'HR']),
            purchaseDate: faker.date.past({ years: 3 }).toISOString().split('T')[0],
            warrantyExpiry: faker.date.future({ years: 2 }).toISOString().split('T')[0],
            status: status,
            lastMaintenance: status === 'Maintenance' ? faker.date.recent().toISOString() : null,
            specifications: {
                cpu: `${faker.number.int({ min: 2, max: 8 })} core ${faker.helpers.arrayElement(['Intel i5', 'Intel i7', 'AMD Ryzen 5', 'AMD Ryzen 7'])}`,
                ram: `${faker.helpers.arrayElement([4, 8, 16, 32])}GB`,
                storage: `${faker.helpers.arrayElement([128, 256, 512, 1024])}GB ${faker.helpers.arrayElement(['SSD', 'HDD'])}`,
                os: faker.helpers.arrayElement(['Windows 10', 'Windows 11', 'macOS', 'Linux'])
            },
            value: faker.commerce.price({ min: 500, max: 3000 }),
            image: faker.image.urlLoremFlickr({ category: 'computer' })
        };
    });
};

const initialAssets = generateMockAssets(25);

// Mock data for charts
const assetAllocationData = [
    { name: "N/A", allocated: 0, available: 0, issued: 0 },
    { name: "N/A", allocated: 0, available: 0, issued: 0 },
    { name: "N/A", allocated: 0, available: 0, issued: 0 },
    { name: "N/A", allocated: 0, available: 0, issued: 0 },
    { name: "N/A", allocated: 0, available: 0, issued: 0 },
    { name: "N/A", allocated: 0, available: 0, issued: 0 },
    { name: "N/A", allocated: 0, available: 0, issued: 0 }
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#4ECDC4'];
// Mock data for notifications
const notifications = [
    { id: 0, message: "N/A", time: "N/A", read: false },
    { id: 0, message: "N/A", time: "N/A", read: true },
    { id: 0, message: "N/A", time: "N/A", read: true },
    { id: 0, message: "N/A", time: "N/A", read: false }
];
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

const AssetManagementDashboard = () => {
    const [assets, setAssets] = useState(initialAssets);
    const [openModal, setOpenModal] = useState(false);
    const [currentAsset, setCurrentAsset] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [page, setPage] = useState(1);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [activeView, setActiveView] = useState("dashboard");
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
    const [currentActionAsset, setCurrentActionAsset] = useState(null);
    const [dashboardAnchorEl, setDashboardAnchorEl] = useState(null);
    const rowsPerPage = 5;
    const navigate = useNavigate();

    const [totalAssets, setTotalAssets] = useState(0);
    const [assignedAssets, setAssignedAssets] = useState(0)
    const [availableAssets, setAvailableAssets] = useState(0);
    useEffect(() => {
        const token = localStorage.getItem("token");  // Get stored auth token

        fetch("http://localhost:8000/Sims/assert-stock-count/", {
            headers: {
                "Authorization": `Token ${token}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error("Unauthorized");
                return response.json();
            })
            .then(data => {
                setTotalAssets(data.total_assets);
                setAssignedAssets(data.assigned_assets);
                setAvailableAssets(data.available_assets);
            })
            .catch(error => console.error("Error fetching assets:", error));
    }, []);




    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        fetchProfileData();
    }, []);



    const [assetTrendData, setAssetTrendData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No token found. Please log in.");
            return;
        }

        fetch("http://localhost:8000/Sims/asset-trend/", {
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                const processedData = data.map(item => ({
                    ...item,
                    available_assets: item.total_assets - item.assigned_assets
                }));
                console.log("Processed Asset trend data:", processedData);
                setAssetTrendData(processedData);
            })
            .catch(error => console.error("Error fetching asset trend data:", error));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No token found. Please log in.");
            return;
        }

        fetch("http://localhost:8000/Sims/available-assets/", {
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log("Available Assets Data:", data);
                setAvailableAssets(data.available_assets);
            })
            .catch(error => console.error("Error fetching available assets:", error));
    }, []);



    useEffect(() => {
        const token = localStorage.getItem("token");

        async function fetchAssets() {
            try {
                // Fetch asset stock data
                const assetResponse = await fetch("http://localhost:8000/Sims/assert-stock/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!assetResponse.ok) throw new Error("Failed to fetch asset data");

                const assetsData = await assetResponse.json();
                console.log("Fetched Asset Data:", assetsData); // Debugging

                // Fetch user data from userdataview.py
                const userResponse = await fetch("http://localhost:8000/Sims/user-data/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!userResponse.ok) throw new Error("Failed to fetch user data");

                const usersData = await userResponse.json();
                console.log("Fetched User Data:", usersData); // Debugging

                // Create a mapping of asset_code -> username
                const userMap = usersData.reduce((map, user) => {
                    if (user.asset_code) {
                        map[user.asset_code] = user.username; // Map asset_code to username
                    }
                    return map;
                }, {});

                console.log("User Mapping:", userMap); // Debugging

                // Transform asset data with assigned usernames
                const formattedAssets = assetsData.map(asset => ({
                    id: asset.assert_id,
                    asset: asset.configuration,
                    type: asset.assert_model,
                    assignedTo: userMap[asset.assert_id] || userMap[asset.asset_code] || "assigned", // Ensure correct username mapping
                    status: asset.inhand ? "Available" : "Assigned",
                    createdDate: asset.created_date,
                    updatedDate: asset.updated_date
                }));

                console.log("Formatted Assets:", formattedAssets); // Debugging

                setAssets(formattedAssets);
            } catch (error) {
                console.error("Error fetching asset data:", error);
            }
        }

        fetchAssets();
    }, []);

    // Add user permissions state
    const [userPermissions, setUserPermissions] = useState({
        hasAssetAccess: true, // Default to true since this is the Asset Dashboard
        hasAttendanceAccess: false,
        hasPayrollAccess: false,
        hasInternAccess: true   // Always show Intern Dashboard
    });

    // Fetch user permissions on component mount
    useEffect(() => {
        const fetchUserPermissions = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:8000/Sims/user-permissions/", {
                    headers: { Authorization: `Token ${token}` }
                });
                
                if (response.data) {
                    setUserPermissions(prev => ({
                        ...prev,
                        ...response.data,
                        hasAssetAccess: true, // Ensure Asset Dashboard is always accessible in this component
                        hasInternAccess: true // Always ensure Intern Dashboard is accessible
                    }));
                }
            } catch (error) {
                console.error("Error fetching user permissions:", error);
                // Fallback to default permissions if API call fails
                setUserPermissions(prev => ({
                    ...prev,
                    hasInternAccess: true // Still ensure Intern Dashboard is accessible
                }));
            }
        };

        fetchUserPermissions();
    }, []);

    const [userMap, setUserMap] = useState({});

    // Filter assets based on search term and status filter
    const filteredAssets = assets.filter(asset => {
        const matchesSearch = searchTerm === '' || 
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.assignedTo && asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
            
        const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const paginatedAssets = filteredAssets.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleOpenModal = (asset = null) => {
        setCurrentAsset(asset);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setCurrentAsset(null);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.target);
        const status = formData.get("status");
        let assignedTo = formData.get("assignedTo");

        // Clear assignedTo if status is not Assigned
        if (status !== 'Assigned') {
            assignedTo = null;
        }

        const newAsset = {
            id: currentAsset ? currentAsset.id : `AST-${faker.string.uuid().substring(0, 8).toUpperCase()}`,
            name: formData.get("name") || `${formData.get("brand")} ${formData.get("model")}`,
            type: formData.get("type"),
            assignedTo: assignedTo,
            purchaseDate: formData.get("purchaseDate"),
            warrantyExpiry: formData.get("warrantyExpiry"),
            status: status,
            lastMaintenance: status === 'Maintenance' ? new Date().toISOString() : currentAsset?.lastMaintenance || null,
            specifications: {
                cpu: formData.get("cpu"),
                ram: formData.get("ram"),
                storage: formData.get("storage"),
                os: formData.get("os")
            },
            value: formData.get("value") || faker.commerce.price({ min: 500, max: 3000 }),
            image: currentAsset?.image || faker.image.urlLoremFlickr({ category: 'computer' })
        };

        // Simulate API call
        setTimeout(() => {
            if (currentAsset) {
                setAssets(assets.map((a) => (a.id === currentAsset.id ? newAsset : a)));
                showSnackbar("Asset updated successfully!");
            } else {
                setAssets([...assets, newAsset]);
                showSnackbar("Asset created successfully!");
            }
            setLoading(false);
            handleCloseModal();
        }, 1000);
    };

    const handleDelete = (id) => {
        setAssets(assets.filter((asset) => asset.id !== id));
        showSnackbar("Asset deleted successfully!");
    };

    const handleBulkDelete = () => {
        setAssets(assets.filter((asset) => !selectedAssets.includes(asset.id)));
        setSelectedAssets([]);
        showSnackbar("Selected assets deleted successfully!");
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedAssets(filteredAssets.map((asset) => asset.id));
        } else {
            setSelectedAssets([]);
        }
    };

    const handleSelectAsset = (id) => {
        if (selectedAssets.includes(id)) {
            setSelectedAssets(selectedAssets.filter((assetId) => assetId !== id));
        } else {
            setSelectedAssets([...selectedAssets, id]);
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

    const handleStatusChange = (assetId, newStatus) => {
        setAssets(assets.map(asset => {
            if (asset.id === assetId) {
                return {
                    ...asset,
                    status: newStatus,
                    assignedTo: newStatus === 'Assigned' ? asset.assignedTo || null : null,
                    lastMaintenance: newStatus === 'Maintenance' ? new Date().toISOString() : asset.lastMaintenance
                };
            }
            return asset;
        }));
        showSnackbar(`Asset status updated to ${newStatus}`);
    };

    const handleActionMenuOpen = (event, asset) => {
        setActionMenuAnchorEl(event.currentTarget);
        setCurrentActionAsset(asset);
    };

    const handleActionMenuClose = () => {
        setActionMenuAnchorEl(null);
        setCurrentActionAsset(null);
    };

    const handleDashboardMenuClick = (event) => {
        setDashboardAnchorEl(event.currentTarget);
    };

    const handleDashboardMenuClose = () => {
        setDashboardAnchorEl(null);
    };

    // Get filtered dashboard options based on permissions
    const getDashboardOptions = () => {
        return [
            {
                id: 'asset',
                label: 'Asset Dashboard',
                icon: <EngineeringIcon />,
                visible: userPermissions.hasAssetAccess,
                current: true
            },
            {
                id: 'attendance',
                label: 'Attendance Dashboard',
                icon: <AssignmentIcon />,
                visible: userPermissions.hasAttendanceAccess
            },
            {
                id: 'intern',
                label: 'Intern Dashboard',
                icon: <PeopleIcon />,
                visible: true // Always show Intern Dashboard
            },
            {
                id: 'payroll',
                label: 'Payroll Dashboard',
                icon: <AttachMoneyIcon />,
                visible: userPermissions.hasPayrollAccess
            }
        ].filter(option => option.visible);
    };

    // Dashboard options for dropdown - now using the filtered version
    const dashboardOptions = getDashboardOptions();

    const getAssetIcon = (type) => {
        switch (type) {
            case 'Laptop':
                return <LaptopIcon />;
            case 'Desktop':
                return <DesktopIcon />;
            case 'Mouse':
                return <MouseIcon />;
            default:
                return <DeviceIcon />;
        }
    };

    const getEmployeeName = (assert_id) => {
        return userMap[assert_id] || "assigned";
    };


    const getStatusColor = (status) => {
        switch (status) {
            case 'Assigned':
                return 'success';
            case 'Available':
                return 'info';
            case 'Maintenance':
                return 'warning';
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

    const renderDashboard = () => (
        <Grid container spacing={3}>
            {/* Total Assets */}
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#3f51b5', color: 'white' }}>
                    <CardContent>
                        <Typography color="inherit" gutterBottom>
                            Total Assets
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h4" color="inherit">{totalAssets}</Typography>
                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                                <DeviceIcon fontSize="large" />
                            </Avatar>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Assigned Assets */}
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#4caf50', color: 'white' }}>
                    <CardContent>
                        <Typography color="inherit" gutterBottom>
                            Assigned Assets
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h4" color="inherit">{assignedAssets}</Typography>
                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                                <AssignmentIcon fontSize="large" />
                            </Avatar>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#ff9800', color: 'white' }}>
                    <CardContent>
                        <Typography color="inherit" gutterBottom>
                            under Maintenance
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h4" color="inherit">{availableAssets}</Typography>
                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                                <StorageIcon fontSize="large" />
                            </Avatar>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: '#ff9800', color: 'white' }}>
                    <CardContent>
                        <Typography color="inherit" gutterBottom>
                            Available Assets
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h4" color="inherit">{availableAssets}</Typography>
                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                                <StorageIcon fontSize="large" />
                            </Avatar>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            {/* Charts */}

            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">Asset Update Trends</Typography>
                        </Box>
                        <Box height={300}>
                            {assetTrendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={assetTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="month"
                                            tickFormatter={(tick) =>
                                                new Date(tick).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                            }
                                        />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value, name) => [`${value} assets`, name]}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="total_assets"
                                            fill="#8884d8"
                                            name="Total Assets"
                                            barSize={25}
                                            activeBar={{ fill: "#5c6bc0" }}
                                        />
                                        <Bar
                                            dataKey="assigned_assets"
                                            fill="#4caf50"
                                            name="Assigned Assets"
                                            barSize={25}
                                            activeBar={{ fill: "#388e3c" }}
                                        />
                                        <Bar
                                            dataKey="available_assets"
                                            fill="#ff9800"
                                            name="Available Assets"
                                            barSize={25}
                                            activeBar={{ fill: "#fb8c00" }}
                                        />
                                    </BarChart>

                                </ResponsiveContainer>
                            ) : (
                                <Typography variant="h6">No data available</Typography>
                            )}
                        </Box>
                    </CardContent>
                </Card>

            </Grid>


            {/* Recent Assets */}
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                Recently Added Assets
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenModal()}
                            >
                                Add Asset
                            </Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Asset</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Assigned</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {assets.slice(0, 5).map((asset) => (
                                        <TableRow key={asset.id} hover>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <ListItemAvatar>
                                                        <Badge
                                                            overlap="circular"
                                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                            variant="dot"
                                                            color={
                                                                asset.status === 'Assigned' ? 'success' :
                                                                    asset.status === 'Maintenance' ? 'warning' : 'error'
                                                            }
                                                        >
                                                            <Avatar
                                                                src={asset.image}
                                                                sx={{ width: 40, height: 40, mr: 2 }}
                                                            />
                                                        </Badge>
                                                    </ListItemAvatar>
                                                    <Box>
                                                        <Typography fontWeight="medium">{asset.name}</Typography>
                                                        <Typography variant="body2" color="textSecondary">
                                                            {asset.id}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {getAssetIcon(asset.type)}
                                                    <Typography>{asset.type}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {asset.assignedTo}
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={asset.status}
                                                    color={getStatusColor(asset.status)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={(e) => handleActionMenuOpen(e, asset)}
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


    const renderAssetList = () => (
        <Grid item xs={12}>
            <AssetManagement />
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
            case "assets":
                return renderAssetList();
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
                            Asset Management
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
                                <ToggleButton value="assets">
                                    <DeviceIcon sx={{ mr: 1 }} />
                                    Assets
                                </ToggleButton>
                                <ToggleButton value="profile">
                                    <PersonIcon sx={{ mr: 1 }} />
                                    Profile
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
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: stringToColor(staffProfile.name)
                                        }}
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
                                selected={activeView === "assets"}
                                onClick={() => {
                                    setActiveView("assets");
                                    setMobileOpen(false);
                                }}
                            >
                                <ListItemIcon>
                                    <DeviceIcon />
                                </ListItemIcon>
                                <ListItemText primary="Assets" />
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

            {/* Asset Create/Edit Modal */}
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
                        {currentAsset ? "Edit Asset" : "Add New Asset"}
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Asset Name"
                                    name="name"
                                    defaultValue={currentAsset?.name}
                                    required
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Brand"
                                    name="brand"
                                    defaultValue={currentAsset?.name?.split(' ')[0] || ''}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Model"
                                    name="model"
                                    defaultValue={currentAsset?.name?.split(' ').slice(1).join(' ') || ''}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        label="Type"
                                        name="type"
                                        defaultValue={currentAsset?.type || ""}
                                        required
                                    >
                                        <MenuItem value="Laptop">Laptop</MenuItem>
                                        <MenuItem value="Desktop">Desktop</MenuItem>
                                        <MenuItem value="Printer">Printer</MenuItem>
                                        <MenuItem value="Mobile">Mobile</MenuItem>
                                        <MenuItem value="Server">Server</MenuItem>
                                        <MenuItem value="Network Device">Network Device</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Assigned To</InputLabel>
                                    <Select
                                        label="Assigned To"
                                        name="assignedTo"
                                        defaultValue={currentAsset?.assignedTo || ""}
                                        disabled={currentAsset?.status === 'Maintenance' || currentAsset?.status === 'Available'}
                                    >
                                        <MenuItem value="">Unassigned</MenuItem>
                                        {employees.map(employee => (
                                            <MenuItem key={employee.id} value={employee.id}>
                                                {employee.name} ({employee.id}) - {employee.type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Department</InputLabel>
                                    <Select
                                        label="Department"
                                        name="department"
                                        defaultValue={currentAsset?.department || ""}
                                        required
                                    >
                                        <MenuItem value="IT">IT</MenuItem>
                                        <MenuItem value="Engineering">Engineering</MenuItem>
                                        <MenuItem value="Design">Design</MenuItem>
                                        <MenuItem value="Marketing">Marketing</MenuItem>
                                        <MenuItem value="Finance">Finance</MenuItem>
                                        <MenuItem value="HR">HR</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        label="Status"
                                        name="status"
                                        defaultValue={currentAsset?.status || "Available"}
                                        required
                                        onChange={(e) => {
                                            if (e.target.value !== 'Assigned') {
                                                // Clear assignedTo if status is not Assigned
                                                const form = document.querySelector('form');
                                                if (form) {
                                                    form.elements['assignedTo'].value = '';
                                                }
                                            }
                                        }}
                                    >
                                        <MenuItem value="Assigned">Assigned</MenuItem>
                                        <MenuItem value="Available">Available</MenuItem>
                                        <MenuItem value="Maintenance">Maintenance</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Purchase Date"
                                    name="purchaseDate"
                                    type="date"
                                    defaultValue={currentAsset?.purchaseDate}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Warranty Expiry"
                                    name="warrantyExpiry"
                                    type="date"
                                    defaultValue={currentAsset?.warrantyExpiry}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Estimated Value ($)"
                                    name="value"
                                    type="number"
                                    defaultValue={currentAsset?.value}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box mt={2}>
                                    <Button
                                        variant="contained"
                                        component="label"
                                        startIcon={<CloudUploadIcon />}
                                        fullWidth
                                    >
                                        Upload Image
                                        <input type="file" hidden />
                                    </Button>
                                </Box>
                            </Grid>

                            {/* Specifications */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Specifications
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="CPU"
                                    name="cpu"
                                    defaultValue={currentAsset?.specifications?.cpu}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="RAM"
                                    name="ram"
                                    defaultValue={currentAsset?.specifications?.ram}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Storage"
                                    name="storage"
                                    defaultValue={currentAsset?.specifications?.storage}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Operating System"
                                    name="os"
                                    defaultValue={currentAsset?.specifications?.os}
                                    margin="normal"
                                />
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
                                ) : currentAsset ? (
                                    "Update Asset"
                                ) : (
                                    "Add Asset"
                                )}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Modal>

            {/* Action Menu for Asset Rows */}
            <Menu
                anchorEl={actionMenuAnchorEl}
                open={Boolean(actionMenuAnchorEl)}
                onClose={handleActionMenuClose}
            >
                <MenuItem onClick={() => {
                    handleOpenModal(currentActionAsset);
                    handleActionMenuClose();
                }}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    Edit
                </MenuItem>
                <MenuItem onClick={() => {
                    handleDelete(currentActionAsset?.id);
                    handleActionMenuClose();
                }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <Typography color="error">Delete</Typography>
                </MenuItem>
            </Menu>

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

export default AssetManagementDashboard;