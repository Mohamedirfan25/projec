import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  TextField,
  Tabs,
  Tab,
  ThemeProvider,
  createTheme,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Notifications, AccountCircle } from "@mui/icons-material";
import { Bar } from "react-chartjs-2";
import PaymentList from "./PaymentList"; // Make sure this component is correctly implemented

// Customized theme for professional appearance
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Custom blue
    },
    secondary: {
      main: "#f50057", // Custom pink
    },
    background: {
      default: "#f4f6f8", // Light background
      paper: "#ffffff", // Paper color for cards
    },
    text: {
      primary: "#333333", // Dark text for readability
    },
  },
});

// Chart data mocks
const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Payments Over Time",
      data: [500, 800, 600, 900, 1200, 1500, 1700],
      backgroundColor: "rgba(25, 118, 210, 0.6)", // Blue background for the chart
      borderColor: "rgba(25, 118, 210, 1)", // Blue border for the chart
      borderWidth: 1,
    },
  ],
};

// Mock intern data
const mockInterns = [
  { id: 1, name: "John Doe", role: "Developer", feeAmount: 2000, paid: true },
  { id: 2, name: "Jane Smith", role: "Designer", feeAmount: 2000, paid: false },
  { id: 3, name: "Sam Wilson", role: "Manager", feeAmount: 2000, paid: false },
];

const Dashboard = () => {
  const [showTabContent, setShowTabContent] = useState("Payments Chart");
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    email: "",
    amount: "",
  });

  const handleClickOpenPaymentDialog = (intern) => {
    setSelectedIntern(intern);
  };

  const handlePaymentConfirm = () => {
    // Handle payment confirmation logic here
    console.log("Payment confirmed for:", selectedIntern);
    setSelectedIntern(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log("Form Data Submitted: ", formData);
    // You can add additional logic here to handle the submitted data (e.g., save to state, API call, etc.)
    setFormData({ name: "", id: "", email: "", amount: "" }); // Reset form
  };

  const renderPaymentsContent = () => (
    <Grid container spacing={3} style={{ marginTop: 20 }}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payments Trend Over Time
            </Typography>
            <Bar data={chartData} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payment List
            </Typography>
            <Box style={{ maxHeight: "400px", overflowY: "auto" }}>
              {mockInterns.map((intern) => (
                <Card
                  key={intern.id}
                  style={{
                    margin: "20px 0",
                    border: `1px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <CardContent
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <Typography variant="subtitle1">{intern.name}</Typography>
                      <Typography variant="body2">{`${intern.role} - Fee: $${intern.feeAmount}`}</Typography>
                    </div>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => handleClickOpenPaymentDialog(intern)}
                    >
                      Mark as Paid
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderManualDataEntryContent = () => (
    <Grid container spacing={3} style={{ marginTop: 20 }}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Manual Data Entry
            </Typography>
            <form onSubmit={handleFormSubmit}>
              <TextField
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <TextField
                margin="dense"
                label="ID"
                type="text"
                fullWidth
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                required
              />
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <TextField
                margin="dense"
                label="Amount"
                type="number"
                fullWidth
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
              <Button
                type="submit"
                color="primary"
                style={{ marginTop: "20px" }}
              >
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth={false} style={{ height: "100vh", padding: 0 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <Notifications />
            </IconButton>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Payroll Staff Dashboard
            </Typography>
            <Button
              color="inherit"
              startIcon={<AccountCircle />}
              onClick={() => alert("Profile Clicked!")}
            >
              Profile
            </Button>
          </Toolbar>
        </AppBar>

        <Tabs
          value={showTabContent}
          onChange={(event, newValue) => {
            setShowTabContent(newValue);
          }}
          indicatorColor="secondary"
          textColor="inherit"
          variant="scrollable"
          scrollButtons="auto"
          style={{ marginTop: "8px", marginBottom: "0px" }}
        >
          <Tab label="Payments Chart" value="Payments Chart" />
          <Tab label="Payment List" value="Payment Table" />
          <Tab label="Manual Entry" value="Manual Entry" />
        </Tabs>

        {showTabContent === "Payments Chart" ? (
          renderPaymentsContent()
        ) : showTabContent === "Payment Table" ? (
          <PaymentList interns={mockInterns} />
        ) : (
          renderManualDataEntryContent()
        )}

        {/* Payment Confirmation Dialog */}
        {selectedIntern && (
          <Dialog
            open={Boolean(selectedIntern)}
            onClose={() => setSelectedIntern(null)}
          >
            <DialogTitle>
              Process Payment for {selectedIntern?.name || ""}
            </DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Intern Name"
                type="text"
                fullWidth
                value={selectedIntern?.name || ""}
                InputProps={{ readOnly: true }}
              />
              <TextField
                margin="dense"
                label="Intern ID"
                type="text"
                fullWidth
                value={selectedIntern?.id || ""}
                InputProps={{ readOnly: true }}
              />
              <TextField
                margin="dense"
                label="Total Internship Fee"
                type="number"
                fullWidth
                value={selectedIntern?.feeAmount || ""}
                InputProps={{ readOnly: true }}
              />
              <TextField
                margin="dense"
                label="Amount Paid"
                type="number"
                fullWidth
              />
              <TextField
                select
                margin="dense"
                label="Payment Mode"
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedIntern(null)} color="primary">
                Cancel
              </Button>
              <Button onClick={handlePaymentConfirm} color="primary">
                Confirm Payment
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default Dashboard;
