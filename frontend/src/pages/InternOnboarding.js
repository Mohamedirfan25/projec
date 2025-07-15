import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Chip,
  IconButton,
} from "@mui/material";
import {
  CloudUpload,
  Person,
  Description,
  DateRange,
  School,
  Work,
  LocationOn,
  Phone,
  Email,
  Delete,
  Add,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";

const InternOnboarding = () => {
  const [formData, setFormData] = useState({
    // Personal Details
    emp_id: "",
    phone: "",
    aadhar: "",
    gender: "",
    photo: null,

    // College Details
    reg_no: "",
    location: "",
    college_name: "",
    degree: "",
    college_department: "",
    year_of_passing: "",

    // User Data
    asset_code: "",
    start_date: null,
    end_date: null,
    duration: "",
    days: "",
    shift_timing: "morning",
    domain: "",
    scheme: "FREE",
    department: "",

    agreeTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [availableEmpIds, setAvailableEmpIds] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await axios.get(
          "http://localhost:8000/Sims/departments/"
        );
        setDepartments(deptResponse.data);

        // Fetch temps and filter interns
        const tempsResponse = await axios.get(
          "http://localhost:8000/Sims/temps/"
        );
        const interns = tempsResponse.data.filter(
          (temp) => temp.role === "intern"
        );

        // Check which interns don't have personal data
        const availableIds = await Promise.all(
          interns.map(async (intern) => {
            try {
              await axios.get(
                `http://localhost:8000/Sims/personal-data/${intern.emp_id}/`
              );
              return null; // Existing record found
            } catch (error) {
              if (error.response?.status === 404) {
                return intern.emp_id;
              }
              return null; 
            }
          })
        );

        setAvailableEmpIds(availableIds.filter((id) => id !== null));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.agreeTerms) {
        throw new Error("You must agree to the terms and conditions.");
      }

      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      // Personal Data
      const personalFormData = new FormData();
      personalFormData.append("emp_id", formData.emp_id);
      personalFormData.append("phone", formData.phone);
      personalFormData.append("aadhar", formData.aadhar);
      personalFormData.append("gender", formData.gender);
      if (formData.photo) {
        personalFormData.append("photo", formData.photo);
      }
      await axios.post(
        "http://localhost:8000/Sims/personal-data/",
        personalFormData,
        config
      );

      // College Details
      const collegeData = {
        emp_id: formData.emp_id,
        reg_no: formData.reg_no,
        location: formData.location,
        college_name: formData.college_name,
        degree: formData.degree,
        college_department: formData.college_department,
        year_of_passing: formData.year_of_passing,
      };
      await axios.post(
        "http://localhost:8000/Sims/college-details/",
        collegeData,
        config
      );

      // User Data
      const userData = {
        emp_id: formData.emp_id,
        asset_code: formData.asset_code,
        start_date: formData.start_date,
        end_date: formData.end_date,
        duration: formData.duration,
        days: formData.days,
        shift_timing: formData.shift_timing,
        domain: formData.domain,
        scheme: formData.scheme,
        department: formData.department,
      };
      await axios.post(
        "http://localhost:8000/Sims/user-data/",
        userData,
        config
      );

      setSnackbarMessage("Onboarding completed successfully!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage(
        error.response?.data?.message || error.message || "An error occurred"
      );
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container component="main" maxWidth="md">
        <Paper
          elevation={3}
          style={{ padding: "30px", marginTop: "30px", borderRadius: "8px" }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            style={{ fontWeight: "bold", marginBottom: "20px" }}
          >
            <Work
              fontSize="large"
              style={{ marginRight: "10px", verticalAlign: "middle" }}
            />
            Intern Onboarding
          </Typography>
          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <Typography
              variant="h6"
              gutterBottom
              style={{ marginBottom: "20px", fontWeight: "bold" }}
            >
              <Person
                fontSize="small"
                style={{ marginRight: "10px", verticalAlign: "middle" }}
              />
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Employee ID</InputLabel>
                  <Select
                    name="emp_id"
                    value={formData.emp_id}
                    onChange={handleChange}
                    required
                  >
                    {availableEmpIds.map((empId) => (
                      <MenuItem key={empId} value={empId}>
                        {empId}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Aadhar Number"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="photo-upload"
                  type="file"
                  name="photo"
                  onChange={handleFileChange}
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    startIcon={<Person />}
                    style={{ marginBottom: "10px" }}
                  >
                    Upload Photo
                  </Button>
                </label>
                {formData.photo && (
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <Avatar
                      alt="Preview"
                      src={URL.createObjectURL(formData.photo)}
                      style={{
                        width: "50px",
                        height: "50px",
                        marginRight: "10px",
                      }}
                    />
                    <IconButton
                      onClick={() => setFormData({ ...formData, photo: null })}
                      style={{ color: "red" }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </Grid>
            </Grid>

            {/* College Details Section */}
            <Divider style={{ margin: "30px 0" }} />
            <Typography
              variant="h6"
              gutterBottom
              style={{ marginBottom: "20px", fontWeight: "bold" }}
            >
              <School
                fontSize="small"
                style={{ marginRight: "10px", verticalAlign: "middle" }}
              />
              College Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  name="reg_no"
                  value={formData.reg_no}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="College Name"
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Degree"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="College Department"
                  name="college_department"
                  value={formData.college_department}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Year of Passing"
                  name="year_of_passing"
                  value={formData.year_of_passing}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            {/* User Data Section */}
            <Divider style={{ margin: "30px 0" }} />
            <Typography
              variant="h6"
              gutterBottom
              style={{ marginBottom: "20px", fontWeight: "bold" }}
            >
              <Work
                fontSize="small"
                style={{ marginRight: "10px", verticalAlign: "middle" }}
              />
              Employment Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) => handleDateChange("start_date", date)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(date) => handleDateChange("end_date", date)}
                  renderInput={(params) => <TextField fullWidth {...params} />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Shift Timing</InputLabel>
                  <Select
                    name="shift_timing"
                    value={formData.shift_timing}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="morning">Morning</MenuItem>
                    <MenuItem value="afternoon">Afternoon</MenuItem>
                    <MenuItem value="night">Night</MenuItem>
                    {console.log("hello")}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Scheme</InputLabel>
                  <Select
                    name="scheme"
                    value={formData.scheme}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="FREE">Free</MenuItem>
                    <MenuItem value="COURSE">Course</MenuItem>
                    <MenuItem value="PROJECT">Project</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.department}>
                        {dept.department}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            {/* Terms and Submit */}
            <Divider style={{ margin: "30px 0" }} />
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="I agree to the terms and conditions"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                style={{ marginTop: "20px" }}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Complete Onboarding"
                )}
              </Button>
            </Grid>
          </form>
        </Paper>

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

export default InternOnboarding;
