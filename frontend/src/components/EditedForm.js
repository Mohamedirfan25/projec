import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container, Typography, TextField, Button, Select,
  MenuItem, InputLabel, FormControl, Grid, Box, Snackbar, Alert,
  InputAdornment, IconButton, Radio, RadioGroup, FormControlLabel,
  Checkbox, Divider, Avatar, CircularProgress, Card, Tooltip, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Stepper, Step, StepLabel,
  Paper, CssBaseline
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  AssignmentInd,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Home as AddressIcon,
  LocationOn as PincodeIcon,
  Cake as DOBIcon,
  Transgender as GenderIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  MoreHoriz as OtherIcon,
  CreditCard as AadharIcon,
  School as GraduateIcon,
  // ...existing code...
  Save as SaveIcon,
  ArrowForward as NextIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Business as CompanyIcon,
  Category as DomainIcon,
  Groups as DepartmentIcon,
  MonetizationOn as SchemeIcon,
  Tag as AssetIcon,
  Event as StartDateIcon,
  EventAvailable as EndDateIcon,
  Schedule as DurationIcon,
  CalendarToday as DaysIcon,
  AccessTime as ShiftIcon,
  ToggleOn as StatusIcon,
  SupervisorAccount as ManagerIcon,
  Person as SupervisorIcon,
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
  AdminPanelSettings
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Modern theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#4361ee',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3f37c9',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: '#3a56e8',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-completed': {
            color: '#4caf50',
          },
          '&.Mui-active': {
            color: '#4361ee',
          },
        },
      },
    },
  },
});

const PersonalDetailsForm = ({ onNext, initialData, isReturning, onClose }) => {
  const [formData, setFormData] = useState({
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
  });

  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [photoPreview, setPhotoPreview] = useState(initialData?.profilePhotoUrl || null);
  const fileInputRef = useRef(null);

  const roles = [
    { value: "intern", label: "Intern" },
    { value: "staff", label: "Staff" },
    { value: "admin", label: "Admin" },
    { value: "hr", label: "HR" }
  ];

  const genders = [
    { value: "M", label: "Male", icon: <MaleIcon /> },
    { value: "F", label: "Female", icon: <FemaleIcon /> },
    { value: "O", label: "Other", icon: <OtherIcon /> }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
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
    }
  }, [initialData]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/Sims/departments/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
        // Fallback to mock data
        const mockDepartments = [
          { id: 1, department: "Software Development" },
          { id: 2, department: "Quality Assurance" },
          { id: 3, department: "Data Science" },
          { id: 4, department: "UX/UI Design" }
        ];
        setDepartments(mockDepartments);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setSnackbarMessage("Personal details saved! Continue to next step...");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        
        if (onNext) {
          onNext(formData);
        }
      } catch (error) {
        console.error("Validation error:", error);
        setSnackbarMessage("Please fix the errors in the form");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      }
    }
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
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: 'text.primary'
          }}
        >
          Personal Details
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Fill in the personal details
        </Typography>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
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
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
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
            <FormControl fullWidth>
              <InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentInd fontSize="small" color="action" /> Department
                </Box>
              </InputLabel>
              <Select
                name="department"
                value={formData.department}
                onChange={handleChange}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.department}>
                    {dept.department}
                  </MenuItem>
                ))}
              </Select>
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
              <AddressIcon color="primary" /> Additional Details
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
              label="Address 2"
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
              variant="outlined"
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
            <FormControl component="fieldset">
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
                JPEG or PNG
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
              label="Aadhar Number"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
              variant="outlined"
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
              fullWidth
              variant="outlined"
              color="secondary"
              size="large"
              onClick={onClose}
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
              startIcon={<SaveIcon />}
              endIcon={<NextIcon />}
            >
              Save & Next
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

const CollegeInfoForm = ({ onBack, onNext, initialData }) => {
  const [formData, setFormData] = useState({
    collegeName: initialData?.collegeName || "",
    collegeAddress: initialData?.collegeAddress || "",
    collegeEmail: initialData?.collegeEmail || "",
    degreeType: initialData?.degreeType || "UG",
    degree: initialData?.degree || "",
    collegeDepartment: initialData?.collegeDepartment || "",
    yearOfPassing: initialData?.yearOfPassing || "",
    cgpa: initialData?.cgpa || "",
    facultyNumber: initialData?.facultyNumber || ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        collegeName: initialData?.collegeName || "",
        collegeAddress: initialData?.collegeAddress || "",
        collegeEmail: initialData?.collegeEmail || "",
        degreeType: initialData?.degreeType || "UG",
        degree: initialData?.degree || "",
        collegeDepartment: initialData?.collegeDepartment || "",
        yearOfPassing: initialData?.yearOfPassing || "",
        cgpa: initialData?.cgpa || "",
        facultyNumber: initialData?.facultyNumber || ""
      }));
    }
  }, [initialData]);
  
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setSnackbarMessage("College information saved! Continue to next step...");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        
        if (onNext) {
          onNext(formData);
        }
      } catch (error) {
        console.error("Validation error:", error);
        setSnackbarMessage("Please fix the errors in the form");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
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
              label="College Email"
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
            <FormControl fullWidth>
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
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DeptIcon fontSize="small" color="action" /> Department
                </Box>
              </InputLabel>
              <Select
                name="collegeDepartment"
                value={formData.collegeDepartment}
                onChange={handleChange}
                label="Department"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
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
              variant="outlined"
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
              variant="outlined"
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
              label="Faculty Number"
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
              startIcon={<SaveIcon />}
              endIcon={<NextIcon />}
            >
              Save & Next
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

const CompanyDetailsForm = ({ onBack, onNext, initialData }) => {
  const [formData, setFormData] = useState({
    domain: initialData?.domain || "",
    department: initialData?.department || "",
    scheme: initialData?.scheme || "",
    teamName: initialData?.teamName || "",
    assetCode: initialData?.assetCode || "",
    startDate: initialData?.startDate || null,
    endDate: initialData?.endDate || null,
    duration: initialData?.duration || "",
    workingDays: initialData?.workingDays || "",
    shiftTiming: initialData?.shiftTiming || "",
    status: initialData?.status || "active",
    reportingManager: initialData?.reportingManager || "",
    reportingSupervisor: initialData?.reportingSupervisor || ""
  });
  
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const domains = [
    "Full Stack",
    "Data Analytics",
    "Digital Marketing",
    "UI/UX Design",
    "AI & Machine Learning"
  ];

  const departments = [
    "Software Development",
    "Quality Assurance",
    "DevOps",
    "Data Science",
    "UX/UI Design",
    "Product Management",
    "Human Resources",
    "Finance & Accounting",
    "Marketing",
    "Sales",
    "Customer Support",
    "Research & Development"
  ];

  const workingDaysOptions = [
    { value: "mon-fri", label: "Monday to Friday" },
    { value: "mon-sat", label: "Monday to Saturday" },
    { value: "sun-thu", label: "Sunday to Thursday" },
    { value: "shift", label: "Rotational Shifts" }
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
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        domain: initialData?.domain || "",
        department: initialData?.department || "",
        scheme: initialData?.scheme || "",
        teamName: initialData?.teamName || "",
        assetCode: initialData?.assetCode || "",
        startDate: initialData?.startDate ? new Date(initialData.startDate) : null,
        endDate: initialData?.endDate ? new Date(initialData.endDate) : null,
        duration: initialData?.duration || "",
        workingDays: initialData?.workingDays || "",
        shiftTiming: initialData?.shiftTiming || "",
        status: "active",
        reportingManager: initialData?.reportingManager || "",
        reportingSupervisor: initialData?.reportingSupervisor || ""
      }));
    }
  }, [initialData]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start > end) {
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
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.domain) newErrors.domain = "Domain is required";
    if (!formData.department) newErrors.department = "Department is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setSnackbarMessage("Company details saved! Continue to next step...");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        
        if (onNext) {
          onNext(formData);
        }
      } catch (error) {
        console.error("Validation error:", error);
        setSnackbarMessage("Please fix the errors in the form");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
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
              <FormControl fullWidth>
                <InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DomainIcon fontSize="small" color="action" /> Domain
                  </Box>
                </InputLabel>
                <Select
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  label="Domain"
                >
                  {domains.map((domain) => (
                    <MenuItem key={domain} value={domain}>
                      {domain}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DepartmentIcon fontSize="small" color="action" /> Department
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
              </FormControl>
            </Grid> */}
            
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
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DepartmentIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Asset Code"
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
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
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
                <InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ManagerIcon fontSize="small" color="action" /> Reporting Manager
                  </Box>
                </InputLabel>
                <Select
                  name="reportingManager"
                  value={formData.reportingManager}
                  onChange={handleChange}
                  label="Reporting Manager"
                >
                  {reportingStaff.map((staff) => (
                    <MenuItem key={staff} value={staff}>
                      {staff}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SupervisorIcon fontSize="small" color="action" /> Reporting Supervisor
                  </Box>
                </InputLabel>
                <Select
                  name="reportingSupervisor"
                  value={formData.reportingSupervisor}
                  onChange={handleChange}
                  label="Reporting Supervisor"
                >
                  {reportingStaff.map((staff) => (
                    <MenuItem key={staff} value={staff}>
                      {staff}
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
                startIcon={<SaveIcon />}
                endIcon={<NextIcon />}
              >
                Save & Next
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

const DocumentsUpload = ({ onBack, initialData, onClose }) => {
  const [files, setFiles] = useState({
    adhaarCard: initialData?.adhaarCard || null,
    bonafideCertificate: initialData?.bonafideCertificate || null,
    collegeId: initialData?.collegeId || null,
    resume: initialData?.resume || null
  });
  
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarKey, setSnackbarKey] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [progress, setProgress] = useState({
    adhaarCard: 0,
    bonafideCertificate: 0,
    collegeId: 0,
    resume: 0
  });
  const [openDialog, setOpenDialog] = useState(false);
  
  const documentNames = {
    adhaarCard: "Adhaar Card",
    bonafideCertificate: "Bonafide Certificate",
    collegeId: "College ID",
    resume: "Resume"
  };
  
  const handleFileUpload = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;
    
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
          showSnackbar(documentNames[key] + ' uploaded successfully!', 'success', key);
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
    showSnackbar(`${documentNames[key]} removed`, 'info', key);
  };
  
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      showSnackbar('You must agree to the terms and conditions to submit.', 'error', 'submit');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSnackbar('All information saved successfully!', 'success', 'submit');
      if (typeof onClose === 'function') {
        setTimeout(() => onClose(), 700); // Give user a moment to see the success message
      }
    } catch (error) {
      console.error("Error:", error);
      showSnackbar('Submission failed. Please try again.', 'error', 'submit');
    } finally {
      setLoading(false);
    }
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
          <Description fontSize="large" />
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
          Documents Upload
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          Please upload the required documents below
        </Typography>
      </Box>
    
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
                id="upload-adhaar"
              />
              <label htmlFor="upload-adhaar">
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
                id="upload-bonafide"
              />
              <label htmlFor="upload-bonafide">
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

const MultiStepForm = ({ internData, onClose }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    personalData: internData ? {
      email: internData.email || '',
      first_name: internData.firstName || internData.first_name || '',
      last_name: internData.lastName || internData.last_name || '',
      mobile: internData.mobile || '',
      department: internData.department || '',
      role: 'intern',
      address1: internData.address1 || '',
      address2: internData.address2 || '',
      pincode: internData.pincode || '',
      dob: internData.dob || '',
      gender: internData.gender || '',
      aadharNumber: internData.aadharNumber || '',
      isFirstGraduate: internData.isFirstGraduate || false
    } : {},
    collegeData: internData ? {
      collegeName: internData.collegeName || '',
      collegeAddress: internData.collegeAddress || '',
      collegeEmail: internData.collegeEmail || '',
      degreeType: internData.degreeType || 'UG',
      degree: internData.degree || '',
      collegeDepartment: internData.collegeDepartment || '',
      yearOfPassing: internData.yearOfPassing || '',
      cgpa: internData.cgpa || '',
      facultyNumber: internData.facultyNumber || ''
    } : {},
    companyData: internData ? {
      domain: internData.domain || '',
      department: internData.department || '',
      scheme: internData.scheme || '',
      teamName: internData.teamName || '',
      assetCode: internData.assetCode || '',
      startDate: internData.startDate ? new Date(internData.startDate) : null,
      endDate: internData.endDate ? new Date(internData.endDate) : null,
      duration: internData.duration || '',
      workingDays: internData.workingDays || '',
      shiftTiming: internData.shiftTiming || '',
      status: 'active',
      reportingManager: internData.reportingManager || '',
      reportingSupervisor: internData.reportingSupervisor || ''
    } : {},
    documentsData: {
      documents: internData.documents || []
    }
  });
  
  const steps = [
    'Personal Details',
    'College Information',
    'Company Details',
    'Documents Upload'
  ];
  
  const handleNext = (data) => {
    const newFormData = { ...formData };
    if (step === 0) newFormData.personalData = data;
    if (step === 1) newFormData.collegeData = data;
    if (step === 2) newFormData.companyData = data;
    if (step === 3) newFormData.documentsData = data;
    
    setFormData(newFormData);
    setStep(step + 1);
  };
  
  const handleBack = () => {
    setStep(step - 1);
  };
  
  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return <PersonalDetailsForm onNext={handleNext} initialData={formData.personalData} isReturning={Object.keys(formData.personalData).length > 0} onClose={onClose} />;
      case 1:
        return <CollegeInfoForm onBack={handleBack} onNext={handleNext} initialData={formData.collegeData} />;
      case 2:
        return <CompanyDetailsForm onBack={handleBack} onNext={handleNext} initialData={formData.companyData} />;
      case 3:
        return <DocumentsUpload onBack={handleBack} initialData={formData.documentsData} onClose={onClose} />;
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {step < steps.length && (
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, index) => (
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

const EditedForm = ({ initialData, onClose, onSave }) => {
  const navigate = useNavigate();
  const internData = initialData;
  // Use initialData immediately for fast dialog open
  const [fullInternData, setFullInternData] = useState(internData);
  const [loading, setLoading] = useState(false);

  // Optionally, fetch extra details only if a key field is missing
  useEffect(() => {
    if (!internData) {
      if (onClose) onClose();
      return;
    }
    // Example: if you want to fetch more only if collegeName is missing
    if (!internData.collegeName) {
      setLoading(true);
      const fetchFullInternData = async () => {
        try {
          const token = localStorage.getItem("token");
          const [collegeRes] = await Promise.all([
            fetch(`http://localhost:8000/Sims/college-details/`, {
              headers: { Authorization: `Token ${token}` }
            })
          ]);
          const collegeData = await collegeRes.json();
          const collegeRecord = collegeData.find(data => data.emp_id === internData.id);
          setFullInternData({ ...internData, collegeName: collegeRecord?.college_name || '' });
        } catch (error) {
          setFullInternData(internData);
        } finally {
          setLoading(false);
        }
      };
      fetchFullInternData();
    } else {
      setFullInternData(internData);
    }
  }, [internData, onClose]);

  if (!internData) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {loading && (
          <LinearProgress />
        )}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => {
              if (onClose) onClose();
            }}
          >
            Back to Intern List
          </Button>
        </Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
          Edit Intern: {internData.name}
        </Typography>
        <MultiStepForm internData={fullInternData} onClose={onClose} />
      </Container>
    </ThemeProvider>
  );
};

export default EditedForm;