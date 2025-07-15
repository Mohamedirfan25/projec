import React, { useState , useEffect} from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Grid,
  CssBaseline,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const AssetReport = () => {
  
  const [laptopId, setLaptopId] = useState("");
  const [asset, setAsset] = useState("Laptop");
  const [issue, setIssue] = useState("");
  const [condition, setCondition] = useState("");
  const [itSupport, setItSupport] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [requestedAsset, setRequestedAsset] = useState("");
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [openAssetHistoryDialog, setOpenAssetHistoryDialog] = useState(false);
  const [assetHistory, setAssetHistory] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode); // Toggle the dark mode state
  };

  // Create theme based on dark mode state
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light', // Set the mode
      text: {
        primary: isDarkMode ? '#fff' : '#000', // Set text color based on mode
      },
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
  
    if (!laptopId || !issue || !condition || !itSupport) {
      setErrorMessage("⚠️ Please fill in all fields before submitting.");
      return;
    }
  
    setOpenConfirmationDialog(true);
  };
  

  const confirmSubmission = async () => {
    setOpenConfirmationDialog(false);
  
    const issueData = {
      assert_id: laptopId,
      issue: issue,
      condition: condition,
      it_support: itSupport,
      alternate_laptop: null
    };
    
    
  
    try {
      console.log("🔄 Sending Issue Data:", JSON.stringify(issueData));
  
      const response = await fetch("http://localhost:8000/Sims/assert-issue/", {
        method: "POST",
        headers: {
          "Authorization": `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(issueData),
      });
  
      const responseData = await response.json();
      console.log("🔄 Response Status:", response.status);
console.log("🔄 Response Data:", responseData);

  
      if (!response.ok) {
        console.error("❌ API Error:", responseData);
        throw new Error("Failed to submit asset issue.");
      }
      
  
      console.log("✅ Issue Reported Successfully!");
      setSuccessMessage(`Issue reported successfully!`);
      resetFormFields();
      window.dispatchEvent(new Event("refreshAssetIssues"));
    } catch (error) {
      console.error("❌ Error submitting asset issue:", error);
      setErrorMessage(error.message);
    }
  };
  
  
  
  const resetFormFields = () => {
    setLaptopId("");
    setAsset("");
    setIssue("");
    setCondition("");
    setItSupport("");
  };

  const requestAsset = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = (confirm) => {
    setOpenDialog(false);
    if (confirm && requestedAsset) {
      setSuccessMessage(
        `Your request for a "${requestedAsset}" has been submitted.`
      );
      setRequestedAsset("");
    }
  };

  const toggleAssetHistory = () => {
    setOpenAssetHistoryDialog(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container
          component="main"
          maxWidth="md"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "90vh",
            paddingTop: 4,
            paddingBottom: 4,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: 3,
              backgroundColor: "background.paper",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              gutterBottom
              sx={{ fontWeight: "bold", color: "primary.main", mb: 3 }}
            >
              Asset Report Issue
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%", mt: 2 }}
            >
              <Grid container spacing={3}>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Asset ID"
                    variant="outlined"
                    fullWidth
                    required
                    value={laptopId}
                    onChange={(e) => setLaptopId(e.target.value)}
                    sx={{ backgroundColor: "background.paper" }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="asset-label">Allocated Assets</InputLabel>
                    <Select
                      labelId="asset-label"
                      value={asset}
                      label="Allocated Assets"
                      onChange={(e) => setAsset(e.target.value)}
                      sx={{ backgroundColor: "background.paper" }}
                    >
                      <MenuItem value="Laptop">Laptop</MenuItem>
                      <MenuItem value="Mouse">Mouse</MenuItem>
                      <MenuItem value="Charger">Charger</MenuItem>
                      <MenuItem value="Headphone">Headphone</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="asset-label">Condition</InputLabel>
                    <Select
                      labelId="asset-label"
                      value={condition}
                      label="Allocated Assets"
                      onChange={(e) => setCondition(e.target.value)}
                      sx={{ backgroundColor: "background.paper" }}
                    >
                     <MenuItem value="Usable">Usable</MenuItem>
<MenuItem value="Not Usable">Not Usable</MenuItem>

                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="asset-label">IT Support</InputLabel>
                    <Select
                      labelId="asset-label"
                      value={itSupport}
                      label="Allocated Assets"
                      onChange={(e) => setItSupport(e.target.value)}
                      sx={{ backgroundColor: "background.paper" }}
                    >
                      <MenuItem value="Hand Over">Hand Over</MenuItem>
                      <MenuItem value="In Hand">In Hand</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Describe Issue"
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth
                    required
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    sx={{ backgroundColor: "background.paper" }}
                  />
                </Grid>
                
                
                
                <Grid item xs={12} sm={6} marginLeft={25}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ py: 1.5, fontWeight: "bold" }}
                  >
                    Submit Report
                  </Button>
                </Grid>
                
              </Grid>
            </Box>
          </Box>
  
          {/* Snackbars for Success and Error Messages */}
          <Snackbar
            open={!!successMessage}
            autoHideDuration={4000}
            onClose={() => setSuccessMessage("")}
          >
            <Alert severity="success" sx={{ width: "100%" }}>
              {successMessage}
            </Alert>
          </Snackbar>
          <Snackbar
            open={!!errorMessage}
            autoHideDuration={4000}
            onClose={() => setErrorMessage("")}
          >
            <Alert severity="error" sx={{ width: "100%" }}>
              {errorMessage}
            </Alert>
          </Snackbar>
  
          {/* Dialog for Requesting New Asset */}
          <Dialog
  open={openConfirmationDialog}
  onClose={() => setOpenConfirmationDialog(false)}
  aria-hidden={false} // ✅ Ensure it's not hidden
>
  <DialogTitle>Confirm Submission</DialogTitle>
  <DialogContent>
    <Typography>Are you sure you want to submit this report?</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenConfirmationDialog(false)} color="secondary">
      Cancel
    </Button>
    <Button onClick={confirmSubmission} color="primary">
      Confirm
    </Button>
  </DialogActions>
</Dialog>

  
          {/* Confirmation Dialog for Submission */}
          <Dialog
  open={openConfirmationDialog}
  onClose={() => setOpenConfirmationDialog(false)}
>
  <DialogTitle>Confirm Submission</DialogTitle>
  <DialogContent>
    <Typography>Are you sure you want to submit this report?</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenConfirmationDialog(false)} color="secondary">
      Cancel
    </Button>
    <Button onClick={confirmSubmission} color="primary">
      Confirm
    </Button>
  </DialogActions>
</Dialog>

  
          {/* Dialog for Asset History */}
          <Dialog
            open={openAssetHistoryDialog}
            onClose={() => setOpenAssetHistoryDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Asset Issue History</DialogTitle>
            <DialogContent>
              <List>
                {assetHistory.length > 0 ? (
                  assetHistory.map((entry, index) => (
                    <ListItem
                      key={index}
                      sx={{ borderBottom: "1px solid #ddd" }}
                    >
                      <ListItemText
                        primary={`Laptop ID: ${entry.laptopId} - Date: ${entry.date}`}
                        secondary={`Issue: ${entry.issue}`}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ padding: 2 }}>
                    No history available.
                  </Typography>
                )}
              </List>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenAssetHistoryDialog(false)}
                color="secondary"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default AssetReport;