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
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  ThemeProvider,
  createTheme,
  styled
} from "@mui/material";
import {
  Search,
  FilterList,
  Edit,
  MoreVert,
  Delete as DeleteIcon,
  CheckCircle,
  Cancel,
  Close,
  Refresh,
} from "@mui/icons-material";
import {
  CalendarToday,
  BeachAccess,
  Work,
  Warning,
  HealthAndSafety as Sick,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";

// Example data simulating a backend response
const sampleData = [
  {
    id: 1,
    intern_id: "I001",
    intern_name: "Alice Johnson",
    start_date: "2023-10-01T09:00:00Z",
    end_date: "2023-10-03T17:00:00Z",
    reason: "Family vacation to Hawaii",
    status: "Pending",
    created_at: "2023-09-28T08:00:00Z",
    leave_type: "Vacation",
    half_day_start: true,
    half_day_end: false,
    remaining_leaves: 18,
    comments: [],
  },
  {
    id: 2,
    intern_id: "I002",
    intern_name: "Bob Smith",
    start_date: "2023-10-05T09:00:00Z",
    end_date: "2023-10-05T17:00:00Z",
    reason: "Doctor appointment for annual checkup",
    status: "Pending",
    created_at: "2023-09-29T10:00:00Z",
    leave_type: "Sick Leave",
    half_day_start: false,
    half_day_end: true,
    remaining_leaves: 13,
    comments: [],
  },
];

// Styled components
const ApproveButton = styled(Button)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.success.light,
  color: theme.palette.success.dark,
  "&:hover": {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.common.white,
  },
}));

const RejectButton = styled(Button)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.dark,
  "&:hover": {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
  },
}));

const ResetButton = styled(Button)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.grey[800],
  "&:hover": {
    backgroundColor: theme.palette.grey[300],
  },
}));

const LeaveRequestList = () => {
  const theme = useTheme();
  const [leaveRequests, setLeaveRequests] = useState(sampleData);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);

  const handleStatusChange = (id, newStatus, commentText = "") => {
    setLeaveRequests((prev) =>
      prev.map((leave) =>
        leave.id === id
          ? {
              ...leave,
              status: newStatus,
              comments: commentText
                ? [
                    ...leave.comments,
                    {
                      text: commentText,
                      date: new Date().toISOString(),
                      by: "Admin",
                    },
                  ]
                : leave.comments,
            }
          : leave
      )
    );

    if (newStatus !== "Pending" && selectedRequest) {
      setSnackbarMessage(`Leave request ${newStatus} for ${selectedRequest.intern_name} (${selectedRequest.intern_id})`);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteLeave = (id) => {
    setLeaveRequests((prev) => prev.filter((leave) => leave.id !== id));
    setSnackbarMessage(`Leave request deleted successfully.`);
    setSnackbarOpen(true);
  };

  const filteredRequests = leaveRequests.filter(
    (leave) =>
      (leave.intern_name.toLowerCase().includes(filter.toLowerCase()) ||
       leave.intern_id.toLowerCase().includes(filter.toLowerCase())) &&
      (statusFilter === "All" ? true : leave.status === statusFilter)
  );

  const paginated = filteredRequests.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const formatDate = (dateString) => {
    return format(parseISO(dateString), "MMM dd, yyyy");
  };

  const formatDateTime = (dateString) => {
    return format(parseISO(dateString), "MMM dd, yyyy hh:mm a");
  };

  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case "Sick Leave":
        return <Sick color="error" />;
      case "Vacation":
        return <BeachAccess color="primary" />;
      case "Personal":
        return <Work color="info" />;
      case "Emergency":
        return <Warning color="warning" />;
      default:
        return <CalendarToday color="action" />;
    }
  };

  const handleOpenMenu = (e, id) => {
    setAnchorEl(e.currentTarget);
    setSelectedId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleDeleteClick = (leave) => {
    setLeaveToDelete(leave.id);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleEditClick = (leave) => {
    setEditingRequest(leave);
    setEditDialogOpen(true);
    handleCloseMenu();
  };

  const handleActionClick = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditDialogOpen(false);
    setComment("");
  };

  const confirmAction = () => {
    handleStatusChange(selectedRequest.id, actionType === "approve" ? "Approved" : "Rejected", comment);
    handleDialogClose();
  };

  const handleResetFilters = () => {
    setFilter("");
    setStatusFilter("All");
    setPage(1);
  };

  const handleEditSave = () => {
    if (editingRequest) {
      setLeaveRequests(prev => 
        prev.map(leave => 
          leave.id === editingRequest.id ? editingRequest : leave
        )
      );
      setSnackbarMessage(`Leave request updated successfully`);
      setSnackbarOpen(true);
      handleDialogClose();
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Leave Requests
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, marginBottom: 3, flexWrap: "wrap" }}>
        <TextField
          label="Search by Intern Name/ID"
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
            endAdornment: filter && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setFilter("")}
                  edge="end"
                >
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            renderValue={(value) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FilterList fontSize="small" />
                {value === "All" ? "All Statuses" : value}
              </Box>
            )}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>

          <ResetButton
            variant="contained"
            size="small"
            startIcon={<Refresh />}
            onClick={handleResetFilters}
          >
            Reset
          </ResetButton>
        </Box>
      </Box>

      <TableContainer elevation={3} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[200] }}>
              <TableCell><strong>Intern Name/ID</strong></TableCell>
              <TableCell><strong>Leave Type</strong></TableCell>
              <TableCell><strong>From Date</strong></TableCell>
              <TableCell><strong>To Date</strong></TableCell>
              <TableCell><strong>Reason</strong></TableCell>
              <TableCell><strong>Remaining Leave</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length > 0 ? (
              paginated.map((leave) => (
                <TableRow 
                  key={leave.id} 
                  hover
                  sx={{ 
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    } 
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography fontWeight={600}>{leave.intern_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {leave.intern_id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {getLeaveTypeIcon(leave.leave_type)}
                      <Typography>{leave.leave_type}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {formatDate(leave.start_date)}
                    </Typography>
                    {leave.half_day_start && (
                      <Typography variant="body2" color="text.secondary">
                        (Half Day)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {formatDate(leave.end_date)}
                    </Typography>
                    {leave.half_day_end && (
                      <Typography variant="body2" color="text.secondary">
                        (Half Day)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={leave.reason}>
                      <Typography sx={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '200px'
                      }}>
                        {leave.reason}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {leave.remaining_leaves} days
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {leave.status === "Pending" ? (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <ApproveButton
                          variant="contained"
                          size="small"
                          onClick={() => handleActionClick(leave, "approve")}
                          startIcon={<CheckCircle />}
                        >
                          Approve
                        </ApproveButton>
                        <RejectButton
                          variant="contained"
                          size="small"
                          onClick={() => handleActionClick(leave, "reject")}
                          startIcon={<Cancel />}
                        >
                          Reject
                        </RejectButton>
                      </Box>
                    ) : (
                      <>
                        <IconButton onClick={(e) => handleOpenMenu(e, leave.id)}>
                          <MoreVert />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedId === leave.id}
                          onClose={handleCloseMenu}
                        >
                          <MenuItem onClick={() => handleEditClick(leave)}>
                            <Edit color="primary" sx={{ mr: 1 }} />
                            Edit
                          </MenuItem>
                          <MenuItem onClick={() => handleDeleteClick(leave)}>
                            <DeleteIcon color="error" sx={{ mr: 1 }} />
                            Delete
                          </MenuItem>
                        </Menu>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">No leave requests found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2">Rows per page:</Typography>
          <Select
            size="small"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(parseInt(e.target.value));
              setPage(1);
            }}
            sx={{ minWidth: 80 }}
          >
            {[5, 10, 20].map((num) => (
              <MenuItem key={num} value={num}>
                {num}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Pagination
          count={Math.ceil(filteredRequests.length / rowsPerPage)}
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          color="primary"
          shape="rounded"
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this leave request?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleDeleteLeave(leaveToDelete);
              setDeleteDialogOpen(false);
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          {actionType === "approve" ? "Approve Leave Request" : "Reject Leave Request"}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {actionType === "approve" ? "Are you sure you want to approve this leave request?" : "Are you sure you want to reject this leave request?"}
          </Typography>
          {selectedRequest && (
            <Box sx={{ p: 2, mt: 1, bgcolor: "background.default", borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Intern:</strong> {selectedRequest.intern_name} ({selectedRequest.intern_id})
              </Typography>
              <Typography variant="body2">
                <strong>Leave Type:</strong> {selectedRequest.leave_type}
              </Typography>
              <Typography variant="body2">
                <strong>From:</strong> {formatDate(selectedRequest.start_date)} 
                {selectedRequest.half_day_start && " (Half Day)"}
              </Typography>
              <Typography variant="body2">
                <strong>To:</strong> {formatDate(selectedRequest.end_date)}
                {selectedRequest.half_day_end && " (Half Day)"}
              </Typography>
              <Typography variant="body2">
                <strong>Reason:</strong> {selectedRequest.reason}
              </Typography>
              <Typography variant="body2">
                <strong>Remaining Leaves:</strong> {selectedRequest.remaining_leaves} days
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={confirmAction}
            color={actionType === "approve" ? "success" : "error"}
            variant="contained"
          >
            {actionType === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit Leave Request</DialogTitle>
        <DialogContent>
          {editingRequest && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Intern:</strong> {editingRequest.intern_name} ({editingRequest.intern_id})
                </Typography>
                <Typography variant="body2">
                  <strong>Leave Type:</strong> {editingRequest.leave_type}
                </Typography>
                <Typography variant="body2">
                  <strong>From:</strong> {formatDate(editingRequest.start_date)} 
                  {editingRequest.half_day_start && " (Half Day)"}
                </Typography>
                <Typography variant="body2">
                  <strong>To:</strong> {formatDate(editingRequest.end_date)}
                  {editingRequest.half_day_end && " (Half Day)"}
                </Typography>
                <Typography variant="body2">
                  <strong>Reason:</strong> {editingRequest.reason}
                </Typography>
                <Typography variant="body2">
                  <strong>Remaining Leaves:</strong> {editingRequest.remaining_leaves} days
                </Typography>
              </Box>
              
              <Select
                value={editingRequest.status}
                onChange={(e) => setEditingRequest({...editingRequest, status: e.target.value})}
                fullWidth
                size="small"
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add a comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleEditSave}
            color="primary"
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Theme provider
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#e3f2fd",
      dark: "#0d47a1",
    },
    secondary: {
      main: "#9c27b0",
    },
    success: {
      main: "#4caf50",
      light: "#e8f5e9",
      dark: "#2e7d32",
    },
    error: {
      main: "#f44336",
      light: "#ffebee",
      dark: "#c62828",
    },
    warning: {
      main: "#ff9800",
      light: "#fff3e0",
      dark: "#e65100",
    },
    info: {
      main: "#2196f3",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, sm: 3 } }}>
        <LeaveRequestList />
      </Box>
    </ThemeProvider>
  );
};

export default App;