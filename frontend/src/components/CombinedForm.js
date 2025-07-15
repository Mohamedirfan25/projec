import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  Card,
  CardMedia,
  Tooltip,
  LinearProgress,
  FormLabel,
} from '@mui/material';
import {
  Person,
  Email,
  Home,
  LocationOn,
  Cake,
  Male,
  Female,
  AssignmentInd,
  School,
  CalendarToday,
  Book,
  Engineering,
  ArrowBack,
  Phone,
  Business,
  Work,
  Domain,
  DateRange,
  PictureAsPdf,
  Description,
  PermIdentity,
  CameraAlt,
  Save,
  CheckCircle,
  CloudUpload,
  Info,
  VerifiedUser,
  Delete,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { FaCloudUploadAlt } from 'react-icons/fa';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CombinedForm = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [internId, setInternId] = useState('');

  const [personalDetails, setPersonalDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    dob: null,
    gender: '',
    aadhaarNumber: '',
    graduateType: '',
    otherGraduateType: '',
  });

  const [collegeInformation, setCollegeInformation] = useState({
    collegeName: '',
    degreeLevel: '',
    degree: '',
    department: '',
    passoutDate: null,
    collegeAddress: '',
    collegeEmail: '',
    collegeFacultyNumber: '',
    cgpa: '',
  });

  const [companyDetails, setCompanyDetails] = useState({
    trainingOrProject: '',
    status: '',
    fullTime: false,
    halfTime: false,
    shift: '',
    workingDays: '',
    payment: '',
    amount: '',
    offerLetterReceived: '',
    completionLetter: null,
    domain: '',
    teamName: '',
    startDate: null,
    endDate: null,
  });

  const [documentsUpload, setDocumentsUpload] = useState({
    adhaarCard: null,
    bonafideCertificate: null,
    collegeId: null,
    resume: null,
    photo: null,
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [progress, setProgress] = useState({
    adhaarCard: 0,
    bonafideCertificate: 0,
    collegeId: 0,
    resume: 0,
    photo: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);

  const handlePersonalDetailsChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    // Validation based on field type
    let processedValue = value;
    if (name === 'firstName' || name === 'lastName') {
      // Only allow letters and spaces for names
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (name === 'pincode' || name === 'aadhaarNumber') {
      // Only allow numbers for pincode and aadhaar
      processedValue = value.replace(/\D/g, '');
    }
    
    setPersonalDetails({ ...personalDetails, [name]: type === 'checkbox' ? checked : processedValue });
  };

  const handleCollegeInformationChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'cgpa') {
      // Only allow numbers and decimal point for CGPA
      processedValue = value.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      if ((processedValue.match(/\./g) || []).length > 1) {
        processedValue = processedValue.substring(0, processedValue.length - 1);
      }
    } else if (name === 'collegeFacultyNumber') {
      // Only allow alphanumeric for faculty number
      processedValue = value.replace(/[^a-zA-Z0-9]/g, '');
    }
    
    setCollegeInformation({ ...collegeInformation, [name]: processedValue });
  };

  const handleCompanyDetailsChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    if (name === 'amount') {
      // Only allow numbers for amount
      processedValue = value.replace(/\D/g, '');
    }
    
    setCompanyDetails({ ...companyDetails, [name]: processedValue });
  };

  const handleCompanyDetailsCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setCompanyDetails({ ...companyDetails, [name]: checked });
  };

  const handleDocumentsUploadChange = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setSnackbarMessage('File size exceeds the limit of 5MB');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (key === 'photo' && !file.type.startsWith('image/')) {
      setSnackbarMessage('Please upload a valid image file');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (key !== 'photo' && file.type !== 'application/pdf') {
      setSnackbarMessage('Please upload a valid PDF file');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setDocumentsUpload({ ...documentsUpload, [key]: file });
    simulateUploadProgress(key);
  };

  const simulateUploadProgress = (key) => {
    setProgress((prevProgress) => ({ ...prevProgress, [key]: 0 }));
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress[key] === 100) {
          clearInterval(interval);
          return { ...prevProgress, [key]: 100 };
        }
        return { ...prevProgress, [key]: Math.min(prevProgress[key] + 10, 100) };
      });
    }, 200);
  };

  const handleDeleteFile = (key) => {
    setDocumentsUpload({ ...documentsUpload, [key]: null });
    setProgress((prevProgress) => ({ ...prevProgress, [key]: 0 }));
  };

  const handleSave = () => {
    if (Object.values(documentsUpload).every(file => file === null)) {
      setSnackbarMessage('Please upload at least one file');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setSaveLoading(true);
    setTimeout(() => {
      setSaveLoading(false);
      setSnackbarMessage('Saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 2000);
  };

  const handleSubmit = () => {
    if (Object.values(documentsUpload).every(file => file === null)) {
      setSnackbarMessage('Please upload at least one file');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!agreeToTerms) {
      setSnackbarMessage('You must agree to the terms and conditions to submit.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setSubmitLoading(true);
    setTimeout(() => {
      setSubmitLoading(false);
      setSnackbarMessage('Form submitted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }, 2000);
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

  const validatePersonalDetails = () => {
    const { firstName, lastName, email, phone, addressLine1, pincode, dob, gender, aadhaarNumber, graduateType } = personalDetails;
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSnackbarMessage('Please enter a valid email address');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    if (!firstName || !lastName || !email || !phone || !addressLine1 || !pincode || !dob || !gender || !aadhaarNumber || !graduateType) {
      setSnackbarMessage('Please fill all required fields in Personal Details.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    // Aadhaar number validation (12 digits)
    if (aadhaarNumber.length !== 12) {
      setSnackbarMessage('Aadhaar number must be 12 digits');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    // Pincode validation (6 digits)
    if (pincode.length !== 6) {
      setSnackbarMessage('Pincode must be 6 digits');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    return true;
  };

  const validateCollegeInformation = () => {
    const { collegeName, degreeLevel, degree, department, passoutDate, collegeAddress, cgpa } = collegeInformation;
    
    // CGPA validation (0.0 to 10.0)
    if (parseFloat(cgpa) < 0 || parseFloat(cgpa) > 10) {
      setSnackbarMessage('CGPA must be between 0.0 and 10.0');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    if (!collegeName || !degreeLevel || !degree || !department || !passoutDate || !collegeAddress || !cgpa) {
      setSnackbarMessage('Please fill all required fields in College Information.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    return true;
  };

  const validateCompanyDetails = () => {
    const { trainingOrProject, status, domain, teamName, startDate, endDate } = companyDetails;
    if (!trainingOrProject || !status || !domain || !teamName || !startDate || !endDate) {
      setSnackbarMessage('Please fill all required fields in Company Details.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    // Date validation
    if (startDate && endDate && startDate > endDate) {
      setSnackbarMessage('End date must be after start date');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return false;
    }
    
    return true;
  };

  const handleSaveAndNext = () => {
    let isValid = false;
    switch (currentSection) {
      case 0:
        isValid = validatePersonalDetails();
        break;
      case 1:
        isValid = validateCollegeInformation();
        break;
      case 2:
        isValid = validateCompanyDetails();
        break;
      default:
        isValid = true;
    }

    if (!isValid) return;

    setSaveLoading(true);
    setTimeout(() => {
      setSaveLoading(false);
      setSnackbarMessage('Data saved successfully! Moving to the next section.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setCurrentSection(currentSection + 1);
    }, 2000);
  };

  const handlePrevious = () => {
    setCurrentSection(currentSection - 1);
  };

  const renderPersonalDetails = () => (
    <form>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="Intern ID"
          value={internId}
          onChange={(e) => setInternId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
          size="small"
          style={{ width: '200px' }}
        />
        <Typography variant="h4" align="center" gutterBottom style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          <Person fontSize="large" style={{ color: '#3f51b5', marginRight: '10px' }} /> Personal Details
        </Typography>
        <div style={{ width: '200px' }}></div>
      </Box>
      
      {/* Name Section */}
      <Typography variant="h6" gutterBottom>
        <Person fontSize="small" /> Name
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={personalDetails.firstName}
            onChange={handlePersonalDetailsChange}
            required
            inputProps={{ maxLength: 50 }}
            InputProps={{
              startAdornment: <Person fontSize="small" />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={personalDetails.lastName}
            onChange={handlePersonalDetailsChange}
            required
            inputProps={{ maxLength: 50 }}
          />
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* Contact Information Section */}
      <Typography variant="h6" gutterBottom>
        <Email fontSize="small" /> Contact Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={personalDetails.email}
            onChange={handlePersonalDetailsChange}
            required
            inputProps={{ maxLength: 100 }}
            InputProps={{
              startAdornment: <Email fontSize="small" />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <PhoneInput
            international
            defaultCountry="IN"
            value={personalDetails.phone}
            onChange={(value) => setPersonalDetails({ ...personalDetails, phone: value })}
            required
            style={{ width: '100%' }}
          />
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* Address Section */}
      <Typography variant="h6" gutterBottom>
        <Home fontSize="small" /> Address
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Line 1"
            name="addressLine1"
            value={personalDetails.addressLine1}
            onChange={handlePersonalDetailsChange}
            required
            inputProps={{ maxLength: 100 }}
            InputProps={{
              startAdornment: <Home fontSize="small" />,
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address Line 2"
            name="addressLine2"
            value={personalDetails.addressLine2}
            onChange={handlePersonalDetailsChange}
            inputProps={{ maxLength: 100 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Pincode"
            name="pincode"
            value={personalDetails.pincode}
            onChange={handlePersonalDetailsChange}
            required
            inputProps={{ maxLength: 6 }}
            InputProps={{
              startAdornment: <LocationOn fontSize="small" />,
            }}
          />
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* Date of Birth and Gender Section */}
      <Typography variant="h6" gutterBottom>
        <Cake fontSize="small" /> Personal Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Date of Birth"
            value={personalDetails.dob}
            onChange={(date) => setPersonalDetails({ ...personalDetails, dob: date })}
            renderInput={(params) => (
              <TextField
                fullWidth
                {...params}
                InputProps={{
                  startAdornment: <Cake fontSize="small" />,
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend" style={{ fontWeight: 'bold' }}>
              <Male fontSize="small" style={{ marginRight: '10px' }} /> Gender
            </FormLabel>
            <RadioGroup
              row
              name="gender"
              value={personalDetails.gender}
              onChange={handlePersonalDetailsChange}
            >
              <FormControlLabel
                value="male"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center">
                    <Male fontSize="small" style={{ marginRight: '5px' }} /> Male
                  </Box>
                }
              />
              <FormControlLabel
                value="female"
                control={<Radio />}
                label={
                  <Box display="flex" alignItems="center">
                    <Female fontSize="small" style={{ marginRight: '5px' }} /> Female
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* Aadhaar Number and Graduate Type Section */}
      <Typography variant="h6" gutterBottom>
        <AssignmentInd fontSize="small" /> Additional Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Aadhaar Number"
            name="aadhaarNumber"
            value={personalDetails.aadhaarNumber}
            onChange={handlePersonalDetailsChange}
            required
            inputProps={{ maxLength: 12 }}
            InputProps={{
              startAdornment: <AssignmentInd fontSize="small" />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Graduate Type</FormLabel>
            <RadioGroup
              name="graduateType"
              value={personalDetails.graduateType}
              onChange={handlePersonalDetailsChange}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Grid container spacing={3} justifyContent="center">
                <Grid item style={{ textAlign: 'left' }}>
                  <FormControlLabel
                    value="firstGraduate"
                    control={<Radio />}
                    label="First Graduate"
                  />
                </Grid>
                <Grid item style={{ textAlign: 'right' }}>
                  <FormControlLabel
                    value="secondGraduate"
                    control={<Radio />}
                    label="Second Graduate"
                  />
                </Grid>
                <Grid item style={{ textAlign: 'center' }}>
                  <FormControlLabel
                    value="other"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" justifyContent="center">
                        Others (Specify:
                        <TextField
                          size="small"
                          name="otherGraduateType"
                          value={personalDetails.otherGraduateType}
                          onChange={handlePersonalDetailsChange}
                          style={{ marginLeft: '10px', width: '150px' }}
                          inputProps={{ maxLength: 50 }}
                        />
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* Navigation Buttons */}
      <Grid container spacing={3} justifyContent="space-between">
        <Grid item>
          <Button
            variant="outlined"
            color="secondary"
            disabled={saveLoading || submitLoading}
          >
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAndNext}
            disabled={saveLoading || submitLoading}
          >
            {saveLoading ? <CircularProgress size={24} /> : 'Save & Next'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  const renderCollegeInformation = () => (
    <form>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="Intern ID"
          value={internId}
          onChange={(e) => setInternId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
          size="small"
          style={{ width: '200px' }}
        />
        <Typography variant="h4" align="center" gutterBottom style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginTop: '40px' }}>
          <School fontSize="large" style={{ color: '#3f51b5', marginRight: '10px' }} /> College Information
        </Typography>
        <div style={{ width: '200px' }}></div>
      </Box>
      
      {/* College Name Section */}
      <Typography variant="h6" gutterBottom>
        <School fontSize="small" /> College Name
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="College Name"
            name="collegeName"
            value={collegeInformation.collegeName}
            onChange={handleCollegeInformationChange}
            required
            inputProps={{ maxLength: 100 }}
            InputProps={{
              startAdornment: <School fontSize="small" />,
            }}
          />
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* Degree Level Section */}
      <Typography variant="h6" gutterBottom>
        <Book fontSize="small" /> Degree Level
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          row
          name="degreeLevel"
          value={collegeInformation.degreeLevel}
          onChange={handleCollegeInformationChange}
        >
          <FormControlLabel
            value="UG"
            control={<Radio />}
            label="Undergraduate (UG)"
          />
          <FormControlLabel
            value="PG"
            control={<Radio />}
            label="Postgraduate (PG)"
          />
          <FormControlLabel
            value="other"
            control={<Radio />}
            label="Others"
          />
        </RadioGroup>
      </FormControl>

      <Divider style={{ margin: '20px 0' }} />

      {/* Degree Section as TextField */}
      <Typography variant="h6" gutterBottom>
        <Book fontSize="small" /> Degree
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Degree"
            name="degree"
            value={collegeInformation.degree}
            onChange={handleCollegeInformationChange}
            required
            inputProps={{ maxLength: 50 }}
            InputProps={{
              startAdornment: <Book fontSize="small" />,
            }}
          />
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* Department Section as TextField */}
      <Typography variant="h6" gutterBottom>
        <Engineering fontSize="small" /> Department
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Department"
            name="department"
            value={collegeInformation.department}
            onChange={handleCollegeInformationChange}
            required
            inputProps={{ maxLength: 50 }}
            InputProps={{
              startAdornment: <Engineering fontSize="small" />,
            }}
          />
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* Passout Date and CGPA Section */}
      <Typography variant="h6" gutterBottom>
        <CalendarToday fontSize="small" /> Graduation Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Passout Date"
            value={collegeInformation.passoutDate}
            onChange={(date) => setCollegeInformation({ ...collegeInformation, passoutDate: date })}
            renderInput={(params) => (
              <TextField
                fullWidth
                {...params}
                InputProps={{
                  startAdornment: <CalendarToday fontSize="small" />,
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="CGPA"
            name="cgpa"
            value={collegeInformation.cgpa}
            onChange={handleCollegeInformationChange}
            required
            inputProps={{ maxLength: 4 }}
            InputProps={{
              startAdornment: <School fontSize="small" />,
            }}
          />
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* College Address Section */}
      <Typography variant="h6" gutterBottom>
        <Home fontSize="small" /> College Address
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="College Address"
            name="collegeAddress"
            value={collegeInformation.collegeAddress}
            onChange={handleCollegeInformationChange}
            required
            inputProps={{ maxLength: 200 }}
            InputProps={{
              startAdornment: <Home fontSize="small" />,
            }}
          />
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* Optional Details Section */}
      <Typography variant="h6" gutterBottom>
        <Email fontSize="small" /> Optional Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="College Email"
            name="collegeEmail"
            type="email"
            value={collegeInformation.collegeEmail}
            onChange={handleCollegeInformationChange}
            inputProps={{ maxLength: 100 }}
            InputProps={{
              startAdornment: <Email fontSize="small" />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="College Faculty Number"
            name="collegeFacultyNumber"
            value={collegeInformation.collegeFacultyNumber}
            onChange={handleCollegeInformationChange}
            inputProps={{ maxLength: 20 }}
            InputProps={{
              startAdornment: <Phone fontSize="small" />,
            }}
          />
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* Navigation Buttons */}
      <Grid container spacing={3} justifyContent="space-between">
        <Grid item>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBack />}
            onClick={handlePrevious}
            disabled={saveLoading || submitLoading}
          >
            Previous
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAndNext}
            disabled={saveLoading || submitLoading}
          >
            {saveLoading ? <CircularProgress size={24} /> : 'Save & Next'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  const renderCompanyDetails = () => (
    <form>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="Intern ID"
          value={internId}
          onChange={(e) => setInternId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
          size="small"
          style={{ width: '200px' }}
        />
        <Typography variant="h4" align="center" gutterBottom style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginTop: '40px' }}>
          <Business fontSize="large" style={{ color: '#3f51b5', marginRight: '10px' }} /> Company Details
        </Typography>
        <div style={{ width: '200px' }}></div>
      </Box>
      
      {/* Training or Project Section */}
      <Typography variant="h6" gutterBottom>
        <Work fontSize="small" /> Training / Project
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          row
          name="trainingOrProject"
          value={companyDetails.trainingOrProject}
          onChange={handleCompanyDetailsChange}
        >
          <FormControlLabel value="Training" control={<Radio />} label="Training" />
          <FormControlLabel value="Project" control={<Radio />} label="Project" />
        </RadioGroup>
      </FormControl>

      <Divider style={{ margin: '20px 0' }} />

      {/* Domain Section */}
      <Typography variant="h6" gutterBottom>
        <Domain fontSize="small" /> Domain
      </Typography>
      <TextField
        fullWidth
        label="Domain"
        name="domain"
        value={companyDetails.domain}
        onChange={handleCompanyDetailsChange}
        inputProps={{ maxLength: 50 }}
        InputProps={{
          startAdornment: <Domain fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
        }}
      />

      <Divider style={{ margin: '20px 0' }} />

      {/* Team Name Section */}
      <Typography variant="h6" gutterBottom>
        <Domain fontSize="small" /> Team Name
      </Typography>
      <TextField
        fullWidth
        label="Team Name"
        name="teamName"
        value={companyDetails.teamName}
        onChange={handleCompanyDetailsChange}
        inputProps={{ maxLength: 50 }}
        InputProps={{
          startAdornment: <Domain fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
        }}
      />

      <Divider style={{ margin: '20px 0' }} />

      {/* Status Section */}
      <Typography variant="h6" gutterBottom>
        <Work fontSize="small" /> Status
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select
          name="status"
          value={companyDetails.status}
          onChange={handleCompanyDetailsChange}
          label="Status"
        >
          <MenuItem value="Joined">Joined</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Discontinued">Discontinued</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Complete">Complete</MenuItem>
        </Select>
      </FormControl>

      <Divider style={{ margin: '20px 0' }} />

      {/* Full Time / Half Time Section */}
      <Typography variant="h6" gutterBottom>
        <Work fontSize="small" /> Employment Type
      </Typography>
      <Box display="flex" alignItems="center">
        <FormControlLabel
          control={
            <Checkbox
              name="fullTime"
              checked={companyDetails.fullTime}
              onChange={handleCompanyDetailsCheckboxChange}
            />
          }
          label="Full Time"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="halfTime"
              checked={companyDetails.halfTime}
              onChange={handleCompanyDetailsCheckboxChange}
            />
          }
          label="Half Time"
        />
      </Box>

      {/* Conditional Rendering for Shifts */}
      {companyDetails.fullTime && (
        <FormControl component="fieldset" style={{ marginTop: '10px' }}>
          <RadioGroup
            row
            name="shift"
            value={companyDetails.shift}
            onChange={handleCompanyDetailsChange}
          >
            <FormControlLabel value="Morning Shift" control={<Radio />} label="Morning Shift" />
            <FormControlLabel value="Night Shift" control={<Radio />} label="Night Shift" />
          </RadioGroup>
        </FormControl>
      )}

      {companyDetails.halfTime && (
        <FormControl component="fieldset" style={{ marginTop: '10px' }}>
          <RadioGroup
            row
            name="shift"
            value={companyDetails.shift}
            onChange={handleCompanyDetailsChange}
          >
            <FormControlLabel value="9 AM To 1 PM" control={<Radio />} label="9 AM To 1 PM" />
            <FormControlLabel value="1 PM To 5 PM" control={<Radio />} label="1 PM To 5 PM" />
          </RadioGroup>
        </FormControl>
      )}

      <Divider style={{ margin: '20px 0' }} />

      {/* Working Days Section */}
      <Typography variant="h6" gutterBottom>
        <CalendarToday fontSize="small" /> Working Days
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Working Days</InputLabel>
        <Select
          name="workingDays"
          value={companyDetails.workingDays}
          onChange={handleCompanyDetailsChange}
          label="Working Days"
        >
          <MenuItem value="Mon-Fri">Mon-Fri</MenuItem>
          <MenuItem value="Mon-Sat">Mon-Sat</MenuItem>
          <MenuItem value="Sat-Sun">Sat-Sun</MenuItem>
        </Select>
      </FormControl>

      <Divider style={{ margin: '20px 0' }} />

      {/* Payment Section */}
      <Typography variant="h6" gutterBottom>
        <Work fontSize="small" /> Payment
      </Typography>
      <Box display="flex" alignItems="center">
        <FormControlLabel
          control={
            <Checkbox
              name="payment"
              value="Free"
              checked={companyDetails.payment === 'Free'}
              onChange={() => setCompanyDetails({ ...companyDetails, payment: 'Free' })}
            />
          }
          label="Free"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="payment"
              value="Paid"
              checked={companyDetails.payment === 'Paid'}
              onChange={() => setCompanyDetails({ ...companyDetails, payment: 'Paid' })}
            />
          }
          label="Paid"
        />
      </Box>

      {companyDetails.payment === 'Paid' && (
        <TextField
          fullWidth
          label="Enter Amount"
          name="amount"
          value={companyDetails.amount}
          onChange={handleCompanyDetailsChange}
          inputProps={{ maxLength: 10 }}
          style={{ marginTop: '10px' }}
        />
      )}

      <Divider style={{ margin: '20px 0' }} />

      {/* Start Date and End Date Section */}
      <Typography variant="h6" gutterBottom>
        <DateRange fontSize="small" /> Start Date and End Date
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <DatePicker
            label="Start Date"
            value={companyDetails.startDate}
            onChange={(date) => setCompanyDetails({ ...companyDetails, startDate: date })}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                InputProps={{
                  startAdornment: <DateRange fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <DatePicker
            label="End Date"
            value={companyDetails.endDate}
            onChange={(date) => setCompanyDetails({ ...companyDetails, endDate: date })}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                InputProps={{
                  startAdornment: <DateRange fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                }}
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider style={{ margin: '20px 0' }} />

      {/* Optional Details Section */}
      <Typography variant="h6" gutterBottom>
        <Email fontSize="small" /> Optional Details
      </Typography>
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>
          Offer Letter Received
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup
            row
            name="offerLetterReceived"
            value={companyDetails.offerLetterReceived}
            onChange={handleCompanyDetailsChange}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>
          Completion Letter
        </Typography>
        <Box
          sx={{
            border: '2px dashed #777',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#f0f0f0',
            },
          }}
        >
          <label htmlFor="upload-file" style={{ cursor: 'pointer' }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <FaCloudUploadAlt size={20} color="#777" />
              <Typography variant="body2" color="textSecondary" mt={0.5} style={{ fontSize: '0.7rem' }}>
                Drag and Drop your Completion Letter here
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ fontSize: '0.7rem' }}>
                -OR-
              </Typography>
              <Button
                variant="contained"
                component="span"
                sx={{
                  mt: 0.5,
                  backgroundColor: '#5a36a2',
                  '&:hover': { backgroundColor: '#462f87' },
                  fontSize: '0.65rem',
                  borderRadius: '8px',
                }}
              >
                Browse files
              </Button>
            </Box>
            <input
              id="upload-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCompanyDetails({ ...companyDetails, completionLetter: e.target.files[0] })}
              style={{ display: 'none' }}
            />
          </label>
        </Box>
        {companyDetails.completionLetter && (
          <Box display="flex" alignItems="center" mt={2}>
            <Typography>{companyDetails.completionLetter.name}</Typography>
            <IconButton onClick={() => setCompanyDetails({ ...companyDetails, completionLetter: null })}>
              <Delete style={{ color: 'red' }} />
            </IconButton>
          </Box>
        )}
      </Box>

      <Divider style={{ margin: '20px 0' }} />

      {/* Navigation Buttons */}
      <Grid container spacing={3} justifyContent="space-between">
        <Grid item>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBack />}
            onClick={handlePrevious}
            disabled={saveLoading || submitLoading}
          >
            Previous
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAndNext}
            disabled={saveLoading || submitLoading}
          >
            {saveLoading ? <CircularProgress size={24} /> : 'Save & Next'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );

  const renderDocumentsUpload = () => (
    <form>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="Intern ID"
          value={internId}
          onChange={(e) => setInternId(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
          size="small"
          style={{ width: '200px' }}
        />
        <Typography variant="h4" align="center" gutterBottom style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginTop: '40px' }}>
          <Description fontSize="large" style={{ marginRight: '10px' }} />
          Documents Upload
        </Typography>
        <div style={{ width: '200px' }}></div>
      </Box>
      <Typography variant="h6" align="center" style={{ marginBottom: '20px' }}>
        Please upload the required documents below:
      </Typography>
      <Grid container spacing={3}>
        {/* Left Side - Upload Section */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Adhaar Card Upload */}
            <Typography variant="h6" gutterBottom>
              <PictureAsPdf fontSize="small" /> Upload Adhaar Card (PDF)
            </Typography>
            <Box display="flex" alignItems="center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleDocumentsUploadChange(e, 'adhaarCard')}
                style={{ display: 'none' }}
                id="upload-adhaar"
              />
              <label htmlFor="upload-adhaar">
                <Tooltip title="Upload the file">
                  <IconButton
                    color="primary"
                    component="span"
                    onClick={() => setSnackbarMessage('Upload the file')}
                  >
                    <CloudUpload />
                  </IconButton>
                </Tooltip>
              </label>
              {documentsUpload.adhaarCard && <LinearProgress variant="determinate" value={progress.adhaarCard} style={{ width: '100%', marginLeft: '10px' }} />}
            </Box>
            <hr style={{ margin: '16px 0', border: '1px solid #ccc' }} />

            {/* Bonafide Certificate Upload */}
            <Typography variant="h6" gutterBottom>
              <Description fontSize="small" /> Upload Bonafide Certificate (PDF)
            </Typography>
            <Box display="flex" alignItems="center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleDocumentsUploadChange(e, 'bonafideCertificate')}
                style={{ display: 'none' }}
                id="upload-bonafide"
              />
              <label htmlFor="upload-bonafide">
                <Tooltip title="Upload the file">
                  <IconButton
                    color="primary"
                    component="span"
                    onClick={() => setSnackbarMessage('Upload the file')}
                  >
                    <CloudUpload />
                  </IconButton>
                </Tooltip>
              </label>
              {documentsUpload.bonafideCertificate && <LinearProgress variant="determinate" value={progress.bonafideCertificate} style={{ width: '100%', marginLeft: '10px' }} />}
            </Box>
            <hr style={{ margin: '16px 0', border: '1px solid #ccc' }} />

            {/* College ID Upload */}
            <Typography variant="h6" gutterBottom>
              <PermIdentity fontSize="small" /> Upload College ID (PDF)
            </Typography>
            <Box display="flex" alignItems="center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleDocumentsUploadChange(e, 'collegeId')}
                style={{ display: 'none' }}
                id="upload-college-id"
              />
              <label htmlFor="upload-college-id">
                <Tooltip title="Upload the file">
                  <IconButton
                    color="primary"
                    component="span"
                    onClick={() => setSnackbarMessage('Upload the file')}
                  >
                    <CloudUpload />
                  </IconButton>
                </Tooltip>
              </label>
              {documentsUpload.collegeId && <LinearProgress variant="determinate" value={progress.collegeId} style={{ width: '100%', marginLeft: '10px' }} />}
            </Box>
            <hr style={{ margin: '16px 0', border: '1px solid #ccc' }} />

            {/* Resume Upload */}
            <Typography variant="h6" gutterBottom>
              <AssignmentInd fontSize="small" /> Upload Resume (PDF)
            </Typography>
            <Box display="flex" alignItems="center">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleDocumentsUploadChange(e, 'resume')}
                style={{ display: 'none' }}
                id="upload-resume"
              />
              <label htmlFor="upload-resume">
                <Tooltip title="Upload the file">
                  <IconButton
                    color="primary"
                    component="span"
                    onClick={() => setSnackbarMessage('Upload the file')}
                  >
                    <CloudUpload />
                  </IconButton>
                </Tooltip>
              </label>
              {documentsUpload.resume && <LinearProgress variant="determinate" value={progress.resume} style={{ width: '100%', marginLeft: '10px' }} />}
            </Box>
            <hr style={{ margin: '16px 0', border: '1px solid #ccc' }} />

            {/* Photo Upload */}
            <Typography variant="h6" gutterBottom>
              <CameraAlt fontSize="small" /> Upload Photo
            </Typography>
            <Box display="flex" alignItems="center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleDocumentsUploadChange(e, 'photo')}
                style={{ display: 'none' }}
                id="upload-photo"
              />
              <label htmlFor="upload-photo">
                <Tooltip title="Upload the file">
                  <IconButton
                    color="primary"
                    component="span"
                    onClick={() => setSnackbarMessage('Upload the file')}
                  >
                    <CloudUpload />
                  </IconButton>
                </Tooltip>
              </label>
              {documentsUpload.photo && <LinearProgress variant="determinate" value={progress.photo} style={{ width: '100%', marginLeft: '10px' }} />}
            </Box>
          </Box>
        </Grid>

        {/* Right Side - Preview Section */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Adhaar Card Preview */}
            {documentsUpload.adhaarCard && (
              <Card style={{ marginBottom: '20px' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
                  <Typography>
                    <PictureAsPdf /> {documentsUpload.adhaarCard.name}
                  </Typography>
                  <IconButton onClick={() => handleDeleteFile('adhaarCard')}>
                    <Delete style={{ color: 'red' }} />
                  </IconButton>
                </Box>
              </Card>
            )}

            {/* Bonafide Certificate Preview */}
            {documentsUpload.bonafideCertificate && (
              <Card style={{ marginBottom: '20px' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
                  <Typography>
                    <Description /> {documentsUpload.bonafideCertificate.name}
                  </Typography>
                  <IconButton onClick={() => handleDeleteFile('bonafideCertificate')}>
                    <Delete style={{ color: 'red' }} />
                  </IconButton>
                </Box>
              </Card>
            )}

            {/* College ID Preview */}
            {documentsUpload.collegeId && (
              <Card style={{ marginBottom: '20px' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
                  <Typography>
                    <PermIdentity /> {documentsUpload.collegeId.name}
                  </Typography>
                  <IconButton onClick={() => handleDeleteFile('collegeId')}>
                    <Delete style={{ color: 'red' }} />
                  </IconButton>
                </Box>
              </Card>
            )}

            {/* Resume Preview */}
            {documentsUpload.resume && (
              <Card style={{ marginBottom: '20px' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
                  <Typography>
                    <AssignmentInd /> {documentsUpload.resume.name}
                  </Typography>
                  <IconButton onClick={() => handleDeleteFile('resume')}>
                    <Delete style={{ color: 'red' }} />
                  </IconButton>
                </Box>
              </Card>
            )}

            {/* Photo Preview */}
            {documentsUpload.photo && (
              <Card style={{ marginBottom: '20px' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
                  <Typography>
                    <CameraAlt /> {documentsUpload.photo.name}
                  </Typography>
                  <IconButton onClick={() => handleDeleteFile('photo')}>
                    <Delete style={{ color: 'red' }} />
                  </IconButton>
                </Box>
                <CardMedia
                  component="img"
                  image={URL.createObjectURL(documentsUpload.photo)}
                  alt="Uploaded Photo"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Terms and Conditions Checkbox */}
      <Box display="flex" justifyContent="center" style={{ marginTop: '20px' }}>
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
            <Info />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Navigation Buttons */}
      <Grid container spacing={3} justifyContent="space-between" style={{ marginTop: '20px' }}>
        <Grid item>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBack />}
            onClick={handlePrevious}
            disabled={saveLoading || submitLoading}
          >
            Previous
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saveLoading || submitLoading}
          >
            {saveLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Grid>
      </Grid>

      {/* Submit Button */}
      <Box display="flex" justifyContent="center" style={{ marginTop: '20px' }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircle />}
          onClick={handleSubmit}
          disabled={saveLoading || submitLoading || !agreeToTerms}
        >
          {submitLoading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </Box>
    </form>
  );

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return renderPersonalDetails();
      case 1:
        return renderCollegeInformation();
      case 2:
        return renderCompanyDetails();
      case 3:
        return renderDocumentsUpload();
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container component="main" maxWidth="md" style={{ marginTop: '20px' }}>
        {renderSection()}

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Dialog for Terms and Conditions */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <VerifiedUser style={{ marginRight: '10px' }} />
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
      </Container>
    </LocalizationProvider>
  );
};

export default CombinedForm;