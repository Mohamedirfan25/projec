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
      setClaims(response.data);
      const stats = response.data.reduce((acc, claim) => {
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

  const handleApprove = async (claim) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8000/Sims/attendance-claims/${claim.id}/approve/`,
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

  const handleReject = async (claim) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8000/Sims/attendance-claims/${claim.id}/reject/`,
        { reason },
        { headers: { Authorization: `Token ${token}` } }
      );
      setSnackbar({ open: true, message: 'Claim rejected successfully', severity: 'success' });
      await fetchClaims();
      setDialogOpen(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to reject claim', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
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
      claim.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const paginatedClaims = filteredClaims.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
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
                    <TableCell>CLAIM TYPE</TableCell>
                    <TableCell>DATES</TableCell>
                    <TableCell>DURATION</TableCell>
                    <TableCell>REASON</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell align="right">ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedClaims.map((claim) => (
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
                        <Chip 
                          label={claim.claim_type || 'Attendance'} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            color: 'primary.main',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(claim.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {claim.period || 'Full day'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {claim.duration || '1 day'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Tooltip title={claim.reason}>
                          <Typography noWrap variant="body2">
                            {claim.reason || 'No reason provided'}
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
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {claim.status === 'pending' ? (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckIcon />}
                                onClick={() => handleApprove(claim.id)}
                                disabled={actionLoading}
                                sx={{
                                  minWidth: 'auto',
                                  px: 1,
                                  '& .MuiButton-startIcon': {
                                    margin: 0
                                  }
                                }}
                              />
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<CloseIcon />}
                                onClick={() => {
                                  setSelectedClaim(claim);
                                  setDialogOpen(true);
                                }}
                                disabled={actionLoading}
                                sx={{
                                  minWidth: 'auto',
                                  px: 1,
                                  '& .MuiButton-startIcon': {
                                    margin: 0
                                  }
                                }}
                              />
                            </>
                          ) : (
                            <IconButton 
                              size="small" 
                              onClick={() => handleView(claim)}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

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
                <Typography variant="subtitle2" color="textSecondary">Employee</Typography>
                <Typography gutterBottom>{selectedClaim.employee_name || 'Unknown'}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Date</Typography>
                <Typography gutterBottom>{new Date(selectedClaim.date).toLocaleDateString()}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Period</Typography>
                <Typography gutterBottom>{selectedClaim.period || 'Full Day'}</Typography>
                
                <Typography variant="subtitle2" color="textSecondary">Reason</Typography>
                <Typography gutterBottom>{selectedClaim.reason || 'No reason provided'}</Typography>
                
                {selectedClaim.status === 'rejected' && selectedClaim.rejection_reason && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Rejection Reason:</Typography>
                    {selectedClaim.rejection_reason}
                  </Alert>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              {selectedClaim.status === 'pending' && (
                <>
                  <Button
                    color="error"
                    onClick={() => handleReject(selectedClaim.id)}
                    disabled={actionLoading}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleApprove(selectedClaim.id)}
                    disabled={actionLoading}
                  >
                    Approve
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendanceClaimRequests;
