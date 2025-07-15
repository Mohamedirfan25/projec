import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  IconButton,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem, 
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Add, Edit, Delete, MoreVert } from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";


const InternHoursCalculator = () => {
  const [internName, setInternName] = useState("");
  const [internId, setInternId] = useState("");
  const [internDuration, setInternDuration] = useState({
    from: null,
    to: null,
  });

  const [shiftInTime, setShiftInTime] = useState(null);
  const [shiftOutTime, setShiftOutTime] = useState(null);
  const [inTime, setInTime] = useState(null);
  const [outTime, setOutTime] = useState(null);

  const [entries, setEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [filteredEntries, setFilteredEntries] = useState(entries);

  const [editIndex, setEditIndex] = useState(null);

  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const filterEntries = () => {
      if (selectedMonth && selectedYear) {
        const startDate = new Date(selectedYear, selectedMonth - 1, 1);
        const endDate = new Date(selectedYear, selectedMonth, 0);

        const filtered = entries.filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        });
        setFilteredEntries(filtered);
      } else {
        setFilteredEntries(entries);
      }
    };

    filterEntries();
  }, [selectedMonth, selectedYear, entries]);

  const handleAddEntry = async () => {
    if (!shiftInTime || !shiftOutTime || !inTime || !outTime) {
      setSnackbarMessage("Please fill all time fields.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const newEntry = {
      id: entries.length + 1,
      date: shiftInTime,
      shiftInTime,
      shiftOutTime,
      inTime,
      outTime,
      totalHours: calculateTotalHours(inTime, outTime),
    };

    try {
      if (editIndex !== null) {
        const updatedEntries = [...entries];
        updatedEntries[editIndex] = newEntry;
        setEntries(updatedEntries);
        setEditIndex(null);
      } else {
        setEntries([...entries, newEntry]);
      }

      setShiftInTime(null);
      setShiftOutTime(null);
      setInTime(null);
      setOutTime(null);

      setSnackbarMessage(
        editIndex !== null
          ? "Entry updated successfully!"
          : "Entry added successfully!"
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Failed to save entry.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const [userSummary, setUserSummary] = useState({
    total_days: 0,
    present_days: 0,
    absent_days: 0,
    remaining_leave: 0,
    extra_leave: 0,
    pending_leave_requests: 0
  });
  
  
  

  
  
  const [internDetails, setInternDetails] = useState({
    name: "",
    empId: "",
    createdMonth: "",
    createdYear: "",
  });
 

  const fetchPersonalData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
  
      if (!token) {
        console.error("No auth token found in localStorage!");
        return;
      }
  
      const response = await axios.get("http://localhost:8000/Sims/personal-data/", {
        headers: { Authorization: `Token ${token}` },
      });
  
      console.log("Personal Data API Response:", response.data);
  
      if (response.data && !response.data.error) {
        setInternDetails(prevDetails => ({
          ...prevDetails,
          name: response.data.username || "N/A",
          empId: response.data.emp_id || "N/A",
        }));
      }
    } catch (error) {
      console.error("Error fetching personal data:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
  
      if (!token) {
        console.error("No auth token found in localStorage!");
        return;
      }
  
      const response = await axios.get("http://localhost:8000/Sims/user-data/", {
        headers: { Authorization: `Token ${token}` },
      });
  
      console.log("User Data API Response:", response.data);
  
      if (response.data && !response.data.error) {
        setInternDetails(prevDetails => ({
          ...prevDetails,
          createdMonth: response.data.start_date || "N/A",
          createdYear: response.data.end_date || "N/A",
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPersonalData();
    fetchUserData();
  }, []);
  
  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        console.error("❌ No auth token found in localStorage!");
        return;
      }
  
      console.log("🔄 Fetching attendance data...");
  
      const response = await axios.get("http://localhost:8000/Sims/attendance/", {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        },
      });
  
      console.log("✅ Attendance API Raw Response:", response.data);
  
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const userData = response.data[0]; // Since it's a list, we access the first employee's data
        const records = userData.records || []; // Extract attendance records
  
        const formattedData = records.map((entry, index) => ({
          id: entry.id,
          date: entry.date ? new Date(entry.date).toLocaleDateString() : "",
          checkIn: entry.check_in ? new Date(entry.check_in).toLocaleTimeString() : "",
          checkOut: entry.check_out ? new Date(entry.check_out).toLocaleTimeString() : "",
          totalHours: entry.total_hours || "0:00",
          status: entry.status || "Unknown",
          presentStatus: entry.present_status || "Unknown",
        }));
  
        console.log("✅ Formatted Attendance Data:", formattedData);
  
        // Set summary data and attendance records
        setUserSummary(userData.summary);
        setEntries(formattedData);
      } else {
        console.error("❌ Unexpected API response format:", response.data);
      }
    } catch (error) {
      console.error("❌ Error fetching attendance:", error.response?.data || error.message);
    }
  };
  
  // Fetch attendance when the component loads
  useEffect(() => {
    fetchAttendance();
  }, []);
  
  
  
  
  
  
  
  const handleEditEntry = (index) => {
    const entry = entries[index];
    setShiftInTime(entry.shiftInTime);
    setShiftOutTime(entry.shiftOutTime);
    setInTime(entry.inTime);
    setOutTime(entry.outTime);
    setEditIndex(index);
  };

  const handleDeleteEntry = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
    setSnackbarMessage("Entry deleted successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const calculateTotalHours = (inTime, outTime) => {
    if (!inTime || !outTime) return "0:00";
    const diff = outTime.getTime() - inTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleOpenPopover = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedEntryIndex(index);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedEntryIndex(null);
  };

  const handleEdit = (index) => {
    handleEditEntry(index);
    handleClosePopover();
  };

  const handleDelete = (index) => {
    handleDeleteEntry(index);
    handleClosePopover();
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle the file upload logic here
      console.log("File selected:", file);
      setSnackbarMessage("File uploaded successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" style={{ marginTop: "40px" }}>
        <Paper elevation={3} style={{ padding: "20px", borderRadius: "8px" }}>
          <Typography variant="h4" align="center" gutterBottom>
            Intern Hours Calculator
          </Typography>

          <Grid container spacing={2} style={{ marginBottom: "20px" }}>
  <Grid item xs={12} sm={6}>
    <TextField
      fullWidth
      label="Intern Name"
      value={internDetails.name}
      InputProps={{ readOnly: true }}
    />
  </Grid>
  <Grid item xs={12} sm={6}>
    <TextField
      fullWidth
      label="Intern ID"
      value={internDetails.empId}
      InputProps={{ readOnly: true }}
    />
  </Grid>
</Grid>

<Grid container spacing={2} style={{ marginBottom: "20px" }}>
  <Grid item xs={6}>
    <TextField
      fullWidth
      label="Start date"
      value={internDetails.createdMonth}
      InputProps={{ readOnly: true }}
    />
  </Grid>
  <Grid item xs={6}>
    <TextField
      fullWidth
      label="End date"
      value={internDetails.createdYear}
      InputProps={{ readOnly: true }}
    />
  </Grid>
</Grid>



          <Box
            display="flex"
            justifyContent="flex-end"
            style={{ marginBottom: "20px" }}
          >
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleUploadClick}
              disabled={loading}
            >
              {editIndex !== null ? "Update Entry" : "Upload"}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Shift In Time</TableCell>
                    <TableCell>Shift Out Time</TableCell>
                    <TableCell>Total hours</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {entries?.length > 0 ? (
    entries.map((entry, index) => (
      <TableRow key={entry.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{entry.date}</TableCell>
        <TableCell>{entry.checkIn}</TableCell>
        <TableCell>{entry.checkOut}</TableCell>
        <TableCell>{entry.totalHours}</TableCell>
        <TableCell>{entry.presentStatus}</TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={7} align="center">
        No attendance records found
      </TableCell>
    </TableRow>
  )}
</TableBody>


              </Table>
            </TableContainer>
          )}
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

        <Popover
          id={`entry-menu-${selectedEntryIndex}`}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            style: {
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(0, 0, 0, 0.12)",
              padding: "4px",
            },
          }}
        >
          <List>
            <ListItem
              button
              onClick={() => handleEdit(selectedEntryIndex)}
              style={{
                padding: "8px 16px",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemIcon style={{ minWidth: "36px", color: "#3f51b5" }}>
                <Edit />
              </ListItemIcon>
              <ListItemText primary="Edit" />
            </ListItem>
            <ListItem
              button
              onClick={() => handleDelete(selectedEntryIndex)}
              style={{
                padding: "8px 16px",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemIcon style={{ minWidth: "36px", color: "#f44336" }}>
                <Delete />
              </ListItemIcon>
              <ListItemText primary="Delete" style={{ color: "#f44336" }} />
            </ListItem>
          </List>
        </Popover>
      </Container>
    </LocalizationProvider>
  );
};

export default InternHoursCalculator;