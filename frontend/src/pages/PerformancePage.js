import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Card, Typography, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { LineChart as RechartsLineChart, RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, CartesianGrid, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from "recharts";
import { RadialBarChart, RadialBar, Line } from "recharts";
// import TaskCompletionChart from "./TaskCompletionChart"; // Adjust path accordingly

// 📌 Productivity Chart (Line Chart)
const ProductivityWaveChart = ({ darkMode }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductivityData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/Sims/tasks/", {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        });

        // Format API response for the chart
        const formattedData = response.data.map(task => ({
          day: task.start_date, // Ensure proper formatting (YYYY-MM-DD or Day names)
          committedTime: task.hours_committed,
          actualTime: task.hours_actual || task.hours_committed, // Adjust based on API data
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching productivity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductivityData();
  }, []);

  return (
    <Card
      sx={{
        width: "100%",
        height: 500, // Increased height for better visibility
        p: 3,
        mb: 4, // More bottom margin to avoid tight spacing
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        bgcolor: darkMode ? "#1E1E1E" : "#FFFFFF",
        boxShadow: 4,
        borderRadius: "20px",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: darkMode ? "#FFFFFF" : "#000000",
          mb: 5, // Increased bottom spacing for better alignment
          textAlign: "center",
        }}
      >
        Productivity (Committed vs Actual Time)
      </Typography>

      {loading ? (
        <Typography sx={{ textAlign: "center", color: darkMode ? "#FFFFFF" : "#000000" }}>
          Loading...
        </Typography>
      ) : (
        <Box sx={{ width: "100%", height: "95%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={chartData}
              margin={{ top: 20, right: 40, left: 40, bottom: 50 }} // Adjusted for better grid spacing
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ccc"} />
              <XAxis
                dataKey="day"
                tick={{ fill: darkMode ? "#FFFFFF" : "#666", fontSize: 14 }}
                axisLine={{ stroke: darkMode ? "#444" : "#ccc" }}
                angle={-25} // Tilted for better spacing
                height={80} // More space for X-axis labels
              />
              <YAxis
                domain={[0, 20]}
                tick={{ fill: darkMode ? "#FFFFFF" : "#666", fontSize: 14 }}
                axisLine={{ stroke: darkMode ? "#444" : "#ccc" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#333" : "#FFF",
                  color: darkMode ? "#FFF" : "#000",
                  borderRadius: "8px",
                  border: "none",
                }}
                itemStyle={{ fontSize: "14px" }} // Larger tooltip text
              />
              <Legend
                iconSize={14}
                wrapperStyle={{
                  paddingTop: "10px",
                  color: darkMode ? "#FFFFFF" : "#000000",
                  textAlign: "center",
                }}
              />
              <Line
                type="monotone"
                dataKey="committedTime"
                name="Committed Time (hours)"
                stroke="#6C63FF"
                strokeWidth={4}
                dot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="actualTime"
                name="Actual Time (hours)"
                stroke="#FF6384"
                strokeWidth={4}
                dot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Card>
  );
};

// 📌 Monthly Task Completion Chart
const TaskCompletionChart = ({ darkMode }) => {
  const [taskCounts, setTaskCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskCounts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/Sims/tasks/monthly-count/", {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        });

        const formattedData = Object.entries(response.data.task_counts).map(([month, count]) => ({
          month,
          count,
        }));

        setTaskCounts(formattedData);
      } catch (error) {
        console.error("Error fetching task counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskCounts();
  }, []);

  return (
    <Card sx={{ width: "100%", height: 300, p: 2 }}>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : taskCounts.length === 0 ? (
        <Typography>No Data Available</Typography>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={taskCounts}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ddd"} />
            <XAxis dataKey="month" tick={{ fill: darkMode ? "#FFFFFF" : "#666" }} />
            <YAxis tick={{ fill: darkMode ? "#FFFFFF" : "#666" }} domain={[0, "dataMax + 5"]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#6C63FF" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};


const PerformancePage = ({ darkMode }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        p: 2,
        bgcolor: darkMode ? "#121212" : "#F8FAFC",
        color: darkMode ? "#FFFFFF" : "#000000",
        maxWidth: "100%",
      }}
    >
      {/* 📌 First Row: Overall Performance and Task Completion */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: "20px",
          width: "100%",
        }}
      >
        
        {/* Task Completion Chart */}
        <Card sx={{ width: "100%", height: 300, p: 2 }}>
  <Typography variant="h6">Monthly Task Completion</Typography>
  <TaskCompletionChart darkMode={darkMode} />
</Card>


    {/* -------------------------------------- */}
      </Box>

      
      {/* 📌 Third Row: Productivity Chart */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: "20px",
          width: "100%",
        }}
      >
        <Card
          sx={{
            width: { xs: "100%", md: "100%" }, // Adjusted width
            height: { xs: "auto", md: "500px" }, // Adjusted height
            boxShadow: 3,
            borderRadius: "20px",
            bgcolor: darkMode ? "#1E1E1E" : "#FFFFFF",
            p:4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between", // Ensures content is spaced properly
          }}
        >
          <Box sx={{ flex: 1 }}> {/* Ensures the chart takes up remaining space */}
            <ProductivityWaveChart darkMode={darkMode} />
          </Box>
        </Card>
      </Box>

    </Box>
  );
};

export default PerformancePage;

// // // #---------------------------------------------------------------

