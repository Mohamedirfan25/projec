import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Box,
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
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  DateRange,
  Work,
  Domain,
  AccessTime,
  Schedule as ScheduleIcon,
  Male,
  Female,
  AttachMoney,
  Create,
  People,
  BusinessCenter,
  HowToReg as RegisterIcon,
  Business,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

const StaffCreationForm = ({ switchToRegister, formData }) => {
  const [staffData, setStaffData] = useState({
    staffId: '',
    staffName: '',
    teamName: '',
    department: '',
    workUndertaken: [], // Initialize as empty array
    mobileNumber: '',
    email: '',
    staffDomain: '',
    staffTiming: '',
    loginTime: null,
    joinDate: null,
    endDate: null,
    dob: null,
    gender: '',
    location: '',
  });


  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [domainOptions, setDomainOptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/Sims/domains/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
  
        setDomainOptions(response.data);
      } catch (err) {
        console.error("Failed to fetch domains:", err.response?.data || err.message);
      }
    };
  
    fetchDomains();
  }, []);

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
          console.log("Departments:", data);
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
  
  useEffect(() => {
    if (formData) {
      setStaffData({
        staffId: formData.staffId || '',
        staffName: formData.staffName || '',
        teamName: formData.teamName || '',
        department: formData.department || '',
        workUndertaken: formData.workUndertaken || [], // Ensure array exists
        mobileNumber: formData.mobileNumber || '',
        email: formData.email || '',
        staffDomain: formData.staffDomain || '',
        staffTiming: formData.staffTiming || '',
        loginTime: formData.loginTime || null,
        joinDate: formData.joinDate || null,
        endDate: formData.endDate || null,
        dob: formData.dob || null,
        gender: formData.gender || '',
        location: formData.location || '',
      });
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffData({ ...staffData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === 'staffTiming') {
      setStaffData({ ...staffData, [name]: checked ? e.target.value : '' });
    } else {
      setStaffData({
        ...staffData,
        workUndertaken: checked
          ? [...staffData.workUndertaken, e.target.value]
          : staffData.workUndertaken.filter((item) => item !== e.target.value),
      });
    }
  };

  const handleDateChange = (name, date) => {
    setStaffData({ ...staffData, [name]: date });
  };

  const handleTimeChange = (name, time) => {
    setStaffData({ ...staffData, [name]: time });
  };

  const isFormValid = () => {
    return (
      staffData.staffId &&
      staffData.staffName &&
      staffData.teamName &&
      staffData.department &&
      staffData.workUndertaken.length > 0 &&
      staffData.mobileNumber &&
      staffData.email &&
      staffData.staffDomain &&
      staffData.staffTiming &&
      staffData.loginTime &&
      staffData.joinDate &&
      staffData.dob &&
      staffData.gender &&
      staffData.location
    );
  };

  const handleSave = () => {
    if (!isFormValid()) {
      setSnackbarMessage('Please fill in all required fields.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } else {
      setConfirmationOpen(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
  
      const payload = {
        team_name: staffData.teamName,
        shift_timing: staffData.staffTiming,
        domain: staffData.staffDomain,
        start_date: staffData.joinDate?.toISOString().split("T")[0],
        end_date: staffData.endDate?.toISOString().split("T")[0],
        duration: "3Month",
        days: "mon-fri",
        scheme: "FREE",
        user_status: "active",
        department: staffData.department || "Academy",
        reporting_manager_username: "staff1",
        reporting_supervisor_username: "staff1",
        is_attendance_access: staffData.workUndertaken.includes("Attendance Management"),
        is_payroll_access: staffData.workUndertaken.includes("Payment Management"),
        is_internmanagement_access: staffData.workUndertaken.includes("Intern Management"),
        is_assert_access: staffData.workUndertaken.includes("Asset Management"),
      };
      
      await axios.patch(
        `http://localhost:8000/Sims/user-data/${staffData.staffId}/`,
        payload,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const payload2 = {
        email: staffData.email,
        phone_no: staffData.mobileNumber,
        date_of_birth: staffData.dob?.toISOString().split("T")[0],
        gender: staffData.gender,
        address1: staffData.location,
      }
      await axios.put(
        `http://localhost:8000/Sims/personal-data/${staffData.staffId}/`,
        payload2,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const payload3 = {
        email: staffData.email
        
      }
      await axios.patch(
        `http://localhost:8000/Sims/user/update/${staffData.staffId}/`,
        payload3,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      setSnackbarMessage("Staff data updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response data:", JSON.stringify(err.response.data, null, 2));
        alert("Update failed:\n" + JSON.stringify(err.response.data, null, 2));
      } else {
        console.error("Unknown error:", err.message);
        alert("Unknown error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmationClose = (confirmed) => {
    setConfirmationOpen(false);
    if (confirmed) {
      handleSubmit();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container component="main" maxWidth="md" style={{ marginTop: '20px', marginBottom: '20px' }}>

        <Card elevation={6} sx={{ p: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              <PersonIcon fontSize="large" style={{ color: '#3f51b5', marginRight: '10px' }} />
              Edit Staff Details
            </Typography>
            <form>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Staff ID"
                    name="staffId"
                    value={staffData.staffId}
                    onChange={handleChange}
                  />
                  {/* <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleFetchStaffData}
                    sx={{ mt: 1 }}
                  >
                    Fetch Staff Info
                  </Button> */}
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Staff Name"
                    name="staffName"
                    value={staffData.staffName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <PersonIcon fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                    }}
                  />
                </Grid>
              </Grid>

              <Divider style={{ margin: '20px 0' }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <Domain fontSize="small" /> Team Name
                  </Typography>
                  <TextField
                    fullWidth
                    label="Team Name"
                    name="teamName"
                    value={staffData.teamName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <Domain fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <Work fontSize="small" /> Department
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department"
                      value={staffData.department}
                      onChange={handleChange}
                      label="Department"
                    >
                      {departments.map((department) => (
                        <MenuItem key={department.id} value={department.department}>
                          {department.department}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider style={{ margin: '20px 0' }} />

              <Typography variant="h6" gutterBottom>
                <Work fontSize="small" /> Work Undertaken
              </Typography>
              <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="workUndertaken"
                            value="Payment Management"
                            checked={staffData.workUndertaken.includes('Payment Management')}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <AttachMoney fontSize="small" style={{ marginRight: '8px' }} />
                            Payment Management
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="workUndertaken"
                            value="Intern Management"
                            checked={staffData.workUndertaken.includes('Intern Management')}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <Create fontSize="small" style={{ marginRight: '8px' }} />
                            Intern Management
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="workUndertaken"
                            value="Attendance Management"
                            checked={staffData.workUndertaken.includes('Attendance Management')}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                                    <People fontSize="small" style={{ marginRight: '8px' }} />
                                    Attendance Management
                                  </Box>
                                }
                              />
                            </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="workUndertaken"
                            value="Asset Management"
                            checked={staffData.workUndertaken.includes('Asset Management')}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <BusinessCenter fontSize="small" style={{ marginRight: '8px' }} />
                            Asset Management
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Divider style={{ margin: '20px 0' }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <PhoneIcon fontSize="small" /> Mobile Number
                  </Typography>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    name="mobileNumber"
                    value={staffData.mobileNumber}
                    onChange={handleChange}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    InputProps={{
                      startAdornment: <PhoneIcon fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <EmailIcon fontSize="small" /> Email
                  </Typography>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={staffData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <EmailIcon fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                    }}
                  />
                </Grid>
              </Grid>

              <Divider style={{ margin: '20px 0' }} />

              <Typography variant="h6" gutterBottom>
                <Domain fontSize="small" /> Staff Domain
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Staff Domain</InputLabel>
                <Select
                  name="staffDomain"
                  value={staffData.staffDomain}
                  onChange={handleChange}
                  label="Staff Domain"
                >
                  {domainOptions.map((domainObj) => (
                    <MenuItem key={domainObj.id} value={domainObj.domain}>
                      {domainObj.domain}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider style={{ margin: '20px 0' }} />

              <Typography variant="h6" gutterBottom>
                <ScheduleIcon fontSize="small" /> Staff Timing
              </Typography>
              <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="staffTiming"
                            value="Full Time"
                            checked={staffData.staffTiming === 'Full Time'}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <AccessTime fontSize="small" style={{ marginRight: '8px' }} />
                            Full Time
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="staffTiming"
                            value="Half Time"
                            checked={staffData.staffTiming === 'Half Time'}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <ScheduleIcon fontSize="small" style={{ marginRight: '8px' }} />
                            Half Time
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Divider style={{ margin: '20px 0' }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <ScheduleIcon fontSize="small" /> Login Time
                  </Typography>
                  <TimePicker
                    label="Login Time"
                    value={staffData.loginTime}
                    onChange={(time) => handleTimeChange('loginTime', time)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        InputProps={{
                          startAdornment: <ScheduleIcon fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <DateRange fontSize="small" /> Join Date
                  </Typography>
                  <DatePicker
                    label="Join Date"
                    value={staffData.joinDate}
                    onChange={(date) => handleDateChange('joinDate', date)}
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

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <DateRange fontSize="small" /> Date of Birth
                  </Typography>
                  <DatePicker
                    label="Date of Birth"
                    value={staffData.dob}
                    onChange={(date) => handleDateChange('dob', date)}
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
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <PersonIcon fontSize="small" /> Gender
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      row
                      name="gender"
                      value={staffData.gender}
                      onChange={handleChange}
                    >
                      <FormControlLabel 
                        value="M" 
                        control={<Radio />} 
                        label={
                          <Box display="flex" alignItems="center">
                            <Male fontSize="small" style={{ marginRight: '8px' }} />
                            Male
                          </Box>
                        } 
                      />
                      <FormControlLabel 
                        value="F" 
                        control={<Radio />} 
                        label={
                          <Box display="flex" alignItems="center">
                            <Female fontSize="small" style={{ marginRight: '8px' }} />
                            Female
                          </Box>
                        } 
                      />
                      <FormControlLabel value="O" control={<Radio />} label="Other" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider style={{ margin: '20px 0' }} />

              <Typography variant="h6" gutterBottom>
                <Business fontSize="small" /> Location
              </Typography>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={staffData.location}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Business fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                }}
              />

              <Divider style={{ margin: '20px 0' }} />

              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={loading}
                  startIcon={<RegisterIcon />}
                  size="large"
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    minWidth: '770px'
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        <Dialog open={confirmationOpen} onClose={() => handleConfirmationClose(false)}>
          <DialogTitle>Confirm Save</DialogTitle>
          <DialogContent>Are you sure you want to save and proceed?</DialogContent>
          <DialogActions>
            <Button onClick={() => handleConfirmationClose(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={() => handleConfirmationClose(true)} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default StaffCreationForm;