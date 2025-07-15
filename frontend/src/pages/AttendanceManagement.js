import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Refresh, MoreVert, Edit, Delete } from "@mui/icons-material";
import axios from "axios";

const AttendanceManagement = () => {
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

      const filteredData = response.data.records.filter((record) => {
        const dateObj = new Date(record.date);
        return (
          months[dateObj.getMonth()] === selectedMonth &&
          dateObj.getFullYear().toString() === selectedYear
        );
      });

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

      const updatedData = filteredData.map((record) => ({
        ...record,
        day: new Date(record.date).toLocaleString("en-US", {
          weekday: "short",
        }),
        shift: "Day Shift", // You can adjust this as needed
        workTime: calculateWorkTime(record.check_in, record.check_out), // Calculate work time
      }));

      setAttendanceData(updatedData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error("Error fetching attendance data:", err);
    }
  };

  // Function to calculate work time based on check-in and check-out
  const calculateWorkTime = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "--";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const totalMinutes = Math.round((end - start) / 60000); // difference in minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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
      reason,
    });
    handleEditDialogClose();
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
        <Button
          variant="contained"
          onClick={handleRefresh}
          sx={{ textTransform: "none" }}
          startIcon={<Refresh />}
        >
          Refresh
        </Button>
      </Box>

      <Divider sx={{ marginBottom: 3 }} />

      <Card sx={{ padding: 2, boxShadow: 3 }}>
        {loading && (
          <Typography sx={{ padding: 2 }}>Loading data...</Typography>
        )}
        {error && (
          <Typography color="error" sx={{ padding: 2 }}>
            Error: {error}
          </Typography>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Day</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Shift</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Work Time</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>In Time</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Out Time</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Total Hours</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>First Half</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Second Half</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.length > 0 ? (
                attendanceData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell
                        onClick={() => handleRowClick(row)}
                        style={{ cursor: "pointer" }}
                      >
                        {new Date(row.date).toLocaleDateString("en-US")}
                      </TableCell>
                      <TableCell>
                        {row.day ||
                          new Date(row.date).toLocaleString("en-US", {
                            weekday: "short",
                          })}
                      </TableCell>
                      <TableCell>{row.shift || "Day Shift"}</TableCell>
                      <TableCell>{row.workTime || "--"}</TableCell>{" "}
                      {/* Using calculated Work Time */}
                      <TableCell>
                        {row.check_in ? formatTime(row.check_in) : "--"}
                      </TableCell>
                      <TableCell>
                        {row.check_out ? formatTime(row.check_out) : "--"}
                      </TableCell>
                      <TableCell>
                        {calculateTotalHours(row.total_hours)}
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            backgroundColor: row.check_in
                              ? "#d4edda"
                              : "#f8d7da",
                            color: row.check_in ? "#155724" : "#721c24",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          {row.check_in ? "Present" : "Absent"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            backgroundColor: row.check_out
                              ? "#d4edda"
                              : "#f8d7da",
                            color: row.check_out ? "#155724" : "#721c24",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          {row.check_out ? "Present" : "Absent"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(event) => handleMoreVertClick(event, row)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No records available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={attendanceData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Menu for Actions (Edit/Delete) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          style: {
            width: "150px",
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ color: "#1976d2", marginRight: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" sx={{ color: "#d32f2f", marginRight: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Dialog for Detailed Logs */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold", color: "#333" }}
        >
          Daily In/Out Punch
        </DialogTitle>
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
    </Box>
  );
};

export default AttendanceManagement;