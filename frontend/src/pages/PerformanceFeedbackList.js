import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Box,
  Rating,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  styled,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import dayjs from "dayjs";
import axios from "axios";

// Styled components
const StyledRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#FFD700',
  },
});

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: 4,
}));

const PerformanceFeedbackList = () => {
  const [currentInternId, setCurrentInternId] = useState(null);
 // Assuming the intern ID you want to retrieve feedback for is '2'.
  const [search, setSearch] = useState("");
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
  
        // Step 1: Get current logged-in intern's emp_id
        const userResponse = await axios.get("http://localhost:8000/Sims/temps/", {
          headers: { Authorization: `Token ${token}` }
        });
  
        const empId = userResponse.data.emp_id;
        setCurrentInternId(empId);
  
        // Step 2: Get feedback data
        const feedbackResponse = await axios.get("http://localhost:8000/Sims/feedback/", {
          headers: { Authorization: `Token ${token}` }
        });
  
        setFeedbackData(feedbackResponse.data);
        console.log("Feedback data:", feedbackResponse.data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  
  // Empty dependency array ensures this runs only once, when the component is mounted
  const filteredFeedback = useMemo(() => {
    if (!currentInternId) return [];
    return feedbackData
      .filter((item) => item.feedback_to.emp_id === currentInternId)
      .filter((item) =>
        item.comments.toLowerCase().includes(search.toLowerCase()) ||
        item.feedback_by.username.toLowerCase().includes(search.toLowerCase())
      );
  }, [search, feedbackData, currentInternId]);
  
  if (loading) return <Typography align="center">Loading feedback...</Typography>;
  if (error) return <Typography align="center" color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
        My Internship Feedback
      </Typography>

      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer 
        component={Paper}
        elevation={4}
        sx={{
          borderRadius: 4,
          maxHeight: 600,
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#1976d2',
            borderRadius: 4,
          },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 15 }}>Intern</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 15 }}>Rating</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 15 }}>Comments</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 15 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 15 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 15 }}>Given By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFeedback.map((item) => (
              <TableRow hover key={item.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ 
                      bgcolor: '#1976d2', 
                      mr: 2,
                      width: 36,
                      height: 36,
                      fontSize: 14
                    }}>
                      {item.feedback_to.username.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="bold">{item.feedback_to.username}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {item.feedback_to.emp_id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <StyledRating 
                    value={parseFloat(item.rating)} 
                    precision={0.5} 
                    readOnly 
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {item.rating}/5.0
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title={item.comments}>
                    <Typography sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.comments}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {dayjs(item.feedback_date).format("MMM D, YYYY")}
                </TableCell>
                <TableCell>
                  <StatusChip 
                    label={item.status} 
                    color={item.status === "Updated" ? "primary" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {item.feedback_by.username}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredFeedback.length === 0 && (
        <Typography align="center" color="text.secondary" sx={{ mt: 3 }}>
          No feedback found matching your search criteria
        </Typography>
      )}
    </Container>
  );
};

export default PerformanceFeedbackList;