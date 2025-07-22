import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Rating,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  useTheme,
  ThemeProvider,
  createTheme,
  styled,
  Box
} from "@mui/material";
import {
  Feedback,
  Star,
  CheckCircle,
  Delete,
  Edit,
  Search,
  Close,
  Save,
  Cancel
} from "@mui/icons-material";
import axios from "axios";
import { useColorMode } from '../index';
import { CssBaseline } from '@mui/material';
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      dark: '#0d47a1',
      light: '#e3f2fd',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0',
      dark: '#7b1fa2',
      light: '#f3e5f5',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
      darkDefault: '#121212',
      darkPaper: '#1e1e1e',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      darkPrimary: '#ffffff',
      darkSecondary: '#e0e0e0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.primary.dark
            : theme.palette.primary.main,
        }),
        contained: ({ theme }) => ({
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? theme.palette.primary.dark
              : '#1565c0',
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'all 0.3s ease',
          bgcolor: theme.palette.mode === 'dark' 
            ? theme.palette.background.darkPaper
            : theme.palette.background.paper,
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.23)'
                : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: theme.palette.mode === 'dark' 
                ? theme.palette.primary.dark
                : theme.palette.primary.main,
            },
          },
        }),
      },
    },
  },
});
// Styled components
const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#FFD700',
  },
  '& .MuiRating-iconHover': {
    color: '#FFC107',
  },
});

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: 4,
  bgcolor: theme.palette.mode === 'dark' 
    ? theme.palette.background.darkPaper
    : theme.palette.background.paper,
  color: theme.palette.mode === 'dark' 
    ? theme.palette.text.darkPrimary
    : theme.palette.text.primary,
}));

const PerformanceFeedbackPage = () => {
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const [feedback, setFeedback] = useState({
    emp_id: "",
    studentName: "",
    rating: 0,
    comments: "",
  });
  const [errors, setErrors] = useState({});
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    rating: 0,
    comments: "",
  });

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Fetch feedback history on component mount
    
  const fetchFeedbackHistory = async () => {
    try {
      const response = await axios.get("http://localhost:8000/Sims/feedback/", {
        headers: { Authorization: `Token ${token}` }
      });
  
      const formattedFeedback = response.data
  .filter(item => item.feedback_to.role === "intern")  // optional
  .map(item => ({
    id: item.id,
    emp_id: item.feedback_to.emp_id,
    studentName: item.feedback_to.username,
    rating: parseFloat(item.rating),
    comments: item.comments,
    date: new Date(item.created_date).toLocaleDateString(),
    status: item.status || "Submitted"
  }));

  
      setFeedbackHistory(formattedFeedback);
    } catch (error) {
      console.error("Error fetching feedback history:", error);
      showSnackbar("Failed to load feedback history", "error");
    }
  };
  useEffect(() => {
    fetchFeedbackHistory(); // ✅ Call it on mount
  }, [token]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback({ ...feedback, [name]: value });
  };

  // Handle rating change
  const handleRatingChange = (event, newValue) => {
    setFeedback({ ...feedback, rating: newValue });
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  // Handle edit rating change
  const handleEditRatingChange = (event, newValue) => {
    setEditForm({ ...editForm, rating: newValue });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!feedback.emp_id) newErrors.emp_id = "Intern ID is required";
    if (!feedback.studentName) newErrors.studentName = "Student Name is required";
    if (!feedback.rating) newErrors.rating = "Rating is required";
    if (!feedback.comments) newErrors.comments = "Comments are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  useEffect(() => {
    theme.palette.mode = colorMode;
  }, [colorMode]);
  // Auto-fill student name when intern ID changes
  useEffect(() => {
    const fetchInternName = async () => {
      if (feedback.emp_id) {
        try {
          console.log("🔍 Fetching name with ID:", feedback.emp_id);
          const response = await axios.get(
            `http://localhost:8000/Sims/temps/${feedback.emp_id}/`,
            {
              headers: { Authorization: `Token ${token}` },
            }
          );
          console.log("✅ Response:", response.data);
  
          if (response.data.role === "intern" || response.data.role === "staff") {
            setFeedback(prev => ({
              ...prev,
              studentName: response.data.username,
            }));
            setErrors(prev => ({ ...prev, emp_id: "" }));  // Clear emp_id error
          } else {
            setFeedback(prev => ({ ...prev, studentName: "" }));
            setErrors(prev => ({ ...prev, emp_id: "Provided ID is not found" }));
          }
        } catch (error) {
          console.error("❌ Error fetching intern details:", error.response?.data || error.message);
          setFeedback(prev => ({ ...prev, studentName: "" }));
          setErrors(prev => ({ ...prev, emp_id: "Intern not found or invalid ID" }));
        }
      }
    };
  
    const debounceTimer = setTimeout(fetchInternName, 500);
    return () => clearTimeout(debounceTimer);
  }, [feedback.emp_id, token]);
  
  
  // Submit feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setLoading(true);
  
    try {
      await axios.post(
        "http://localhost:8000/Sims/feedback/",
        {
          feedback_to: feedback.emp_id,
          rating: feedback.rating,
          comments: feedback.comments,
        },
        {
          headers: { Authorization: `Token ${token}` }
        }
      );
  
      await fetchFeedbackHistory(); // ✅ Refresh the list from backend
      showSnackbar("Feedback submitted successfully!", "success");
  
      // Reset form
      setFeedback({
        emp_id: "",
        studentName: "",
        rating: 0,
        comments: "",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showSnackbar("Error submitting feedback", "error");
    } finally {
      setLoading(false);
    }
  };
  
  // Delete feedback
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/Sims/feedback/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setFeedbackHistory(prev => prev.filter(item => item.id !== id));
      showSnackbar("Feedback deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      showSnackbar("Failed to delete feedback", "error");
    }
  };

  // Open edit dialog
  const handleEdit = (id) => {
    const feedbackToEdit = feedbackHistory.find(item => item.id === id);
    if (feedbackToEdit) {
      setEditForm({
        rating: feedbackToEdit.rating,
        comments: feedbackToEdit.comments,
      });
      setEditingId(id);
      setEditDialogOpen(true);
    }
  };

  // Save edited feedback
  const handleEditSave = async () => {
    try {
      await axios.patch(
        `http://localhost:8000/Sims/feedback/${editingId}/`,
        {
          rating: editForm.rating,
          comments: editForm.comments,
        },
        {
          headers: { Authorization: `Token ${token}` }
        }
      );

      setFeedbackHistory(prev =>
        prev.map(item =>
          item.id === editingId
            ? { ...item, ...editForm, status: "Updated" }
            : item
        )
      );
      setEditDialogOpen(false);
      showSnackbar("Feedback updated successfully!", "success");
    } catch (error) {
      console.error("Error updating feedback:", error);
      showSnackbar("Failed to update feedback", "error");
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
<Container 
  sx={{ 
    bgcolor: theme.palette.mode === 'dark' 
      ? theme.palette.background.darkDefault 
      : theme.palette.background.default,
    minHeight: '100vh',
    color: theme.palette.mode === 'dark' 
      ? theme.palette.text.darkPrimary 
      : theme.palette.text.primary,
    p: 3,
  }}
>      <Grid container spacing={4}>
        {/* Left Side: Feedback Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ 
            p: 3,
            bgcolor: theme.palette.mode === 'dark' 
              ? theme.palette.background.darkPaper
              : theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 1px 3px rgba(255,255,255,0.1)'
              : '0 1px 3px rgba(0,0,0,0.1)',
          }}>
<Typography
  variant="h5"
  component="h1"
  gutterBottom
  sx={{
    mb: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.mode === 'dark' 
      ? theme.palette.text.darkPrimary 
      : theme.palette.text.primary,
  }}
>
              <Feedback sx={{ mr: 1, fontSize: 32 }} />
              Student Performance Feedback
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Intern ID */}
                <Grid item xs={12}>
                <TextField
  fullWidth
  label="Intern ID"
  name="emp_id"
  value={feedback.emp_id}
  onChange={handleChange}
  sx={{
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.23)'
          : 'rgba(0, 0, 0, 0.23)',
      },
      '&:hover fieldset': {
        borderColor: theme.palette.mode === 'dark' 
          ? theme.palette.primary.dark
          : theme.palette.primary.main,
      },
    },
  }}
/>
                </Grid>

                {/* Student Name */}
                <Grid item xs={12}>
                <TextField
  fullWidth
  label="Student Name"
  name="studentName"
  value={feedback.studentName}
  onChange={handleChange}
                    error={!!errors.studentName}
                    helperText={errors.studentName}
                    variant="outlined"
                    disabled
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.23)'
                            : 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.mode === 'dark' 
                            ? theme.palette.primary.dark
                            : theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Rating */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: theme.palette.mode === 'dark' 
                  ? theme.palette.text.darkPrimary 
                  : theme.palette.text.primary }}>
                    Overall Performance Rating:
                  </Typography>
                  <StyledRating
                    name="rating"
                    value={feedback.rating}
                    onChange={handleRatingChange}
                    precision={0.5}
                    size="large"
                    icon={<Star fontSize="inherit" sx={{ color: theme.palette.warning.main }} />}
                    emptyIcon={<Star fontSize="inherit" />}
                  />
                  {errors.rating && (
                    <FormHelperText error>{errors.rating}</FormHelperText>
                  )}
                </Grid>

                {/* Comments */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Detailed Comments"
                    name="comments"
                    value={feedback.comments}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    error={!!errors.comments}
                    helperText={errors.comments}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.23)'
                            : 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.mode === 'dark' 
                            ? theme.palette.primary.dark
                            : theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 12px rgba(25, 118, 210, 0.4)',
                      }
                    }}
                  >
                    {loading ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Right Side: Feedback History */}
        <Grid item xs={12} md={6}>
        <Paper
  sx={{
    p: 3,
    bgcolor: theme.palette.mode === 'dark' 
      ? theme.palette.background.darkPaper
      : theme.palette.background.paper,
    borderRadius: 2,
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 1px 3px rgba(255,255,255,0.1)'
      : '0 1px 3px rgba(0,0,0,0.1)',
  }}
>
            <Typography 
              variant="h5" 
              gutterBottom 
              align="center" 
              sx={{ 
                fontWeight: 'bold', 
                color: theme.palette.primary.dark,
                mb: 3
              }}
            >
              Feedback History
            </Typography>
            <TableContainer sx={{ 
              flex: 1, 
              maxHeight: 500, 
              overflow: 'auto',
              borderRadius: 2,
              '&::-webkit-scrollbar': {
                width: 8,
              },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.grey[200],
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.primary.main,
                borderRadius: 4,
              },
            }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      color: 'text.primary', 
                      backgroundColor: theme.palette.grey[300],
                      fontSize: 15
                    }}>Intern</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      color: 'text.primary', 
                      backgroundColor: theme.palette.grey[300],
                      fontSize: 15
                    }}>Rating</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      color: 'text.primary', 
                      backgroundColor: theme.palette.grey[300],
                      fontSize: 15
                    }}>Comments</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      color: 'text.primary', 
                      backgroundColor: theme.palette.grey[300],
                      fontSize: 15
                    }}>Date</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      color: 'text.primary', 
                      backgroundColor: theme.palette.grey[300],
                      fontSize: 15
                    }}>Status</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      color: 'text.primary', 
                      backgroundColor: theme.palette.grey[300],
                      fontSize: 15
                    }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feedbackHistory.map((row) => (
                    <TableRow 
                      key={row.id}
                      hover
                      sx={{ 
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover
                        },
                        '&:last-child td': {
                          borderBottom: 0
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ 
                            bgcolor: theme.palette.primary.main, 
                            mr: 2,
                            width: 36,
                            height: 36,
                            fontSize: 14
                          }}>
                            {row.studentName.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="bold">{row.studentName}</Typography>
                            <Typography variant="body2" color="text.secondary">ID: {row.emp_id}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <StyledRating 
                          value={row.rating} 
                          precision={0.5} 
                          readOnly 
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {row.rating.toFixed(1)}/5.0
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={row.comments}>
                          <Typography 
                            sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {row.comments}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <StatusChip 
                          label={row.status} 
                          color={row.status === "Updated" ? "primary" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit feedback">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(row.id)}
                            sx={{ '&:hover': { bgcolor: theme.palette.primary.light } }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete feedback">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(row.id)}
                            sx={{ '&:hover': { bgcolor: theme.palette.error.light } }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 'bold'
        }}>
          Edit Feedback
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Performance Rating:
              </Typography>
              <StyledRating
                name="rating"
                value={editForm.rating}
                onChange={handleEditRatingChange}
                precision={0.5}
                size="large"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Detailed Comments"
                name="comments"
                value={editForm.comments}
                onChange={handleEditChange}
                multiline
                rows={6}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            startIcon={<Close />}
            sx={{ color: theme.palette.text.secondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            color="primary"
            startIcon={<Save />}
            sx={{ fontWeight: 'bold' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};


const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PerformanceFeedbackPage />
    </ThemeProvider>
  );
};

export default App;