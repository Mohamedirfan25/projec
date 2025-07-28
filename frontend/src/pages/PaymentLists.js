import React, { useState, useEffect } from 'react';
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
  ListItemIcon,
  ListItemText,
  Menu,
  Divider,
  Skeleton,
  TableRow as MuiTableRow
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Work as WorkIcon, 
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const ShimmerRow = ({ columns }) => (
  <MuiTableRow>
    {Array(columns.length).fill().map((_, index) => (
      <TableCell key={index}>
        <Skeleton variant="rectangular" width="100%" height={20} animation="wave" />
      </TableCell>
    ))}
  </MuiTableRow>
);

const ShimmerTable = ({ rows = 5, columns = 7 }) => (
  <TableContainer component={Paper} sx={{ 
    borderRadius: 3, 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid',
    borderColor: 'divider'
  }}>
    <Table>
      <TableHead>
        <TableRow>
          {Array(columns).fill().map((_, index) => (
            <TableCell key={index}>
              <Skeleton variant="text" width="80%" height={24} animation="wave" />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array(rows).fill().map((_, rowIndex) => (
          <ShimmerRow key={rowIndex} columns={columns} />
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const PaymentLists = () => {
  const [activeTab, setActiveTab] = useState('InProgress');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [interns, setInterns] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [paymentFilterAnchorEl, setPaymentFilterAnchorEl] = useState(null);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openAddPaymentDialog, setOpenAddPaymentDialog] = useState(false);
  const [openEditPaymentDialog, setOpenEditPaymentDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [editPaymentReceipt, setEditPaymentReceipt] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentRowsPerPage, setPaymentRowsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    department: '',
    scheme: '',
    domain: ''
  });
  const [paymentFilters, setPaymentFilters] = useState({
    status: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rowMenuAnchorEl, setRowMenuAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    internId: '',
    internName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    department: '',
    status: 'Pending',
    paymentMethod: 'Bank Transfer',
    receipt: null
  });

  const [editPaymentForm, setEditPaymentForm] = useState({
    id: '',
    internId: '',
    internName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    department: '',
    status: 'Pending',
    paymentMethod: 'Bank Transfer',
    receipt: null
  });

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
    
        // Fetch all required data in parallel
        const [userDataRes, registerRes, tempRes] = await Promise.all([
          axios.get("http://localhost:8000/Sims/user-data/", {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/Sims/register/", {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get("http://localhost:8000/Sims/temps/", {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);
    
        console.log("User Data:", userDataRes.data);
    
        // Get intern usernames from temp data
        const internUsernames = new Set(
          tempRes.data
            .filter((entry) => entry.role === "intern")
            .map((entry) => entry.username)
        );
    
        // Filter only intern users
        const internUsers = userDataRes.data.filter((user) =>
          internUsernames.has(user.username)
        );
    
        // Combine intern data with registration info
        const combinedData = internUsers.map((user) => {
          const registerInfo = registerRes.data.find(
            (reg) => reg.id === user.user
          ) || {};
          return {
            ...user,
            ...registerInfo,
            firstName: registerInfo.first_name || "",
            lastName: registerInfo.last_name || "",
          };
        });
    
        const today = new Date();
    
        const formatted = combinedData.map((item) => {
          const endDate = item.end_date ? new Date(item.end_date) : null;
    
          let status = "InProgress";
          if (item.user_status?.toLowerCase() === "discontinued") {
            status = "Discontinued";
          } else if (endDate && endDate < today) {
            status = "Completed";
          }
    
          return {
            id: item.emp_id,
            name: item.username,
            firstName: item.first_name || item.firstName || "",
            lastName: item.last_name || item.lastName || "",
            email: item.email || `${item.username}@example.com`,
            department: item.department || "-",
            scheme: item.scheme || "-",
            domain: item.domain || "-",
            startDate: item.start_date || "-",
            endDate: item.end_date || "-",
            status,
            reportingManager: item.reporting_manager_username || "-",
            reportingSupervisor: item.reporting_supervisor_username || "-",
            duration: item.duration || "-",
            shiftTiming: item.shift_timing || "-",
            teamName: item.team_name || "-",
          };
        });
    
        setInterns(formatted);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch interns:", error);
        setLoading(false);
        setError("Failed to load interns. Please try again later.");
      }
    };
    
    fetchInterns();
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!selectedIntern) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/Sims/fees/${selectedIntern.id}/`,
          { headers: { Authorization: `Token ${token}` } }
        );

        if (response.data && response.data.length > 0) {
          const paymentData = response.data[0].payment_details.map(payment => ({
            id: payment.id,
            internId: selectedIntern.id,
            internName: selectedIntern.name,
            amount: payment.amount,
            date: payment.payment_date,
            method: payment.payment_method,
            status: payment.status,
            receipt: payment.receipt,
            department: selectedIntern.department
          }));
          setPayments(paymentData);
        } else {
          setPayments([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        setError("Failed to fetch payments. Please try again.");
        setLoading(false);
      }
    };

    if (selectedIntern && openPaymentDialog) {
      fetchPayments();
    }
  }, [selectedIntern, openPaymentDialog]);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handlePaymentFilterClick = (event) => {
    setPaymentFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setPaymentFilterAnchorEl(null);
  };

  const handleMenuClick = (event, intern) => {
    setAnchorEl(event.currentTarget);
    setSelectedIntern(intern);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRowMenuClick = (event, row) => {
    setRowMenuAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleRowMenuClose = () => {
    setRowMenuAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setEditPaymentForm({
      id: payment.id,
      internId: payment.internId,
      internName: payment.internName,
      amount: payment.amount,
      date: payment.date,
      department: payment.department,
      status: payment.status,
      paymentMethod: payment.method,
      receipt: payment.receipt
    });
    setOpenEditPaymentDialog(true);
  };

  const handleDeleteIntern = async (internId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/Sims/user-data/${internId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setInterns(interns.filter(intern => intern.id !== internId));
      handleRowMenuClose();
    } catch (error) {
      console.error("Failed to delete intern:", error);
      setError("Failed to delete intern. Please try again.");
    }
  };

  const handleInternClick = (intern) => {
    setSelectedIntern(intern);
    setOpenPaymentDialog(true);
  };

  const handlePaymentDialogClose = () => {
    setOpenPaymentDialog(false);
    setSelectedIntern(null);
  };

  const handleAddPaymentDialogClose = () => {
    setOpenAddPaymentDialog(false);
    setPaymentForm({
      internId: '',
      internName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      department: '',
      status: 'Pending',
      paymentMethod: 'Bank Transfer',
      receipt: null
    });
    setPaymentReceipt(null);
  };

  const handleEditPaymentDialogClose = () => {
    setOpenEditPaymentDialog(false);
    setEditPaymentForm({
      id: '',
      internId: '',
      internName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      department: '',
      status: 'Pending',
      paymentMethod: 'Bank Transfer',
      receipt: null
    });
    setEditPaymentReceipt(null);
    setSelectedPayment(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentFilterChange = (e) => {
    const { name, value } = e.target;
    setPaymentFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditPaymentFormChange = (e) => {
    const { name, value } = e.target;
    setEditPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentReceipt(file);
      setPaymentForm(prev => ({
        ...prev,
        receipt: file.name
      }));
    }
  };

  const handleEditReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditPaymentReceipt(file);
      setEditPaymentForm(prev => ({
        ...prev,
        receipt: file.name
      }));
    }
  };

  const handleAddPaymentSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      // Append all payment form data
      Object.entries(paymentForm).forEach(([key, value]) => {
        if (key !== 'receipt' && value !== null) {
          formData.append(key, value);
        }
      });
      
      // Append the receipt file if it exists
      if (paymentReceipt) {
        formData.append('receipt', paymentReceipt);
      }
      
      const response = await axios.post(
        "http://localhost:8000/Sims/fees/",
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update local state with the new payment
      const newPayment = {
        ...response.data,
        internId: paymentForm.internId,
        internName: paymentForm.internName,
        department: paymentForm.department
      };
      
      setPayments([...payments, newPayment]);
      setOpenAddPaymentDialog(false);
    } catch (error) {
      console.error("Failed to add payment:", error);
      setError("Failed to add payment. Please try again.");
    }
  };

  const handleEditPaymentSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      // Append all edit payment form data
      Object.entries(editPaymentForm).forEach(([key, value]) => {
        if (key !== 'receipt' && value !== null) {
          formData.append(key, value);
        }
      });
      
      // Append the receipt file if it exists
      if (editPaymentReceipt) {
        formData.append('receipt', editPaymentReceipt);
      }
      
      const response = await axios.put(
        `http://localhost:8000/Sims/fees/${editPaymentForm.id}/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update local state with the updated payment
      const updatedPayments = payments.map(payment => 
        payment.id === selectedPayment.id ? {
          ...payment,
          ...response.data,
          internId: editPaymentForm.internId,
          internName: editPaymentForm.internName,
          department: editPaymentForm.department
        } : payment
      );
      
      setPayments(updatedPayments);
      setOpenEditPaymentDialog(false);
    } catch (error) {
      console.error("Failed to update payment:", error);
      setError("Failed to update payment. Please try again.");
    }
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      scheme: '',
      domain: ''
    });
  };

  const clearPaymentFilters = () => {
    setPaymentFilters({
      status: '',
      paymentMethod: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const filteredInterns = interns.filter(intern => {
    // First filter by active tab status
    const statusMatch = 
      (activeTab === 'InProgress' && intern.status === 'InProgress') ||
      (activeTab === 'Completed' && intern.status === 'Completed') ||
      (activeTab === 'Discontinued' && intern.status === 'Discontinued');
    
    // Then filter by search term and other filters
    return (
      statusMatch &&
      (intern.id.toString().includes(searchTerm) ||
      intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.scheme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.domain.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filters.department === '' || intern.department === filters.department) &&
      (filters.scheme === '' || intern.scheme === filters.scheme) &&
      (filters.domain === '' || intern.domain === filters.domain)
    );
  });

  const filteredPayments = payments.filter(payment => 
    (paymentFilters.status === '' || payment.status === paymentFilters.status) &&
    (paymentFilters.paymentMethod === '' || payment.method === paymentFilters.paymentMethod) &&
    (paymentFilters.dateFrom === '' || payment.date >= paymentFilters.dateFrom) &&
    (paymentFilters.dateTo === '' || payment.date <= paymentFilters.dateTo)
  );

  const columns = [
    'Intern ID', 'Intern Name', 'Email ID', 'Department', 'Scheme', 'Domain', 'Start Date', 'End Date', 'Status', 'Action'
  ];

  const paymentColumns = [
    'Intern', 'Intern ID', 'Amount', 'Date', 'Method', 'Status', 'Actions'
  ];

  // Get unique values for filters
  const departments = [...new Set(interns.map(intern => intern.department))];
  const schemes = [...new Set(interns.map(intern => intern.scheme))];
  const domains = [...new Set(interns.map(intern => intern.domain))];

  // Pagination logic
  const count = Math.ceil(filteredInterns.length / rowsPerPage);
  const paginatedInterns = filteredInterns.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const paymentCount = Math.ceil(filteredPayments.length / paymentRowsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (paymentPage - 1) * paymentRowsPerPage,
    paymentPage * paymentRowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handlePaymentChangePage = (event, newPage) => {
    setPaymentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handlePaymentChangeRowsPerPage = (event) => {
    setPaymentRowsPerPage(parseInt(event.target.value, 10));
    setPaymentPage(1);
  };

  const schemeColors = {
    'Free': { bg: '#e3f2fd', text: '#1976d2' },
    'Project': { bg: '#e8f5e9', text: '#388e3c' },
    'Course': { bg: '#fff3e0', text: '#ffa000' }
  };

  const domainColors = {
    'Full Stack': { bg: '#e3f2fd', text: '#1976d2' },
    'Machine Learning': { bg: '#f3e5f5', text: '#8e24aa' },
    'Cloud Computing': { bg: '#e0f7fa', text: '#00acc1' },
    'Mobile Development': { bg: '#e8f5e9', text: '#43a047' },
    'Data Analytics': { bg: '#f1f8e9', text: '#7cb342' },
    'Design Systems': { bg: '#fff8e1', text: '#ffb300' }
  };

  const statusColors = {
    'Paid': { bg: '#e8f5e9', text: '#388e3c' },
    'Pending': { bg: '#fff3e0', text: '#ffa000' },
    'Overdue': { bg: '#ffebee', text: '#d32f2f' },
    'Canceled': { bg: '#f5f5f5', text: '#616161' }
  };

  const open = Boolean(filterAnchorEl);
  const paymentOpen = Boolean(paymentFilterAnchorEl);
  const menuOpen = Boolean(anchorEl);
  const rowMenuOpen = Boolean(rowMenuAnchorEl);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1); // Reset to first page when changing tabs
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
        {/* Shimmer for search and filter bar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          backgroundColor: 'background.paper',
          p: 3,
          borderRadius: 3,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Skeleton variant="rectangular" width={200} height={40} animation="wave" />
            <Skeleton variant="rectangular" width={350} height={40} animation="wave" />
            <Skeleton variant="circular" width={40} height={40} animation="wave" />
          </Box>
          <Skeleton variant="rectangular" width={150} height={40} animation="wave" />
        </Box>
        
        {/* Shimmer for tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ 
              '& .MuiTabs-indicator': { 
                height: 3,
                borderRadius: '3px 3px 0 0'
              } 
            }}
          >
            {['InProgress', 'Completed', 'Discontinued'].map((tab) => (
              <Tab 
                key={tab}
                value={tab}
                label={tab}
                sx={{ 
                  textTransform: 'none', 
                  minWidth: 'auto',
                  px: 3,
                  '&.Mui-selected': { color: 'primary.main' }
                }}
              />
            ))}
          </Tabs>
        </Box>
        
        {/* Shimmer for table */}
        <ShimmerTable rows={5} columns={columns.length} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Main content */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        backgroundColor: 'background.paper',
        p: 3,
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Payroll List
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Search by name, ID, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              width: 350,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fieldset: {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            onClick={handleFilterClick}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1,
              color: 'primary.main'
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddPaymentDialog(true)}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1
          }}
        >
          Add New Payment
        </Button>
      </Box>

      {/* Filters Popover */}
      <Popover
        open={open}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 3,
            width: 300,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
        
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 1 }}>Department</Typography>
            <Select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              displayEmpty
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 1 }}>Scheme</Typography>
            <Select
              name="scheme"
              value={filters.scheme}
              onChange={handleFilterChange}
              displayEmpty
            >
              <MenuItem value="">All Schemes</MenuItem>
              {schemes.map((scheme) => (
                <MenuItem key={scheme} value={scheme}>{scheme}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 1 }}>Domain</Typography>
            <Select
              name="domain"
              value={filters.domain}
              onChange={handleFilterChange}
              displayEmpty
            >
              <MenuItem value="">All Domains</MenuItem>
              {domains.map((domain) => (
                <MenuItem key={domain} value={domain}>{domain}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              onClick={clearFilters}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Clear
            </Button>
            <Button 
              onClick={handleFilterClose}
              variant="contained"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Apply
            </Button>
          </Box>
        </Stack>
      </Popover>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: 3
          }
        }}
        variant="fullWidth"
      >
        <Tab 
          label="In Progress" 
          value="InProgress" 
          icon={<WorkIcon fontSize="small" />} 
          iconPosition="start"
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 48
          }}
        />
        <Tab 
          label="Completed" 
          value="Completed" 
          icon={<CheckCircleIcon fontSize="small" />} 
          iconPosition="start"
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 48
          }}
        />
        <Tab 
          label="Discontinued" 
          value="Discontinued" 
          icon={<CancelIcon fontSize="small" />} 
          iconPosition="start"
          sx={{ 
            textTransform: 'none', 
            fontWeight: 500,
            fontSize: '0.875rem',
            minHeight: 48
          }}
        />
      </Tabs>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 3, 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column} 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary',
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Show shimmer rows when loading
              Array(rowsPerPage).fill().map((_, index) => (
                <ShimmerRow key={`shimmer-${index}`} columns={columns.length} />
              ))
            ) : paginatedInterns.length > 0 ? (
              // Show actual data when loaded
              paginatedInterns.map((intern) => (
                <TableRow 
                  key={intern.id} 
                  hover
                  sx={{ 
                    '&:last-child td': { borderBottom: 0 },
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <TableCell>
                    <Typography 
                      onClick={() => handleInternClick(intern)}
                      sx={{ 
                        fontWeight: 600, 
                        color: 'text.primary',
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {intern.id}
                    </Typography>
                  </TableCell>
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
                        {intern.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {intern.name}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {intern.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{intern.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={intern.scheme}
                      size="small"
                      sx={{
                        backgroundColor: schemeColors[intern.scheme]?.bg || '#f5f5f5',
                        color: schemeColors[intern.scheme]?.text || 'text.primary',
                        fontWeight: 500,
                        minWidth: 80
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={intern.domain}
                      size="small"
                      sx={{
                        backgroundColor: domainColors[intern.domain]?.bg || '#f5f5f5',
                        color: domainColors[intern.domain]?.text || 'text.primary',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>{intern.startDate}</TableCell>
                  <TableCell>{intern.endDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={intern.status}
                      size="small"
                      sx={{
                        backgroundColor: 
                          intern.status === 'InProgress' ? 'rgba(33, 150, 243, 0.1)' :
                          intern.status === 'Completed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        color: 
                          intern.status === 'InProgress' ? 'primary.main' :
                          intern.status === 'Completed' ? 'success.main' : 'error.main',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="more"
                      aria-controls="row-menu"
                      aria-haspopup="true"
                      onClick={(e) => handleRowMenuClick(e, intern)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id="row-menu"
                      anchorEl={rowMenuAnchorEl}
                      open={rowMenuOpen && selectedRow?.id === intern.id}
                      onClose={handleRowMenuClose}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <MenuItem onClick={() => {
                        handleInternClick(intern);
                        handleRowMenuClose();
                      }}>
                        <ListItemIcon>
                          <WorkIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText>View Payments</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => {
                        handleRowMenuClose();
                      }}>
                        <ListItemIcon>
                          <EditIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={() => handleDeleteIntern(intern.id)}>
                        <ListItemIcon>
                          <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No interns found matching your criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredInterns.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mt: 3,
          backgroundColor: 'background.paper',
          p: 2,
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
                IconComponent={ArrowDropDownIcon}
                sx={{
                  '& .MuiSelect-select': {
                    py: 1,
                    pl: 1.5,
                    pr: 3
                  }
                }}
              >
                {[5, 10, 25].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Pagination
              count={count}
              page={page}
              onChange={handleChangePage}
              shape="rounded"
              sx={{ ml: 2 }}
            />
          </Box>
        </Box>
      )}

      {/* Payment List Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={handlePaymentDialogClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6" fontWeight={600}>
            Payment List - {selectedIntern?.name}
          </Typography>
          <Box>
            <IconButton
              onClick={handlePaymentFilterClick}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 1,
                color: 'primary.main',
                mr: 1
              }}
            >
              <FilterListIcon />
            </IconButton>
            <IconButton onClick={handlePaymentDialogClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  {paymentColumns.map((column) => (
                    <TableCell 
                      key={column} 
                      sx={{ 
                        fontWeight: 700, 
                        color: 'text.primary',
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      {column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  // Show shimmer rows when loading payments
                  Array(paymentRowsPerPage).fill().map((_, index) => (
                    <ShimmerRow key={`shimmer-${index}`} columns={paymentColumns.length} />
                  ))
                ) : paginatedPayments.length > 0 ? (
                  // Show actual data when loaded
                  paginatedPayments.map((payment) => (
                    <TableRow 
                      key={payment.id}
                      hover
                      sx={{ 
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                    >
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
                            {payment.internName[0]}
                          </Avatar>
                          <Typography fontWeight={600}>
                            {payment.internName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{payment.internId}</TableCell>
                      <TableCell>₹{payment.amount}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          size="small"
                          sx={{
                            backgroundColor: statusColors[payment.status]?.bg || '#f5f5f5',
                            color: statusColors[payment.status]?.text || 'text.primary',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary"
                          onClick={() => handleEditPayment(payment)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={paymentColumns.length} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No payments found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredPayments.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 2,
              borderTop: '1px solid #e0e0e0'
            }}>
              <Typography variant="body2" color="text.secondary">
                Showing {paginatedPayments.length} of {filteredPayments.length} payments
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1 }} color="text.secondary">
                  Rows per page:
                </Typography>
                <FormControl variant="standard" size="small">
                  <Select
                    value={paymentRowsPerPage}
                    onChange={handlePaymentChangeRowsPerPage}
                    IconComponent={ArrowDropDownIcon}
                    sx={{
                      '& .MuiSelect-select': {
                        py: 1,
                        pl: 1.5,
                        pr: 3
                      }
                    }}
                  >
                    {[5, 10, 25].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Pagination
                  count={paymentCount}
                  page={paymentPage}
                  onChange={handlePaymentChangePage}
                  shape="rounded"
                  sx={{ ml: 2 }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Filter Popover */}
      <Popover
        open={paymentOpen}
        anchorEl={paymentFilterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 3,
            width: 300,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>Payment Filters</Typography>
        
        <Stack spacing={3}>
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 1 }}>Status</Typography>
            <Select
              name="status"
              value={paymentFilters.status}
              onChange={handlePaymentFilterChange}
              displayEmpty
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
              <MenuItem value="Canceled">Canceled</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth size="small">
            <Typography variant="body2" sx={{ mb: 1 }}>Payment Method</Typography>
            <Select
              name="paymentMethod"
              value={paymentFilters.paymentMethod}
              onChange={handlePaymentFilterChange}
              displayEmpty
            >
              <MenuItem value="">All Methods</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Net Banking">Net Banking</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
            </Select>
          </FormControl>
          
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>Date Range</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="date"
                name="dateFrom"
                value={paymentFilters.dateFrom}
                onChange={handlePaymentFilterChange}
                size="small"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                type="date"
                name="dateTo"
                value={paymentFilters.dateTo}
                onChange={handlePaymentFilterChange}
                size="small"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              onClick={clearPaymentFilters}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Clear
            </Button>
            <Button 
              onClick={handleFilterClose}
              variant="contained"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Apply
            </Button>
          </Box>
        </Stack>
      </Popover>

      {/* Add Payment Dialog */}
      <Dialog
        open={openAddPaymentDialog}
        onClose={handleAddPaymentDialogClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6" fontWeight={600}>
            Add New Payment
          </Typography>
          <IconButton onClick={handleAddPaymentDialogClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Intern ID"
              name="internId"
              value={paymentForm.internId}
              onChange={handlePaymentFormChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Intern Name"
              name="internName"
              value={paymentForm.internName}
              onChange={handlePaymentFormChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={paymentForm.amount}
              onChange={handlePaymentFormChange}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
            <TextField
              label="Date"
              name="date"
              type="date"
              value={paymentForm.date}
              onChange={handlePaymentFormChange}
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl fullWidth size="small">
              <Typography variant="body2" sx={{ mb: 1 }}>Department</Typography>
              <Select
                name="department"
                value={paymentForm.department}
                onChange={handlePaymentFormChange}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <Typography variant="body2" sx={{ mb: 1 }}>Status</Typography>
              <Select
                name="status"
                value={paymentForm.status}
                onChange={handlePaymentFormChange}
              >
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
                <MenuItem value="Canceled">Canceled</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <Typography variant="body2" sx={{ mb: 1 }}>Payment Method</Typography>
              <Select
                name="paymentMethod"
                value={paymentForm.paymentMethod}
                onChange={handlePaymentFormChange}
              >
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Net Banking">Net Banking</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Upload Receipt</Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileIcon />}
                sx={{ mr: 2 }}
              >
                Upload
                <input
                  type="file"
                  hidden
                  onChange={handleReceiptUpload}
                />
              </Button>
              {paymentReceipt && (
                <Typography variant="body2" display="inline">
                  {paymentReceipt.name}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={handleAddPaymentDialogClose}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddPaymentSubmit}
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog
        open={openEditPaymentDialog}
        onClose={handleEditPaymentDialogClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6" fontWeight={600}>
            Edit Payment
          </Typography>
          <IconButton onClick={handleEditPaymentDialogClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Intern ID"
              name="internId"
              value={editPaymentForm.internId}
              onChange={handleEditPaymentFormChange}
              fullWidth
              size="small"
              disabled
            />
            <TextField
              label="Intern Name"
              name="internName"
              value={editPaymentForm.internName}
              onChange={handleEditPaymentFormChange}
              fullWidth
              size="small"
              disabled
            />
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={editPaymentForm.amount}
              onChange={handleEditPaymentFormChange}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
            <TextField
              label="Date"
              name="date"
              type="date"
              value={editPaymentForm.date}
              onChange={handleEditPaymentFormChange}
              fullWidth
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl fullWidth size="small">
              <Typography variant="body2" sx={{ mb: 1 }}>Department</Typography>
              <Select
                name="department"
                value={editPaymentForm.department}
                onChange={handleEditPaymentFormChange}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <Typography variant="body2" sx={{ mb: 1 }}>Status</Typography>
              <Select
                name="status"
                value={editPaymentForm.status}
                onChange={handleEditPaymentFormChange}
              >
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
                <MenuItem value="Canceled">Canceled</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <Typography variant="body2" sx={{ mb: 1 }}>Payment Method</Typography>
              <Select
                name="paymentMethod"
                value={editPaymentForm.paymentMethod}
                onChange={handleEditPaymentFormChange}
              >
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Net Banking">Net Banking</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Upload Receipt</Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileIcon />}
                sx={{ mr: 2 }}
              >
                Upload
                <input
                  type="file"
                  hidden
                  onChange={handleEditReceiptUpload}
                />
              </Button>
              {editPaymentReceipt ? (
                <Typography variant="body2" display="inline">
                  {editPaymentReceipt.name}
                </Typography>
              ) : editPaymentForm.receipt ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" display="inline">
                    {editPaymentForm.receipt}
                  </Typography>
                  <Box
                    component="img"
                    src={`/path/to/receipts/${editPaymentForm.receipt}`}
                    sx={{ width: 50, height: 50, objectFit: 'cover' }}
                    alt="Receipt preview"
                  />
                </Box>
              ) : null}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
          <Button 
            onClick={handleEditPaymentDialogClose}
            variant="outlined"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditPaymentSubmit}
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentLists;