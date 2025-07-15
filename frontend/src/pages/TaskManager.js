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
  Avatar,
  Badge,
  Divider,
  Tooltip,
  useTheme,
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
  Person,
  TaskAlt,
  PendingActions,
  ErrorOutline,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import "./App.css";

const MAX_TASK_WORDS = 2;

const StatusBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 10,
    top: 15,
    padding: '0 4px',
  },
}));

const truncateTaskName = (name) => {
  const words = name.split(" ");
  if (words.length > MAX_TASK_WORDS) {
    return `${words.slice(0, MAX_TASK_WORDS).join(" ")}...`;
  }
  return name;
};

const TaskManager = () => {
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [internFilter, setInternFilter] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedStatus, setEditedStatus] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [interns, setInterns] = useState([]);
  const [viewTaskDetails, setViewTaskDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      // Fetch all tasks
      const tasksResponse = await axios.get("http://localhost:8000/Sims/tasks/", {
        headers: { Authorization: `Token ${token}` },
      });

      // Fetch interns (users with role 'intern')
      const internsResponse = await axios.get("http://localhost:8000/Sims/users/?role=intern", {
        headers: { Authorization: `Token ${token}` },
      });

      setInterns(internsResponse.data);

      const mappedTasks = tasksResponse.data.map((task) => ({
        id: task.id,
        taskName: task.task_title,
        description: task.description,
        startDate: new Date(task.start_date).toLocaleDateString(),
        endDate: new Date(task.end_date).toLocaleDateString(),
        assignedTo: task.assigned_to_user,
        assignedToName: internsResponse.data.find(s => s.id === task.assigned_to_user)?.name || 'Unknown Intern',
        assignedToId: task.assigned_to_user, // Adding Intern ID
        committedDate: task.committed_date ? new Date(task.committed_date).toLocaleString() : null,
        status: task.status,
        priority: task.priority,
        attachments: task.attachments || [],
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/Sims/tasks/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      setTasks(tasks.filter((task) => task.id !== id));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/Sims/tasks/${id}/`,
        { status: newStatus },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setTasks(tasks.map((task) => 
        task.id === id ? { ...task, status: newStatus } : task
      ));
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (task.taskName?.toLowerCase().includes(filter.toLowerCase()) ?? false) &&
      (statusFilter ? task.status === statusFilter : true) &&
      (internFilter ? task.assignedTo?.toString() === internFilter : true)
  );

  const paginatedTasks = filteredTasks.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return { 
          background: theme.palette.warning.light, 
          color: theme.palette.warning.dark,
          icon: <PendingActions fontSize="small" />
        };
      case "Completed":
        return { 
          background: theme.palette.success.light, 
          color: theme.palette.success.dark,
          icon: <TaskAlt fontSize="small" />
        };
      case "Missing":
        return { 
          background: theme.palette.error.light, 
          color: theme.palette.error.dark,
          icon: <ErrorOutline fontSize="small" />
        };
      default:
        return { 
          background: theme.palette.grey[200], 
          color: theme.palette.text.primary,
          icon: <Assignment fontSize="small" />
        };
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
    setEditingTaskId(task.id);
    handleCloseMenu();
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task.id);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (task) => {
    setViewTaskDetails(task);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Paper
      sx={{
        padding: 4,
        fontFamily: "'Inter', sans-serif",
        borderRadius: 3,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Task Details Dialog */}
      <Dialog
        open={!!viewTaskDetails}
        onClose={() => setViewTaskDetails(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.common.white,
          fontWeight: 600,
        }}>
          Task Details
        </DialogTitle>
        <DialogContent>
          {viewTaskDetails && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {viewTaskDetails.taskName}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Avatar 
                      src={interns.find(s => s.id === viewTaskDetails.assignedTo)?.avatar} 
                      sx={{ width: 32, height: 32 }}
                    />
                    <Typography variant="body1">{viewTaskDetails.assignedToName}</Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Chip
                      label={viewTaskDetails.status}
                      sx={{
                        background: getStatusColor(viewTaskDetails.status).background,
                        color: getStatusColor(viewTaskDetails.status).color,
                        fontWeight: 'medium',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Description
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                {viewTaskDetails.description || "No description provided"}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                  <Typography variant="body1">{viewTaskDetails.startDate}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                  <Typography variant="body1">{viewTaskDetails.endDate}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Submitted Date</Typography>
                  <Typography variant="body1">{viewTaskDetails.committedDate || "Not submitted"}</Typography>
                </Box>
              </Box>
              
              {viewTaskDetails.attachments.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Attachments
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                    {viewTaskDetails.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        size="small"
                        component="a"
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<Assignment fontSize="small" />}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                        }}
                      >
                        {attachment.name || `Attachment ${index + 1}`}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setViewTaskDetails(null)}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
        <Assignment sx={{ 
          marginRight: 1, 
          fontSize: 40,
          color: theme.palette.primary.main 
        }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Intern Task Management
        </Typography>
      </Box>

      {/* Status Quick Filters */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3,
        flexWrap: 'wrap'
      }}>
        <Button
          variant="outlined"
          onClick={() => {
            setFilter("");
            setStatusFilter("");
            setInternFilter("");
          }}
          startIcon={<Refresh />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Clear Filters
        </Button>
        <Button
          variant={statusFilter === "Completed" ? "contained" : "outlined"}
          onClick={() => setStatusFilter("Completed")}
          startIcon={<TaskAlt />}
          color="success"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Completed ({statusCounts.Completed || 0})
        </Button>
        <Button
          variant={statusFilter === "Pending" ? "contained" : "outlined"}
          onClick={() => setStatusFilter("Pending")}
          startIcon={<PendingActions />}
          color="warning"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Pending ({statusCounts.Pending || 0})
        </Button>
        <Button
          variant={statusFilter === "Missing" ? "contained" : "outlined"}
          onClick={() => setStatusFilter("Missing")}
          startIcon={<ErrorOutline />}
          color="error"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
          }}
        >
          Missing ({statusCounts.Missing || 0})
        </Button>
      </Box>

      {/* Search and Filter Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          marginBottom: 3,
          flexWrap: 'wrap',
          alignItems: 'center',
          backgroundColor: theme.palette.grey[50],
          p: 2,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search tasks"
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
            sx={{ 
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          
          <Select
            value={internFilter}
            onChange={(e) => setInternFilter(e.target.value)}
            size="small"
            displayEmpty
            renderValue={(value) => {
              const selectedIntern = interns.find(s => s.id.toString() === value);
              return (
                <Box sx={{ display: "flex", gap: 1, alignItems: 'center' }}>
                  {selectedIntern ? (
                    <>
                      <Avatar 
                        src={selectedIntern.avatar} 
                        sx={{ width: 24, height: 24 }}
                      />
                      <span>{selectedIntern.name}</span>
                    </>
                  ) : (
                    <>
                      <Person fontSize="small" />
                      <span>All Interns</span>
                    </>
                  )}
                </Box>
              );
            }}
            sx={{ 
              minWidth: 220,
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
              },
              borderRadius: 2,
            }}
          >
            <MenuItem value="">
              <Box sx={{ display: "flex", gap: 1, alignItems: 'center' }}>
                <Person fontSize="small" />
                All Interns
              </Box>
            </MenuItem>
            {interns.map((intern) => (
              <MenuItem key={intern.id} value={intern.id.toString()}>
                <Box sx={{ display: "flex", gap: 1, alignItems: 'center' }}>
                  <Avatar src={intern.avatar} sx={{ width: 24, height: 24 }} />
                  {intern.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Main Table */}
      <TableContainer 
        component={Paper}
        sx={{
          borderRadius: 2,
          border: `1px solid ${theme.palette.grey[200]}`,
          boxShadow: 'none',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: theme.palette.grey[300],  // Grey title color
              '& th': {
                fontWeight: 600,
                color: theme.palette.text.secondary,
              }
            }}>
              <TableCell>Intern Name</TableCell>
              <TableCell>Intern ID</TableCell>
              <TableCell>Task Name</TableCell>
              <TableCell>Committed Date</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : paginatedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No tasks found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              paginatedTasks.map((task) => (
                <TableRow
                  key={task.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <TableCell sx={{ color: 'black' }}>{task.assignedToName}</TableCell>
                  <TableCell sx={{ color: 'black' }}>{task.assignedToId}</TableCell>
                  <TableCell sx={{ color: 'black' }}>
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewDetails(task);
                      }}
                      sx={{ 
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      {truncateTaskName(task.taskName)}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ color: 'black' }}>{task.committedDate || <Typography color="text.secondary">Not submitted</Typography>}</TableCell>
                  <TableCell sx={{ color: 'black' }}>{task.startDate}</TableCell>
                  <TableCell sx={{ color: 'black' }}>{task.endDate}</TableCell>
                  <TableCell sx={{ color: 'black' }}>
                    <Chip
                      label={task.status}
                      icon={getStatusColor(task.status).icon}
                      sx={{
                        background: getStatusColor(task.status).background,
                        color: getStatusColor(task.status).color,
                        fontWeight: 'medium',
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {paginatedTasks.length} of {filteredTasks.length} tasks
        </Typography>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">Rows per page:</Typography>
            <Select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              size="small"
              sx={{
                borderRadius: 2,
                '& .MuiSelect-select': {
                  py: 1,
                }
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              size="small"
              sx={{
                backgroundColor: theme.palette.grey[100],
                '&:hover': {
                  backgroundColor: theme.palette.grey[200],
                },
                '&:disabled': {
                  backgroundColor: theme.palette.grey[50],
                }
              }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
            <Typography variant="body2">
              Page {page} of {Math.ceil(filteredTasks.length / rowsPerPage) || 1}
            </Typography>
            <IconButton
              disabled={page >= Math.ceil(filteredTasks.length / rowsPerPage)}
              onClick={() => setPage(page + 1)}
              size="small"
              sx={{
                backgroundColor: theme.palette.grey[100],
                '&:hover': {
                  backgroundColor: theme.palette.grey[200],
                },
                '&:disabled': {
                  backgroundColor: theme.palette.grey[50],
                }
              }}
            >
              <ArrowForward fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm Task Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDeleteTask(taskToDelete);
              setDeleteDialogOpen(false);
            }}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Delete Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Edit Dialog */}
      <Dialog
        open={!!editingTaskId}
        onClose={() => setEditingTaskId(null)}
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Update Task Status
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Select
            value={editedStatus}
            onChange={(e) => setEditedStatus(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Missing">Missing</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setEditingTaskId(null)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleEditStatus(editingTaskId, editedStatus);
              setEditingTaskId(null);
            }}
            color="primary"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TaskManager;