import React, { useState, useEffect } from "react";
import axios from "axios";
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
  TextField,
  Select,
  MenuItem,
  Chip,
  Link,
  IconButton,
  InputAdornment,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Assignment,
  Search,
  FilterList,
  Edit,
  MoreVert,
  ArrowBack,
  ArrowForward,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import "../styles/App.css"; // Make sure this path is correct

import { Snackbar, Alert } from "@mui/material";


import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const MAX_TASK_WORDS = 2;

const truncateTaskName = (name) => {
  const words = name.split(" ");
  if (words.length > MAX_TASK_WORDS) {
    return `${words.slice(0, MAX_TASK_WORDS).join(" ")}...`;
  }
  return name;
};

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editedStartDate, setEditedStartDate] = useState(null);
  const [editedEndDate, setEditedEndDate] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [datesTouched, setDatesTouched] = useState(false);


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No authentication token found.");
          return;
        }

        const response = await axios.get("http://localhost:8000/Sims/tasks/", {
          headers: { Authorization: `Token ${token}` },
        });
        console.log("Tasks fetched:", response.data);

        const mappedTasks = response.data.map((task) => ({
          id: task.id,
          taskName: task.task_title,
          startDate: task.start_date,
          endDate: task.end_date,
          createdBy: task.assigned_by_user,
          committedDate: task.committed_date, // Add committed date field
          status: task.status,
          priority: task.priority,
        }));

        setTasks(mappedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  const handleDeleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/Sims/tasks/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setTasks(tasks.filter((task) => task.id !== id)); // Remove task from state
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8000/Sims/tasks/${id}/`,
        { status: newStatus },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
  
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                status: response.data.status,
                startDate: response.data.start_date,
                endDate: response.data.end_date,
              }
            : task
        )
      );
      
      
  
      setStatusFilter(""); // Keep it visible even after change
      setEditingTaskId(null);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  
  

  const formatDate = (date) => {
    return date.toLocaleDateString("en-CA"); // 'YYYY-MM-DD'
  };
  
  const handleEditDates = async (id, startDate, endDate) => {
    try {
      const token = localStorage.getItem("token");
  
      const payload = {};
      if (startDate) payload.start_date = formatDate(startDate);
      if (endDate) payload.end_date = formatDate(endDate);
  
      const response = await axios.put(
        `http://localhost:8000/Sims/tasks/${id}/`,
        payload,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
  
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                startDate: response.data.start_date ?? task.startDate,
                endDate: response.data.end_date ?? task.endDate,
              }
            : task
        )
      );
  
      setSnackbarOpen(true);
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error updating task dates:", error);
    }
  };
  
  
  
  useEffect(() => {
    if (editingTaskId && editedStartDate && editedEndDate && datesTouched) {
      handleEditDates(editingTaskId, editedStartDate, editedEndDate);
      setDatesTouched(false); // reset after submit
    }
  }, [editingTaskId, editedStartDate, editedEndDate, datesTouched]);
  
  
  
  

  const filteredTasks = tasks.filter(
    (task) =>
      (task.taskName?.toLowerCase().includes(filter.toLowerCase()) ?? false) &&
      (statusFilter ? task.status === statusFilter : true)
  );

  const paginatedTasks = filteredTasks.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Not_Started":
        return { background: "#FFF5CC", color: "#FFAB00" };
      case "In_Progress":
        return { background: "#BBE8FB", color: "#6B7280" };
      case "Completed":
        return { background: "#22C55E29", color: "#118D57" };
      case "Missing":
        return { background: "#FF563029", color: "#B71D1A" };
      default:
        return { background: "inherit", color: "inherit" };
    }
  };

  const handleOpenMenu = (event, taskId) => {
    setAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedTaskId(null);
  };

  const handleEditClick = (task) => {
    setEditedStatus(task.status);
    setEditedStartDate(task.startDate ? new Date(task.startDate) : null);
    setEditedEndDate(task.endDate ? new Date(task.endDate) : null);
    setEditingTaskId(task.id);
    handleCloseMenu();
  };
  
  

  const handleDeleteClick = (task) => {
    setTaskToDelete(task.id);
    setDeleteDialogOpen(true);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  return (
    <Paper
      sx={{
        padding: 4,
        fontFamily: "'DM Sans Variable', sans-serif",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
        <Assignment sx={{ marginRight: 1, fontSize: 40 }} />
        <Typography variant="h4" gutterBottom>
          Task Management
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          gap: 2,
          marginBottom: 3,
        }}
      >
        <TextField
          label="Search Tasks"
          variant="outlined"
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 300 }}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
          size="small"
          renderValue={(value) => {
            return value ? (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <FilterList />
                {value}
              </Box>
            ) : (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <FilterList />
                All Task
              </Box>
            );
          }}
          sx={{ maxWidth: 200 }}
        >
          <MenuItem value="">All Task</MenuItem>
          <MenuItem value="Not_Started">Not Started</MenuItem>
          <MenuItem value="In_Progress">In Progress</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Missing">Missing</MenuItem>
        </Select>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setStatusFilter("")}
        >
          Clear Filters
        </Button>

        <Button
          variant="contained"
          color="secondary"
          component="a"
          href="/Create"
        >
          Add Task
        </Button>
        
      </Box>

      

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ backgroundColor: "grey.200", fontWeight: "bold" }}
              >
                Task Name
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "grey.200", fontWeight: "bold" }}
              >
                Committed Date
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "grey.200", fontWeight: "bold" }}
              >
                Start Date
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "grey.200", fontWeight: "bold" }}
              >
                End Date
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "grey.200", fontWeight: "bold" }}
              >
                Task Creator
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "grey.200", fontWeight: "bold" }}
              >
                Priority
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "grey.200", fontWeight: "bold" }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "grey.200", fontWeight: "bold" }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTasks.map((task) => (
              <TableRow
                key={task.id}
                sx={{
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
              >
                <TableCell>
                  
                  {truncateTaskName(task.taskName)}
                  
                </TableCell>
                <TableCell>{task.committedDate || "N/A"}</TableCell>
                <TableCell>
                   {task.startDate || "N/A"}
                </TableCell>

                <TableCell>
                    {task.endDate || "N/A"}
                </TableCell>

                <TableCell>{task.createdBy}</TableCell>
                <TableCell>
                  <Chip
                    label={task.priority}
                    sx={{
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      borderRadius: "12px",
                    }}
                  />
                </TableCell>
                <TableCell>
                    {editingTaskId === task.id ? (
                      <Select
                      value={editedStatus}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setEditedStatus(newStatus);
                        handleEditStatus(task.id, newStatus);
                      }}
                      size="small"
                      autoFocus
                    >
                    
                        <MenuItem value="Not_Started">Not Started</MenuItem>
                        <MenuItem value="In_Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Missing">Missing</MenuItem>
                      </Select>
                    ) : (
                      <Chip
                        label={task.status.replace("_", " ")}
                        onClick={() => handleEditClick(task)}
                        style={{
                          cursor: "pointer",
                          ...getStatusColor(task.status),
                        }}
                      />
                    )}
                  </TableCell>

                <TableCell>
                  <IconButton onClick={(e) => handleOpenMenu(e, task.id)}>
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedTaskId === task.id}
                    onClose={handleCloseMenu}
                  >
                    <MenuItem
                      onClick={() => handleEditClick(task)}
                      sx={{ color: "#1976d2" }}
                    >
                      <Edit sx={{ marginRight: 1 }} />
                      Edit Status
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleDeleteClick(task)}
                      sx={{ color: "red" }}
                    >
                      <DeleteIcon sx={{ marginRight: 1 }} />
                      Delete
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: 2,
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">Records per page:</Typography>
          <Select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            size="small"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
          <Typography variant="body2">
            | Total items: {filteredTasks.length}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ArrowBack />
          </IconButton>
          <IconButton
            disabled={page >= Math.ceil(filteredTasks.length / rowsPerPage)}
            onClick={() => setPage(page + 1)}
          >
            <ArrowForward />
          </IconButton>
        </Box>
      </Box>

      {/* <Box sx={{ marginTop: -4 }}>
        <Button
          variant="contained"
          color="secondary"
          component="a"
          href="/Create"
        >
          Add Task
        </Button>
      </Box> */}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this task?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleDeleteTask(taskToDelete);
              setDeleteDialogOpen(false);
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
            Task updated successfully!
          </Alert>
        </Snackbar>

    
    
    </Paper>
  );
};

export default TaskManager;
