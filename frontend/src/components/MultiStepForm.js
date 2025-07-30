import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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
  Male as MaleIcon,
  Female as FemaleIcon,
  MoreHoriz as OtherIcon,
  CreditCard as AadharIcon,
  School as GraduateIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  ArrowForward as NextIcon,
  AddAPhoto as AddPhotoIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
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
  TaskAlt
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

const RegisterPage = ({ onNext, initialData, isReturning }) => {
  const [formData, setFormData] = useState(initialData || {
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    mobile: "",
    department: "",
    role: "intern",
    address1: "",
    address2: "",
    pincode: "",
    dob: "",
    gender: "",
    aadharNumber: "",
    isFirstGraduate: false,
    profilePhoto: null
  });

  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(initialData?.profilePhotoUrl || null);
  const fileInputRef = useRef(null);

  const roles = [
    { value: "intern", label: "Intern" },
    { value: "staff", label: "Staff" },
    { value: "admin", label: "Admin" },
    { value: "hr", label: "HR" }
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
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
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
      
      if (onNext) {
        onNext(formData); // Pass form data to parent without backend call
      }
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
              fullWidth
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<CancelIcon />}
              onClick={props.onClose}
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
  const [formData, setFormData] = useState(initialData || {
    collegeName: "",
    collegeAddress: "",
    collegeEmail: "",
    degreeType: "UG",
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
  const [formData, setFormData] = useState(initialData || {
    domainName: '',
  startDate: '',
  endDate: '',
  duration: '',
  days: '',
  shiftTiming: '',
  workingDays: '',
  scheme: '',
  teamName: '',
  userStatus: '',
  department: '',
  reportingManager: '',
  reportingSupervisor: ''
  });
 
  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const domains = [
    "IT Services",
    "Product Development",
    "Consulting",
    "Finance",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail",
    "Telecommunications",
    "Automotive",
    "Energy",
    "Media & Entertainment"
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
 
  const validateForm = () => {
    const newErrors = {};
    if (!formData.domain) newErrors.domain = "Domain is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.teamName) newErrors.teamName = "Team name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date cannot be before start date";
    }
   
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSnackbarMessage("Company details saved! Continue to next step...");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      
      if (onNext) {
        onNext(formData); // Pass form data to parent without backend call
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
              <FormControl fullWidth error={!!errors.domain}>
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
                {errors.domain && (
                  <Typography variant="caption" color="error">
                    {errors.domain}
                  </Typography>
                )}
              </FormControl>
            </Grid>
           
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.department}>
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
                {errors.department && (
                  <Typography variant="caption" color="error">
                    {errors.department}
                  </Typography>
                )}
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
                    value="free"
                    control={<Radio color="primary" />}
                    label="Free"
                  />
                  <FormControlLabel
                    value="course"
                    control={<Radio color="primary" />}
                    label="Course"
                  />
                  <FormControlLabel
                    value="project"
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
                <InputLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ManagerIcon fontSize="small" color="action" /> Reporting Manager (Optional)
                  </Box>
                </InputLabel>
                <Select
                  name="reportingManager"
                  value={formData.reportingManager}
                  onChange={handleChange}
                  label="Reporting Manager (Optional)"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
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
                    <SupervisorIcon fontSize="small" color="action" /> Reporting Supervisor (Optional)
                  </Box>
                </InputLabel>
                <Select
                  name="reportingSupervisor"
                  value={formData.reportingSupervisor}
                  onChange={handleChange}
                  label="Reporting Supervisor (Optional)"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
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

const DocumentsUpload = ({ onBack, onNext, initialData, allFormData }) => {
  const [files, setFiles] = useState(initialData || {
    adhaarCard: null,
    bonafideCertificate: null,
    collegeId: null,
    resume: null
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
    setSnackbarKey(key); // Track which document triggered the message
    setSnackbarOpen(true);
  };
 
  const handleDeleteFile = (key) => {
    setFiles({ ...files, [key]: null });
    setProgress(prev => ({ ...prev, [key]: 0 }));
    showSnackbar(`${documentNames[key]} removed`, 'info', key);
  };
 
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
   
    if (Object.values(files).every(file => file === null)) {
      showSnackbar('Please upload at least one document', 'error', 'submit');
      return;
    }
   
    if (!agreeToTerms) {
      showSnackbar('You must agree to the terms and conditions to submit.', 'error', 'submit');
      return;
    }
   
    setLoading(true);
   
    try {
      const token = localStorage.getItem("token");
      
      // Step 1: Register user first
      const registerPayload = {
        username: allFormData.registerData.username,
        password: allFormData.registerData.password,
        email: allFormData.registerData.email,
        first_name: allFormData.registerData.first_name,
        last_name: allFormData.registerData.last_name,
        role: allFormData.registerData.role || "intern",
        department: allFormData.registerData.department
      };

      const registerResponse = await axios.post("http://localhost:8000/Sims/register/", registerPayload, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json"
        }
      });

      const emp_id = registerResponse.data.emp_id;
      // console.log("emp_id", emp_id);
      // console.log("allFormData", allFormData);
      
      
      // Step 2: Save personal data with photo
      const personalFormData = new FormData();
      personalFormData.append("emp_id", emp_id);
      personalFormData.append("phone", allFormData.registerData.mobile || "");
      personalFormData.append("aadhar", allFormData.registerData.aadharNumber || "");
      personalFormData.append("gender", allFormData.registerData.gender || "");
      personalFormData.append("address1", allFormData.registerData.address1 || "");
      personalFormData.append("address2", allFormData.registerData.address2 || "");
      personalFormData.append("pincode", allFormData.registerData.pincode || "");
      personalFormData.append("dob", allFormData.registerData.dob || "");
      if (allFormData.registerData.profilePhoto) {
        personalFormData.append("photo", allFormData.registerData.profilePhoto);
      }
      
      await axios.post("http://localhost:8000/Sims/personal-data/", personalFormData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      // Step 3: Save college details
      if (allFormData.collegeData && Object.keys(allFormData.collegeData).length > 0) {
        const collegePayload = {
          emp_id: emp_id,
          college_name: allFormData.collegeData.collegeName || '',
          college_address: allFormData.collegeData.collegeAddress || '',
          college_emailid: allFormData.collegeData.collegeEmail || '',
          degree_type: allFormData.collegeData.degreeType || '',
          degree: allFormData.collegeData.degree || '',
          college_department: allFormData.collegeData.department || '',
          year_of_passing: allFormData.collegeData.yearOfPassing || '',
          cgpa: allFormData.collegeData.cgpa || '',
          college_faculty_phonenumber: allFormData.collegeData.facultyNumber || '',
        };
        
        await axios.post("http://localhost:8000/Sims/college-details/", collegePayload, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json"
          }
        });
      }
      

      // Step 4: Save company/user details
      if (allFormData.companyData && Object.keys(allFormData.companyData).length > 0) {
        const companyPayload = {
          emp_id: emp_id,
          domain: allFormData.companyData.domainName || allFormData.companyData.domain || '',
          start_date: allFormData.companyData.startDate || '',
          end_date: allFormData.companyData.endDate || '',
          duration: allFormData.companyData.duration || '',
          days: allFormData.companyData.days || allFormData.companyData.workingDays || '',
          shift_timing: allFormData.companyData.shiftTiming || '',
          shift_days: allFormData.companyData.workingDays || '',
          scheme: allFormData.companyData.scheme || '',
          team_name: allFormData.companyData.teamName || '',
          user_status: allFormData.companyData.userStatus || allFormData.companyData.status || '',
          department: allFormData.companyData.department || '',
          reporting_manager: allFormData.companyData.reportingManager || '',
          reporting_supervisor: allFormData.companyData.reportingSupervisor || '',
        };
        
        await axios.post("http://localhost:8000/Sims/user-data/", companyPayload, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json"
          }
        });
      }

      // Step 5: Upload documents
      const documentsFormData = new FormData();
      documentsFormData.append("emp_id", emp_id);
      Object.keys(files).forEach(key => {
        if (files[key]) {
          documentsFormData.append(key, files[key]);
        }
      });
      
      if (Object.keys(files).some(key => files[key])) {
        await axios.post("http://localhost:8000/Sims/documents/", documentsFormData, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
      }
      console.log(documentsFormData.emp_id)
     
      showSnackbar('All data saved and submitted successfully!', 'success', 'submit');
     
      if (onNext) {
        onNext(files);
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === "string") {
        errorMessage = error.response.data;
      }
      
      showSnackbar(errorMessage, 'error', 'submit');
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

const ThankYouPage = ({ onRestart }) => {
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
          href="/admin-dashboard"
          sx={{
            px: 4,
          }}
        >
          Go To Intern Lists
        </Button>
      </Box>
    </Paper>
  );
};

const MultiStepForm = () => {
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

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return <RegisterPage
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
                 allFormData={formData}
               />;
      case 4:
        return <ThankYouPage onRestart={handleRestart} />;
      default:
        return null;
    }
  };

  return (    <Container maxWidth="lg" sx={{ py: 4 }}>
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

const App = () => {
return (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <MultiStepForm />
  </ThemeProvider>
);
};

// Export individual components for use in other files
export { RegisterPage, CollegeInfoForm, CompanyDetailsForm, DocumentsUpload, ThankYouPage };

export default App;