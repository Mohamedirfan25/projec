import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DialogContentText from '@mui/material/DialogContentText';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  PaginationItem,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Button,
  IconButton,
  Popover,
  Stack,
  Container,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  CssBaseline,
  Grid,
  Menu,
  InputLabel,
  Card
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
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  AssignmentInd,
  HowToReg as RegisterIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Home as AddressIcon,
  LocationOn as PincodeIcon,
  Cake as DOBIcon,
  Transgender as GenderIcon,
  MoreVert as MoreVertIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  MoreHoriz as OtherIcon,
  CreditCard as AadharIcon,
  School as GraduateIcon,
  Save as SaveIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  PictureAsPdf,
  Description,
  PermIdentity,
  Info,
  VerifiedUser,
  School as CollegeIcon,
  Class as DegreeIcon,
  ListAlt as DeptIcon,
  CalendarToday as YearIcon,
  Grade as CgpaIcon,
  ContactPhone as FacultyIcon,
  CloudUpload,
  Delete,
  CheckCircle,
  AdminPanelSettings,
  TaskAlt,
  Business as CompanyIcon,
  Category as DomainIcon,
  Groups as DepartmentIcon,
  MonetizationOn as SchemeIcon,
  Groups as TeamIcon,
  Tag as AssetIcon,
  Event as StartDateIcon,
  EventAvailable as EndDateIcon,
  Schedule as DurationIcon,
  CalendarToday as DaysIcon,
  AccessTime as ShiftIcon,
  ToggleOn as StatusIcon,
  SupervisorAccount as ManagerIcon,
  Person as SupervisorIcon,
  AddAPhoto as AddPhotoIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import EditedForm from '../components/EditedForm';
import UndoIcon from '@mui/icons-material/Undo';
import { useTheme } from '@mui/material/styles';
import { useColorMode } from '../index';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BuildIcon from '@mui/icons-material/Build';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4361ee',
      dark: '#3a56e8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
      darkDefault: '#121212',
      darkPaper: '#1e1e1e',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      darkPrimary: '#ffffff',
      darkSecondary: '#e0e0e0',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.primary.dark
            : theme.palette.primary.main,
        }),
        contained: ({ theme }) => ({
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.primary.dark
              : '#3a56e8',
          },
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.23)'
                : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: theme.palette.mode === 'dark' 
                ? theme.palette.primary.dark
                : theme.palette.primary.main,
            },
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          bgcolor: theme.palette.mode === 'dark' 
            ? theme.palette.background.darkPaper
            : theme.palette.background.paper,
        }),
      },
    },
  },
});
const generateCompletedCertificate = async (empId, firstName) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `http://localhost:8000/Sims/generate-completed-certificate/${empId}/`,
      {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${firstName}_CompletedCertificate.pdf`);
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error generating completed certificate:", error);
    alert("Failed to generate certificate.");
  }
};

const InternLists = ({ setActiveComponent, showAddForm: externalShowAddForm, onFormComplete, onFormCancel, departmentFilter }) => {
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  // Set default tab to 'In Progress' (matches tab value, not 'InProgress')
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInternId, setSelectedInternId] = useState(null);
  const [certificatesAnchorEl, setCertificatesAnchorEl] = useState(null);
  const [selectedCertInternId, setSelectedCertInternId] = useState(null);
  // Initialize interns as an object with all tab keys to avoid blank data
  const [interns, setInterns] = useState({
    'All': [],
    'In Progress': [],
    'Completed': [],
    'Yet to Join': [],
    'Hold and Wait': [],
    'Discontinued': [],
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [deletedInterns, setDeletedInterns] = useState([]); // Deleted interns

  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    scheme: '',
    domain: ''
  });
  const [showAddForm, setShowAddForm] = useState(externalShowAddForm || false);
  const [showEditedForm, setShowEditedForm] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState(null); // optional, to pass data
  const [actionSubMenuAnchorEl, setActionSubMenuAnchorEl] = useState(null);

  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [certificateSentStatus, setCertificateSentStatus] = useState({});
  const [activeCertMenu, setActiveCertMenu] = useState('inProgress');
  const [openPartialCertDialog, setOpenPartialCertDialog] = useState(false);
const [partialCertData, setPartialCertData] = useState({
  start_date: '',
  end_date: '',
  remarks: '',
  is_approved: false,
  approved_by: ''
});

const [users, setUsers] = useState([]);

// Add this useEffect to fetch users when the component mounts
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get('http://localhost:8000/Sims/users/', {
        headers: { 'Authorization': `Token ${token}` }
      });
      setUsers(response.data);
      console.log("Users:",response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  fetchUsers();
}, []);

  const fetchInterns = async () => {
    try {
      setIsLoading(true);
    // Declare intern status arrays
    const inProgressInterns = [];
    const completedInterns = [];
    const yetToJoinInterns = [];
    const holdAndWaitInterns = [];
    const discontinuedInterns = [];
    const deletedInterns = [];
    const certStatusMap = {};

    const token = localStorage.getItem("token");

    const [userDataRes, registerRes, tempRes] = await Promise.all([
      axios.get("http://localhost:8000/Sims/user-data/", {
        headers: { Authorization: `Token ${token}` },
      }),
      axios.get("http://localhost:8000/Sims/register/", {
        headers: { Authorization: `Token ${token}` },
      }),
      axios.get("http://localhost:8000/Sims/temps/", {
        headers: { Authorization: `Token ${token}` },
      }),
    ]);

    const internUsernames = new Set(
      tempRes.data
        .filter((entry) => entry.role === "intern")
        .map((entry) => entry.username)
    );

    const internUsers = userDataRes.data.filter((user) =>
      internUsernames.has(user.username)
    );

    const combinedData = internUsers.map((user) => {
      const registerInfo = registerRes.data.find((reg) => reg.id === user.user) || {};
      // Map the certificate sent status from the backend
      if (user.certicate_sent) {
        certStatusMap[user.emp_id] = true;
      }
      return { ...user, ...registerInfo };
    });
    
    // Update the certificate sent status state
    setCertificateSentStatus(prev => ({
      ...prev,
      ...certStatusMap
    }));

// Removed unreachable code after return

    combinedData.forEach((item) => {
      const userStatus = item.user_status?.toLowerCase();
      let status = "In Progress";
      if (userStatus === "deleted") {
        status = "Deleted";
      } else if (userStatus === "discontinued") {
        status = "Discontinued";
      } else if (userStatus === "completed") {
        status = "Completed";
      } else if (userStatus === "yettojoin") {
        status = "Yet to Join";
      } else if (userStatus === "holdandwait") {
        status = "Hold and Wait";
      } else if (userStatus === "inprogress") {
        status = "In Progress";
      }

      const internData = {
        id: item.emp_id,
        name: item.username,
        firstName: item.first_name || item.firstName || "",
        lastName: item.last_name || item.lastName || "",
        email: item.email || `${item.username}@example.com`,
        mobile: item.mobile || "",
        department: item.department || "-",
        scheme: item.scheme || "-",
        domain: item.domain || "-",
        startDate: item.start_date || "-",
        endDate: item.end_date || "-",
        status,
        user_status: item.user_status,
        reportingManager: item.reporting_manager_username || "-",
        reportingSupervisor: item.reporting_supervisor_username || "-",
        duration: item.duration || "-",
        shiftTiming: item.shift_timing || "-",
        teamName: item.team_name || "-",
        address1: item.address1 || "",
        address2: item.address2 || "",
        pincode: item.pincode || "",
        dob: item.dob || "",
        gender: item.gender || "",
        aadharNumber: item.aadharNumber || "",
      };

      if (status === "Deleted") {
        deletedInterns.push(internData);
      } else if (status === "Discontinued") {
        discontinuedInterns.push(internData);
      } else if (status === "Yet to Join") {
        yetToJoinInterns.push(internData);
      } else if (status === "Hold and Wait") {
        holdAndWaitInterns.push(internData);
      } else if (status === "Completed") {
        completedInterns.push(internData);
      } else if (status === "In Progress") {
        inProgressInterns.push(internData);
      }
    });

    setInterns({
      'All': [
        ...inProgressInterns,
        ...completedInterns,
        ...yetToJoinInterns,
        ...holdAndWaitInterns,
        ...discontinuedInterns
      ],
      'In Progress': inProgressInterns,
      'Completed': completedInterns,
      'Yet to Join': yetToJoinInterns,
      'Hold and Wait': holdAndWaitInterns,
      'Discontinued': discontinuedInterns,
    });
    setDeletedInterns(deletedInterns);
  } catch (error) {
    console.error("Failed to fetch interns:", error);
  } finally {
    setIsLoading(false);
  }
};


useEffect(() => {
  fetchInterns();
}, []);


const handleCertificatesMenuOpen = (event, internId, menuType = 'inProgress') => {
  setCertificatesAnchorEl(event.currentTarget);
  setSelectedCertInternId(internId);
  setActiveCertMenu(menuType); // Add this line
};

const handleCertificatesMenuClose = () => {
  setCertificatesAnchorEl(null);
  setSelectedCertInternId(null);
};

const handleCertificateAction = async (type, intern) => {
  if (!selectedCertInternId) return;

  try {
    const token = localStorage.getItem("token");
    let endpoint = '';
    let method = 'GET';
    let data = null;

        // Find the selected intern's data
        const allInterns = Object.values(interns).flat();
        const selectedIntern = allInterns.find(intern => intern.id === selectedCertInternId);
        
        if (!selectedIntern) {
          console.error('Intern not found');
          return;
        }
        console.log(selectedIntern);
        const collegeData = await axios.get(`http://localhost:8000/Sims/college-details/${selectedIntern.id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        const userData = await axios.get(`http://localhost:8000/Sims/user-data/${selectedIntern.id}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        console.log(collegeData.data.college_details);
        console.log(userData.data);

    switch(type) {
      case 'Offer Letter':
        endpoint = `http://localhost:8000/Sims/generate-offer-letter/`;
        method = 'POST';
        data = {
          college_name: collegeData.data.college_details.college_name,
          start_date: userData.data.start_date,
          end_date: userData.data.end_date,
          position_title: userData.data.domain+" Intern", 
          domain: userData.data.domain,
          work_location: "VDart, Global Capability Center, Mannarpuram",
          reporting_to: userData.data.reportingManager || "Derrick Alex",
          emp_id: selectedIntern.id, 
          shift_time: userData.data.shift_timing,
          shift_days: userData.data.shift_days
        };
        console.log(data);
        const offer_letter = await axios.post(endpoint, data ,
          {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
        );
        break;
      case 'Completion Certificate':
        const response = await axios.get(
          `http://localhost:8000/Sims/generate-completed-certificate/${selectedIntern.id}/`,
          {
            headers: { Authorization: `Token ${token}` },
            responseType: "blob",
          }
        );
    
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
    
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${userData.data.username}_CompletedCertificate.pdf`);
        document.body.appendChild(link);
        link.click();
    
        link.remove();
        window.URL.revokeObjectURL(url);
        break;
      case 'Task Certificate':
        const response2 = await axios.post(
          `http://localhost:8000/Sims/generate-task-certificate/`,
          {
            emp_id: selectedIntern.id,
          },
          {
            headers: { Authorization: `Token ${token}` },
            responseType: "blob",
          }
        );
        break;
      case 'Attendance Certificate':
        const response3 = await axios.post(
          `http://localhost:8000/Sims/generate-attendance-certificate/`,
          {
            emp_id: selectedIntern.id,
          },
          {
            headers: { Authorization: `Token ${token}` },
            responseType: "blob",
          }
        );
        break;
      case 'Partial Certificate':
        setSelectedIntern(intern);
        setOpenPartialCertDialog(true);
        break;
      default:
        break;
    }

    // const response = await axios({
    //   method,
    //   url: endpoint,
    //   data,
    //   headers: {
    //     'Authorization': `Token ${token}`,
    //     'Content-Type': 'application/json'
    //   } ,
    //   responseType: 'blob',
    // });
    // const blob = new Blob([response.data], { type: "application/pdf" });
    // const url = window.URL.createObjectURL(blob);

    // const link = document.createElement("a");
    // link.href = url;
    // link.setAttribute("download", `${userData.data.username}_CompletedCertificate.pdf`);
    // document.body.appendChild(link);
    // link.click();

    // link.remove();
    // window.URL.revokeObjectURL(url);
    toast.success(`Successfully generated ${type}.`);
    
    
  } catch (error) {
    console.error(`Error generating ${type}:`, error);
    toast.error(`Failed to generate ${type}. Please try again.`);
  } finally {
    handleCertificatesMenuClose();
  }
};

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  const handleDeleteIntern = async (internId) => {
    try {
      const token = localStorage.getItem("token");
      
      // Save the current state for potential rollback
      const previousState = {
        interns: JSON.parse(JSON.stringify(interns)),
        deletedInterns: [...deletedInterns]
      };
      
      // Find the intern being deleted for the undo functionality
      const internToDelete = Object.values(interns)
        .flat()
        .find(intern => intern.id === internId);
      
      if (!internToDelete) {
        throw new Error('Intern not found');
      }
      
      try {
        // Optimistically update the UI
        setInterns(prevInterns => {
          const updatedInterns = { ...prevInterns };
          
          // Remove the intern from all status arrays
          Object.keys(updatedInterns).forEach(key => {
            if (Array.isArray(updatedInterns[key])) {
              updatedInterns[key] = updatedInterns[key].filter(intern => intern.id !== internId);
            }
          });
          
          return updatedInterns;
        });
        
        // Add to deleted interns list
        setDeletedInterns(prev => [
          ...prev,
          {
            ...internToDelete,
            status: 'Deleted',
            user_status: 'deleted'
          }
        ]);
        
        // Make the API call
        const response = await axios.patch(
          `http://localhost:8000/Sims/user-data/${internId}/`,
          { user_status: "deleted" },
          { headers: { Authorization: `Token ${token}` }}
        );
        
        // Show success message with undo option
        setSnackbarMessage("Intern deleted successfully");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        
      } catch (apiError) {
        console.error("API Error:", apiError);
        // Revert to previous state on error
        setInterns(previousState.interns);
        setDeletedInterns(previousState.deletedInterns);
        
        setSnackbarMessage("Failed to delete intern. Please try again.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
      
    } catch (error) {
      console.error("Error in handleDeleteIntern:", error);
      setSnackbarMessage("An unexpected error occurred. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };
  const handleSetStatusAll = async () => {
    try {
      const response = await axios.get('http://localhost:8000/Sims/user-data/'); // 🔁 Replace with your actual endpoint
      if (!response.ok) throw new Error("Failed to fetch interns");
  
      const data = await response.json();
      setInterns(data); 
    } catch (error) {
      console.error("Error fetching all interns:", error);
    }
  };
  
const handleSetStatus = async (internId, status) => {
  try {
    const token = localStorage.getItem("token");
    // Map tab display values to backend status values
    const statusMap = {
      'In Progress': 'inprogress',
      'Completed': 'completed',
      'Yet to Join': 'yettojoin',
      'Hold and Wait': 'holdandwait',
      'Discontinued': 'discontinued',
      'Deleted': 'deleted'
    };
    
    const backendStatus = statusMap[status] || status;
    
    // Save the current state for potential rollback
    const previousState = {
      interns: JSON.parse(JSON.stringify(interns)),
      deletedInterns: [...deletedInterns]
    };
    
    try {
      // Make the API call first
      const response = await axios.patch(
        `http://localhost:8000/Sims/user-data/${internId}/`,
        { user_status: backendStatus },
        { headers: { Authorization: `Token ${token}` } }
      );
      
      // Only update the UI after successful API call
      setInterns(prevInterns => {
        const updatedInterns = { ...prevInterns };
        let movedIntern = null;
        
        // Find and remove the intern from all status arrays
        Object.keys(updatedInterns).forEach(key => {
          if (Array.isArray(updatedInterns[key])) {
            const index = updatedInterns[key].findIndex(intern => intern.id === internId);
            if (index !== -1) {
              movedIntern = { ...updatedInterns[key][index] };
              updatedInterns[key] = [
                ...updatedInterns[key].slice(0, index),
                ...updatedInterns[key].slice(index + 1)
              ];
            }
          }
        });
        
        // If we found the intern and status is not 'Deleted', add to new status
        if (movedIntern && status !== 'Deleted') {
          movedIntern = {
            ...movedIntern,
            status: status,
            user_status: backendStatus
          };
          
          updatedInterns[status] = [
            ...(updatedInterns[status] || []),
            movedIntern
          ];
        }
        
        return updatedInterns;
      });
      
      // If status is 'Deleted', update deletedInterns state
      if (status === 'Deleted') {
        const deletedIntern = Object.values(previousState.interns)
          .flat()
          .find(intern => intern.id === internId);
          
        if (deletedIntern) {
          setDeletedInterns(prev => [
            ...prev,
            {
              ...deletedIntern,
              status: 'Deleted',
              user_status: 'deleted'
            }
          ]);
        }
      }
      
      // Show success message
      setSnackbarMessage(`Intern status set to ${status}`);
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      
    } catch (apiError) {
      console.error("API Error:", apiError);
      // Revert to previous state on error
      setInterns(previousState.interns);
      setDeletedInterns(previousState.deletedInterns);
      
      setSnackbarMessage("Failed to update intern status. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
    
  } catch (error) {
    console.error("Error in handleSetStatus:", error);
    setSnackbarMessage("An unexpected error occurred. Please try again.");
    setSnackbarSeverity("error");
    setOpenSnackbar(true);
  }
  
  // Always refresh data from server to ensure consistency
  try {
    await fetchInterns();
  } catch (fetchError) {
    console.error("Failed to refresh intern data:", fetchError);
  }
};

const handleDiscontinueIntern = async (internId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.patch(
      `http://localhost:8000/Sims/user-data/${internId}/`,
      { user_status: "discontinued" },
      {
        headers: { Authorization: `Token ${token}` },
      }
    );

    console.log("Discontinue PATCH response:", response.data);

    await fetchInterns(); // refresh UI with updated status

    setSnackbarMessage("Intern discontinued successfully");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  } catch (error) {
    console.error("Failed to discontinue intern:", error);
    setSnackbarMessage("Failed to discontinue intern. Please try again.");
    setSnackbarSeverity("error");
    setOpenSnackbar(true);
  }
};
const handleUndoDelete = async (internId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.patch(
      `http://localhost:8000/Sims/user-data/${internId}/`,
      { user_status: "active" }, // Restore to active status
      { headers: { Authorization: `Token ${token}` } }
    );

    console.log("Undo delete response:", response.data);
    await fetchInterns(); // Refresh list after update

    setSnackbarMessage("Intern restored successfully");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  } catch (error) {
    console.error("Failed to restore intern:", error);
    setSnackbarMessage("Failed to restore intern. Please try again.");
    setSnackbarSeverity("error");
    setOpenSnackbar(true);
  }
};





  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  const handleMenuOpen = (event, internId) => {
    setAnchorEl(event.currentTarget);
    setSelectedInternId(internId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInternId(null);
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

  const filteredInterns = React.useMemo(() => {
    const baseFiltered = activeTab === 'Deleted'
      ? deletedInterns.filter(intern =>
          intern.id.toString().includes(searchTerm) ||
          intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          intern.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          intern.scheme?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          intern.domain?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : (interns[activeTab] || []).filter(intern =>
          (intern.id.toString().includes(searchTerm) ||
           intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           intern.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           intern.scheme?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           intern.domain?.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filters.department === '' || intern.department === filters.department) &&
          (filters.scheme === '' || intern.scheme === filters.scheme) &&
          (filters.domain === '' || intern.domain === filters.domain)
        );
  
    // Apply department filter if provided
    if (departmentFilter) {
      return baseFiltered.filter(intern => 
        intern.department && 
        intern.department.toLowerCase() === departmentFilter.toLowerCase()
      );
    }
  
    return baseFiltered;
  }, [activeTab, deletedInterns, searchTerm, interns, filters, departmentFilter]);

  const columns = [
    'Intern ID', 'Intern Name', 'Email ID', 'Department', 'Scheme', 'Domain', 'Start Date', 'End Date', 'Status', 'Action'
  ];

  const currentInternsArray = activeTab === 'All' 
  ? [...(interns['In Progress'] || []), 
     ...(interns['Completed'] || []), 
     ...(interns['Yet to Join'] || []), 
     ...(interns['Hold and Wait'] || []), 
     ...(interns['Discontinued'] || [])]
  : Array.isArray(interns[activeTab]) ? interns[activeTab] : [];
  const departments = [...new Set(currentInternsArray.map(intern => intern.department))];
  const schemes = [...new Set(currentInternsArray.map(intern => intern.scheme))];
  const domains = [...new Set(currentInternsArray.map(intern => intern.domain))];

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

  const handleAddIntern = () => {
    setShowAddForm(true);
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
    if (onFormCancel) {
      onFormCancel();
    }
  };

  const handleInternAdded = async () => {
    setShowAddForm(false);
    if (onFormComplete) {
      onFormComplete();
    }
    // Refresh the intern list immediately
    console.log('Refreshing intern list after registration...');
    await fetchInterns();
    // Force a re-render by updating state
    setSnackbarMessage("New intern added successfully!");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  };

  const handleSendCertificateClick = (intern) => {
    setSelectedIntern(intern);
    setCertificateModalOpen(true);
  };

  const handlePreviewCertificate = async (intern) => {
    try {
      await generateCompletedCertificate(intern.id, intern.firstName);
    } catch (error) {
      console.error("Error previewing certificate:", error);
      setSnackbarMessage("Failed to preview certificate");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleConfirmSendCertificate = async () => {
    if (!selectedIntern) return;
    
    try {
      setIsSending(true);
      const token = localStorage.getItem("token");
      
      // Generate and download the certificate
      await generateCompletedCertificate(selectedIntern.id, selectedIntern.firstName);
      
      // Update certificate sent status in the database
      await axios.patch(
        `http://localhost:8000/Sims/user-data/${selectedIntern.id}/`,
        { certicate_sent: true },
        { headers: { Authorization: `Token ${token}` } }
      );
      
      // Update local state and refresh the intern list to get the latest data
      setCertificateSentStatus(prev => ({
        ...prev,
        [selectedIntern.id]: true
      }));
      
      // Refresh the intern list to ensure we have the latest data from the backend
      await fetchInterns();
      
      setCertificateModalOpen(false);
      setSnackbarMessage(`Certificate sent successfully to ${selectedIntern.name}`);
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      
    } catch (error) {
      console.error("Error sending certificate:", error);
      setSnackbarMessage("Failed to send certificate. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showAddForm ? (
        <>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setShowAddForm(false)}
            sx={{ mb: 2 }}
          >
            Back to Intern List
          </Button>

          <MultiStepForm 
            onCancel={handleCloseAddForm} 
            onComplete={handleInternAdded}
          />
        </>
      ) : (
        <>
<Box sx={{ 
  p: 3, 
  bgcolor: theme.palette.mode === 'dark' 
    ? theme.palette.background.darkDefault 
    : theme.palette.background.default,
  minHeight: '100vh',
  color: theme.palette.mode === 'dark' 
    ? theme.palette.text.darkPrimary 
    : theme.palette.text.primary
}}>          {/* Edit Intern Dialog */}
          <Dialog open={showEditedForm} onClose={() => setShowEditedForm(false)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Intern Details</DialogTitle>
            <DialogContent>
              <EditedForm
                initialData={selectedEditData}
                onClose={() => setShowEditedForm(false)}
                onSave={() => { setShowEditedForm(false); fetchInterns(); }}
              />
            </DialogContent>
          </Dialog>
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
                Intern Management
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
              onClick={() => setShowAddForm(true)}

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
        {/* Edit Intern Dialog */}
        <Dialog open={showEditedForm} onClose={() => setShowEditedForm(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Intern Details</DialogTitle>
          <DialogContent>
            <EditedForm
              initialData={selectedEditData}
              onClose={() => setShowEditedForm(false)}
              onSave={() => { setShowEditedForm(false); fetchInterns(); }}
            />
          </DialogContent>
        </Dialog>

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
              label="All"
              value="All"
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
              label="In Progress"
              value="In Progress"
              icon={<AccessTimeIcon fontSize="small" />}
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
              label="Yet to Join"
              value="Yet to Join"
              icon={<PersonIcon fontSize="small" />}
              iconPosition="start"
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                minHeight: 48
              }}
            />
            <Tab
              label="Hold and Wait"
              value="Hold and Wait"
              icon={<PauseCircleIcon fontSize="small" />}
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
            <Tab
              label="Deleted"
              value="Deleted"
              icon={<DeleteIcon fontSize="small" />}
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
              boxShadow: theme.palette.mode === 'dark' 
              ? '0 1px 3px rgba(255,255,255,0.1)'
              : '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.12)'
              : 'divider',
            bgcolor: theme.palette.mode === 'dark' 
              ? theme.palette.background.darkPaper
              : theme.palette.background.paper,
              mt: 3,
              minHeight: '400px',
              position: 'relative',
              width: '100%',
              overflowX: 'auto',
              '& .MuiTable-root': {
                minWidth: 'max-content',
                width: '100%',
              },
              '& .MuiTableCell': {
                whiteSpace: 'nowrap',
                position: 'relative',
                '&:last-child': {
                  position: 'sticky',
                  right: 0,
                  backgroundColor: 'background.paper',
                  boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                  zIndex: 2,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '1px',
                    height: '100%',
                    backgroundColor: 'divider',
                  }
                }
              },
              '& .MuiTableHead .MuiTableCell': {
                backgroundColor: 'background.paper',
                position: 'sticky',
                top: 0,
                zIndex: 3,
                fontWeight: 600,
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                '&:last-child': {
                  zIndex: 4 // Higher z-index for sticky action column header
                }
              },
              '& .MuiTableBody .MuiTableRow:hover .MuiTableCell': {
                backgroundColor: 'action.hover',
                '&:last-child': {
                  backgroundColor: 'action.hover',
                }
              }
            }}
          >
            {isLoading ? (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(110deg, #333 8%, #444 18%, #333 33%)' 
                  : 'linear-gradient(110deg, #f5f7fa 8%, #f0f2f5 18%, #f5f7fa 33%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite linear',
                  zIndex: 1,
                  '& .MuiTableRow-root': {
                    backgroundColor: 'transparent',
                  }
                }}
              >
                <Table sx={{ minWidth: '1200px' }}>
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell key={column} sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          {column}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array(5).fill(0).map((_, index) => (
                      <TableRow key={`loading-${index}`}>
                        {columns.map((_, colIndex) => (
                          <TableCell key={colIndex} sx={{ py: 2 }}>
                            <Box 
                              sx={{ 
                                height: '24px', 
                                bgcolor: 'rgba(0, 0, 0, 0.04)',
                                borderRadius: 1
                              }} 
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column} sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {column}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!isLoading && filteredInterns.length > 0 ? (
                    paginatedInterns.map((intern) => (
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
                        <TableCell>{intern.id}</TableCell>
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
                        <TableCell>{intern.scheme}</TableCell>
                        <TableCell>{intern.domain}</TableCell>
                        <TableCell>{intern.startDate}</TableCell>
                        <TableCell>{intern.endDate}</TableCell>
                        <TableCell>
                        <Chip
  label={intern.status}
  sx={{
    fontWeight: 700,
    fontSize: '1em',
    px: 2,
    py: 0.5,
    borderRadius: 1,
    minWidth: 110,
    textAlign: 'center',
    bgcolor:
      intern.status === 'Completed' ? (theme.palette.mode === 'dark' ? '#004d40' : '#d0f5e8')
      : intern.status === 'Free' ? (theme.palette.mode === 'dark' ? '#0d47a1' : '#e3f2fd')
      : intern.status === 'Pending' ? (theme.palette.mode === 'dark' ? '#f57c00' : '#fff9db')
      : intern.status === 'Incomplete' ? (theme.palette.mode === 'dark' ? '#b71c1c' : '#ffe3e0')
      : intern.status === 'In Progress' ? (theme.palette.mode === 'dark' ? '#0d47a1' : '#e3f2fd')
      : intern.status === 'Yet to Join' ? (theme.palette.mode === 'dark' ? '#f57c00' : '#fff9db')
      : intern.status === 'Hold and Wait' ? (theme.palette.mode === 'dark' ? '#b71c1c' : '#ffe3e0')
      : intern.status === 'Discontinued' ? (theme.palette.mode === 'dark' ? '#b71c1c' : '#ffe3e0')
      : intern.status === 'Deleted' ? (theme.palette.mode === 'dark' ? '#212121' : '#f5f5f5')
      : theme.palette.mode === 'dark' ? '#212121' : '#f5f5f5',
    color:
      intern.status === 'Completed' ? (theme.palette.mode === 'dark' ? '#80cbc4' : '#009688')
      : intern.status === 'Free' ? (theme.palette.mode === 'dark' ? '#64b5f6' : '#1976d2')
      : intern.status === 'Pending' ? (theme.palette.mode === 'dark' ? '#ffd740' : '#ffa000')
      : intern.status === 'Incomplete' ? (theme.palette.mode === 'dark' ? '#ef9a9a' : '#d32f2f')
      : intern.status === 'In Progress' ? (theme.palette.mode === 'dark' ? '#64b5f6' : '#1976d2')
      : intern.status === 'Yet to Join' ? (theme.palette.mode === 'dark' ? '#ffd740' : '#ffa000')
      : intern.status === 'Hold and Wait' ? (theme.palette.mode === 'dark' ? '#ef9a9a' : '#d32f2f')
      : intern.status === 'Discontinued' ? (theme.palette.mode === 'dark' ? '#ef9a9a' : '#d32f2f')
      : intern.status === 'Deleted' ? (theme.palette.mode === 'dark' ? '#9e9e9e' : '#616161')
      : theme.palette.mode === 'dark' ? '#9e9e9e' : '#757575',
  }}
/>
                        </TableCell>
                        {/* {activeTab === 'Completed' && (
                          <TableCell sx={{ width: '120px', minWidth: '120px' }}>
                            <Tooltip 
                              title={certificateSentStatus[intern.id] || intern.certicate_sent 
                                ? 'Certificate already sent' 
                                : 'Send Certificate'}
                            >
                              <span>
                                <Button
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendCertificateClick(intern);
                                  }}
                                  disabled={certificateSentStatus[intern.id] || intern.certicate_sent}
                                  endIcon={
                                    certificateSentStatus[intern.id] || intern.certicate_sent ? (
                                      <CheckCircle fontSize="small" />
                                    ) : (
                                      <SendIcon fontSize="small" />
                                    )
                                  }
                                  sx={{
                                    textTransform: 'none',
                                    '&.Mui-disabled': {
                                      color: 'success.main',
                                      borderColor: 'success.light',
                                      bgcolor: 'success.light',
                                      opacity: 0.8
                                    },
                                    '&:hover': {
                                      bgcolor: 'primary.light',
                                      '&.Mui-disabled': {
                                        bgcolor: 'success.light',
                                        opacity: 0.8
                                      }
                                    }
                                  }}
                                >
                                  {(certificateSentStatus[intern.id] || intern.certicate_sent) ? 'Sent' : 'Send'}
                                </Button>
                              </span>
                            </Tooltip>
                          </TableCell>
                        )} */}
                        <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, intern.id);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={selectedInternId === intern.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={async () => {
                              const userData = await axios.get(`http://localhost:8000/Sims/user-data/${intern.id}`,
                                {
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Token ${localStorage.getItem('token')}`,
                                  },
                                }
                              );
                              const personalData = await axios.get(`http://localhost:8000/Sims/personal-data/${intern.id}`,
                                {
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Token ${localStorage.getItem('token')}`,
                                  },
                                }
                              );
                              const collegeData = await axios.get(`http://localhost:8000/Sims/college-details/${intern.id}`,
                                {
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Token ${localStorage.getItem('token')}`,
                                  },
                                }
                              );
                              const documentData = await axios.get(`http://localhost:8000/Sims/documents/emp/${intern.id}`,
                                {
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Token ${localStorage.getItem('token')}`,
                                  },
                                }
                              );
                              const documents = documentData.data.results || [];

                                // Create a function to find a document by title
                                const findDocument = (title) => {
                                  return documents.find(doc => doc.title.toLowerCase() === title.toLowerCase()) || {};
                                };

                                // Map the documents to their respective fields
                                const documentFields = {
                                  aadharCard: findDocument('Adhaar Card').file || '',
                                  bonafideCertificate: findDocument('Bonafide Certificate').file || '',
                                  collegeId: findDocument('College ID').file || '',
                                  resume: findDocument('Resume').file || ''
                                };
                              console.log("userData",userData.data); 
                              console.log("personalData",personalData.data); 
                              console.log("collegeData",collegeData.data); 
                              console.log("documentData",documentData.data); 
                              console.log("documentFields",documentFields);
                              console.log("intern",intern);
                              const formData = {
                                id: intern.id,
                                first_name: intern.firstName,
                                last_name: intern.lastName,
                                mobile: personalData.data.phone_no,
                                email: personalData.data.email,
                                dob : personalData.data.date_of_birth,
                                gender : personalData.data.gender,
                                department : intern.department,
                                aadharNumber : personalData.data.aadhar_number,
                                isFirstGraduate : personalData.data.first_graduation,
                                collegeName : collegeData.data.college_details.college_name,
                                collegeAddress : collegeData.data.college_details.college_address,
                                collegeDepartment : collegeData.data.college_details.college_department,
                                yearOfPassing : collegeData.data.college_details.year_of_passing,
                                teamName : userData.data.team_name,
                                assetCode : userData.data.asset_code,
                                startDate : userData.data.start_date,
                                endDate : userData.data.end_date,
                                duration : userData.data.duration,
                                workingDays : "mon-fri",
                                shiftTiming : userData.data.shift_timing,
                                status : intern.user_status,
                                scheme : intern.scheme,
                                ...documentFields,  // Spread the document fields
                                documents: documents,
                                ...userData.data,
                                ...personalData.data,
                                ...collegeData.data.college_details,
                              }
                              console.log("formData",formData);
                              setSelectedEditData(formData); 
                              setShowEditedForm(true); 
                              handleMenuClose(); 
                              }}>
                              <EditIcon fontSize="small" style={{ marginRight: 8 }} /> Edit
                            </MenuItem>
                            <MenuItem onClick={() => { handleDeleteIntern(intern.id); handleMenuClose(); }}>
                              <DeleteIcon fontSize="small" style={{ marginRight: 8 }} /> Delete
                            </MenuItem>
                            <MenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionSubMenuAnchorEl(e.currentTarget);
                              }}
                            >
                              <BuildIcon fontSize="small" style={{ marginRight: 8 }} /> Actions
                            </MenuItem>
                            {activeTab === 'In Progress' && (
                            <MenuItem 
                              onClick={(e) => {
                                handleMenuClose();
                                handleCertificatesMenuOpen(e, intern.id);
                              }}
                            >
                              <Description fontSize="small" sx={{ mr: 1 }} /> Certificates
                            </MenuItem>
                            )}
                            {activeTab === 'Completed' && (
                              <MenuItem 
                                onClick={(e) => {
                                  handleMenuClose();
                                  handleCertificatesMenuOpen(e, intern.id, 'completed');
                                }}
                              >
                                <Description fontSize="small" sx={{ mr: 1 }} /> Certificates
                              </MenuItem>
                            )}
                          </Menu>
                          <Menu
                            anchorEl={actionSubMenuAnchorEl}
                            open={Boolean(actionSubMenuAnchorEl) && selectedInternId === intern.id}
                            onClose={() => setActionSubMenuAnchorEl(null)}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                          >
                            <MenuItem onClick={() => { handleSetStatus(intern.id, 'In Progress'); setActionSubMenuAnchorEl(null); handleMenuClose(); }}>In Progress</MenuItem>
                            <MenuItem onClick={() => { handleSetStatus(intern.id, 'Completed'); setActionSubMenuAnchorEl(null); handleMenuClose(); }}>Completed</MenuItem>
                            <MenuItem onClick={() => { handleSetStatus(intern.id, 'Yet to Join'); setActionSubMenuAnchorEl(null); handleMenuClose(); }}>Yet to Join</MenuItem>
                            <MenuItem onClick={() => { handleSetStatus(intern.id, 'Hold and Wait'); setActionSubMenuAnchorEl(null); handleMenuClose(); }}>Hold and Wait</MenuItem>
                            <MenuItem onClick={() => { handleSetStatus(intern.id, 'Discontinued'); setActionSubMenuAnchorEl(null); handleMenuClose(); }}>Discontinued</MenuItem>
                          </Menu>
                          <Menu
                              anchorEl={certificatesAnchorEl}
                              open={Boolean(certificatesAnchorEl)}
                              onClose={handleCertificatesMenuClose}
                            >
                              {activeCertMenu === 'inProgress' ? (
                                // In Progress tab certificates
                                <>
                                  <MenuItem onClick={() => handleCertificateAction('Offer Letter')}>
                                    Send Offer Letter
                                  </MenuItem>
                                  <MenuItem onClick={() => handleCertificateAction('Partial Certificate', intern)}>
                                    Send Partial Certificate
                                  </MenuItem>
                                </>
                              ) : (
                                // Completed tab certificates
                                <>
                                  <MenuItem onClick={() => handleCertificateAction('Completion Certificate')}>
                                    Generate Completion Certificate
                                  </MenuItem>
                                  <MenuItem onClick={() => handleCertificateAction('Attendance Certificate')}>
                                    Generate Attendance Certificate
                                  </MenuItem>
                                  <MenuItem onClick={() => handleCertificateAction('Task Certificate')}>
                                    Generate Task Certificate
                                  </MenuItem>
                                </>
                              )}
                            </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : !isLoading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                        <Typography>No interns found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          {/* Certificate Send Confirmation Modal */}
          <Dialog
            open={certificateModalOpen}
            onClose={() => !isSending && setCertificateModalOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, textAlign: 'center' }}>
                <WarningIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Are you sure you want to send the certificate?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  This will email the certificate to {selectedIntern?.name}'s registered email address.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2, width: '100%', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => setCertificateModalOpen(false)}
                    disabled={isSending}
                    sx={{ minWidth: 120 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirmSendCertificate}
                    disabled={isSending}
                    startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ minWidth: 180 }}
                  >
                    {isSending ? 'Sending...' : 'Yes, Send Certificate'}
                  </Button>
                </Box>
              </Box>
            </DialogContent>
          </Dialog>

          {!isLoading && filteredInterns.length === 0 ? (
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
          ) : !isLoading && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              mt: 3,
              p: 2,
              backgroundColor: 'background.paper',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
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
                <Typography sx={{ ml: 2 }}>{`${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, filteredInterns.length)} of ${filteredInterns.length}`}</Typography>
                <Pagination
  count={count}
  page={page}
  onChange={handleChangePage}
  shape="rounded"
  renderItem={(item) => {
    // Only render the previous and next buttons
    if (item.type === 'previous' || item.type === 'next') {
      return <PaginationItem {...item} />;
    }
    // Return null for all other items (page numbers, etc.)
    return null;
  }}
  sx={{ 
    ml: 2,
    '& .MuiPagination-ul': {
      justifyContent: 'flex-end'
    }
  }}
/>
              </Box>
            </Box>
          )}
          <Dialog open={openPartialCertDialog} onClose={() => setOpenPartialCertDialog(false)}>
  <DialogTitle>Generate Partial Completion Certificate</DialogTitle>
  <DialogContent>
    <TextField
      margin="dense"
      label="Start Date"
      type="date"
      fullWidth
      variant="outlined"
      InputLabelProps={{ shrink: true }}
      value={partialCertData.start_date}
      onChange={(e) => setPartialCertData({...partialCertData, start_date: e.target.value})}
    />
    <TextField
      margin="dense"
      label="End Date"
      type="date"
      fullWidth
      variant="outlined"
      InputLabelProps={{ shrink: true }}
      value={partialCertData.end_date}
      onChange={(e) => setPartialCertData({...partialCertData, end_date: e.target.value})}
    />
    <TextField
      margin="dense"
      label="Remarks"
      fullWidth
      multiline
      rows={3}
      variant="outlined"
      value={partialCertData.remarks}
      onChange={(e) => setPartialCertData({...partialCertData, remarks: e.target.value})}
    />
    <FormControlLabel
      control={
        <Checkbox
          checked={partialCertData.is_approved}
          onChange={(e) => setPartialCertData({...partialCertData, is_approved: e.target.checked})}
        />
      }
      label="Approved"
    />
    {partialCertData.is_approved && (
      <FormControl fullWidth margin="dense" variant="outlined">
  <InputLabel id="approved-by-label">Approved By</InputLabel>
  <Select
    labelId="approved-by-label"
    value={partialCertData.approved_by || ''}
    onChange={(e) => setPartialCertData({...partialCertData, approved_by: e.target.value})}
    label="Approved By"
  >
    <MenuItem value="">
      <em>Select a user</em>
    </MenuItem>
    {users.map((user) => (
      <MenuItem key={user.emp_id} value={user.emp_id}>
        {user.emp_id} {user.user}
      </MenuItem>
    ))}
  </Select>
</FormControl>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenPartialCertDialog(false)}>Cancel</Button>
    <Button 
      onClick={async () => {
        try {
          const token = localStorage.getItem("token");
          const requestData = {
            emp_id: selectedIntern.id,
            start_date: partialCertData.start_date,
            end_date: partialCertData.end_date,
            remarks: partialCertData.remarks,
            is_approved: partialCertData.is_approved,
            approved_by: partialCertData.is_approved ? partialCertData.approved_by : null
          };
          
          console.log('Sending request with data:', requestData);  // Add this line
          
          const response = await axios.post(
            `http://localhost:8000/Sims/generate-partial-certificate/`,
            requestData,
            {
              headers: { 
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
              },
              responseType: "blob",
            }
          );
          
          // Handle the response (e.g., download the certificate)
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `partial_certificate_${selectedIntern.id}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          
          setOpenPartialCertDialog(false);
          // Reset form
          setPartialCertData({
            start_date: '',
            end_date: '',
            remarks: '',
            is_approved: false,
            approved_by: ''
          });
        } catch (error) {
          console.error('Error generating certificate:', error);
          // Handle error (show error message to user)
        }
      }}
      color="primary"
    >
      Generate
    </Button>
  </DialogActions>
</Dialog>
        </Box>
      </> 
      )}
    </ThemeProvider>
  );
};

// -----------------register&personaldata------------------

const RegisterPage = ({ onNext, initialData, isReturning, onCancel }) => {
  const [formData, setFormData] = useState(() => ({
  username: initialData?.username || "",
  password: initialData?.password || "",
  email: initialData?.email || "",
  first_name: initialData?.first_name || "",
  last_name: initialData?.last_name || "",
  mobile: initialData?.mobile || "",
  department: initialData?.department || "",
  role: initialData?.role || "intern",
  address1: initialData?.address1 || "",
  address2: initialData?.address2 || "",
  pincode: initialData?.pincode || "",
  dob: initialData?.dob || "",
  gender: initialData?.gender || "",
  aadharNumber: initialData?.aadharNumber || "",
  isFirstGraduate: initialData?.isFirstGraduate || false,
  profilePhoto: initialData?.profilePhoto || null
}));


  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(initialData?.profilePhotoUrl || null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const roles = [
    { value: "intern", label: "Intern" },
    
  ];

  const genders = [
    { value: "male", label: "Male", icon: <MaleIcon /> },
    { value: "female", label: "Female", icon: <FemaleIcon /> },
    { value: "other", label: "Other", icon: <OtherIcon /> }
  ];

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/Sims/departments/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : 
             (name === "mobile" || name === "pincode" || name === "aadharNumber") ? 
             value.replace(/\D/g, "") : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setSnackbarMessage("Please select an image file (JPEG, PNG)");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setSnackbarMessage("Image size should be less than 5MB");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({
          ...formData,
          profilePhoto: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    
    if (formData.role === "intern" && !formData.department) {
      newErrors.department = "Department is required for interns";
    }

    if (!formData.address1) newErrors.address1 = "Address 1 is required";
    if (!formData.pincode) newErrors.pincode = "Pincode is required";
    else if (formData.pincode.length !== 6) newErrors.pincode = "Pincode must be 6 digits";
    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required";
    } else {
      const today = new Date();
      const dob = new Date(formData.dob);
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();

      const isUnder18 = age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));
      
      if (isUnder18) {
        newErrors.dob = "You must be at least 18 years old to register";
      }
    }

    if (!formData.gender) newErrors.gender = "Gender is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setSnackbarMessage("User registration data saved! Continue to next step...");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      if (onNext) onNext(formData); // Go to next step with form data
    }
  };

  

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleDeletePhoto = () => {
    setFormData({ ...formData, profilePhoto: null });
    setPhotoPreview(null);
  };

  return (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4
              }}>
                <Avatar sx={{
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  mb: 2
                }}>
                  <RegisterIcon fontSize="large" />
                </Avatar>
                <Typography
                  variant="h4"
                  align="center"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'text.primary'
                  }}
                >
                  User Registration
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center">
                  Fill in the details to register a new user
                </Typography>
              </Box>
            
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      error={!!errors.username}
                      helperText={errors.username}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      error={!!errors.first_name}
                      helperText={errors.first_name}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      error={!!errors.last_name}
                      helperText={errors.last_name}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Mobile (Optional)"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      error={!!errors.mobile}
                      helperText={errors.mobile}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
  <FormControl fullWidth error={!!errors.department}>
    <InputLabel id="department-label">Department</InputLabel>
    <Select
      labelId="department-label"
      name="department"
      value={formData.department}
      onChange={handleChange}
      label="Department"
      disabled={formData.role !== "intern"}
    >
      {departments.map((dept) => (
        <MenuItem key={dept.id} value={dept.department}>
          {dept.department}
        </MenuItem>
      ))}
    </Select>
    {errors.department && (
      <Typography variant="caption" color="error">
        {errors.department}
      </Typography>
    )}
  </FormControl>
</Grid>

                
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Role</InputLabel>
                      <Select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        label="Role"
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.value} value={role.value}>
                            {role.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ my: 4 }}>
                  <Divider>
                    <Typography variant="h6" sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: 'text.primary',
                      fontWeight: 'bold'
                    }}>
                      <AddressIcon color="primary" /> Personal Details
                    </Typography>
                  </Divider>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address 1"
                      name="address1"
                      value={formData.address1}
                      onChange={handleChange}
                      error={!!errors.address1}
                      helperText={errors.address1}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AddressIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address 2 (Optional)"
                      name="address2"
                      value={formData.address2}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AddressIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      error={!!errors.pincode}
                      helperText={errors.pincode}
                      variant="outlined"
                      inputProps={{ maxLength: 6 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PincodeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      error={!!errors.dob}
                      helperText={errors.dob}
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DOBIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                
                  <Grid item xs={12}>
                    <FormControl component="fieldset" error={!!errors.gender}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <GenderIcon color="primary" />
                        <Typography variant="subtitle1">Gender</Typography>
                      </Box>
                      <RadioGroup
                        row
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        {genders.map((gender) => (
                          <FormControlLabel
                            key={gender.value}
                            value={gender.value}
                            control={<Radio color="primary" />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {gender.icon} {gender.label}
                              </Box>
                            }
                          />
                        ))}
                      </RadioGroup>
                      {errors.gender && (
                        <Typography variant="caption" color="error">
                          {errors.gender}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<UploadIcon />}
                        onClick={triggerFileInput}
                        sx={{
                          py: 1,
                          px: 2,
                          fontWeight: 'bold'
                        }}
                      >
                        Upload Your Photo
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        JPEG or PNG, Max 5MB
                      </Typography>

                      {photoPreview && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            alt="Profile Photo"
                            src={photoPreview}
                            sx={{ width: 50, height: 50, border: '2px solid #f5f5f5' }}
                          />
                          <IconButton color="error" onClick={handleDeletePhoto}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AadharIcon color="primary" /> Optional Details
                    </Typography>
                  
                    <TextField
                      fullWidth
                      label="Aadhar Number (Optional)"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleChange}
                      variant="outlined"
                      inputProps={{ maxLength: 12 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AadharIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />
                  
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isFirstGraduate}
                          onChange={handleChange}
                          name="isFirstGraduate"
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GraduateIcon color="action" /> First Graduate
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 3 }}>
                  <Grid item xs={6}>
                    <Button
  variant="outlined"
  color="primary"
  fullWidth
  onClick={onCancel}  // ✅ Use the prop here
>
  Cancel
</Button>


                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary" 
                      type="submit"
                      size="large"
                      endIcon={<NextIcon />}
                    >
                      Next
                    </Button>
                  </Grid>
                </Grid>
              </form>
            
              <Snackbar 
                open={openSnackbar} 
                autoHideDuration={6000} 
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <Alert 
                  onClose={() => setOpenSnackbar(false)} 
                  severity={snackbarSeverity} 
                  sx={{ width: "100%" }}
                >
                  {snackbarMessage}
                </Alert>
              </Snackbar>
            </Paper>
            );
            };
            // ------------------------end register&personaldata------------------
            //-------------------------College details----------------------------
            const CollegeInfoForm = ({ onBack, onNext, initialData }) => {
            const [formData, setFormData] = useState(initialData || {
            collegeName: "",
            collegeAddress: "",
            collegeEmail: "",
            degreeType: "",
            degree: "",
            department: "",
            yearOfPassing: "",
            cgpa: "",
            facultyNumber: ""
            });
            
            const [errors, setErrors] = useState({});
            const [openSnackbar, setOpenSnackbar] = useState(false);
            const [snackbarMessage, setSnackbarMessage] = useState("");
            const [snackbarSeverity, setSnackbarSeverity] = useState("success");
            
            const departments = [
            "Computer Science",
            "Electrical Engineering",
            "Mechanical Engineering",
            "Civil Engineering",
            "Electronics & Communication",
            "Information Technology",
            "Chemical Engineering",
            "Biotechnology",
            "Mathematics",
            "Physics",
            "Chemistry",
            "Business Administration",
            "Commerce",
            "Arts",
            "Law",
            "Medicine"
            ];
            
            const degrees = {
            UG: ["B.Tech", "B.E", "B.Sc", "B.Com", "B.A", "BBA", "LLB", "MBBS"],
            PG: ["M.Tech", "M.E", "M.Sc", "M.Com", "M.A", "MBA", "LLM", "MD"],
            OTHER: ["Diploma", "Ph.D", "Post Doctoral", "Certificate Course"]
            };
            
            const handleChange = (e) => {
            const { name, value } = e.target;
            
            setFormData(prev => ({
              ...prev,
              [name]: value
            }));
            
            if (errors[name]) {
              setErrors(prev => ({ ...prev, [name]: "" }));
            }
            };
            
            const validateForm = () => {
            const newErrors = {};
            if (!formData.collegeName) newErrors.collegeName = "College name is required";
            if (!formData.collegeAddress) newErrors.collegeAddress = "College address is required";
            if (!formData.degree) newErrors.degree = "Degree is required";
            if (!formData.department) newErrors.department = "Department is required";
            if (!formData.yearOfPassing) newErrors.yearOfPassing = "Year of passing is required";
            else if (formData.yearOfPassing.length !== 4 || isNaN(formData.yearOfPassing)) {
            newErrors.yearOfPassing = "Enter a valid year";
            }
            if (!formData.cgpa) newErrors.cgpa = "CGPA is required";
            else if (isNaN(formData.cgpa) || parseFloat(formData.cgpa) > 10 || parseFloat(formData.cgpa) < 0) {
            newErrors.cgpa = "Enter a valid CGPA (0-10)";
            }
            
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
            };
            

            const handleSubmit = (e) => {
              e.preventDefault();
              if (validateForm()) {
                setSnackbarMessage("College information saved! Continue to next step...");
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
                
                if (onNext) {
                  onNext(formData);
                }
              }
            };


            
            return (
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
            <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
            }}>
            <Avatar sx={{
            bgcolor: 'primary.main',
            width: 56,
            height: 56,
            mb: 2
            }}>
            <CollegeIcon fontSize="large" />
            </Avatar>
            <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
            fontWeight: 'bold',
            color: 'text.primary'
            }}
            >
            College Information
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
            Provide your academic details
            </Typography>
            </Box>
            
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="College Name"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      error={!!errors.collegeName}
                      helperText={errors.collegeName}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CollegeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="College Address"
                      name="collegeAddress"
                      value={formData.collegeAddress}
                      onChange={handleChange}
                      error={!!errors.collegeAddress}
                      helperText={errors.collegeAddress}
                      variant="outlined"
                      multiline
                      rows={3}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AddressIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="College Email (Optional)"
                      name="collegeEmail"
                      type="email"
                      value={formData.collegeEmail}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider>
                      <Typography variant="h6" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: 'text.primary',
                        fontWeight: 'bold'
                      }}>
                        <DegreeIcon color="primary" /> Academic Details
                      </Typography>
                    </Divider>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <DegreeIcon color="primary" />
                        <Typography variant="subtitle1">Degree Type</Typography>
                      </Box>
                      <RadioGroup
                        row
                        name="degreeType"
                        value={formData.degreeType}
                        onChange={handleChange}
                      >
                        <FormControlLabel
                          value="UG"
                          control={<Radio color="primary" />}
                          label="Undergraduate (UG)"
                        />
                        <FormControlLabel
                          value="PG"
                          control={<Radio color="primary" />}
                          label="Postgraduate (PG)"
                        />
                        <FormControlLabel
                          value="OTHER"
                          control={<Radio color="primary" />}
                          label="Other"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.degree}>
                      <InputLabel>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DegreeIcon fontSize="small" color="action" /> Degree
                        </Box>
                      </InputLabel>
                      <Select
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        label="Degree"
                      >
                        {degrees[formData.degreeType]?.map((degree) => (
                          <MenuItem key={degree} value={degree}>
                            {degree}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.degree && (
                        <Typography variant="caption" color="error">
                          {errors.degree}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors.department}>
                      <InputLabel>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DeptIcon fontSize="small" color="action" /> Department
                        </Box>
                      </InputLabel>
                      <Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        label="Department"
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.department && (
                        <Typography variant="caption" color="error">
                          {errors.department}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Year of Passing"
                      name="yearOfPassing"
                      type="number"
                      value={formData.yearOfPassing}
                      onChange={handleChange}
                      error={!!errors.yearOfPassing}
                      helperText={errors.yearOfPassing}
                      variant="outlined"
                      inputProps={{ min: "1900", max: "2099" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <YearIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="CGPA (out of 10)"
                      name="cgpa"
                      type="number"
                      value={formData.cgpa}
                      onChange={handleChange}
                      error={!!errors.cgpa}
                      helperText={errors.cgpa}
                      variant="outlined"
                      inputProps={{ step: "0.01", min: "0", max: "10" }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CgpaIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Faculty Number (Optional)"
                      name="facultyNumber"
                      value={formData.facultyNumber}
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FacultyIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
            
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="secondary"
                      size="large"
                      startIcon={<BackIcon />}
                      onClick={onBack}
                    >
                      Previous
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary" 
                      type="submit"
                      size="large"
                      endIcon={<NextIcon />}
                    >
                      Next
                    </Button>
                  </Grid>
                </Grid>
              </form>
            
              <Snackbar 
                open={openSnackbar} 
                autoHideDuration={6000} 
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <Alert 
                  onClose={() => setOpenSnackbar(false)} 
                  severity={snackbarSeverity} 
                  sx={{ width: "100%" }}
                >
                  {snackbarMessage}
                </Alert>
              </Snackbar>
            </Paper>
            );
            };
          //  -------------------------End college details----------------------------- 
          // -----------------------------companydetails---------------------
            const CompanyDetailsForm = ({ onBack, onNext, initialData }) => {
            const [formData, setFormData] = useState(initialData || {
                domain: "",
                scheme: "",
                teamName: "",
                assetCode: "",
                startDate: null,
                endDate: null,
                duration: "",
                workingDays: "",
                shiftTiming: "",
                status: "",
                reportingManager: "",
                reportingSupervisor: ""
              });
            
            const [errors, setErrors] = useState({});
            const [openSnackbar, setOpenSnackbar] = useState(false);
            const [snackbarMessage, setSnackbarMessage] = useState("");
            const [snackbarSeverity, setSnackbarSeverity] = useState("success");
            const [department, setDepartment] = useState([]);
            const [domain, setDomain] = useState([]);
            

            useEffect(() => {
              const fetchDomains = async () => {
                try {
                  const token = localStorage.getItem("token");
                  const dept = localStorage.getItem("internDepartment") || "Developer";
                  
                  console.log('Fetching domains for department:', dept);
                  
                  // Try department-specific API first
                  try {
                    const res = await axios.get(
                      `http://localhost:8000/Sims/domains-by-department/?department=${encodeURIComponent(dept)}`,
                      { headers: { Authorization: `Token ${token}` } }
                    );
                    
                    const domainsData = res.data.results || res.data;
                    if (Array.isArray(domainsData) && domainsData.length > 0) {
                      setDomain(domainsData);
                      return;
                    }
                  } catch (error) {
                    console.log('Department-specific API failed, falling back to all domains');
                  }
                  
                  // Fallback to all domains
                  const res = await axios.get("http://localhost:8000/Sims/domains/", {
                    headers: { Authorization: `Token ${token}` },
                  });
                  
                  const domainsData = res.data.results || res.data;
                  if (Array.isArray(domainsData)) {
                    setDomain(domainsData);
                  } else {
                    setDomain([]);
                  }
                } catch (error) {
                  console.error("Error fetching domains:", error);
                  setDomain([]);
                }
              };
            
              fetchDomains();
            }, []);
            
            
            
            
            
            const handleFilterChange = (e) => {
              const { name, value } = e.target;
              setFormData((prev) => ({
                ...prev,
                [name]: value
              }));
              
            };
          
          
            
            
            
            const workingDaysOptions = [
            { value: "Monday to Friday", label: "Monday to Friday" },
            { value: "Monday to Saturday", label: "Monday to Saturday" },
            { value: "Sunday to Thursday", label: "Sunday to Thursday" },
            { value: "Rotational Shifts", label: "Rotational Shifts" }
            ];
            
            const shiftTimings = [
            { value: "9am-1pm", label: "9:00 AM - 1:00 PM" },
            { value: "1pm-5pm", label: "1:00 PM - 5:00 PM" },
            { value: "9am-5pm", label: "9:00 AM - 5:00 PM" },
            { value: "10am-6pm", label: "10:00 AM - 6:00 PM" },
            { value: "2pm-10pm", label: "2:00 PM - 10:00 PM" },
            { value: "10pm-6am", label: "10:00 PM - 6:00 AM" }
            ];
            
            const reportingStaff = [
            "John Smith",
            "Sarah Johnson",
            "Michael Brown",
            "Emily Davis",
            "David Wilson",
            "Jessica Lee",
            "Robert Taylor",
            "Jennifer Martinez"
            ];
            
            useEffect(() => {
            if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            
              if (start > end) {
                setErrors(prev => ({ ...prev, endDate: "End date cannot be before start date" }));
                setFormData(prev => ({...prev, duration: "" }));
                return;
              }
              
              const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + 
                                  (end.getMonth() - start.getMonth());
              
              setFormData(prev => ({
                ...prev,
                duration: `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''}`
              }));
            }
            }, [formData.startDate, formData.endDate]);
            
            const handleChange = (e) => {
            const { name, value } = e.target;
            
            setFormData(prev => ({
              ...prev,
              [name]: value
            }));
            
            if (errors[name]) {
              setErrors(prev => ({ ...prev, [name]: "" }));
            }
            };


      
           
            
            
            const handleDateChange = (name, date) => {
            setFormData(prev => ({
            ...prev,
            [name]: date
            }));
            
            if (name === "endDate" && formData.startDate && date < formData.startDate) {
              setErrors(prev => ({ ...prev, endDate: "End date cannot be before start date" }));
            } else if (errors.endDate) {
              setErrors(prev => ({ ...prev, endDate: "" }));
            }
            };

             // For staff list for reporting manager and supervisor
            const [staffList, setStaffList] = useState([]);

            useEffect(() => {
              const department = localStorage.getItem("internDepartment");
              const token = localStorage.getItem("token");
            
              console.log("Department from localStorage:", department);
            
              if (department && token) {
                axios.get(`http://localhost:8000/Sims/staffs-by-department/?department=${encodeURIComponent(department)}`, {
                  headers: {
                    Authorization: `Token ${token}`
                  }
                })
                .then((response) => setStaffList(response.data))
                .catch((error) => console.error("Failed to fetch staff list:", error));
              }
            }, []);
            
            console.log("staffssssss response", staffList);
            
            const validateForm = () => {
            const newErrors = {};
            // Make domain and teamName optional
            if (!formData.startDate) newErrors.startDate = "Start date is required";
            if (!formData.endDate) newErrors.endDate = "End date is required";
            if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
            newErrors.endDate = "End date cannot be before start date";
            }
            
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
            };
            
            // Company Details Submission
            const handleSubmit = (e) => {
              e.preventDefault();
              if (validateForm()) {
                setSnackbarMessage("Company details saved! Continue to next step...");
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
                
                if (onNext) {
                  onNext(formData);
                }
              }
            };



            
            
            

            
            return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
            <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
            }}>
            <Avatar sx={{
            bgcolor: 'primary.main',
            width: 56,
            height: 56,
            mb: 2
            }}>
            <CompanyIcon fontSize="large" />
            </Avatar>
            <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
            fontWeight: 'bold',
            color: 'text.primary'
            }}
            >
            Company Details
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
            Provide your company and employment details
            </Typography>
            </Box>
            
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <Typography variant="body2" sx={{ mb: 1 }}>Domain</Typography>
                      <Select
                        name="domain"
                        value={formData.domain}
                        onChange={handleChange}
                        displayEmpty
                      >
                        <MenuItem value="">Select Domain</MenuItem>
                        {(() => {
                          console.log('Rendering domain dropdown, domain state:', domain);
                          return Array.isArray(domain) && domain.map((item) => {
                            console.log('Domain item:', item);
                            return (
                              <MenuItem key={item.id} value={item.domain}>
                                {item.domain}
                              </MenuItem>
                            );
                          });
                        })()}
                      </Select>
                    </FormControl>




                    </Grid>
                    
              
                    
                    <Grid item xs={12}>
                      <Divider>
                        <Typography variant="h6" sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          color: 'text.primary',
                          fontWeight: 'bold'
                        }}>
                          <SchemeIcon color="primary" /> Scheme
                        </Typography>
                      </Divider>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <SchemeIcon color="primary" />
                          <Typography variant="subtitle1">Scheme</Typography>
                        </Box>
                        <RadioGroup
                          row
                          name="scheme"
                          value={formData.scheme}
                          onChange={handleChange}
                        >
                          <FormControlLabel
                            value="FREE"
                            control={<Radio color="primary" />}
                            label="Free"
                          />
                          <FormControlLabel
                            value="COURSE"
                            control={<Radio color="primary" />}
                            label="Course"
                          />
                          <FormControlLabel
                            value="PROJECT"
                            control={<Radio color="primary" />}
                            label="Project"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Team Name"
                        name="teamName"
                        value={formData.teamName}
                        onChange={handleChange}
                        error={!!errors.teamName}
                        helperText={errors.teamName}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TeamIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Asset Code (Optional)"
                        name="assetCode"
                        value={formData.assetCode}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AssetIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider>
                        <Typography variant="h6" sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          color: 'text.primary',
                          fontWeight: 'bold'
                        }}>
                          <DurationIcon color="primary" /> Duration Details
                        </Typography>
                      </Divider>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <DatePicker
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(date) => handleDateChange("startDate", date)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.startDate}
                            helperText={errors.startDate}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <StartDateIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <DatePicker
                        label="End Date"
                        value={formData.endDate}
                        onChange={(date) => handleDateChange("endDate", date)}
                        minDate={formData.startDate}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.endDate}
                            helperText={errors.endDate}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EndDateIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Duration"
                        value={formData.duration}
                        variant="outlined"
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <DurationIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DaysIcon fontSize="small" color="action" /> Working Days
                          </Box>
                        </InputLabel>
                        <Select
                          name="workingDays"
                          value={formData.workingDays}
                          onChange={handleChange}
                          label="Working Days"
                        >
                          {workingDaysOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShiftIcon fontSize="small" color="action" /> Shift Timing
                          </Box>
                        </InputLabel>
                        <Select
                          name="shiftTiming"
                          value={formData.shiftTiming}
                          onChange={handleChange}
                          label="Shift Timing"
                        >
                          {shiftTimings.map((shift) => (
                            <MenuItem key={shift.value} value={shift.value}>
                              {shift.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider>
                        <Typography variant="h6" sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          color: 'text.primary',
                          fontWeight: 'bold'
                        }}>
                          <StatusIcon color="primary" /> Status & Reporting
                        </Typography>
                      </Divider>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <StatusIcon color="primary" />
                          <Typography variant="subtitle1">Status</Typography>
                        </Box>
                        <RadioGroup
                          row
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          <FormControlLabel
                            value="active"
                            control={<Radio color="primary" />}
                            label="Active"
                          />
                          <FormControlLabel
                            value="inactive"
                            control={<Radio color="primary" />}
                            label="Inactive"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
  <FormControl fullWidth>
    <InputLabel id="reporting-manager-label">Reporting Manager (Optional)</InputLabel>
    <Select
      labelId="reporting-manager-label"
      name="reportingManager"
      value={formData.reportingManager}
      onChange={handleChange}
      label="Reporting Manager (Optional)"
    >
      <MenuItem value=""><em>None</em></MenuItem>
      {staffList.map((staff) => (
        <MenuItem key={staff.id} value={staff.username}>
          {staff.username}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

<Grid item xs={12} md={6}>
  <FormControl fullWidth>
    <InputLabel id="reporting-supervisor-label">Reporting Supervisor (Optional)</InputLabel>
    <Select
      labelId="reporting-supervisor-label"
      name="reportingSupervisor"
      value={formData.reportingSupervisor}
      onChange={handleChange}
      label="Reporting Supervisor (Optional)"
    >
      <MenuItem value=""><em>None</em></MenuItem>
      {staffList.map((staff) => (
        <MenuItem key={staff.id} value={staff.username}>
          {staff.username}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

                  </Grid>
            
                  <Grid container spacing={2} sx={{ mt: 3 }}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="secondary"
                        size="large"
                        startIcon={<BackIcon />}
                        onClick={onBack}
                      >
                        Previous
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary" 
                        type="submit"
                        size="large"
                        endIcon={<NextIcon />}
                      >
                        Next
                      </Button>
                    </Grid>
                  </Grid>
                </form>
            
                <Snackbar 
                  open={openSnackbar} 
                  autoHideDuration={6000} 
                  onClose={() => setOpenSnackbar(false)}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                  <Alert 
                    onClose={() => setOpenSnackbar(false)} 
                    severity={snackbarSeverity} 
                    sx={{ width: "100%" }}
                  >
                    {snackbarMessage}
                  </Alert>
                </Snackbar>
              </Paper>
            </LocalizationProvider>
            
            );
            };
            // -------------------end company details---------------------
            // -------------------Documents Upload---------------------
  

const DocumentsUpload = ({ onBack, onNext, initialData, registerData, collegeData, companyData }) => {

  const [files, setFiles] = useState(initialData || {
    adhaarCard: null,
    bonafideCertificate: null,
    collegeId: null,
    resume: null
  });
  
  const [loading, setLoading] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarKey, setSnackbarKey] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const emp_id = localStorage.getItem("emp_id"); // ✅ Add this line FIRST

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    receiver: ""
  });
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [progress, setProgress] = useState({
    adhaarCard: 0,
    bonafideCertificate: 0,
    collegeId: 0,
    resume: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [documentResponse, setDocumentResponse] = useState(null);
  
  const documentNames = {
    adhaarCard: "Adhaar Card",
    bonafideCertificate: "Bonafide Certificate",
    collegeId: "College ID",
    resume: "Resume"
  };
  
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileUpload = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > MAX_FILE_SIZE) {
      showSnackbar(`File size exceeds the limit of 5MB for ${documentNames[key]}`, 'error', key);
      return;
    }
    
    if (file.type !== 'application/pdf') {
      showSnackbar(`Please upload a valid PDF file for ${documentNames[key]}`, 'error', key);
      return;
    }
    
    setFiles({ ...files, [key]: file });
    simulateUploadProgress(key);
  };
  
  const simulateUploadProgress = (key) => {
    setProgress(prev => ({ ...prev, [key]: 0 }));
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = { ...prev };
        if (newProgress[key] === 100) {
          clearInterval(interval);
          showSnackbar(`${documentNames[key]} uploaded successfully!`, 'success', key);
          return newProgress;
        }
        newProgress[key] = Math.min(newProgress[key] + 10, 100);
        return newProgress;
      });
    }, 200);
  };
  
  const showSnackbar = (message, severity, key) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarKey(key);
    setSnackbarOpen(true);
  };
  
  const handleDeleteFile = (key) => {
    setFiles({ ...files, [key]: null });
    setProgress(prev => ({ ...prev, [key]: 0 }));
    
    // Reset the file input to allow re-uploading the same file
    const fileInput = document.getElementById(`upload-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
    if (fileInput) {
      fileInput.value = '';
    }
    
    showSnackbar(`${documentNames[key]} removed`, 'info', key);
  };
 
  const handleSaveSubmit = async (e) => {
  e.preventDefault();

  if (!files.adhaarCard || !files.bonafideCertificate || !files.collegeId || !files.resume) {
    showSnackbar('Please upload all required documents', 'error');
    return;
  }

  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    
    console.log('Starting full registration process...');
    console.log('Register data:', registerData);
    console.log('College data:', collegeData);
    console.log('Company data:', companyData);

    // STEP 1: Check if user already exists
    try {
      const existingUser = await axios.get(`http://localhost:8000/Sims/register/?username=${registerData.username}`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      console.log('Existing user check response:', existingUser.data);
      
      // Check if any user matches the username
      const userExists = Array.isArray(existingUser.data) 
        ? existingUser.data.some(user => user.username === registerData.username)
        : existingUser.data.username === registerData.username;
      
      if (userExists) {
        showSnackbar(`User '${registerData.username}' already exists. Please choose a different username.`, "error");
        return;
      }
    } catch (error) {
      console.log('User check error (user likely does not exist):', error.response?.status);
      // User doesn't exist, continue with registration
    }

    // STEP 2: Create user registration
    const registerPayload = {
      username: registerData.username,
      password: registerData.password,
      email: registerData.email,
      first_name: registerData.first_name,
      last_name: registerData.last_name,
      mobile: registerData.mobile || "",
      address1: registerData.address1,
      address2: registerData.address2 || "",
      pincode: registerData.pincode,
      dob: registerData.dob,
      gender: registerData.gender,
      aadharNumber: registerData.aadharNumber || "",
      isFirstGraduate: registerData.isFirstGraduate || false,
      department: registerData.department,
      role: registerData.role
    };

    const registerRes = await axios.post("http://localhost:8000/Sims/register/", registerPayload, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json"
      }
    });

    console.log('Registration response:', registerRes.data);
    const userId = registerRes.data.id;

    // STEP 3: Create temp entry (skip if already exists)
    const tempPayload = {
      user: registerData.username,
      role: registerData.role || "intern",
      department: registerData.department
    };
    console.log('Creating temp entry with payload:', tempPayload);
    
    let emp_id; // Declare emp_id outside try-catch block
    
    try {
      const tempCreateRes = await axios.post("http://localhost:8000/Sims/temps/", tempPayload, {
        headers: { 
          Authorization: `Token ${token}`,
          "Content-Type": "application/json"
        }
      });
      // If successful, get emp_id from the creation response
      emp_id = tempCreateRes.data.emp_id;
      console.log('Temp created successfully with emp_id:', emp_id);
      // Store emp_id in localStorage for later use
      localStorage.setItem('emp_id', emp_id);
    } catch (tempError) {
      console.error('Temp creation failed:', tempError.response?.data);
      // If user already has employee record, get the existing emp_id
      if (tempError.response?.data?.error?.includes('already has an employee record')) {
        console.log('User already has temp record, fetching emp_id...');
        try {
          const tempRes = await axios.get(`http://localhost:8000/Sims/temps/`, {
            headers: { Authorization: `Token ${token}` }
          });
          // Look for user by username or user field
          const userTemp = tempRes.data.find(temp => 
            temp.username === registerData.username || 
            temp.user === registerData.username ||
            (temp.user && typeof temp.user === 'object' && temp.user.username === registerData.username)
          );
          
          if (userTemp) {
            emp_id = userTemp.emp_id;
            console.log('Found existing emp_id:', emp_id);
            // Store emp_id in localStorage for later use
            localStorage.setItem('emp_id', emp_id);
          }
          
          if (!emp_id) {
            console.error('Available temp records:', tempRes.data);
            throw new Error('Could not find employee ID for existing user');
          }
        } catch (fetchError) {
          console.error('Fetch error details:', fetchError);
          throw new Error('Failed to fetch existing employee record');
        }
      } else {
        throw new Error(tempError.response?.data?.error || 'Failed to create employee record');
      }
    }

    // STEP 4: Create user data entry with emp_id
    const userDataPayload = {
      emp_id: emp_id,
      username: registerData.username,
      department: registerData.department,
      domain: companyData.domain || "",
      scheme: companyData.scheme || "",
      team_name: companyData.teamName || "",
      start_date: companyData.startDate ? new Date(companyData.startDate).toISOString().split('T')[0] : null,
      end_date: companyData.endDate ? new Date(companyData.endDate).toISOString().split('T')[0] : null,
      duration: companyData.duration || "",
      shift_timing: companyData.shiftTiming || "",
      reporting_manager_username: companyData.reportingManager || "",
      reporting_supervisor_username: companyData.reportingSupervisor || "",
      user_status: "active"
    };

    const userDataRes = await axios.post("http://localhost:8000/Sims/user-data/", userDataPayload, {
      headers: { Authorization: `Token ${token}` }
    });

    console.log('User data response:', userDataRes.data);
    if (!emp_id) {
      emp_id = userDataRes.data.emp_id;
    }

    // STEP 5: Create personal data entry
    const personalDataPayload = {
      emp_id: emp_id,
      user: userId,
      phone_no: parseInt(registerData.mobile) || 0,
      aadhar_number: parseInt(registerData.aadharNumber) || null,
      gender: registerData.gender === 'male' ? 'M' : registerData.gender === 'female' ? 'F' : 'M',
      address1: registerData.address1 || '',
      address2: registerData.address2 || '',
      pincode: registerData.pincode || '',
      date_of_birth: registerData.dob || null,
      first_Graduation: registerData.isFirstGraduate || false
    };

    await axios.post("http://localhost:8000/Sims/personal-data/", personalDataPayload, {
      headers: { Authorization: `Token ${token}` }
    });

    // STEP 5.5: Upload required documents
    const documentKeys = ['adhaarCard', 'bonafideCertificate', 'collegeId', 'resume'];
    for (const key of documentKeys) {
      const file = files[key];
      if (file) {
        console.log('Uploading', documentNames[key], 'with emp_id:', emp_id); // DEBUG LOG
        const docFormData = new FormData();
        docFormData.append('files', file); // FIX: use 'files' as key
        docFormData.append('title', documentNames[key]);
        docFormData.append('uploader', emp_id); // Backend expects emp_id as uploader
        docFormData.append('receiver', emp_id); // Add receiver for backend requirement
        docFormData.append('description', `${documentNames[key]} for intern ${emp_id}`);
        try {
          await axios.post('http://localhost:8000/Sims/documents/', docFormData, {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
          showSnackbar(`${documentNames[key]} uploaded successfully!`, 'success', key);
        } catch (uploadError) {
          console.error(`${documentNames[key]} upload failed:`, uploadError, uploadError.response?.data);
          showSnackbar(`${documentNames[key]} upload failed. Please try again.`, 'error', key);
          setLoading(false);
          return;
        }
      }
    }

    // STEP 6: Create college details entry
    const collegePayload = {
      emp_id: emp_id,
      college_name: collegeData.collegeName || '',
      college_address: collegeData.collegeAddress || '',
      college_email_id: collegeData.collegeEmail || '',
      degree_type: collegeData.degreeType || 'UG',
      degree: collegeData.degree || '',
      college_department: collegeData.department || '',
      year_of_passing: parseInt(collegeData.yearOfPassing) || null,
      cgpa: parseFloat(collegeData.cgpa) || null,
      college_faculty_phonenumber: parseInt(collegeData.facultyNumber) || null
    };

    await axios.post("http://localhost:8000/Sims/college-details/", collegePayload, {
      headers: { Authorization: `Token ${token}` }
    });

    // STEP 6: Upload documents
    const documentsForm = new FormData();
    documentsForm.append("receiver", emp_id);
    documentsForm.append("title", "Intern Documents");
    documentsForm.append("description", "Internship document upload");
    documentsForm.append("generate_offer_letter", "false");

    documentsForm.append("files", files.adhaarCard);
    documentsForm.append("files", files.bonafideCertificate);
    documentsForm.append("files", files.collegeId);
    documentsForm.append("files", files.resume);

    const docRes = await axios.post("http://localhost:8000/Sims/documents/", documentsForm, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });

    showSnackbar("All data submitted successfully!", "success");
    setDocumentResponse(docRes.data);
    setConfirmationDialog(true);

  } catch (error) {
    console.error("Final submit error:", error);
    console.error("Error details:", error.response?.data);
    showSnackbar(error.response?.data?.error || error.response?.data?.detail || "Submission failed", "error");
  } finally {
    setLoading(false);
  }
};

  const handleGenerateOfferLetter = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Prepare the payload with proper field names from companyData and collegeData
      const payload = {
        college_name: collegeData?.collegeName || '',
        start_date: companyData?.startDate || new Date().toISOString().split('T')[0],
        end_date: companyData?.endDate || '',
        position_title: companyData?.positionTitle || 'FullStack Intern',
        domain: companyData?.domain || '',
        work_location: "VDart, Global Capability Center, Mannarpuram",
        reporting_to: companyData?.reportingManager || "Derrick Alex",
        emp_id: emp_id,  // Changed from intern_emp_id to emp_id to match backend
        shift_time: companyData?.shiftTiming || '9:00 AM to 6:00 PM',
        shift_days: 'Monday to Friday'
      };
      
      console.log('Sending payload to generate offer letter:', payload);

      console.log('Sending offer letter with payload:', payload);

      const response = await axios.post(
        "http://localhost:8000/Sims/generate-offer-letter/",
        payload,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Offer letter response:', response.data);
      showSnackbar('Offer letter generated successfully!', 'success');
      return true;
    } catch (error) {
      console.error("Offer letter error:", error);
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.detail || 
                         error.message || 
                         "Failed to generate offer letter";
      console.error('Error details:', error.response?.data);
      showSnackbar(errorMessage, 'error');
      return false;
    }
  };

  const handleSendOfferLetter = async () => {
    try {
      setSendingOffer(true);
      const success = await handleGenerateOfferLetter();
      if (success && onNext) {
        onNext(documentResponse);
      }
    } finally {
      setSendingOffer(false);
      setConfirmationDialog(false);
    }
  };

  const handleSkipSending = () => {
    setConfirmationDialog(false);
    if (onNext) onNext(documentResponse);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  
  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        mb: 2,
        gap: 2,
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'auto',
        maxWidth: '100vw',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <Description fontSize="large" />
          </Avatar>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0, whiteSpace: 'nowrap', minWidth: 0 }}
          >
            Intern Management
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', minWidth: 0, width: { xs: '100%', md: 'auto' }, maxWidth: { xs: '100%', md: 500 } }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by name, ID, department..."
            sx={{ minWidth: 180, maxWidth: 300, flexGrow: 1, width: '100%' }}
          />
          <IconButton color="primary" sx={{ ml: 1 }}>
            <FilterListIcon />
          </IconButton>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 1 }}>
        Please upload the required documents below
      </Typography>
    
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PictureAsPdf color="primary" /> Upload Adhaar Card
            </Typography>
            <Box display="flex" alignItems="center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e, 'adhaarCard')}
                style={{ display: 'none' }}
                id="upload-adhaar-card"
              />
              <label htmlFor="upload-adhaar-card">
                <Tooltip title="Upload Adhaar Card">
                  <IconButton
                    color="primary"
                    component="span"
                  >
                    <CloudUpload />
                  </IconButton>
                </Tooltip>
              </label>
              {files.adhaarCard && (
                <LinearProgress 
                  variant="determinate" 
                  value={progress.adhaarCard} 
                  sx={{ width: '100%', ml: 2 }} 
                />
              )}
            </Box>
            <Divider sx={{ my: 3 }} />
    
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description color="primary" /> Upload Bonafide Certificate
            </Typography>
            <Box display="flex" alignItems="center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e, 'bonafideCertificate')}
                style={{ display: 'none' }}
                id="upload-bonafide-certificate"
              />
              <label htmlFor="upload-bonafide-certificate">
                <Tooltip title="Upload Bonafide Certificate">
                  <IconButton
                    color="primary"
                    component="span"
                  >
                    <CloudUpload />
                  </IconButton>
                </Tooltip>
              </label>
              {files.bonafideCertificate && (
                <LinearProgress 
                  variant="determinate" 
                  value={progress.bonafideCertificate} 
                  sx={{ width: '100%', ml: 2 }} 
                />
              )}
            </Box>
            <Divider sx={{ my: 3 }} />
    
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PermIdentity color="primary" /> Upload College ID
            </Typography>
            <Box display="flex" alignItems="center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e, 'collegeId')}
                style={{ display: 'none' }}
                id="upload-college-id"
              />
              <label htmlFor="upload-college-id">
                <Tooltip title="Upload College ID">
                  <IconButton
                    color="primary"
                    component="span"
                  >
                    <CloudUpload />
                  </IconButton>
                </Tooltip>
              </label>
              {files.collegeId && (
                <LinearProgress 
                  variant="determinate" 
                  value={progress.collegeId} 
                  sx={{ width: '100%', ml: 2 }} 
                />
              )}
            </Box>
            <Divider sx={{ my: 3 }} />
    
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentInd color="primary" /> Upload Resume
            </Typography>
            <Box display="flex" alignItems="center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e, 'resume')}
                style={{ display: 'none' }}
                id="upload-resume"
              />
              <label htmlFor="upload-resume">
                <Tooltip title="Upload Resume">
                  <IconButton
                    color="primary"
                    component="span"
                  >
                    <CloudUpload />
                  </IconButton>
                </Tooltip>
              </label>
              {files.resume && (
                <LinearProgress 
                  variant="determinate" 
                  value={progress.resume} 
                  sx={{ width: '100%', ml: 2 }} 
                />
              )}
            </Box>
          </Box>
        </Grid>
    
        <Grid item xs={12} md={6}>
          <Box>
            {files.adhaarCard && (
              <Card sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PictureAsPdf color="primary" /> {files.adhaarCard.name}
                  </Typography>
                  <IconButton onClick={() => handleDeleteFile('adhaarCard')}>
                    <Delete color="error" />
                  </IconButton>
                </Box>
              </Card>
            )}
    
            {files.bonafideCertificate && (
              <Card sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description color="primary" /> {files.bonafideCertificate.name}
                  </Typography>
                  <IconButton onClick={() => handleDeleteFile('bonafideCertificate')}>
                    <Delete color="error" />
                  </IconButton>
                </Box>
              </Card>
            )}
    
            {files.collegeId && (
              <Card sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PermIdentity color="primary" /> {files.collegeId.name}
                  </Typography>
                  <IconButton onClick={() => handleDeleteFile('collegeId')}>
                    <Delete color="error" />
                  </IconButton>
                </Box>
              </Card>
            )}
    
            {files.resume && (
              <Card sx={{ mb: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentInd color="primary" /> {files.resume.name}
                  </Typography>
                  <IconButton onClick={() => handleDeleteFile('resume')}>
                    <Delete color="error" />
                  </IconButton>
                </Box>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
    
      <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              color="primary"
            />
          }
          label="I hereby agree to the terms and conditions as outlined by VDart."
        />
        <Tooltip title="View Terms and Conditions">
          <IconButton onClick={handleOpenDialog}>
            <Info color="primary" />
          </IconButton>
        </Tooltip>
      </Box>
    
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<BackIcon />}
            onClick={onBack}
          >
            Previous
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button 
            fullWidth 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSaveSubmit}
            disabled={loading || !agreeToTerms}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save & Submit'}
          </Button>
        </Grid>
      </Grid>
    
      {/* Confirmation Dialog for Offer Letter */}
      <Dialog open={confirmationDialog} onClose={handleSkipSending}>
        <DialogTitle>Send Offer Letter?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Documents uploaded successfully! Would you like to send the offer letter to the candidate now?
          </Typography>
        </DialogContent>
          <Button 
            onClick={handleSkipSending} 
            color="primary"
            disabled={sendingOffer}
          >
            Skip
          </Button>
          <Button 
            onClick={handleSendOfferLetter} 
            color="primary" 
            variant="contained"
            disabled={sendingOffer}
          >
            {sendingOffer ? <CircularProgress size={24} color="inherit" /> : 'Send Offer Letter'}
          </Button>
      </Dialog>
      <Snackbar
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        key={snackbarKey}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    
      {/* Terms and Conditions Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <VerifiedUser color="primary" sx={{ mr: 1 }} />
            Terms and Conditions
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            By using this service, you agree to the terms and conditions outlined by VDart. Please read them carefully before proceeding.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

            // ------------------end documents upload---------------------
            const ThankYouPage = ({ onRestart, onComplete }) => {
              const handleReturn = () => {
                if (onComplete) {
                  onComplete();
                }
              };
              return (
                <Paper elevation={3} sx={{ 
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '70vh',
                  textAlign: 'center',
                  borderRadius: 4
                }}>
                  <Box sx={{ 
                    backgroundColor: 'primary.light',
                    borderRadius: '50%',
                    width: 120,
                    height: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 4
                  }}>
                    <TaskAlt sx={{ fontSize: 60, color: 'primary.contrastText' }} />
                  </Box>
                  
                  <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Registration Successful!
                  </Typography>
                  
                  <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                    <AdminPanelSettings sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
                    Admin Registration Complete
                  </Typography>
                  
                  <Box sx={{ 
                    backgroundColor: 'background.default',
                    p: 4,
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: 600,
                    mb: 4
                  }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      The new user has been successfully registered in the system.
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      An email notification has been sent to the registered email address with login credentials.
                    </Typography>
                    
                    <Typography variant="body1">
                      You can now manage this user from the admin dashboard.
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={onRestart}
                      sx={{
                        px: 4,
                      }}
                    >
                      Register Another User
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="primary"
                      size="large"
                      onClick={handleReturn}
                      sx={{
                        px: 4,
                      }}
                    >
                      Back to Intern List
                    </Button>
                  </Box>
                </Paper>
              );
            };
            
            const MultiStepForm = ({ onClose, onComplete, onCancel }) => {
              const [step, setStep] = useState(0);
              const [formData, setFormData] = useState({
                registerData: {},
                collegeData: {},
                companyData: {},
                documentsData: {}
              });
             
              const steps = [
                'User Registration',
                'College Information',
                'Company Details',
                'Documents Upload',
                'Complete'
              ];
            
              const handleNext = (data) => {
                const newFormData = { ...formData };
                if (step === 0) newFormData.registerData = data;
                if (step === 1) newFormData.collegeData = data;
                if (step === 2) newFormData.companyData = data;
                if (step === 3) newFormData.documentsData = data;
            
                setFormData(newFormData);
                setStep(step + 1);
              };
            
              const handleBack = () => {
                setStep(step - 1);
              };
            
              const handleSubmit = (data) => {
                handleNext(data);
              };
            
              const handleRestart = () => {
                setStep(0);
                setFormData({
                  registerData: {},
                  collegeData: {},
                  companyData: {},
                  documentsData: {}
                });
              };
              
              const handleFinalComplete = () => {
                if (onComplete) {
                  onComplete();
                }
              };
            
              const getStepContent = (stepIndex) => {
                switch (stepIndex) {
                  case 0:
                    return <RegisterPage 
                    onCancel={onCancel} 
                             onNext={handleNext} 
                             initialData={formData.registerData} 
                             isReturning={Object.keys(formData.registerData).length > 0}
                           />;
                  case 1:
                    return <CollegeInfoForm 
                             onBack={handleBack} 
                             onNext={handleNext} 
                             initialData={formData.collegeData} 
                           />;
                  case 2:
                    return <CompanyDetailsForm 
                             onBack={handleBack} 
                             onNext={handleNext} 
                             initialData={formData.companyData} 
                           />;
                  case 3:
  return <DocumentsUpload
  onBack={handleBack}
  onNext={handleSubmit}
  initialData={formData.documentsData}
  registerData={formData.registerData}
  collegeData={formData.collegeData}
  companyData={formData.companyData}
/>;



                  case 4:
                    return <ThankYouPage 
                      onRestart={handleRestart} 
                      onComplete={handleFinalComplete}
                    />;

                  default:
                    return null;
                }
              };
            
              return (
                <Container maxWidth="lg" sx={{ py: 4 }}>
                  {step < steps.length - 1 && (
                    <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
                      {steps.slice(0, -1).map((label, index) => (
                        <Step key={label}>
                          <StepLabel 
                            sx={{
                              '& .MuiStepLabel-label': {
                                fontWeight: 600,
                                color: step === index ? 'primary.main' : 'text.secondary'
                              }
                            }}
                          >
                            {label}
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  )}
            
                  {getStepContent(step)}
                </Container>
              );
            };
            
            export default InternLists;
           