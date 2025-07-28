import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Divider,
  TablePagination,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Pagination,
  Grid,
  FormHelperText,
} from "@mui/material";
import { Refresh, MoreVert, Event, Close } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";

const AttendanceManagement = () => {
  const navigate = useNavigate();
  const [internId, setInternId] = useState("");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailedLogs, setDetailedLogs] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [firstHalfStatus, setFirstHalfStatus] = useState("");
  const [secondHalfStatus, setSecondHalfStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  
  // Attendance Claim Dialog State
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [claimForm, setClaimForm] = useState({
    fromDate: new Date(),
    fromDayType: 'full',
    fromHalfDayType: 'first',
    toDate: new Date(),
    toDayType: 'full',
    toHalfDayType: 'first',
    forPeriod: '',
    comment: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const years = Array.from({ length: 10 }, (_, i) => (2021 + i).toString());

  const currentDate = new Date();
  const currentMonth = months[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear().toString();

  // Fetch interns data from API
  useEffect(() => {
    const fetchInterns = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8000/Sims/attendance/",
          {
            headers: { Authorization: `Token ${token}` },
          }
        );

        const internsData = response.data.map((item) => ({
          id: item.emp_id.toString(),
          name: item.name,
          domain: item.domain,
          records: item.records,
        }));
        setInterns(internsData);

        if (internsData.length > 0) {
          setInternId(internsData[0].id);
          setName(internsData[0].name);
          setDomain(internsData[0].domain);
          setAttendanceData(internsData[0].records);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchInterns();
  }, []);

  useEffect(() => {
    setMonth(currentMonth);
    setYear(currentYear);
  }, []);

  // Fetch attendance records for the selected intern
  useEffect(() => {
    if (internId) {
      filterAttendanceData(internId, month, year, filterStatus);
    } else {
      setAttendanceData([]);
    }
  }, [internId, month, year, filterStatus]);

  const filterAttendanceData = async (
    id,
    selectedMonth,
    selectedYear,
    status
  ) => {
    if (!id) {
      setAttendanceData([]);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/Sims/attendance/${id}`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      console.log("API Response:", response.data); // Debug log

      // Ensure we have records to process
      if (!response.data.records || !Array.isArray(response.data.records)) {
        console.error("No records found in response or invalid format");
        setAttendanceData([]);
        setLoading(false);
        return;
      }

      // Filter by month and year
      let filteredData = response.data.records.filter((record) => {
        if (!record.date) return false;
        try {
          const dateObj = new Date(record.date);
          return (
            months[dateObj.getMonth()] === selectedMonth &&
            dateObj.getFullYear().toString() === selectedYear
          );
        } catch (e) {
          console.error("Error parsing date:", record.date, e);
          return false;
        }
      });

      console.log("Filtered by date:", filteredData); // Debug log

      // Filter by status
      if (status === "present") {
        filteredData = filteredData.filter(
          (record) => record.present_status === "Present"
        );
      } else if (status === "absent") {
        filteredData = filteredData.filter(
          (record) => record.present_status !== "Present"
        );
      }

      console.log("After status filter:", filteredData); // Debug log

      // Process and format the data for display
      const updatedData = filteredData.map((record) => {
        // Ensure we have valid date and times
        const dateObj = record.date ? new Date(record.date) : new Date();
        const checkInTime = record.check_in ? new Date(record.check_in) : null;
        const checkOutTime = record.check_out ? new Date(record.check_out) : null;

        return {
          ...record,
          date: dateObj.toISOString(), // Ensure consistent date format
          check_in: checkInTime ? checkInTime.toISOString() : null,
          check_out: checkOutTime ? checkOutTime.toISOString() : null,
          day: dateObj.toLocaleString("en-US", { weekday: "short" }),
          shift: "Day Shift",
          workTime: calculateWorkTime(checkInTime, checkOutTime),
        };
      });

      console.log("Processed data:", updatedData); // Debug log
      setAttendanceData(updatedData);
    } catch (err) {
      console.error("Error in filterAttendanceData:", err);
      setError(err.message || "Failed to fetch attendance data");
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate work time based on check-in and check-out
  const calculateWorkTime = (checkIn, checkOut) => {
    try {
      // If either time is missing or invalid, return placeholder
      if (!checkIn || !checkOut || isNaN(new Date(checkIn)) || isNaN(new Date(checkOut))) {
        return "--";
      }
      
      // Ensure we have Date objects
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      
      // Calculate time difference in minutes
      const totalMinutes = Math.round((end - start) / 60000);
      
      // Handle case where end time is before start time (overnight shift)
      const absMinutes = Math.abs(totalMinutes);
      const hours = Math.floor(absMinutes / 60);
      const minutes = absMinutes % 60;
      
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    } catch (error) {
      console.error("Error calculating work time:", { checkIn, checkOut, error });
      return "--";
    }
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '--:--';
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '--:--';
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", { dateTimeString, error });
      return '--:--';
    }
  };

  const handleMoreVertClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleConfirmDelete = () => {
    console.log("Deleting:", selectedRow);
    setDeleteDialogOpen(false);
    handleCloseMenu();
  };

  const handleEdit = () => {
    setSelectedDate(new Date(selectedRow.date));
    setFirstHalfStatus(selectedRow.check_in ? "Present" : "Absent");
    setSecondHalfStatus(selectedRow.check_out ? "Present" : "Absent");
    setEditDialogOpen(true);
    handleCloseMenu();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleMonthChange = async (e) => {
    const selectedMonth = e.target.value;
    setMonth(selectedMonth);
    await filterAttendanceData(internId, selectedMonth, year, filterStatus);
  };

  const handleYearChange = async (e) => {
    const selectedYear = e.target.value;
    setYear(selectedYear);
    await filterAttendanceData(internId, month, selectedYear, filterStatus);
  };

  const handleFilterChange = async (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    await filterAttendanceData(internId, month, year, status);
  };

  const handleRefresh = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8000/Sims/attendance/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      const internsData = response.data.map((item) => ({
        id: item.emp_id.toString(),
        name: item.name,
        domain: item.domain,
        records: item.records,
      }));
      setInterns(internsData);
      if (internsData.length > 0) {
        setInternId(internsData[0].id);
        setName(internsData[0].name);
        setDomain(internsData[0].domain);
        setAttendanceData(internsData[0].records);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const calculateTotalHours = (totalHoursString) => {
    if (!totalHoursString) return "--";
    return totalHoursString; // Assuming seconds or already formatted correctly
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (row) => {
    if (!row.logs || row.logs.length === 0) {
      setDetailedLogs([]);
    } else {
      const formattedLogs = row.logs.map((log) => ({
        date: new Date(log.time).toLocaleDateString("en-US"),
        timing: formatTime(log.time),
        inOut: log.is_in ? "In" : "Out",
        ipAddress: log.ip_address || "--",
        reason: log.reason || "--",
      }));
      setDetailedLogs(formattedLogs);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleSaveEdit = () => {
    console.log("Save Edit:", {
      date: selectedDate,
      firstHalfStatus,
      secondHalfStatus,
    });
    setEditDialogOpen(false);
  };

  const handleAttendanceClaim = () => {
    // Format the period as "Month Year" (e.g., "July 2024")
    // Use current month and year if none selected
    const selectedMonthValue = month || currentMonth;
    const selectedYearValue = year || currentYear;
    const formattedPeriod = `${selectedMonthValue} ${selectedYearValue}`;
    
    // Set default values for fromDate and toDate
    const today = new Date();
    setClaimForm(prev => ({
      ...prev,
      fromDate: today,
      toDate: today,
      forPeriod: formattedPeriod,
      fromDayType: 'full',
      fromHalfDayType: 'first',
      toDayType: 'full',
      toHalfDayType: 'first'
    }));
    
    setClaimDialogOpen(true);
  };

  const handleClaimDialogClose = () => {
    setClaimDialogOpen(false);
    const today = new Date();
    setClaimForm({
      fromDate: today,
      toDate: today,
      forPeriod: '',
      fromDayType: 'full',
      fromHalfDayType: 'first',
      toDayType: 'full',
      toHalfDayType: 'first',
      comment: ''
    });
    setFormErrors({});
  };

  const handleClaimFormChange = (field, value) => {
    setClaimForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!claimForm.forPeriod.trim()) {
      errors.forPeriod = 'For Period is required';
    }
    if (!claimForm.fromDate) {
      errors.fromDate = 'From Date is required';
    }
    if (!claimForm.toDate) {
      errors.toDate = 'To Date is required';
    }
    if (claimForm.fromDate && claimForm.toDate && claimForm.fromDate > claimForm.toDate) {
      errors.dateRange = 'From Date cannot be after To Date';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle form submission
      console.log('Submitting claim:', claimForm);
      // Add your API call here
      handleClaimDialogClose();
    }
  };

  return (
  <Box
    sx={{ padding: { xs: 1, sm: 2, md: 3 }, maxWidth: 1200, margin: "auto" }}
  >
    <Typography
      variant="h5"
      align="center"
      sx={{ marginBottom: 2, fontWeight: "bold", color: "primary.main" }}
    >
      Attendance Management
    </Typography>

    <Divider sx={{ marginBottom: 3 }} />

    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        marginBottom: 3,
      }}
    >
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          Intern ID:
        </Typography>
        <Typography variant="body1">{internId}</Typography>
      </Box>
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          Name:
        </Typography>
        <Typography variant="body1">{name}</Typography>
      </Box>
      {/* <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Domain:</Typography>
                    <Typography variant="body1">{domain}</Typography>
                </Box> */}
    </Box>

    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        gap: 2,
        marginBottom: 3,
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        For The Period
      </Typography>
      <TextField
        select
        label="Month"
        value={month}
        onChange={handleMonthChange}
        size="small"
        sx={{ width: { xs: "100%", sm: 150 } }}
      >
        {months.map((m) => (
          <MenuItem key={m} value={m}>
            {m}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Year"
        value={year}
        onChange={handleYearChange}
        size="small"
        sx={{ width: { xs: "100%", sm: 100 } }}
      >
        {years.map((y) => (
          <MenuItem key={y} value={y}>
            {y}
          </MenuItem>
        ))}
      </TextField>
      <FormControl size="small" sx={{ width: { xs: "100%", sm: 150 } }}>
        <InputLabel id="filter-status-label">Filter Status</InputLabel>
        <Select
          labelId="filter-status-label"
          value={filterStatus}
          onChange={handleFilterChange}
          label="Filter Status"
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="present">Present</MenuItem>
          <MenuItem value="absent">Absent</MenuItem>
        </Select>
      </FormControl>
      
      <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
        <Button
          variant="contained"
          onClick={handleRefresh}
          startIcon={<Refresh />}
          sx={{ textTransform: 'none' }}
        >
          Refresh
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/LeaveManagement')}
          startIcon={<Event />}
          sx={{
            textTransform: 'none',
            color: 'secondary.main',
            borderColor: 'secondary.main',
            '&:hover': {
              borderColor: 'secondary.dark',
              backgroundColor: 'rgba(156, 39, 176, 0.04)'
            }
          }}
        >
          Request Leave
        </Button>
        <Button
          variant="outlined"
          onClick={handleAttendanceClaim}
          startIcon={<Event />}
          sx={{
            textTransform: 'none',
            color: 'primary.main',
            borderColor: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
        >
          Attendance Claim
        </Button>
      </Box>
    </Box>

    {/* Main Table Content */}
    <TableContainer component={Paper} sx={{ marginBottom: 3, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Day</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Shift</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Work Time</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>In Time</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Out Time</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Total Hours</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>First Half</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Second Half</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendanceData.length > 0 ? (
            attendanceData.map((row, index) => {
              const isPresent = row.present_status === 'Present';
              const firstHalfStatus = row.check_in ? 'Present' : 'Absent';
              const secondHalfStatus = row.check_out ? 'Present' : 'Absent';
              
              return (
                <TableRow 
                  key={index}
                  hover
                  onClick={() => handleRowClick(row)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:nth-of-type(odd)': {
                      backgroundColor: '#f9f9f9'
                    }
                  }}
                >
                  <TableCell>{new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                  <TableCell>{new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' })}</TableCell>
                  <TableCell>Day Shift</TableCell>
                  <TableCell>9:00 AM - 6:00 PM</TableCell>
                  <TableCell>{row.check_in ? formatTime(row.check_in) : '--:--'}</TableCell>
                  <TableCell>{row.check_out ? formatTime(row.check_out) : '--:--'}</TableCell>
                  <TableCell>{row.workTime || '--'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={firstHalfStatus}
                      color={firstHalfStatus === 'Present' ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        minWidth: 70,
                        borderRadius: 1,
                        fontWeight: 'medium',
                        borderWidth: '1.5px'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={secondHalfStatus}
                      color={secondHalfStatus === 'Present' ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        minWidth: 70,
                        borderRadius: 1,
                        fontWeight: 'medium',
                        borderWidth: '1.5px'
                      }}
                    />
                  </TableCell>

                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                {loading ? 'Loading attendance data...' : 'No attendance records found'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={attendanceData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            marginBottom: 0
          },
          '& .MuiTablePagination-toolbar': {
            padding: '8px 16px',
            minHeight: '56px'
          }
        }}
      />
    </TableContainer>

    {/* Dialog for Detailed Logs */}
    <Dialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Attendance Details</DialogTitle>
      <DialogContent
        sx={{
          padding: 0,
          height: "250px",
          overflow: "auto",
        }}
      >
          <Table sx={{ margin: "2%", width: "95%" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  Timing
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  In/Out
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  IP Address
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                >
                  Reason
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detailedLogs.length > 0 ? (
                detailedLogs.map((log, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      height: "40px",
                      "&:hover": { backgroundColor: "#f9f9f9" },
                    }}
                  >
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {log.date}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {log.timing}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {log.inOut}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {log.ipAddress}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                      {log.reason}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No detailed logs available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions sx={{ padding: 2, backgroundColor: "#f5f5f5" }}>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#333",
              color: "#fff",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Edit Attendance */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#333" }}>
          Edit Attendance Details
        </DialogTitle>
        <DialogContent sx={{ padding: 3 }}>
          <Typography>
            Edit attendance information for {selectedRow?.date}.
          </Typography>
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={handleEditDialogClose}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#333",
              color: "#fff",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#1976d2",
              color: "#fff",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Delete Confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#333" }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ padding: 3 }}>
          <Typography variant="body1">
            Are you sure you want to delete the attendance record for{" "}
            {selectedRow?.date
              ? new Date(selectedRow.date).toLocaleDateString()
              : ""}
            ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#333",
              color: "#fff",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#d32f2f",
              color: "#fff",
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attendance Claim Dialog */}
      <Dialog 
        open={claimDialogOpen} 
        onClose={handleClaimDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          pb: 1,
          m: 0,
          p: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Attendance Claim</Typography>
          <IconButton 
            onClick={handleClaimDialogClose}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <form onSubmit={handleClaimSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* For Period */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="For Period"
                  value={claimForm.forPeriod}
                  onChange={(e) => handleClaimFormChange('forPeriod', e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="e.g., January 2024"
                  error={!!formErrors.forPeriod}
                  helperText={formErrors.forPeriod}
                  required
                />
              </Grid>
              
              {/* From Date and Day Type */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>From</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="From Date"
                    value={claimForm.fromDate}
                    onChange={(date) => handleClaimFormChange('fromDate', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        size="small"
                        error={!!formErrors.fromDate}
                        helperText={formErrors.fromDate}
                        required
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Day Type</InputLabel>
                  <Select
                    value={claimForm.fromDayType}
                    onChange={(e) => handleClaimFormChange('fromDayType', e.target.value)}
                    label="Day Type"
                  >
                    <MenuItem value="full">Full Day</MenuItem>
                    <MenuItem value="half">Half Day</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* From Half Day Type (conditional) */}
              {claimForm.fromDayType === 'half' && (
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Half Day Type</InputLabel>
                    <Select
                      value={claimForm.fromHalfDayType}
                      onChange={(e) => handleClaimFormChange('fromHalfDayType', e.target.value)}
                      label="Half Day Type"
                    >
                      <MenuItem value="first">First Half</MenuItem>
                      <MenuItem value="second">Second Half</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {/* To Date and Day Type */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>To</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="To Date"
                    value={claimForm.toDate}
                    onChange={(date) => handleClaimFormChange('toDate', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        size="small"
                        error={!!formErrors.toDate}
                        helperText={formErrors.toDate || (formErrors.dateRange || '')}
                        required
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Day Type</InputLabel>
                  <Select
                    value={claimForm.toDayType}
                    onChange={(e) => handleClaimFormChange('toDayType', e.target.value)}
                    label="Day Type"
                  >
                    <MenuItem value="full">Full Day</MenuItem>
                    <MenuItem value="half">Half Day</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* To Half Day Type (conditional) */}
              {claimForm.toDayType === 'half' && (
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Half Day Type</InputLabel>
                    <Select
                      value={claimForm.toHalfDayType}
                      onChange={(e) => handleClaimFormChange('toHalfDayType', e.target.value)}
                      label="Half Day Type"
                    >
                      <MenuItem value="first">First Half</MenuItem>
                      <MenuItem value="second">Second Half</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {/* Comment Box */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Comments (Optional)"
                  value={claimForm.comment}
                  onChange={(e) => handleClaimFormChange('comment', e.target.value)}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                  placeholder="Add any additional comments here..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 2, 
            borderTop: '1px solid #e0e0e0',
            justifyContent: 'flex-end',
            gap: 1
          }}>
            <Button 
              onClick={handleClaimDialogClose}
              variant="outlined"
              color="inherit"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              color="primary"
            >
              Submit Claim
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AttendanceManagement;