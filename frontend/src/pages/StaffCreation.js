import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent
} from '@mui/material';
import {
  Business,
  Email,
  CalendarToday,
  Work,
  Domain,
  DateRange,
  Person,
  Phone,
  LocationOn,
  Schedule,
  Male,
  Female,
  AttachMoney,
  Create,
  People,
  BusinessCenter,
  AccessTime,
  Schedule as ScheduleIcon,
  HowToReg
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import axios from 'axios'; // At the top

const StaffCreation = () => {
  const [formData, setFormData] = useState({
    staffId: '',
    staffName: '',
    teamName: '',
    role: '',
    workUndertaken: [],
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === 'staffTiming') {
      setFormData({ ...formData, [name]: checked ? e.target.value : '' });
    } else {
      setFormData({
        ...formData,
        workUndertaken: checked
          ? [...formData.workUndertaken, e.target.value]
          : formData.workUndertaken.filter((item) => item !== e.target.value),
      });
    }
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleTimeChange = (name, time) => {
    setFormData({ ...formData, [name]: time });
  };

  const isFormValid = () => {
    return (
      formData.staffId &&
      formData.staffName &&
      formData.teamName && // ✅ Correct field
      formData.role &&
      formData.workUndertaken.length > 0 &&
      formData.mobileNumber &&
      formData.email &&
      formData.staffDomain &&
      formData.staffTiming &&
      formData.loginTime &&
      formData.joinDate &&
      formData.dob &&
      formData.gender &&
      formData.location
    );
  };
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/Sims/domains/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
  
        setDomainOptions(response.data); // assuming response.data is an array of domain strings
      } catch (err) {
        console.error("Failed to fetch domains:", err.response?.data || err.message);
      }
    };
  
    fetchDomains();
  }, []);
  
  

  const handleSave = () => {
    if (!isFormValid()) {
      setSnackbarMessage('Please fill in all required fields.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } else {
      setConfirmationOpen(true);
    }
  };

  
  const handleFetchStaffData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/Sims/user-data/${formData.staffId}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
  
      const data = response.data;
  
      setFormData((prev) => ({
        ...prev,
        staffName: data.username || "",
        email: data.temp_details?.email || "",
        staffDomain: data.domain_name || data.domain || "",
        staffTiming: data.shift_timing || "",
        teamName: data.team_name || "",
        joinDate: data.start_date ? new Date(data.start_date) : null,
        endDate: data.end_date ? new Date(data.end_date) : null,
        workUndertaken: [
          ...(data.is_attendance_access ? ["Attendance"] : []),
          ...(data.is_payroll_access ? ["Payroll"] : []),
          ...(data.is_internmanagement_access ? ["Intern Management"] : []),
          ...(data.is_assert_access ? ["Assets"] : []),
        ],
        // Keep existing values for fields not in response
        loginTime: prev.loginTime,
        dob: prev.dob,
        gender: prev.gender,
        location: prev.location,
        mobileNumber: prev.mobileNumber,
      }));
      
  
      setSnackbarMessage("Staff data loaded successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage("Staff not found.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error("Fetch error:", err.response?.data || err.message);
    }
  };
  
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
  
      const payload = {
        team_name: formData.teamName,
        shift_timing: formData.staffTiming,
        domain: formData.staffDomain,
        start_date: formData.joinDate?.toISOString().split("T")[0],
        end_date: formData.endDate?.toISOString().split("T")[0],
        duration: "3Month",
        days: "mon-fri",
        scheme: "FREE",
        user_status: "active",
        department: "Academy",
        role: formData.role || "intern",
        reporting_manager_username: "staff1",
        reporting_supervisor_username: "staff1",
        is_attendance_access: formData.workUndertaken.includes("Attendance"),
        is_payroll_access: formData.workUndertaken.includes("Payroll"),
        is_internmanagement_access: formData.workUndertaken.includes("Intern Management"),
        is_assert_access: formData.workUndertaken.includes("Assets"),
      };
      
      
      
  
      await axios.patch(
        `http://localhost:8000/Sims/user-data/${formData.staffId}/`,
        payload,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Sending PATCH to:", formData.staffId);
console.log("Payload:", payload);

  
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
              <Person fontSize="large" style={{ color: '#3f51b5', marginRight: '10px' }} />
              Staff Creation
            </Typography>
            <form>
              {/* First Row - Staff ID and Staff Name */}
              <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
  <TextField
    fullWidth
    label="Staff ID"
    name="staffId"
    value={formData.staffId}
    onChange={handleChange}
  />
  <Button
    variant="outlined"
    color="primary"
    onClick={handleFetchStaffData}
    sx={{ mt: 1 }}
  >
    Fetch Staff Info
  </Button>
</Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Staff Name"
                    name="staffName"
                    value={formData.staffName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <Person fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                    }}
                  />
                </Grid>
              </Grid>

              <Divider style={{ margin: '20px 0' }} />

              {/* Second Row - Team Number and Role */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <Domain fontSize="small" /> Team Name
                  </Typography>
                  <TextField
                    fullWidth
                    label="Team Name"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <Domain fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <Work fontSize="small" /> Role
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      label="Role"
                    >
                      <MenuItem value="Trainer">Trainer</MenuItem>
                      <MenuItem value="Software Developer">Software Developer</MenuItem>
                      <MenuItem value="Data Analyst">Data Analyst</MenuItem>
                      <MenuItem value="Project Manager">Project Manager</MenuItem>
                      <MenuItem value="HR Manager">HR Manager</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider style={{ margin: '20px 0' }} />

              {/* Work Undertaken Section */}
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
                            value="Payroll"
                            checked={formData.workUndertaken.includes('Payroll')}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <AttachMoney fontSize="small" style={{ marginRight: '8px' }} />
                            Payroll
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="workUndertaken"
                            value="Creation"
                            checked={formData.workUndertaken.includes('Creation')}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <Create fontSize="small" style={{ marginRight: '8px' }} />
                            Creation & Update
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="workUndertaken"
                            value="Counseling"
                            checked={formData.workUndertaken.includes('Counseling')}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <People fontSize="small" style={{ marginRight: '8px' }} />
                            Attendance
                          </Box>
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="workUndertaken"
                            value="Handling"
                            checked={formData.workUndertaken.includes('Handling')}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <BusinessCenter fontSize="small" style={{ marginRight: '8px' }} />
                            Asset
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Divider style={{ margin: '20px 0' }} />

              {/* Third Row - Mobile Number and Email */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <Phone fontSize="small" /> Mobile Number
                  </Typography>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    InputProps={{
                      startAdornment: <Phone fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <Email fontSize="small" /> Email
                  </Typography>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <Email fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                    }}
                  />
                </Grid>
              </Grid>

              <Divider style={{ margin: '20px 0' }} />

              {/* Staff Domain Section */}
              <Typography variant="h6" gutterBottom>
                <Domain fontSize="small" /> Staff Domain
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Staff Domain</InputLabel>
                <Select
  name="staffDomain"
  value={formData.staffDomain}
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

              {/* Staff Timing Section */}
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
                            checked={formData.staffTiming === 'Full Time'}
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
                            checked={formData.staffTiming === 'Half Time'}
                            onChange={handleCheckboxChange}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <Schedule fontSize="small" style={{ marginRight: '8px' }} />
                            Half Time
                          </Box>
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Divider style={{ margin: '20px 0' }} />

              {/* Fourth Row - Login Time and Join Date */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <Schedule fontSize="small" /> Login Time
                  </Typography>
                  <TimePicker
                    label="Login Time"
                    value={formData.loginTime}
                    onChange={(time) => handleTimeChange('loginTime', time)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        InputProps={{
                          startAdornment: <Schedule fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
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
                    value={formData.joinDate}
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

              {/* Fifth Row - Date of Birth and Gender */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    <DateRange fontSize="small" /> Date of Birth
                  </Typography>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.dob}
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
                    <Person fontSize="small" /> Gender
                  </Typography>
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      row
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <FormControlLabel 
                        value="Male" 
                        control={<Radio />} 
                        label={
                          <Box display="flex" alignItems="center">
                            <Male fontSize="small" style={{ marginRight: '8px' }} />
                            Male
                          </Box>
                        } 
                      />
                      <FormControlLabel 
                        value="Female" 
                        control={<Radio />} 
                        label={
                          <Box display="flex" alignItems="center">
                            <Female fontSize="small" style={{ marginRight: '8px' }} />
                            Female
                          </Box>
                        } 
                      />
                      <FormControlLabel value="Other" control={<Radio />} label="Other" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider style={{ margin: '20px 0' }} />

              {/* Location Section */}
              <Typography variant="h6" gutterBottom>
                <LocationOn fontSize="small" /> Location
              </Typography>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <LocationOn fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
                }}
              />

              <Divider style={{ margin: '20px 0' }} />

              {/* Submit Button */}
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={loading}
                  startIcon={<HowToReg />}
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

        {/* Confirmation Dialog */}
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
      </Container>
    </LocalizationProvider>
  );
};

export default StaffCreation;