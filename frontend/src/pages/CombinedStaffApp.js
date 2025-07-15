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
  InputAdornment,
  IconButton,
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
  Lock as LockIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  AssignmentInd,
  HowToReg as RegisterIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Business,
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
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

const CombinedStaffForm = ({ switchToUpdate, setFormDataForUpdate }) => {
  // Registration Form State
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

  const [departments, setDepartments] = useState([
    { id: 1, department: "HR" },
    { id: 2, department: "IT" },
    { id: 3, department: "Finance" },
    { id: 4, department: "Operations" },
    { id: 5, department: "Marketing" }
  ]);



  const [errors, setErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [domainOptions, setDomainOptions] = useState([]);
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
  
  useEffect(() => {
    // If formData is passed from CombinedStaffForm, use it to populate the form
    if (formData) {
      setFormData(formData);
    }
  }, [formData]);

  const roles = [
    { value: "intern", label: "Intern" },
    { value: "staff", label: "Staff" },
    { value: "admin", label: "Admin" },
    { value: "hr", label: "HR" },
  ];

  const apiUrl = "http://localhost:8000/Sims/register/";

  useEffect(() => {
    const fetchDepartmentsAndDomains = async () => {
      try {
        const token = localStorage.getItem("token");
        // You can keep the API calls here if needed, but we're using predefined data
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDepartmentsAndDomains();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "mobile" ? value.replace(/\D/g, "") : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === "staffTiming") {
      setFormData({ ...formData, [name]: checked ? e.target.value : "" });
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";

    // Department is required only for interns
    if (formData.role === "intern" && !formData.department) {
      newErrors.department = "Department is required for interns";
    }

    // Staff creation validation
    if (!formData.teamName) newErrors.teamName = "Team name is required";
    if (formData.workUndertaken.length === 0) newErrors.workUndertaken = "At least one work area is required";
    if (!formData.staffDomain) newErrors.staffDomain = "Staff domain is required";
    if (!formData.staffTiming) newErrors.staffTiming = "Staff timing is required";
    if (!formData.loginTime) newErrors.loginTime = "Login time is required";
    if (!formData.joinDate) newErrors.joinDate = "Join date is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.location) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setConfirmationOpen(true);
  };

  const handleConfirmationClose = async (confirmed) => {
    setConfirmationOpen(false);
    if (!confirmed) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // First, register the user
      const postData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        department: formData.department,
      };

      const registerResponse = await axios.post(apiUrl, postData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      // Update staff data if registration was successful
      const staffPayload = {
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
        staffPayload,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSnackbarMessage("User registered and staff data updated successfully!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      // Set the form data for update before resetting
      setFormDataForUpdate({
        staffId: formData.username, // Using username as staffId
        staffName: `${formData.first_name} ${formData.last_name}`,
        teamName: formData.teamName,
        role: formData.role,
        workUndertaken: formData.workUndertaken,
        mobileNumber: formData.mobile,
        email: formData.email,
        staffDomain: formData.staffDomain,
        staffTiming: formData.staffTiming,
        loginTime: formData.loginTime,
        joinDate: formData.joinDate,
        endDate: formData.endDate,
        dob: formData.dob,
        gender: formData.gender,
        location: formData.location,
      });

      // Reset form
      setFormData({
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
        mobile: "",
        department: "",
        role: "intern",
        teamName: "",
        workUndertaken: [],
        staffDomain: "",
        staffTiming: "",
        loginTime: null,
        joinDate: null,
        endDate: null,
        dob: null,
        gender: "",
        location: "",
      });
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          "Registration failed. Please try again.";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md">
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Button variant="contained" color="primary" size="small">Register Staff Creation</Button>
          <Button 
            variant="outlined" 
            size="small" 
            color="secondary"
            onClick={switchToUpdate}
          >
            Update Staff Creation
          </Button>
        </Box>

        <Box
          sx={{
            mt: 1,
            mb: 4,
            p: 4,
            boxShadow: 6,
            borderRadius: 2,
            backgroundColor: "background.paper",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              color: "text.primary",
              fontWeight: "bold",
              mb: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <RegisterIcon fontSize="large" />
            User Registration & Staff Creation
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Registration Section */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <AssignmentInd fontSize="medium" />
                Registration Details
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* First Row - Username and Password */}
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
                        <PersonIcon />
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
                        <LockIcon />
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

              {/* Second Row - First Name and Last Name */}
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
                        <BadgeIcon />
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
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Third Row - Email and Mobile */}
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
                        <EmailIcon />
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
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Department and Role */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.department}>
                  <InputLabel id="department-label">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Business fontSize="small" /> Department
                    </Box>
                  </InputLabel>
                  <Select
                    labelId="department-label"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    label="Department"
                    disabled={formData.role !== "intern"}
                    sx={{ textAlign: 'left' }}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.department} sx={{ minHeight: '36px' }}>
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
                  <InputLabel id="role-label">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AssignmentInd fontSize="small" /> Role
                    </Box>
                  </InputLabel>
                  <Select
                    labelId="role-label"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                    sx={{ textAlign: 'left' }}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value} sx={{ minHeight: '36px' }}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Staff Creation Section */}
            <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <Business fontSize="medium" />
                Staff Details
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* Team Name and Staff Domain */}
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
                        <People />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.staffDomain}>
                  
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

                  {errors.staffDomain && (
                    <Typography variant="caption" color="error">
                      {errors.staffDomain}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Work Undertaken Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                              checked={formData.workUndertaken.includes("Payroll")}
                              onChange={handleCheckboxChange}
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center">
                              <AttachMoney fontSize="small" style={{ marginRight: "8px" }} />
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
                              checked={formData.workUndertaken.includes("Creation")}
                              onChange={handleCheckboxChange}
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center">
                              <Create fontSize="small" style={{ marginRight: "8px" }} />
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
                              value="Attendance"
                              checked={formData.workUndertaken.includes("Attendance")}
                              onChange={handleCheckboxChange}
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center">
                              <People fontSize="small" style={{ marginRight: "8px" }} />
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
                              value="Assets"
                              checked={formData.workUndertaken.includes("Assets")}
                              onChange={handleCheckboxChange}
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center">
                              <BusinessCenter fontSize="small" style={{ marginRight: "8px" }} />
                              Asset
                            </Box>
                          }
                        />
                      </Grid>
                    </Grid>
                    {errors.workUndertaken && (
                      <Typography variant="caption" color="error">
                        {errors.workUndertaken}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Staff Timing */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" /> Staff Timing
                </Typography>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="staffTiming"
                              value="Full Time"
                              checked={formData.staffTiming === "Full Time"}
                              onChange={handleCheckboxChange}
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center">
                              <AccessTime fontSize="small" style={{ marginRight: "8px" }} />
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
                              checked={formData.staffTiming === "Half Time"}
                              onChange={handleCheckboxChange}
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center">
                              <ScheduleIcon fontSize="small" style={{ marginRight: "8px" }} />
                              Half Time
                            </Box>
                          }
                        />
                      </Grid>
                    </Grid>
                    {errors.staffTiming && (
                      <Typography variant="caption" color="error">
                        {errors.staffTiming}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Login Time and Join Date */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" /> Login Time
                </Typography>
                <TimePicker
                  label="Login Time"
                  value={formData.loginTime}
                  onChange={(time) => handleTimeChange("loginTime", time)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.loginTime}
                      helperText={errors.loginTime}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DateRange fontSize="small" /> Join Date
                </Typography>
                <DatePicker
                  label="Join Date"
                  value={formData.joinDate}
                  onChange={(date) => handleDateChange("joinDate", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.joinDate}
                      helperText={errors.joinDate}
                    />
                  )}
                />
              </Grid>

              {/* Date of Birth and Gender */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DateRange fontSize="small" /> Date of Birth
                </Typography>
                <DatePicker
                  label="Date of Birth"
                  value={formData.dob}
                  onChange={(date) => handleDateChange("dob", date)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.dob}
                      helperText={errors.dob}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" /> Gender
                </Typography>
                <FormControl component="fieldset" fullWidth error={!!errors.gender}>
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
                          <Male fontSize="small" style={{ marginRight: "8px" }} />
                          Male
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="Female"
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center">
                          <Female fontSize="small" style={{ marginRight: "8px" }} />
                          Female
                        </Box>
                      }
                    />
                    <FormControlLabel value="Other" control={<Radio />} label="Other" />
                  </RadioGroup>
                  {errors.gender && (
                    <Typography variant="caption" color="error">
                      {errors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Location */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business fontSize="small" /> Location
                </Typography>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  error={!!errors.location}
                  helperText={errors.location}
                />
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 4 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                size="large"
                startIcon={<RegisterIcon />}
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                {loading ? <CircularProgress size={24} /> : "REGISTER & SUBMIT"}
              </Button>
            </Grid>
          </form>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmationOpen}
          onClose={() => handleConfirmationClose(false)}
        >
          <DialogTitle>Confirm Registration</DialogTitle>
          <DialogContent>
            Are you sure you want to register this user and create staff record?
          </DialogContent>
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
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

const StaffCreation = ({ switchToRegister, formData }) => {
  const [staffData, setStaffData] = useState({
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
  
  useEffect(() => {
    // If formData is passed from CombinedStaffForm, use it to populate the form
    if (formData) {
      setStaffData(formData);
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
      staffData.role &&
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

  const handleFetchStaffData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/Sims/user-data/${staffData.staffId}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      const data = response.data;

      setStaffData((prev) => ({
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
        team_name: staffData.teamName,
        shift_timing: staffData.staffTiming,
        domain: staffData.staffDomain,
        start_date: staffData.joinDate?.toISOString().split("T")[0],
        end_date: staffData.endDate?.toISOString().split("T")[0],
        duration: "3Month",
        days: "mon-fri",
        scheme: "FREE",
        user_status: "active",
        department: "Academy",
        role: staffData.role || "intern",
        reporting_manager_username: "staff1",
        reporting_supervisor_username: "staff1",
        is_attendance_access: staffData.workUndertaken.includes("Attendance"),
        is_payroll_access: staffData.workUndertaken.includes("Payroll"),
        is_internmanagement_access: staffData.workUndertaken.includes("Intern Management"),
        is_assert_access: staffData.workUndertaken.includes("Assets"),
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
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Button 
            variant="outlined" 
            size="small" 
            color="primary"
            onClick={switchToRegister}
          >
            Register Staff Creation
          </Button>
          <Button variant="contained" color="secondary" size="small">Update Staff Creation</Button>
        </Box>

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
                    value={staffData.staffId}
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
                    value={staffData.staffName}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <PersonIcon fontSize="small" style={{ marginRight: '10px', color: '#777' }} />,
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
                    value={staffData.teamName}
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
                      value={staffData.role}
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
                            checked={staffData.workUndertaken.includes('Payroll')}
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
                            checked={staffData.workUndertaken.includes('Creation')}
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
                            value="Attendance"
                            checked={staffData.workUndertaken.includes('Attendance')}
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
                            value="Assets"
                            checked={staffData.workUndertaken.includes('Assets')}
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

              {/* Staff Domain Section */}
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

              {/* Fourth Row - Login Time and Join Date */}
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

              {/* Fifth Row - Date of Birth and Gender */}
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

              {/* Submit Button */}
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

const CombinedStaffApp = () => {
  const [currentView, setCurrentView] = useState('register');
  const [formDataForUpdate, setFormDataForUpdate] = useState(null);

  const switchToUpdate = () => {
    setCurrentView('update');
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  return (
    <>
      {currentView === 'register' ? (
        <CombinedStaffForm 
          switchToUpdate={switchToUpdate} 
          setFormDataForUpdate={setFormDataForUpdate} 
        />
      ) : (
        <StaffCreation 
          switchToRegister={switchToRegister} 
          formData={formDataForUpdate} 
        />
      )}
    </>
  );
};

export default CombinedStaffApp;