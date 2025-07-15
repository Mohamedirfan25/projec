import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { AddTask, CalendarToday, Delete, ExpandMore, ExpandLess, ArrowBack } from '@mui/icons-material';

const CreateTask = () => {
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [committedDate, setCommittedDate] = useState(dayjs());
  const [assignTo, setAssignTo] = useState('');
  const [assignBy, setAssignBy] = useState('');
  const [errors, setErrors] = useState({});
  const [tasks, setTasks] = useState([]);
  const [showTaskList, setShowTaskList] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 2; // Modified to show 2 items per page

  const priorities = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
  ];

  useEffect(() => {
    fetchTasks1();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token is missing! Please log in.");
      return;
    }
    try {
      const response = await axios.get("http://localhost:8000/Sims/tasks/", {
        headers: {
          "Authorization": `Token ${token}`,
        },
        withCredentials: true,
      });
      const fetchedTasks = response.data.map(task => ({
        id: task.id,
        taskName: task.task_title,
        taskDescription: task.task_description,
        priority: task.priority,
        committedDate: task.committed_date,
        assignTo: task.assigned_to,
        assignBy: task.assigned_by,
      }));
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Failed to fetch tasks.");
    }
  };
  useEffect(() => {
    fetchTasks1();
  }, []);
  
  const fetchTasks1 = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token is missing! Please log in.");
      return;
    }
    try {
      const response = await axios.get("http://localhost:8000/Sims/tasks/assigned-history/", {
        headers: {
          "Authorization": `Token ${token}`,
        },
        withCredentials: true,
      });
      const fetchedTasks = response.data.map(task => ({
        id: task.id,
        taskName: task.task_title,
        committedDate: task.committed_date,
        taskDescription: task.task_description,
        startDate: task.start_date,
        endDate: task.end_date,
        assignTo: task.assigned_to_username,
        assignBy: task.assigned_by_username,
        priority: task.priority,
        status: task.status,
      }));
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error fetching task history:", error);
      alert("Failed to fetch task history.");
    }
  };
  

  const validateForm = () => {
    let tempErrors = {};
    if (!taskName) tempErrors.task_title = 'Task Name is required.';
    if (!taskDescription) tempErrors.taskDescription = 'Task Description is required.';
    if (!priority) tempErrors.priority = 'Priority is required.';
    if (!assignTo) tempErrors.assignTo = 'Please assign the task.';
    if (!assignBy) tempErrors.assignBy = 'Please specify who is assigning the task.';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("Authentication token is missing! Please log in.");
      return;
    }

    if (!validateForm()) return;

    try {
      await axios.post(
        "http://localhost:8000/Sims/tasks/",
        {
          task_title: taskName,
          task_description: taskDescription,
          priority: priority,
          committed_date: committedDate.format("YYYY-MM-DD"),
          assigned_to: assignTo,
          assigned_by: assignBy,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
          },
          withCredentials: true,
        }
      );
      alert("Task created successfully!");
      fetchTasks();
      setTaskName('');
      setTaskDescription('');
      setPriority('');
      setCommittedDate(dayjs());
      setAssignTo('');
      setAssignBy('');
      setErrors({});
    } catch (error) {
      console.error("Error creating task:", error);
      if (error.response) {
        alert("AssignedTo User or AssignedBy User does not exist");
      } else {
        alert("Failed to create task: Unknown error occurred.");
      }
    }
  };

  const handleDeleteTask = (id) => {
    setTaskToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteTask = () => {
    setTasks(tasks.filter((task) => task.id !== taskToDelete));
    if (tasks.length === 1) setShowTaskList(false);
    setOpenDeleteDialog(false);
    setTaskToDelete(null);
  };

  const handleBackToTasks = () => {
    navigate('/Dash');
  };

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: '800px',
        margin: 'auto',
        bgcolor: '#f5f5f5',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 6, color: '#1976d2', fontWeight: 'bold' }}>
        <AddTask sx={{ verticalAlign: 'middle', mr: 2, fontSize: 30 }} />
        Create Task
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              transition: '0.3s',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              borderRadius: 4,
              '&:hover': {
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Task Name"
                    variant="outlined"
                    fullWidth
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    error={!!errors.taskName}
                    helperText={errors.taskName}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Task Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    error={!!errors.taskDescription}
                    helperText={errors.taskDescription}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Priority"
                    fullWidth
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    error={!!errors.priority}
                    helperText={errors.priority || 'Select the priority for this task'}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    {priorities.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Committed Date"
                      value={committedDate}
                      onChange={(newValue) => setCommittedDate(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Assigned To"
                    variant="outlined"
                    fullWidth
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                    error={!!errors.assignTo}
                    helperText={errors.assignTo}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Assigned By"
                    variant="outlined"
                    fullWidth
                    value={assignBy}
                    onChange={(e) => setAssignBy(e.target.value)}
                    error={!!errors.assignBy}
                    helperText={errors.assignBy}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSubmit}
                    startIcon={<AddTask />}
                    sx={{
                      bgcolor: '#1976d2',
                      '&:hover': {
                        bgcolor: '#1565c0',
                      },
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                    }}
                  >
                    Create Task
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={handleBackToTasks}
                    startIcon={<ArrowBack />}
                    sx={{
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.04)',
                      },
                      borderRadius: 2,
                      py: 1.5,
                      textTransform: 'none',
                      fontSize: '1rem',
                    }}
                  >
                    Back to Dashboard
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 3,
              transition: '0.3s',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              borderRadius: 4,
              '&:hover': {
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                Task History
              </Typography>
              <IconButton
                onClick={() => setShowTaskList(!showTaskList)}
                sx={{ color: '#1976d2' }}
              >
                {showTaskList ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            <Collapse in={showTaskList}>
              <List>
                {tasks
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((task) => (
                    <ListItem
                      key={task.id}
                      sx={{
                        mb: 2,
                        bgcolor: '#f8f8f8',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                        '&:hover': {
                          bgcolor: '#f0f0f0',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                            {task.taskName}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                            Status: {task.status ? task.status.replace("_", " ") : "N/A"}

                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Committed: {dayjs(task.committedDate).format('MMM D, YYYY')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Start Date: {task.startDate ? dayjs(task.startDate).format('MMM D, YYYY') : 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              End Date: {task.endDate ? dayjs(task.endDate).format('MMM D, YYYY') : 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Assigned To: {task.assignTo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Assigned By: {task.assignBy}
                            </Typography>
                            <Typography variant="body2" color="text.secondary"> 
                              Discription: {task.taskDescription}
                            </Typography>

                          </>
                        }
                      />
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteTask(task.id)}
                        sx={{ '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.04)' } }}
                      >
                        <Delete />
                      </IconButton>
                    </ListItem>
                  ))}
              </List>
              {tasks.length > 0 && (
                <Pagination
                  count={Math.ceil(tasks.length / rowsPerPage)}
                  page={page + 1}
                  onChange={(event, value) => setPage(value - 1)}
                  sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
                />
              )}
            </Collapse>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteTask} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateTask;