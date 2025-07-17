import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Box, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Tabs, 
  Tab, 
  Typography,
  InputAdornment,
  Avatar,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Button,
  IconButton,
  Popover,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Skeleton,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const AssetLists = () => {
  const [activeTab, setActiveTab] = useState('InProgress');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [interns, setInterns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    department: '',
    scheme: '',
    domain: ''
  });
  
  const [assets] = useState([
    { id: 'Laptop-001', type: 'Laptop', assignedTo: 'Intern 1', status: 'Assigned', date: '2023-01-15' },
    { id: 'Mouse-005', type: 'Mouse', assignedTo: 'Intern 1', status: 'Assigned', date: '2023-01-15' },
    { id: 'Keyboard-012', type: 'Keyboard', assignedTo: 'Intern 2', status: 'Assigned', date: '2023-02-20' },
    { id: 'Monitor-008', type: 'Monitor', assignedTo: '', status: 'Available', date: '2023-03-10' },
    { id: 'Laptop-002', type: 'Laptop', assignedTo: 'Intern 3', status: 'Assigned', date: '2023-04-05' },
    { id: 'Headset-003', type: 'Headset', assignedTo: '', status: 'Maintenance', date: '2023-04-18' },
  ]);
  
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [assetFilters, setAssetFilters] = useState({
    assetType: '',
    assetStatus: ''
  });
  
  const columns = [
    'Intern ID', 'Name', 'Email', 'Department', 'Scheme', 'Domain', 'Start Date', 'End Date', 'Status', 'Action'
  ];
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };
  
  const handleMenuClick = (event, intern) => {
    setSelectedIntern(intern);
    // Handle menu click logic here
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };
  
  const handleAssetFilterChange = (e) => {
    const { name, value } = e.target;
    setAssetFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredInterns = useMemo(() => {
    return interns.filter(intern => 
      intern.status === activeTab &&
      (intern.id.toString().includes(searchTerm) ||
      intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.scheme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.domain.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filters.department === '' || intern.department === filters.department) &&
      (filters.scheme === '' || intern.scheme === filters.scheme) &&
      (filters.domain === '' || intern.domain === filters.domain)
    );
  }, [interns, activeTab, searchTerm, filters]);

  // Memoize paginated data
  const paginatedInterns = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredInterns.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredInterns, page, rowsPerPage]);

  // Memoize filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesIntern = !selectedIntern || asset.assignedTo === selectedIntern.name || asset.assignedTo === '';
      const matchesType = assetFilters.assetType === '' || asset.type === assetFilters.assetType;
      const matchesStatus = assetFilters.assetStatus === '' || asset.status === assetFilters.assetStatus;
      return matchesIntern && matchesType && matchesStatus;
    });
  }, [assets, selectedIntern, assetFilters]);

  // Optimized fetch function with error handling
  const fetchInterns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      // Using Promise.all to fetch data in parallel
      const [userDataRes, registerRes, tempRes] = await Promise.all([
        axios.get("http://localhost:8000/Sims/user-data/", {
          headers: { Authorization: `Token ${token}` },
          timeout: 10000 // 10 second timeout
        }),
        axios.get("http://127.0.0.1:8000/Sims/register/", {
          headers: { Authorization: `Token ${token}` },
          timeout: 10000
        }),
        axios.get("http://localhost:8000/Sims/temps/", {
          headers: { Authorization: `Token ${token}` },
          timeout: 10000
        }),
      ]);

      // Process data
      const internUsernames = new Set(
        tempRes.data
          .filter(entry => entry.role === "intern")
          .map(entry => entry.username)
      );

      const internUsers = userDataRes.data.filter(user =>
        internUsernames.has(user.username)
      );

      const today = new Date();
      const formatted = internUsers.map((user) => {
        const registerInfo = registerRes.data.find(reg => reg.id === user.user) || {};
        const endDate = registerInfo.end_date ? new Date(registerInfo.end_date) : null;
        
        let status = "InProgress";
        if (registerInfo.user_status?.toLowerCase() === "discontinued") {
          status = "Discontinued";
        } else if (endDate && endDate < today) {
          status = "Completed";
        }

        return {
          id: user.emp_id,
          name: user.username,
          firstName: registerInfo.first_name || user.firstName || "",
          lastName: registerInfo.last_name || user.lastName || "",
          email: user.email || `${user.username}@example.com`,
          department: user.department || "-",
          scheme: user.scheme || "-",
          domain: user.domain || "-",
          startDate: registerInfo.start_date || "-",
          endDate: registerInfo.end_date || "-",
          status,
          // ... other fields
        };
      });

      setInterns(formatted);
    } catch (err) {
      console.error("Failed to fetch interns:", err);
      setError("Failed to load intern data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Shimmer effect for loading state
  const renderShimmer = () => (
    <TableRow>
      <TableCell colSpan={columns.length} sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
            </Box>
          ))}
        </Box>
      </TableCell>
    </TableRow>
  );

  // Error boundary component
  const ErrorBoundary = ({ error }) => (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography color="error" variant="h6" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {error || 'An unexpected error occurred'}
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={fetchInterns}
        startIcon={<RefreshIcon />}
      >
        Retry
      </Button>
    </Box>
  );

  // Update your JSX to include loading and error states
  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Rest of your JSX */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            {/* Table headers */}
          </TableHead>
          <TableBody>
            {isLoading ? (
              renderShimmer()
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <ErrorBoundary error={error} />
                </TableCell>
              </TableRow>
            ) : filteredInterns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No interns found. Try adjusting your search or filter criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedInterns.map((intern) => (
                <TableRow key={intern.id} hover>
                  <TableCell>{intern.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          mr: 2,
                          bgcolor: 'primary.main',
                          color: 'common.white'
                        }}
                      >
                        {intern.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {intern.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {intern.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{intern.department}</TableCell>
                  <TableCell>{intern.scheme}</TableCell>
                  <TableCell>{intern.domain}</TableCell>
                  <TableCell>{intern.startDate}</TableCell>
                  <TableCell>{intern.endDate}</TableCell>
                  <TableCell>
                    <Chip 
                      label={intern.status}
                      color={
                        intern.status === 'InProgress' ? 'primary' :
                        intern.status === 'Completed' ? 'success' : 'error'
                      }
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        minWidth: 100
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, intern)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination with loading state */}
      {!isLoading && !error && filteredInterns.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mt: 3,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedInterns.length} of {filteredInterns.length} interns
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }} color="text.secondary">
              Rows per page:
            </Typography>
            <FormControl variant="standard" size="small">
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                disabled={isLoading}
              >
                {[5, 10, 25].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>\
            <Pagination
              count={Math.ceil(filteredInterns.length / rowsPerPage)}
              page={page}
              onChange={handleChangePage}
              disabled={isLoading}
              shape="rounded"
              sx={{ ml: 2 }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(AssetLists);