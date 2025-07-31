import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  const [damageType, setDamageType] = useState("");
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
  const [assetCode, setAssetCode] = useState(""); // State to store the asset code
  const { assetId } = useParams();

  // Function to fetch asset details by ID from the asset stock
  const fetchAssetById = async (id) => {
    try {
      const token = localStorage.getItem("token");
      // First try to fetch from assert-stock endpoint
      const response = await fetch(`http://localhost:8000/Sims/assert-stock/${id}/`, {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const assetData = await response.json();
        console.log("Asset details from assert-stock:", assetData);
        
        // Set the asset ID and code if found
        if (assetData.assert_id) {
          setLaptopId(assetData.assert_id);
          setAssetCode(assetData.assert_id);
          return assetData.assert_id;
        }
      } else {
        console.error("Error fetching asset from assert-stock:", await response.text());
        
        // Fallback to the old assets endpoint if assert-stock fails
        const fallbackResponse = await fetch(`http://localhost:8000/Sims/assets/${id}/`, {
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log("Asset details from fallback endpoint:", fallbackData);
          
          // Set the asset code if found in the response
          if (fallbackData.asset_code) {
            setAssetCode(fallbackData.asset_code);
            return fallbackData.asset_code;
          } else if (fallbackData.id) {
            // If no asset_code, use the ID as a fallback
            setAssetCode(fallbackData.id.toString());
            return fallbackData.id.toString();
          }
        } else {
          console.error("Error fetching from fallback endpoint:", await fallbackResponse.text());
        }
      }
    } catch (error) {
      console.error("Error in fetchAssetById:", error);
    }
    return null;
  };

  // Function to fetch all assets from asset stock
  const fetchAllAssets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/Sims/assert-stock/", {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const assets = await response.json();
        console.log("All assets from stock:", assets);
        return assets;
      } else {
        console.error("Error fetching all assets:", await response.text());
      }
    } catch (error) {
      console.error("Error in fetchAllAssets:", error);
    }
    return [];
  };

  // Fetch user data and set asset ID when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      // If we have an assetId in the URL, try to fetch its details first
      if (assetId) {
        console.log("Asset ID from URL:", assetId);
        
        // Try to fetch the asset by ID
        console.log("Trying to fetch asset by ID...");
        const assetCode = await fetchAssetById(assetId);
        
        if (assetCode) {
          console.log("Found asset:", assetCode);
          return; // Exit if we successfully got the asset
        }
      }
      try {
        console.log("Starting to fetch user data...");
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        
        console.log("Token exists:", !!token);
        console.log("Username from localStorage:", username);
        
        if (!token) {
          console.log("No token found, cannot fetch user data");
          return;
        }

        if (!username) {
          console.log("No username found in localStorage");
          return;
        }

        console.log("Making API call to fetch all users data...");
        // First, get all users to find the one matching the username from localStorage
        const allUsersResponse = await fetch("http://localhost:8000/Sims/all-user-data/", {
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
          }
        });

        console.log("All Users API Response Status:", allUsersResponse.status);
        
        if (allUsersResponse.ok) {
          const allUsersData = await allUsersResponse.json();
          const usersList = allUsersData.users || [];
          console.log("All Users Data:", usersList);
          
          // Find the user by username from localStorage
          const currentUser = usersList.find(user => user.username === username);
          
          if (currentUser) {
            console.log("Found current user by username:", currentUser);
            
            // Log all available properties of the user object to understand its structure
            console.log("Available user properties:", Object.keys(currentUser));
            
            // Try to find asset_code in user data
            if (currentUser.asset_code) {
              console.log("Found asset_code in user data:", currentUser.asset_code);
              
              // Try to fetch the asset by asset_code
              try {
                const response = await fetch(`http://localhost:8000/Sims/assert-stock/${currentUser.asset_code}/`, {
                  headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                  }
                });
                
                if (response.ok) {
                  const assetData = await response.json();
                  console.log("Asset details by asset_code:", assetData);
                  
                  if (assetData.assert_id) {
                    setLaptopId(assetData.assert_id);
                    setAssetCode(assetData.assert_id);
                    return; // Exit if we successfully got the asset by asset_code
                  }
                } else {
                  console.error("Error fetching asset by asset_code:", await response.text());
                }
              } catch (error) {
                console.error("Error in fetch asset by asset_code:", error);
              }
            }
            
            // If no asset_code or failed to fetch by asset_code, try other methods
            const possibleAssetCodeFields = ['laptopId', 'laptop_id', 'assetId', 'asset_id'];
            let foundAssetCode = null;
            
            // Try to fetch asset by username as fallback
            if (username) {
              try {
                console.log(`Attempting to fetch asset for username: ${username}`);
                const response = await fetch(`http://localhost:8000/Sims/asset-by-username/${username}/`, {
                  headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                  }
                });
                
                if (response.ok) {
                  const assets = await response.json();
                  if (assets && assets.length > 0) {
                    const userAsset = assets[0]; // Get the first matching asset
                    console.log("Found asset by username:", userAsset);
                    if (userAsset.assert_id) {
                      setLaptopId(userAsset.assert_id);
                      setAssetCode(userAsset.assert_id);
                      return;
                    }
                  }
                } else {
                  console.error("Error fetching asset by username:", await response.text());
                }
              } catch (error) {
                console.error("Error in fetch asset by username:", error);
              }
            }
            
            // If no asset ID in URL, try to get the current user's asset
            if (!assetId) {
              console.log("No asset ID in URL, trying to find user's asset...");
              try {
                // First try to get the current user's data
                const userResponse = await fetch("http://localhost:8000/Sims/user-data/", {
                  headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                  }
                });
                
                if (userResponse.ok) {
                  const userData = await userResponse.json();
                  console.log("Current user data:", userData);
                  
                  // Check if user has an asset code
                  if (userData.asset_code) {
                    console.log("Found asset code in user data:", userData.asset_code);
                    setLaptopId(userData.asset_code);
                    setAssetCode(userData.asset_code);
                    return;
                  }
                  
                  // If no asset code, check access_rights
                  if (userData.access_rights) {
                    console.log("Checking access_rights for asset code:", userData.access_rights);
                    // Check for asset code in access_rights
                    const accessRights = userData.access_rights;
                    if (accessRights.asset_code) {
                      console.log("Found asset code in access_rights:", accessRights.asset_code);
                      setLaptopId(accessRights.asset_code);
                      setAssetCode(accessRights.asset_code);
                      return;
                    }
                  }
                  
                  // If still no asset code, fetch all assets from stock and find one assigned to the user
                  console.log("No asset code found in user data. Trying to fetch all assets from stock...");
                  const allAssets = await fetchAllAssets();
                  
                  if (allAssets && allAssets.length > 0) {
                    console.log("All assets from stock:", allAssets);
                    console.log("Current user data for matching:", userData);
                    
                    // First, try to find an asset by asset_code in user data
                    if (userData.asset_code) {
                      console.log("Trying to match by asset_code:", userData.asset_code);
                      const assetByCode = allAssets.find(asset => 
                        asset.assert_id && asset.assert_id.toLowerCase() === userData.asset_code.toLowerCase()
                      );
                      
                      if (assetByCode) {
                        console.log("Matched asset by asset_code:", assetByCode);
                        setLaptopId(assetByCode.assert_id);
                        setAssetCode(assetByCode.assert_id);
                        return;
                      }
                    }
                    
                    // If no match by asset_code, try other matching strategies
                    const userAsset = allAssets.find(asset => {
                      // Match by user ID if available
                      if (asset.user && asset.user.id === userData.id) {
                        console.log("Matched by user.id");
                        return true;
                      }
                      
                      // Match by emp_id if available
                      if (asset.emp_id && userData.emp_id && asset.emp_id.emp_id === userData.emp_id) {
                        console.log("Matched by emp_id.emp_id");
                        return true;
                      }
                      
                      // Match by username if available
                      if (asset.user && asset.user.username === userData.username) {
                        console.log("Matched by username");
                        return true;
                      }
                      
                      // Match by email if available
                      if (asset.user && asset.user.email && userData.email && 
                          asset.user.email.toLowerCase() === userData.email.toLowerCase()) {
                        console.log("Matched by email");
                        return true;
                      }
                      
                      return false;
                    });
                    
                    if (userAsset && userAsset.assert_id) {
                      console.log("Found user's asset in stock:", userAsset);
                      setLaptopId(userAsset.assert_id);
                      setAssetCode(userAsset.assert_id);
                      return;
                    } else {
                      console.log("No matching asset found in stock for the current user");
                    }
                  }
                  
                  console.log("No asset code found and no URL parameter provided");
                  
                } else {
                  console.error("Error fetching user data:", await userResponse.text());
                }
              } catch (error) {
                console.error("Error in fetchUserData:", error);
              }
            }
            
            // Try different possible field names for asset code
            for (const field of possibleAssetCodeFields) {
              if (currentUser[field]) {
                foundAssetCode = currentUser[field];
                console.log(`Found asset code in field ${field}:`, foundAssetCode);
                break;
              }
            }
            
            // If we found an asset code in any field, use it
            if (foundAssetCode) {
              console.log("Using asset code:", foundAssetCode);
              setLaptopId(foundAssetCode);
              return;
            }
            
            // If still no asset code, try to find it in the access_rights or other nested objects
            if (currentUser.access_rights) {
              console.log("Checking access_rights for asset code:", currentUser.access_rights);
              for (const field of possibleAssetCodeFields) {
                if (currentUser.access_rights[field]) {
                  foundAssetCode = currentUser.access_rights[field];
                  console.log(`Found asset code in access_rights.${field}:`, foundAssetCode);
                  break;
                }
              }
              
              if (foundAssetCode) {
                setLaptopId(foundAssetCode);
                return;
              }
            }
            
            console.log("No asset code found in user data. Trying to fetch assigned assets...");
            
            try {
              // Try to fetch assigned assets for this user
              const assignedAssetsResponse = await fetch(`http://localhost:8000/Sims/assigned-assets/?user_id=${currentUser.id}`, {
                headers: {
                  "Authorization": `Token ${token}`,
                  "Content-Type": "application/json"
                }
              });
              
              if (assignedAssetsResponse.ok) {
                const assignedAssets = await assignedAssetsResponse.json();
                console.log("Assigned assets response:", assignedAssets);
                
                // Check if we have any assigned assets
                if (assignedAssets.length > 0 && assignedAssets[0].asset) {
                  const assetCode = assignedAssets[0].asset.asset_code || 
                                  assignedAssets[0].asset.id || 
                                  assignedAssets[0].asset.asset_id;
                  
                  if (assetCode) {
                    console.log("Found assigned asset:", assetCode);
                    setLaptopId(assetCode);
                    return;
                  }
                }
              } else {
                console.log("No assigned assets found or error fetching assigned assets");
              }
            } catch (error) {
              console.error("Error fetching assigned assets:", error);
            }
            
            // If we get here, try to find any asset in the system
            try {
              const allAssetsResponse = await fetch('http://localhost:8000/Sims/assets/', {
                headers: {
                  "Authorization": `Token ${token}`,
                  "Content-Type": "application/json"
                }
              });
              
              if (allAssetsResponse.ok) {
                const allAssets = await allAssetsResponse.json();
                if (allAssets.length > 0) {
                  const firstAsset = allAssets[0];
                  const assetCode = firstAsset.asset_code || firstAsset.id || firstAsset.asset_id;
                  if (assetCode) {
                    console.log("Using first available asset:", assetCode);
                    setLaptopId(assetCode);
                    return;
                  }
                }
              }
            } catch (error) {
              console.error("Error fetching all assets:", error);
            }
          } else {
            console.log(`User with username '${username}' not found in all users list`);
          }
          
          // Fallback: Try to find any user with an asset code if current user doesn't have one
          const userWithAsset = usersList.find(user => user.asset_code);
          if (userWithAsset?.asset_code) {
            console.log("Found another user with asset code:", userWithAsset.asset_code);
            setLaptopId(userWithAsset.asset_code);
            return;
          }
          
          // Final fallback to URL parameter if available
          if (assetId) {
            console.log("Using asset_id from URL parameters:", assetId);
            setLaptopId(assetId);
          } else {
            console.log("No asset code found and no URL parameter provided");
          }
        } else {
          const errorText = await allUsersResponse.text();
          console.error("API Error fetching all users:", errorText);
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        // Fallback to URL parameter if there's an error
        if (assetId) {
          console.log("Using URL parameter due to error:", assetId);
          setLaptopId(assetId);
        }
      }
    };

    fetchUserData();
  }, [assetId]);

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
  
    if (!laptopId || !issue || !damageType || !condition || !itSupport) {
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
      damage_type: damageType,
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
    setDamageType("");
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
                  <FormControl fullWidth>
                    <InputLabel id="damage-type-label">Damage Type</InputLabel>
                    <Select
                      labelId="damage-type-label"
                      value={damageType}
                      label="Damage Type"
                      onChange={(e) => setDamageType(e.target.value)}
                      required
                      sx={{ backgroundColor: "background.paper" }}
                    >
                      <MenuItem value="Physical Damage">Physical Damage</MenuItem>
                      <MenuItem value="Screen Issue">Screen Issue</MenuItem>
                      <MenuItem value="Battery Problem">Battery Problem</MenuItem>
                      <MenuItem value="Keyboard/Touchpad">Keyboard/Touchpad</MenuItem>
                      <MenuItem value="Software Problem">Software Problem</MenuItem>
                      <MenuItem value="Performance Issue">Performance Issue</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
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