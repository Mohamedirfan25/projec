import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Card, CardContent, CircularProgress, Alert, IconButton, Tooltip, Snackbar,
  InputAdornment, Menu, MenuItem, Pagination, Select, FormControl, InputLabel, Divider
} from '@mui/material';
import {
  Check as CheckIcon, Close as CloseIcon, MoreVert as MoreVertIcon,
  Search as SearchIcon, Refresh as RefreshIcon,
  ArrowDropDown as ArrowDropDownIcon, FilterList as FilterListIcon, Assignment as AssignmentIcon
} from '@mui/icons-material';
import axios from 'axios';

// Helper function to generate a color from a string
function stringToColor(string) {
  if (!string) return '#9e9e9e';
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

// Helper function to get initials from a name

// Helper to format a date range like "31/07/2025 - 01/08/2025"
const formatDateRange = (from, to) => {
  if (!from) return 'Invalid Date';
  const fromStr = new Date(from).toLocaleDateString('en-GB');
  if (!to || from === to) return fromStr;
  const toStr = new Date(to).toLocaleDateString('en-GB');
  return `${fromStr} - ${toStr}`;
};

// Map API half-day codes to user-friendly labels
const halfMap = {
  first_half: 'First Half',
  second_half: 'Second Half',
  morning: 'First Half',
  afternoon: 'Second Half',
  am: 'First Half',
  pm: 'Second Half'
};

const formatHalfInfo = (fromHalf, toHalf) => {
  if (!fromHalf && !toHalf) return null;
  const start = halfMap[fromHalf] || fromHalf;
  const end = halfMap[toHalf] || toHalf;
  if (!toHalf || start === end) return start;
  return `${start} - ${end}`;
};
function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

const statusColors = { pending: 'warning', approved: 'success', rejected: 'error' };
const statusLabels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };

const AttendanceClaimRequests = ({ onBack }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  // Menu for per-row actions
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuClaim, setActionMenuClaim] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/Sims/attendance-claims/', {
        headers: { Authorization: `Token ${token}` }
      });
      console.log('Attendance claims:', response.data);
      const rawClaims = Array.isArray(response.data) ? response.data : response.data.results || [];
      const claimData = rawClaims.map(c => ({ ...c, status: c.status?.toLowerCase() }));
      setClaims(claimData);
      console.log('Claim data:', claimData);
      const stats = claimData.reduce((acc, claim) => {
        acc.total++;
        if (claim.status === 'approved') acc.approved++;
        if (claim.status === 'pending') acc.pending++;
        if (claim.status === 'rejected') acc.rejected++;
        return acc;
      }, { total: 0, approved: 0, pending: 0, rejected: 0 });
      setStats(stats);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch claims', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (claimId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8000/Sims/attendance-claims/${claimId}/approve/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      await fetchClaims();
      setSnackbar({ open: true, message: 'Claim approved successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to approve claim', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = (claim) => {
    setSelectedClaim(claim);
    setDialogOpen(true);
  };

  const openRejectDialog = (claim) => {
    setRejectTarget(claim);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8000/Sims/attendance-claims/${rejectTarget.id}/reject/`,
        { rejection_reason: rejectReason },
        { headers: { Authorization: `Token ${token}` } }
      );
      setSnackbar({ open: true, message: 'Claim rejected successfully', severity: 'success' });
      await fetchClaims();
      setRejectDialogOpen(false);
      setDialogOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to reject claim', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Open/close per-row action menu
  const handleActionMenuOpen = (event, claim) => {
    setActionMenuAnchor(event.currentTarget);
    setActionMenuClaim(claim);
  };
  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuClaim(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setPage(0);
    handleFilterClose();
  };

  const resetFilters = () => {
    setFilterStatus('all');
    setSearchTerm('');
    setPage(0);
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.comments || claim.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  console.log('Filtered claims:', filteredClaims);

  const paginatedClaims = filteredClaims.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  console.log('Paginated claims:', paginatedClaims);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
          Attendance Claim Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Review and manage attendance claim requests
        </Typography>
      </Box>

      <Card elevation={0} sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Attendance Claim Records</Typography>
          </Box>
          
          {/* Toolbar */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search claims..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { 
                    backgroundColor: 'background.paper',
                    minWidth: 250,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.12)'
                    }
                  }
                }}
              />
              
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleFilterClick}
                endIcon={<ArrowDropDownIcon />}
                sx={{ 
                  textTransform: 'none',
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'rgba(0, 0, 0, 0.5)',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <FilterListIcon sx={{ mr: 0.5, fontSize: 20 }} />
                Filters
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleFilterClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <Box sx={{ p: 2, minWidth: 200 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Status</Typography>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <Select
                      value={filterStatus}
                      onChange={(e) => handleStatusFilter(e.target.value)}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Status' }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                  <Divider sx={{ my: 1 }} />
                  <Button 
                    size="small" 
                    onClick={resetFilters}
                    sx={{ textTransform: 'none' }}
                  >
                    Reset Filters
                  </Button>
                </Box>
              </Menu>

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RefreshIcon />}
                onClick={fetchClaims}
                disabled={loading}
                sx={{ 
                  textTransform: 'none',
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'rgba(0, 0, 0, 0.5)',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>INTERN</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>DATES</TableCell>
                    <TableCell>DURATION</TableCell>
                    <TableCell>COMMENTS</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell align="right">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: stringToColor(claim.employee_name),
                            width: 36,
                            height: 36,
                            fontSize: '0.875rem'
                          }}>
                            {getInitials(claim.employee_name || '')}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>{claim.employee_name}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          #{claim.employee_id || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2">
                            {formatDateRange(claim.from_date, claim.to_date)}
                          </Typography>
                          {formatHalfInfo(claim.from_half_day_type, claim.to_half_day_type) && (
                            <Typography variant="caption" color="text.secondary">
                              {formatHalfInfo(claim.from_half_day_type, claim.to_half_day_type)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {claim.duration || '1 day'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Tooltip title={claim.comments || claim.reason}>
                          <Typography noWrap variant="body2">
                            {claim.comments || 'No comments'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[claim.status] || claim.status}
                          color={statusColors[claim.status] || 'default'}
                          size="small"
                          sx={{
                            fontWeight: 500,
                            textTransform: 'capitalize',
                            minWidth: 80,
                            justifyContent: 'center'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, claim)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Row action menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (actionMenuClaim) handleApprove(actionMenuClaim.id);
            handleActionMenuClose();
          }}
          disabled={!actionMenuClaim || actionMenuClaim.status !== 'pending'}
        >
          Approve
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (actionMenuClaim) openRejectDialog(actionMenuClaim);
            handleActionMenuClose();
          }}
          disabled={!actionMenuClaim || actionMenuClaim.status !== 'pending'}
        >
          Reject
        </MenuItem>
      </Menu>

      {/* Claim Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedClaim && (
          <>
            <DialogTitle>
              Claim Details
              <Chip
                label={selectedClaim.status || 'pending'}
                color={statusColors[selectedClaim.status] || 'default'}
                size="small"
                sx={{ float: 'right' }}
              />
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Employee</Typography>
                <Typography variant="body1" gutterBottom>{selectedClaim.employee_name}</Typography>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>Date Range</Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDateRange(selectedClaim.from_date, selectedClaim.to_date)}
                </Typography>
                
                {selectedClaim.comments && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>Comments</Typography>
                    <Typography variant="body1">{selectedClaim.comments}</Typography>
                  </>
                )}
                
                {selectedClaim.rejection_reason && (
                  <>
                    <Typography variant="subtitle2" color="error" sx={{ mt: 2 }} gutterBottom>Rejection Reason</Typography>
                    <Typography variant="body1" color="error">{selectedClaim.rejection_reason}</Typography>
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => !actionLoading && setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Attendance Claim</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Please provide a reason for rejecting this claim:
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Rejection Reason"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={actionLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleRejectSubmit} 
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendanceClaimRequests;
