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

const StaffRegistrationForm = ({ switchToUpdate, setFormDataForUpdate }) => {
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
  
        setDomainOptions(response.data);
      } catch (err) {
        console.error("Failed to fetch domains:", err.response?.data || err.message);
      }
    };
  
    fetchDomains();
  }, []);
  
  useEffect(() => {
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

    if (formData.role === "intern" && !formData.department) {
      newErrors.department = "Department is required for interns";
    }

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

      setFormDataForUpdate({
        staffId: formData.username,
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

export default StaffRegistrationForm;