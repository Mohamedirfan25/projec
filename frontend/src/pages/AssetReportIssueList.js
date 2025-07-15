import React, { useState, useEffect } from "react";
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
  TextField,
  MenuItem,
  IconButton,
  Menu,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Snackbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  MoreVert,
  Search,
  ReportProblem,
  FilterList,
  Edit,
} from "@mui/icons-material";

const Status = ({ status }) => {
  const statusStyles = {
    "Usable": { fontWeight: "bold", backgroundColor: "#C8E6C9", color: "#388E3C" },
    "Not Usable": { fontWeight: "bold", backgroundColor: "#FFCDD2", color: "#D32F2F" },
  };

  const style = statusStyles[status] || { backgroundColor: "inherit", color: "inherit" };

  return (
    <Typography
      sx={{
        fontSize: "0.875rem",
        fontWeight: "500",
        padding: "2px 6px",
        borderRadius: "12px",
        display: "inline-block",
        ...style,
      }}
    >
      {status}
    </Typography>
  );
};

const AssetReportIssueList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filter, setFilter] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [openReportIssueDialog, setOpenReportIssueDialog] = useState(false);
  const [editedAsset, setEditedAsset] = useState(null);
  const [issueStatusFilter, setIssueStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [snackBarOpen, setSnackBarOpen] = useState(false);

  const filteredAssets = assets.filter((asset) => {
    return (
      (asset.assetId.toLowerCase().includes(filter.toLowerCase()) ||
        (asset.department && asset.department.toLowerCase().includes(filter.toLowerCase())) ||
        asset.issueDescription.toLowerCase().includes(filter.toLowerCase())) &&
      (issueStatusFilter ? asset.issueStatus === issueStatusFilter : true)
    );
  });

  const handleDeleteAsset = (id) => {
    setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== id));
    handleCloseActionMenu();
    setSnackBarOpen(true);
  };

  const handleOpenFilterMenu = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilterMenu = () => {
    setFilterAnchorEl(null);
  };

  const handleOpenActionMenu = (event, assetId) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedAssetId(assetId);
  };

  const handleCloseActionMenu = () => {
    setActionAnchorEl(null);
    setSelectedAssetId(null);
  };

  const handleReportIssue = (assetId) => {
    const asset = assets.find((asset) => asset.id === assetId);
    setEditedAsset({...asset});
    setOpenReportIssueDialog(true);
  };

  const handleSaveIssueReport = async () => {
    try {
      const response = await fetch(`http://localhost:8000/Sims/assert-issue/${editedAsset.id}/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          condition: editedAsset.issueStatus,
          issue: editedAsset.issueDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update issue");
      }

      setAssets((prevAssets) =>
        prevAssets.map((asset) =>
          asset.id === editedAsset.id ? { ...editedAsset } : asset
        )
      );
      setOpenReportIssueDialog(false);
      setSnackBarOpen(true);
    } catch (error) {
      console.error("Error updating issue:", error);
    }
  };

  const handleResetFilters = () => {
    setFilter("");
    setIssueStatusFilter("");
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("http://localhost:8000/Sims/departments/", {
        headers: {
          "Authorization": `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchAssetIssues = async () => {
    try {
      const response = await fetch("http://localhost:8000/Sims/assert-issue/", {
        headers: {
          "Authorization": `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const issuesData = await response.json();
      
      // Filter out deleted items on the frontend
      const activeIssues = issuesData.filter(issue => !issue.is_deleted);

      // Fetch asset details for the active issues
      const assetDetailsResponse = await fetch("http://localhost:8000/Sims/assert-stock/", {
        headers: {
          "Authorization": `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!assetDetailsResponse.ok) {
        throw new Error("Failed to fetch asset details");
      }

      const assetDetails = await assetDetailsResponse.json();

      const formattedData = activeIssues.map((entry) => {
        const assetInfo = assetDetails.find(item => item.assert_id === entry.assert_id) || {};
        
        return {
          id: entry.id,
          assetId: entry.assert_id,
          department: assetInfo.department || "N/A",
          issueStatus: entry.condition,
          issueDescription: entry.issue,
          configuration: assetInfo.configuration || "N/A",
          assetModel: assetInfo.assert_model || "N/A",
          isDeleted: entry.is_deleted || false
        };
      });

      setAssets(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleRefresh = () => {
    fetchAssetIssues();
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (departments.length > 0) {
      fetchAssetIssues();
    }
  }, [departments]);

  useEffect(() => {
    window.addEventListener("refreshAssetIssues", handleRefresh);
    return () => {
      window.removeEventListener("refreshAssetIssues", handleRefresh);
    };
  }, []);

  const openDeleteConfirmation = (assetId) => {
    setAssetToDelete(assetId);
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      // Perform soft delete by marking is_deleted as true in backend
      const response = await fetch(`http://localhost:8000/Sims/assert-issue/${assetToDelete}/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Token ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_deleted: true
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete issue");
      }

      // Remove the item from frontend state
      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== assetToDelete));
      setDeleteConfirmDialog(false);
      setAssetToDelete(null);
      setSnackBarOpen(true);
    } catch (error) {
      console.error("Error deleting issue:", error);
    }
  };

  const handleCloseConfirmDialog = () => {
    setDeleteConfirmDialog(false);
    setAssetToDelete(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const paginatedAssets = filteredAssets.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box sx={{ padding: isMobile ? 2 : 4, bgcolor: theme.palette.background.default, color: theme.palette.text.primary }}>
      {/* Asset Report Issue List Title */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
        <ReportProblem sx={{ marginRight: 1, fontSize: 40, color: theme.palette.text.primary }} />
        <Typography variant="h4"  sx={{ color: theme.palette.text.primary , fontWeight: "bold" }}>
          Asset Report Issue List
        </Typography>
      </Box>

      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        {/* Search Bar and Reset Button */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            label="Search Assets"
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
            sx={{ maxWidth: isMobile ? "100%" : 300 }}
          />
          <Button variant="contained" color="secondary" onClick={handleResetFilters}>
            Reset
          </Button>
        </Box>

        {/* Filter Icon */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <IconButton onClick={handleOpenFilterMenu}>
            <FilterList />
          </IconButton>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleCloseFilterMenu}
            sx={{ zIndex: 1300 }}
          >
            <MenuItem onClick={() => setIssueStatusFilter("Usable")}>Usable</MenuItem>
            <MenuItem onClick={() => setIssueStatusFilter("Not Usable")}>Not Usable</MenuItem>
            <MenuItem onClick={() => setIssueStatusFilter("")}>All Statuses</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Table Section */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.mode === "dark" ? "#2e2e2e" : "#D3D3D3"}}>
              <TableCell sx={{ fontWeight: "bold", color: theme.palette.text.primary }}>Asset ID</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: theme.palette.text.primary }}>Department</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: theme.palette.text.primary}}>Configuration</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: theme.palette.text.primary }}>Model</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: theme.palette.text.primary }}>Issue Status</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: theme.palette.text.primary }}>Issue Description</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: theme.palette.text.primary }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.length > 0 ? (
              paginatedAssets.map((asset) => (
                <TableRow key={asset.id} sx={{ "&:hover": { backgroundColor: theme.palette.action.hover } }}>
                  <TableCell>{asset.assetId}</TableCell>
                  <TableCell>{asset.department}</TableCell>
                  <TableCell>{asset.configuration}</TableCell>
                  <TableCell>{asset.assetModel}</TableCell>
                  <TableCell>
                    <Status status={asset.issueStatus} />
                  </TableCell>
                  <TableCell>{asset.issueDescription}</TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleOpenActionMenu(e, asset.id)}>
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={actionAnchorEl}
                      open={Boolean(actionAnchorEl) && selectedAssetId === asset.id}
                      onClose={handleCloseActionMenu}
                    >
                      <MenuItem onClick={() => handleReportIssue(asset.id)}>
                        <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                      </MenuItem>
                      <MenuItem onClick={() => openDeleteConfirmation(asset.id)}>
                        <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                      </MenuItem>
                    </Menu>
                  </TableCell>
                  

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">No asset issues found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Section */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography>{`Showing ${paginatedAssets.length} of ${filteredAssets.length} records`}</Typography>
          <Select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            size="small"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            
          </Select>
          <Typography>Records per page:</Typography>
          <Pagination
            count={Math.ceil(filteredAssets.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
          />
        </Box>
      </Box>

      {/* Edit Issue Dialog */}
      <Dialog 
        open={openReportIssueDialog} 
        onClose={() => setOpenReportIssueDialog(false)} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle>Edit Issue Report</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Asset ID"
                value={editedAsset?.assetId || ""}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Department"
                value={editedAsset?.department || ""}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Configuration"
                value={editedAsset?.configuration || ""}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Model"
                value={editedAsset?.assetModel || ""}
                InputProps={{ readOnly: true }}
                fullWidth
                margin="normal"
              />
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Issue Status</InputLabel>
              <Select
                value={editedAsset?.issueStatus || ""}
                onChange={(e) => setEditedAsset({...editedAsset, issueStatus: e.target.value})}
                label="Issue Status"
              >
                <MenuItem value="Usable">Usable</MenuItem>
                <MenuItem value="Not Usable">Not Usable</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Issue Description"
              value={editedAsset?.issueDescription || ""}
              onChange={(e) => setEditedAsset({...editedAsset, issueDescription: e.target.value})}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportIssueDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveIssueReport} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this issue report?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackBarOpen(false)}
        message="Operation successful!"
      />
    </Box>
  );
};

export default AssetReportIssueList;