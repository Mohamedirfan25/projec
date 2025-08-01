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
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { AddTask, CalendarToday, Delete, ExpandMore, ExpandLess, ArrowBack } from '@mui/icons-material';
import { ro } from 'date-fns/locale';

const CreateTask = () => {
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [committedDate, setCommittedDate] = useState(dayjs());
  const [assignTo, setAssignTo] = useState(null);
  const [assignBy, setAssignBy] = useState(null);
  const [staff, setStaff] = useState([]);
  const [intern, setIntern] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Fetch users for autocomplete
  const fetchStaffs = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token is missing! Please log in.");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Fetching users from API...");
      const response = await axios.get("http://localhost:8000/Sims/users/", {
        headers: {
          "Authorization": `Token ${token}`,
        },
        withCredentials: true,
      });
      console.log("Raw API response:", response.data);

      if (!response.data || !Array.isArray(response.data)) {
        console.error("Unexpected API response format:", response.data);
        alert("Failed to load users: Unexpected response format");
        return;
      }
      
      // Map the response to include both username and email for better user identification
      const userOptions = response.data.map((user, index) => {
        // Log each user object structure for debugging
        
        const userOption = {
          id: user.id || user.emp_id || user.user?.id || user.temp?.emp_id,
          username: user.username,
          role: user.role || 'intern',
        };
        
        console.log(`Processed user ${index + 1}:`, userOption);
        return userOption;
      });
      
      console.log("Processed user options:", userOptions);
      setStaff(userOptions);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.log("Error response:", error.response?.data);
      alert("Failed to load user list. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInterns = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token is missing! Please log in.");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching interns from API...");
      const response = await axios.get("http://localhost:8000/Sims/interns/", {
        headers: {
          "Authorization": `Token ${token}`,
        },
        withCredentials: true,
      });
      console.log("Raw API response:", response.data);

      if (!response.data || !Array.isArray(response.data)) {
        console.error("Unexpected API response format:", response.data);
        alert("Failed to load interns: Unexpected response format");
        return;
      }

      const internOptions = response.data.map((user, index) => {
        // Log each user object structure for debugging
        console.log(`Intern ${index + 1}:`, user);

        const userOption = {
          id: user.id || user.emp_id || user.user?.id || user.temp?.emp_id,
          username: user.username,
          role: user.role || 'intern',
        };

        return userOption;
      });

      console.log("Processed intern options:", internOptions);
      setIntern(internOptions);
    } catch (error) {
      console.error("Error fetching interns:", error);
      console.log("Error response:", error.response?.data);
      alert("Failed to load intern list. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch users when component mounts
    fetchStaffs();
    fetchInterns();

    if (showTaskList) {
      fetchTasks();
    }
  }, [showTaskList]);

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
      console.log("Raw tasks response:", response.data);
      const fetchedTasks = response.data.map(task => ({
        id: task.id,
        taskName: task.task_title,
        taskDescription: task.task_description,
        priority: task.priority,
        committedDate: task.committed_date,
        assignTo: task.assigned_to_user || task.assigned_to,
        assignBy: task.assigned_by_user || task.assigned_by,
        status: task.status || 'Not_Started'
      }));
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      if (showTaskList) {
        alert("Failed to load task list. Please try again later.");
      }
    }
  };

  const handleSubmit = async () => {
    // Validate form
    const newErrors = {};
    if (!taskName.trim()) newErrors.taskName = 'Task name is required';
    if (!taskDescription.trim()) newErrors.taskDescription = 'Description is required';
    if (!priority) newErrors.priority = 'Priority is required';
    if (!committedDate) newErrors.committedDate = 'Committed date is required';
    if (!assignTo) newErrors.assignTo = 'Please select a user to assign to';
    if (!assignBy) newErrors.assignBy = 'Please select who is assigning the task';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing! Please log in.");
        return;
      }

      // Extract usernames from the selected user objects
      const getUsername = (user) => {
        if (!user) return '';
        if (typeof user === 'string') return user;
        return user.username || user.label?.split(' (')[0] || '';
      };

      const assignedToUsername = getUsername(assignTo);
      const assignedByUsername = getUsername(assignBy);

      console.log("Submitting with usernames:", {
        assignedTo: assignedToUsername,
        assignedBy: assignedByUsername,
        assignToRaw: assignTo,
        assignByRaw: assignBy
      });

      const response = await axios.post(
        "http://localhost:8000/Sims/tasks/",
        {
          task_title: taskName,
          task_description: taskDescription,
          priority: priority,
          committed_date: committedDate.format("YYYY-MM-DD"),
          assigned_to: assignedToUsername,
          assigned_by: assignedByUsername,
          status: "Not_Started"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
          },
          withCredentials: true,
        }
      );
      
      console.log("Task created successfully:", response.data);
      alert("Task created successfully!");
      
      // Reset form
      setTaskName('');
      setTaskDescription('');
      setPriority('');
      setCommittedDate(dayjs());
      setAssignTo(null);
      setAssignBy(null);
      setErrors({});
      
      // Refresh tasks if task list is shown
      if (showTaskList) {
        await fetchTasks();
      }
      
    } catch (error) {
      console.error("Error creating task:", error);
      let errorMessage = "Failed to create task.";
      
      if (error.response) {
        console.error("Error response:", error.response.data);
        if (error.response.data) {
          // Handle specific error messages from backend
          if (error.response.data.assigned_to) {
            errorMessage = `Invalid user: ${error.response.data.assigned_to[0]}`;
            setErrors(prev => ({ ...prev, assignTo: error.response.data.assigned_to[0] }));
          } else if (error.response.data.assigned_by) {
            errorMessage = `Invalid assigner: ${error.response.data.assigned_by[0]}`;
            setErrors(prev => ({ ...prev, assignBy: error.response.data.assigned_by[0] }));
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          }
        }
      }
      
      alert(errorMessage);
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
  const role = localStorage.getItem('role');
  if (role === 'admin') {
    navigate('/AdminDashboard');
  } else if (role === 'staff') {
    navigate('/Intern');
  } else if (role === 'intern') {
    navigate('/Dash');
  } else {
    navigate('/'); // fallback
  }
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
                  <Autocomplete
                    options={intern}
                    getOptionLabel={(option) => {
                      if (!option) return '';
                      if (typeof option === 'string') return option;
                      return option.label || option.displayName || option.username || 'Unknown';
                    }}
                    value={assignTo}
                    onChange={(event, newValue) => {
                      setAssignTo(newValue);
                      if (errors.assignTo) {
                        setErrors(prev => ({
                          ...prev,
                          assignTo: undefined
                        }));
                      }
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return (option.id && value.id && option.id === value.id) || 
                             (option.username && value.username && option.username === value.username);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Assigned To"
                        variant="outlined"
                        fullWidth
                        error={!!errors.assignTo}
                        helperText={errors.assignTo || 'Start typing to search users'}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id || option.username}>
                        {option.label || option.displayName || option.username || 'Unknown'}
                      </li>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={staff}
                    getOptionLabel={(option) => {
                      if (!option) return '';
                      if (typeof option === 'string') return option;
                      return option.label || option.displayName || option.username || 'Unknown';
                    }}
                    value={assignBy}
                    onChange={(event, newValue) => {
                      setAssignBy(newValue);
                      if (errors.assignBy) {
                        setErrors(prev => ({
                          ...prev,
                          assignBy: undefined
                        }));
                      }
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return (option.id && value.id && option.id === value.id) || 
                             (option.username && value.username && option.username === value.username);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Assigned By"
                        variant="outlined"
                        fullWidth
                        error={!!errors.assignBy}
                        helperText={errors.assignBy || 'Start typing to search users'}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id || option.username}>
                        {option.label || option.displayName || option.username || 'Unknown'}
                      </li>
                    )}
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