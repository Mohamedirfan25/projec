import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Check, Close, Visibility } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const AttendanceClaimRequests = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  const fetchClaims = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:8000/Sims/attendance-claims/';
      
      if (statusFilter === 'PENDING') {
        url = 'http://localhost:8000/Sims/attendance-claims/pending-approval/';
      } else if (statusFilter === 'MY_CLAIMS') {
        url = 'http://localhost:8000/Sims/attendance-claims/my-claims/';
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Token ${token}` },
      });
      console.log('Attendance claims:', response.data);
      
      setClaims(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance claims:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (claimId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8000/Sims/attendance-claims/${claimId}/approve/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      
      // Refresh the claims list
      fetchClaims();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error approving claim:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim || !rejectionReason.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8000/Sims/attendance-claims/${selectedClaim.id}/reject/`,
        { rejection_reason: rejectionReason },
        { headers: { Authorization: `Token ${token}` } }
      );
      
      // Refresh the claims list
      fetchClaims();
      setDialogOpen(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting claim:', error);
    }
  };

  const handleViewDetails = (claim) => {
    setSelectedClaim(claim);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedClaim(null);
    setRejectionReason('');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Chip label="Approved" color="success" size="small" />;
      case 'REJECTED':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label="Pending" color="warning" size="small" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const isStaff = true; // You'll need to get this from your auth context or user data

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Attendance Claims
        </Typography>
        <Box>
          <Button
            variant={statusFilter === 'PENDING' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setStatusFilter('PENDING')}
            sx={{ mr: 1 }}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'MY_CLAIMS' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setStatusFilter('MY_CLAIMS')}
            sx={{ mr: 1 }}
          >
            My Claims
          </Button>
          <Button
            variant={statusFilter === 'ALL' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setStatusFilter('ALL')}
          >
            All
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted On</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : claims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No claims found
                </TableCell>
              </TableRow>
            ) : (
              claims
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>{claim.for_period}</TableCell>
                    <TableCell>
                      {formatDate(claim.from_date)} - {formatDate(claim.to_date)}
                    </TableCell>
                    <TableCell>{getStatusChip(claim.status)}</TableCell>
                    <TableCell>{formatDate(claim.created_at)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(claim)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isStaff && claim.status === 'PENDING' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(claim.id)}
                            >
                              <Check fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleViewDetails(claim)}
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={claims.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Claim Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Attendance Claim Details</DialogTitle>
        <DialogContent dividers>
          {selectedClaim && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Period</Typography>
                <Typography>{selectedClaim.for_period}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Date Range</Typography>
                <Typography>
                  {formatDate(selectedClaim.from_date)} - {formatDate(selectedClaim.to_date)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">From Day Type</Typography>
                <Typography>
                  {selectedClaim.from_day_type === 'full' ? 'Full Day' : 'Half Day'} 
                  {selectedClaim.from_day_type === 'half' && 
                    `(${selectedClaim.from_half_day_type === 'first' ? 'First Half' : 'Second Half'})`}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">To Day Type</Typography>
                <Typography>
                  {selectedClaim.to_day_type === 'full' ? 'Full Day' : 'Half Day'} 
                  {selectedClaim.to_day_type === 'half' && 
                    `(${selectedClaim.to_half_day_type === 'first' ? 'First Half' : 'Second Half'})`}
                </Typography>
              </Box>
              {selectedClaim.comments && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Comments</Typography>
                  <Typography>{selectedClaim.comments}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                {getStatusChip(selectedClaim.status)}
              </Box>
              {selectedClaim.rejection_reason && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Rejection Reason</Typography>
                  <Typography color="error">{selectedClaim.rejection_reason}</Typography>
                </Box>
              )}
              {selectedClaim.reviewed_by && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Reviewed By</Typography>
                  <Typography>{selectedClaim.reviewed_by_name || 'N/A'}</Typography>
                </Box>
              )}
              {selectedClaim.reviewed_at && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Reviewed On</Typography>
                  <Typography>{formatDate(selectedClaim.reviewed_at)}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedClaim?.status === 'PENDING' && isStaff && (
            <>
              <Button
                onClick={() => handleApprove(selectedClaim.id)}
                color="success"
                variant="contained"
                startIcon={<Check />}
              >
                Approve
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Rejection reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <Button
                  onClick={handleReject}
                  color="error"
                  variant="outlined"
                  startIcon={<Close />}
                  disabled={!rejectionReason.trim()}
                >
                  Reject
                </Button>
              </Box>
            </>
          )}
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceClaimRequests;
