import React, { useState } from "react";
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
} from "@mui/material";
import {
  Delete as DeleteIcon,
  MoreVert,
  Edit,
  Search,
  Business,
  FilterList,
} from "@mui/icons-material";

const Status = ({ status }) => {
  const statusStyles = {
    "With Intern": { backgroundColor: "#FFEBEE", color: "#C62828" },
    "With IT": { backgroundColor: "#FFF3E0", color: "#EF6C00" },
    "With Staff": { backgroundColor: "#E8F5E9", color: "#2E7D32" },
  };

  const style = statusStyles[status] || { backgroundColor: "inherit", color: "inherit" };

  return (
    <Typography
      sx={{
        fontSize: "0.75rem",
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

const AssetList = () => {
  const [assets, setAssets] = useState([
    {
      id: 1,
      assetId: "ASSET001",
      empId: "EMP001",
      configuration: "i7, 16GB RAM, 512GB SSD",
      assetModel: "Dell XPS 15",
      status: "With Staff",
    },
    {
      id: 2,
      assetId: "ASSET002",
      empId: "EMP002",
      configuration: "i5, 8GB RAM, 256GB SSD",
      assetModel: "HP Spectre x360",
      status: "With Intern",
    },
    {
      id: 3,
      assetId: "ASSET003",
      empId: "EMP003",
      configuration: "i3, 4GB RAM, 128GB SSD",
      assetModel: "Lenovo IdeaPad",
      status: "With IT",
    },
  ]);

  const [filter, setFilter] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [addAssetData, setAddAssetData] = useState({
    assetId: "",
    empId: "",
    configuration: "",
    assetModel: "",
    status: "",
  });
  const [editedAsset, setEditedAsset] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [snackBarOpen, setSnackBarOpen] = useState(false);

  const filteredAssets = assets.filter((asset) => {
    return (
      asset.empId.toLowerCase().includes(filter.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(filter.toLowerCase()) ||
      asset.configuration.toLowerCase().includes(filter.toLowerCase()) ||
      asset.assetModel.toLowerCase().includes(filter.toLowerCase())
    ) && (statusFilter ? asset.status === statusFilter : true);
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

  const handleEditAsset = (asset) => {
    setEditedAsset(asset);
    setOpenEditDialog(true);
    handleCloseActionMenu();
  };

  const handleSaveEdit = () => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) =>
        asset.id === editedAsset.id ? { ...editedAsset } : asset
      )
    );
    setOpenEditDialog(false);
  };

  const handleAddAsset = () => {
    const newAsset = {
      id: assets.length + 1,
      assetId: addAssetData.assetId,
      empId: addAssetData.empId,
      configuration: addAssetData.configuration,
      assetModel: addAssetData.assetModel,
      status: addAssetData.status,
    };

    setAssets((prevAssets) => [...prevAssets, newAsset]);
    setOpenAddDialog(false);
    setAddAssetData({ assetId: "", empId: "", configuration: "", assetModel: "", status: "" });
    setSnackBarOpen(true);
  };

  const handleResetFilters = () => {
    setFilter("");
    setStatusFilter("");
  };

  const openDeleteConfirmation = (assetId) => {
    setAssetToDelete(assetId);
    setDeleteConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    if (assetToDelete) {
      handleDeleteAsset(assetToDelete);
    }
    setDeleteConfirmDialog(false);
    setAssetToDelete(null);
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
    <Box sx={{ padding: 4, bgcolor: "white", color: "black" }}>
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
        <Business sx={{ marginRight: 1, fontSize: 40 }} />
        <Typography variant="h4" gutterBottom>
          Asset List
        </Typography>
      </Box>

      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        {/* Search Bar and Buttons */}
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
            sx={{ maxWidth: 300 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenAddDialog(true)}
          >
            Add Asset
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => console.log("Report issue clicked")}
          >
            Asset Report Issue
          </Button>
        </Box>

        {/* Reset Button and Filter Icon */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button variant="contained" color="secondary" onClick={handleResetFilters}>
            Reset
          </Button>
          <IconButton onClick={handleOpenFilterMenu}>
            <FilterList />
          </IconButton>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleCloseFilterMenu}
            sx={{ zIndex: 1300 }}
          >
            <MenuItem onClick={() => setStatusFilter("With Intern")}>With Intern</MenuItem>
            <MenuItem onClick={() => setStatusFilter("With Staff")}>With Staff</MenuItem>
            <MenuItem onClick={() => setStatusFilter("With IT")}>With IT</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Table Section */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#D3D3D3", color: "black" }}>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>Asset ID</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>Employee ID</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>Configuration</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>Asset Model</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAssets.map((asset) => (
              <TableRow
                key={asset.id}
                sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
              >
                <TableCell>{asset.assetId}</TableCell>
                <TableCell>{asset.empId}</TableCell>
                <TableCell>{asset.configuration}</TableCell>
                <TableCell>{asset.assetModel}</TableCell>
                <TableCell>
                  <Status status={asset.status} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleOpenActionMenu(e, asset.id)}>
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={actionAnchorEl}
                    open={Boolean(actionAnchorEl) && selectedAssetId === asset.id}
                    onClose={handleCloseActionMenu}
                    sx={{ zIndex: 1300 }}
                  >
                    <MenuItem
                      onClick={() => handleEditAsset(asset)}
                      sx={{ color: "#1976d2" }}
                    >
                      <Edit sx={{ marginRight: 1 }} />
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => openDeleteConfirmation(asset.id)}
                      sx={{ color: "red" }}
                    >
                      <DeleteIcon sx={{ marginRight: 1 }} />
                      Delete
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Section */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 2 }}>
        {/* Records and Pagination */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography>{`Showing ${paginatedAssets.length} of ${filteredAssets.length} records`}</Typography>
          <Select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            size="small"
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
          <Typography>Records per page:</Typography>
          <Pagination
            count={Math.ceil(filteredAssets.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
          />
        </Box>
      </Box>

      {/* Add Asset Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add Asset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Asset ID"
            fullWidth
            value={addAssetData.assetId}
            onChange={(e) => setAddAssetData({ ...addAssetData, assetId: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Employee ID"
            fullWidth
            value={addAssetData.empId}
            onChange={(e) => setAddAssetData({ ...addAssetData, empId: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Configuration"
            fullWidth
            value={addAssetData.configuration}
            onChange={(e) => setAddAssetData({ ...addAssetData, configuration: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Asset Model"
            fullWidth
            value={addAssetData.assetModel}
            onChange={(e) => setAddAssetData({ ...addAssetData, assetModel: e.target.value })}
          />
          <FormControl margin="dense" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={addAssetData.status}
              onChange={(e) => setAddAssetData({ ...addAssetData, status: e.target.value })}
            >
              <MenuItem value="With Intern">With Intern</MenuItem>
              <MenuItem value="With Staff">With Staff</MenuItem>
              <MenuItem value="With IT">With IT</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddAsset}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Asset Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Asset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Asset ID"
            fullWidth
            value={editedAsset ? editedAsset.assetId : ""}
            onChange={(e) => setEditedAsset({ ...editedAsset, assetId: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Employee ID"
            fullWidth
            value={editedAsset ? editedAsset.empId : ""}
            onChange={(e) => setEditedAsset({ ...editedAsset, empId: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Configuration"
            fullWidth
            value={editedAsset ? editedAsset.configuration : ""}
            onChange={(e) => setEditedAsset({ ...editedAsset, configuration: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Asset Model"
            fullWidth
            value={editedAsset ? editedAsset.assetModel : ""}
            onChange={(e) => setEditedAsset({ ...editedAsset, assetModel: e.target.value })}
          />
          <FormControl margin="dense" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={editedAsset ? editedAsset.status : ""}
              onChange={(e) => setEditedAsset({ ...editedAsset, status: e.target.value })}
            >
              <MenuItem value="With Intern">With Intern</MenuItem>
              <MenuItem value="With Staff">With Staff</MenuItem>
              <MenuItem value="With IT">With IT</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this asset?</Typography>
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

export default AssetList;