import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Badge,
  Avatar,
  useMediaQuery,
  useTheme,
  Box,
  TextField,
  Hidden,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  AttachMoney,
  History,
  FilterList,
  Print,
  Download,
  Close,
  CheckCircle,
  ArrowBack,
  Paid,
  Receipt,
  CalendarToday,
  Payment,
  MoreVert,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components with responsive adjustments
const StyledCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'transform 0.3s, box-shadow 0.3s',
  width: '100%',
  maxWidth: '300px',
  height: '240px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '16px',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' 
    : 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
  },
  [theme.breakpoints.down('sm')]: {
    height: '200px',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === 'paid'
      ? theme.palette.success.main
      : status === 'pending'
      ? theme.palette.warning.main
      : theme.palette.error.main,
  color: 'white',
  borderRadius: '12px',
  fontWeight: 600,
  padding: '4px 8px',
  fontSize: '0.75rem',
}));

const StyledTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-head': {
    fontWeight: 700,
    backgroundColor: theme.palette.mode === 'dark' ? '#1e3c72' : '#e0f7fa',
    fontSize: '0.875rem',
    [theme.breakpoints.down('sm')]: {
      padding: '8px',
      fontSize: '0.75rem',
    },
  },
  '& .MuiTableCell-body': {
    fontSize: '0.875rem',
    [theme.breakpoints.down('sm')]: {
      padding: '8px',
      fontSize: '0.75rem',
    },
  },
}));

const BalanceWidget = styled(Box)(({ theme }) => ({
  padding: '16px',
  borderRadius: '12px',
  backgroundColor: theme.palette.mode === 'dark' ? '#1e3c72' : '#e0f7fa',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '16px',
  width: '100%',
}));

const PaymentStatusPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [activeView, setActiveView] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false);
  const [filters, setFilters] = useState({ status: 'all' });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [dueData, setDueData] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:8000/Sims/fees/',{
          headers: { Authorization: `Token ${token}` },
        });
        const data = response.data;
        
        // Transform API data for due fees
        const transformedDueData = data.map(item => {
          return {
            id: item.employee_id,
            name: item.employee_name,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: item.summary.total_fee_amount,
            paid: item.summary.total_paid,
            status: item.summary.remaining_amount > 0 ? 
              (new Date() > new Date(new Date().setDate(new Date().getDate() + 30))) ? 'overdue' : 'pending' 
              : 'paid',
            domain: item.domain,
            scheme: item.scheme,
            feeStructureId: item.summary.fee_structure_id
          };
        });
  
        // Transform API data for payment history
        const transformedCollectionData = data.flatMap(item => {
          return item.payment_details.map(payment => {
            return {
              id: item.employee_id,
              receiptNo: payment.id,
              amount: parseFloat(payment.amount),
              date: payment.paid_date.split('T')[0],
              paymentMethod: payment.payment_method || 'Not specified',
              domain: payment.domain,
              feeStructure: payment.fee_structure
            };
          });
        });
  
        setDueData(transformedDueData);
        setCollectionData(transformedCollectionData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching fee data:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchFeeData();
  }, []);



  const handleCardClick = (view) => {
    setActiveView(view);
  };

  const handleBackClick = () => {
    setActiveView(null);
  };

  const handleFilterOpen = () => {
    setFilterDialogOpen(true);
  };

  const handleFilterClose = () => {
    setFilterDialogOpen(false);
  };

  const handleFilterChange = (filter, value) => {
    setFilters({ ...filters, [filter]: value });
  };

  const handlePaymentClick = (payment) => {
    setSelectedPayment(payment);
    setPaymentDetailsOpen(true);
  };

  const handlePaymentDetailsClose = () => {
    setPaymentDetailsOpen(false);
    setPaymentAmount('');
  };

  const handlePaymentAmountChange = (e) => {
    setPaymentAmount(e.target.value);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleMakePayment = async () => {
    if (!paymentAmount || isNaN(paymentAmount)) return;
    
    const amount = Number(paymentAmount);
    if (amount <= 0) return;

    try {
      const paymentData = {
        emp_id: selectedPayment.id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        domain: selectedPayment.domain,
        fee_structure: selectedPayment.feeStructureId
      };

      const response = await axios.post('http://localhost:8000/Sims/fees/', paymentData);
      
      // Update local state with the new payment
      const newPayment = {
        id: selectedPayment.id,
        receiptNo: response.data.id,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: paymentMethod,
        domain: selectedPayment.domain,
        feeStructure: selectedPayment.feeStructureId
      };

      setCollectionData([...collectionData, newPayment]);

      // Update the due data
      const updatedData = dueData.map(item => {
        if (item.id === selectedPayment.id) {
          const newPaid = item.paid + amount;
          const newStatus = newPaid >= item.amount ? 'paid' : item.status;
          return {
            ...item,
            paid: newPaid,
            status: newStatus
          };
        }
        return item;
      });

      setDueData(updatedData);
      setPaymentAmount('');
      setPaymentDetailsOpen(false);
    } catch (err) {
      console.error('Error making payment:', err);
      setError('Failed to record payment. Please try again.');
    }
  };

  const filteredFeeDueData = dueData.filter((item) => {
    return filters.status === 'all' || item.status === filters.status;
  });

  const filteredFeeCollectionData = collectionData.filter((item) => {
    return filters.status === 'all' || true; // No status filter for collection data
  });

  const totalDue = dueData.reduce((sum, item) => sum + (item.amount - item.paid), 0);
  const totalPaid = collectionData.reduce((sum, item) => sum + item.amount, 0);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const dataToExport = activeView === 'due' ? filteredFeeDueData : filteredFeeCollectionData;
    const headers = activeView === 'due' 
      ? ['Employee ID', 'Name', 'Total Amount', 'Amount Paid', 'Due Date', 'Domain', 'Status']
      : ['Employee ID', 'Receipt No.', 'Amount Paid', 'Payment Date', 'Payment Method', 'Domain'];
    
    let csvContent = headers.join(',') + '\n';
    
    dataToExport.forEach(item => {
      const row = activeView === 'due'
        ? [
            item.id,
            `"${item.name}"`,
            formatCurrency(item.amount),
            formatCurrency(item.paid),
            formatDate(item.dueDate),
            item.domain,
            item.status === 'overdue' ? 'Overdue' : item.status === 'paid' ? 'Paid' : 'Pending'
          ]
        : [
            item.id,
            item.receiptNo,
            formatCurrency(item.amount),
            formatDate(item.date),
            item.paymentMethod,
            item.domain
          ];
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeView === 'due' ? 'pending_fees' : 'payment_history'}_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDashboard = () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      gap: 4, 
      flexWrap: 'wrap',
      mt: 4,
      px: isMobile ? 2 : 4,
    }}>
      <StyledCard onClick={() => handleCardClick('due')}>
        <CardContent sx={{ textAlign: 'center', width: '100%' }}>
          <Badge badgeContent={dueData.length} color="error" overlap="circular">
            <Avatar sx={{ 
              bgcolor: 'error.main', 
              width: isMobile ? 56 : 72, 
              height: isMobile ? 56 : 72,
              margin: '0 auto',
              boxShadow: theme.shadows[4]
            }}>
              <Paid sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }} />
            </Avatar>
          </Badge>
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ mt: 2, fontWeight: 700 }}>
            Pending Intern Fees
          </Typography>
          <Typography variant={isMobile ? 'body2' : 'subtitle1'} color="textSecondary" sx={{ mt: 1 }}>
            Total Outstanding: <span style={{ fontWeight: 700 }}>{formatCurrency(totalDue)}</span>
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            Click to view details
          </Typography>
        </CardContent>
      </StyledCard>

      <StyledCard onClick={() => handleCardClick('collection')}>
        <CardContent sx={{ textAlign: 'center', width: '100%' }}>
          <Avatar sx={{ 
            bgcolor: 'success.main', 
            width: isMobile ? 56 : 72, 
            height: isMobile ? 56 : 72,
            margin: '0 auto',
            boxShadow: theme.shadows[4]
          }}>
            <Receipt sx={{ fontSize: isMobile ? '1.5rem' : '2rem' }} />
          </Avatar>
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ mt: 2, fontWeight: 700 }}>
            Payment History
          </Typography>
          <Typography variant={isMobile ? 'body2' : 'subtitle1'} color="textSecondary" sx={{ mt: 1 }}>
            Total Paid: <span style={{ fontWeight: 700 }}>{formatCurrency(totalPaid)}</span>
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            Click to view history
          </Typography>
        </CardContent>
      </StyledCard>
    </Box>
  );

  const renderFeeDueList = () => (
    <Box sx={{ 
      width: '100%',
      margin: '0 auto',
      p: isMobile ? 1 : isTablet ? 2 : 3
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackClick}
          variant="outlined"
          sx={{ borderRadius: '12px' }}
          size={isMobile ? 'small' : 'medium'}
        >
          Back
        </Button>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={handleFilterOpen}
          sx={{ borderRadius: '12px' }}
          size={isMobile ? 'small' : 'medium'}
        >
          Filter by Status
        </Button>
      </Box>

      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Pending Intern Fees
      </Typography>

      <BalanceWidget>
        <Typography variant={isMobile ? 'body1' : 'subtitle1'} sx={{ fontWeight: 600 }}>
          Total Outstanding Balance
        </Typography>
        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 800, color: 'error.main' }}>
          {formatCurrency(totalDue)}
        </Typography>
      </BalanceWidget>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: '12px',
          boxShadow: theme.shadows[3],
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflowX: 'auto',
        }}
      >
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total Amount</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Amount Paid</TableCell>
              {!isMobile && (
                <TableCell sx={{ fontWeight: 600 }}>Domain</TableCell>
              )}
              <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFeeDueData.length > 0 ? (
              filteredFeeDueData.map((fee) => (
                <TableRow 
                  key={fee.id} 
                  hover 
                  onClick={() => handlePaymentClick(fee)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{fee.id}</TableCell>
                  <TableCell>{fee.name}</TableCell>
                  <TableCell align="right">{formatCurrency(fee.amount)}</TableCell>
                  <TableCell align="right">{formatCurrency(fee.paid)}</TableCell>
                  {!isMobile && (
                    <TableCell>{fee.domain}</TableCell>
                  )}
                  <TableCell align="center">
                    <StatusChip
                      label={fee.status === 'overdue' ? 'Overdue' : fee.status === 'paid' ? 'Paid' : 'Pending'}
                      status={fee.status}
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isMobile ? 5 : 6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No pending intern fees found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </StyledTable>
      </TableContainer>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="body2" color="textSecondary">
          Showing {filteredFeeDueData.length} of {dueData.length} records
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            startIcon={<Print />} 
            variant="outlined"
            sx={{ borderRadius: '12px' }}
            onClick={handlePrint}
            size={isMobile ? 'small' : 'medium'}
          >
            Print
          </Button>
          <Button 
            startIcon={<Download />} 
            variant="contained"
            sx={{ borderRadius: '12px' }}
            onClick={handleExport}
            size={isMobile ? 'small' : 'medium'}
          >
            Export
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderFeeCollectionTable = () => (
    <Box sx={{ 
      width: '100%',
      margin: '0 auto',
      p: isMobile ? 1 : isTablet ? 2 : 3
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackClick}
          variant="outlined"
          sx={{ borderRadius: '12px' }}
          size={isMobile ? 'small' : 'medium'}
        >
          Back
        </Button>
        <Typography variant="caption" color="textSecondary">
          Last updated: {new Date().toLocaleString()}
        </Typography>
      </Box>

      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Payment History
      </Typography>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: '12px',
          boxShadow: theme.shadows[3],
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflowX: 'auto',
        }}
      >
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Receipt No.</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Amount Paid</TableCell>
              {!isMobile && (
                <TableCell sx={{ fontWeight: 600 }}>Payment Date</TableCell>
              )}
              <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
              {!isMobile && (
                <TableCell sx={{ fontWeight: 600 }}>Domain</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFeeCollectionData.length > 0 ? (
              filteredFeeCollectionData.map((payment) => (
                <TableRow 
                  key={payment.receiptNo} 
                  hover
                  onClick={() => handlePaymentClick(payment)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{payment.id}</TableCell>
                  <TableCell>{payment.receiptNo}</TableCell>
                  <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                  {!isMobile ? (
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        {formatDate(payment.date)}
                      </Box>
                    </TableCell>
                  ) : (
                    <Hidden xsUp>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" color="action" />
                          {formatDate(payment.date)}
                        </Box>
                      </TableCell>
                    </Hidden>
                  )}
                  <TableCell>
                    {isMobile ? (
                      <Box>{payment.paymentMethod}</Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Payment fontSize="small" color="action" />
                        {payment.paymentMethod}
                      </Box>
                    )}
                  </TableCell>
                  {!isMobile && (
                    <TableCell>{payment.domain}</TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isMobile ? 4 : 6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No payment history found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </StyledTable>
      </TableContainer>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="body2" color="textSecondary">
          Showing {filteredFeeCollectionData.length} of {collectionData.length} records
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            startIcon={<Print />} 
            variant="outlined"
            sx={{ borderRadius: '12px' }}
            onClick={handlePrint}
            size={isMobile ? 'small' : 'medium'}
          >
            Print
          </Button>
          <Button 
            startIcon={<Download />} 
            variant="contained"
            sx={{ borderRadius: '12px' }}
            onClick={handleExport}
            size={isMobile ? 'small' : 'medium'}
          >
            Export
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderPaymentDetails = () => (
    <Dialog 
      open={paymentDetailsOpen} 
      onClose={handlePaymentDetailsClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ 
        sx: { 
          borderRadius: isMobile ? 0 : '16px',
          background: theme.palette.background.paper
        } 
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'dark' ? '#1e3c72' : '#e0f7fa',
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pr: 1
        }}>
          <Typography variant={isMobile ? 'h6' : 'h6'} sx={{ fontWeight: 700 }}>
            {activeView === 'due' ? 'Fee Payment Details' : 'Payment Receipt'}
          </Typography>
          <IconButton onClick={handlePaymentDetailsClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ py: 3 }}>
        {selectedPayment && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                mb: 2
              }}>
                <Avatar sx={{ 
                  bgcolor: activeView === 'due' ? 'error.light' : 'success.light',
                  color: activeView === 'due' ? 'error.dark' : 'success.dark',
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48
                }}>
                  {activeView === 'due' ? <AttachMoney fontSize={isMobile ? 'medium' : 'large'} /> : <Receipt fontSize={isMobile ? 'medium' : 'large'} />}
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontWeight: 600 }}>
                    {selectedPayment.name || 'Intern Fee'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {activeView === 'due' ? 'Pending Payment' : 'Payment Receipt'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Employee ID
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                {selectedPayment.id}
              </Typography>
            </Grid>

            {activeView === 'due' ? (
              <>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Amount
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(selectedPayment.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Amount Paid
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(selectedPayment.paid)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Balance Due
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {formatCurrency(selectedPayment.amount - selectedPayment.paid)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatDate(selectedPayment.dueDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Domain
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedPayment.domain}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <StatusChip
                    label={selectedPayment.status === 'overdue' ? 'Overdue' : selectedPayment.status === 'paid' ? 'Paid' : 'Pending'}
                    status={selectedPayment.status}
                    size={isMobile ? 'small' : 'medium'}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant={isMobile ? 'subtitle1' : 'subtitle1'} sx={{ fontWeight: 600, mb: 2 }}>
                    Make Payment
                  </Typography>
                  <TextField
                    fullWidth
                    label="Payment Amount"
                    variant="outlined"
                    type="number"
                    value={paymentAmount}
                    onChange={handlePaymentAmountChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <Typography sx={{ mr: 1 }}>₹</Typography>
                      ),
                    }}
                    size={isMobile ? 'small' : 'medium'}
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={paymentMethod}
                      label="Payment Method"
                      onChange={handlePaymentMethodChange}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      <MenuItem value="ONLINE">Online</MenuItem>
                      <MenuItem value="CASH">Cash</MenuItem>
                      <MenuItem value="CHEQUE">Cheque</MenuItem>
                      <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                      <MenuItem value="UPI">UPI</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleMakePayment}
                    disabled={!paymentAmount || isNaN(paymentAmount) || Number(paymentAmount) <= 0}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    Record Payment
                  </Button>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Receipt No.
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedPayment.receiptNo}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Amount Paid
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatCurrency(selectedPayment.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Payment Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatDate(selectedPayment.date)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedPayment.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Domain
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedPayment.domain}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <StatusChip
                    label="Paid"
                    status="paid"
                    icon={<CheckCircle fontSize="small" />}
                    size={isMobile ? 'small' : 'medium'}
                  />
                </Grid>
              </>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ 
        p: 3, 
        borderTop: `1px solid ${theme.palette.divider}`,
        justifyContent: 'space-between'
      }}>
        <Typography variant="caption" color="textSecondary">
          {activeView === 'due' ? 'Payments will be recorded in the system' : 'Updated manually by admin staff'}
        </Typography>
        <Button
          variant="contained"
          onClick={handlePaymentDetailsClose}
          sx={{ 
            borderRadius: '12px',
            px: 3,
            py: 1,
            fontWeight: 600
          }}
          size={isMobile ? 'small' : 'medium'}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderFilterDialog = () => (
    <Dialog 
      open={filterDialogOpen} 
      onClose={handleFilterClose} 
      maxWidth="xs" 
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ 
        sx: { 
          borderRadius: isMobile ? 0 : '16px',
          background: theme.palette.background.paper
        } 
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'dark' ? '#1e3c72' : '#e0f7fa',
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pr: 1
        }}>
          <Typography variant={isMobile ? 'h6' : 'h6'} sx={{ fontWeight: 700 }}>
            Filter by Status
          </Typography>
          <IconButton onClick={handleFilterClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant={filters.status === 'all' ? 'contained' : 'outlined'}
            onClick={() => handleFilterChange('status', 'all')}
            sx={{ 
              borderRadius: '12px',
              justifyContent: 'flex-start',
              px: 3,
              py: isMobile ? 1 : 1.5,
              fontWeight: 600
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Show All
          </Button>
          <Button
            fullWidth
            variant={filters.status === 'pending' ? 'contained' : 'outlined'}
            color="warning"
            onClick={() => handleFilterChange('status', 'pending')}
            sx={{ 
              borderRadius: '12px',
              justifyContent: 'flex-start',
              px: 3,
              py: isMobile ? 1 : 1.5,
              fontWeight: 600
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Pending Fees
          </Button>
          <Button
            fullWidth
            variant={filters.status === 'overdue' ? 'contained' : 'outlined'}
            color="error"
            onClick={() => handleFilterChange('status', 'overdue')}
            sx={{ 
              borderRadius: '12px',
              justifyContent: 'flex-start',
              px: 3,
              py: isMobile ? 1 : 1.5,
              fontWeight: 600
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Overdue Fees
          </Button>
          <Button
            fullWidth
            variant={filters.status === 'paid' ? 'contained' : 'outlined'}
            color="success"
            onClick={() => handleFilterChange('status', 'paid')}
            sx={{ 
              borderRadius: '12px',
              justifyContent: 'flex-start',
              px: 3,
              py: isMobile ? 1 : 1.5,
              fontWeight: 600
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Paid Fees
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: 3, 
        borderTop: `1px solid ${theme.palette.divider}`,
        justifyContent: 'flex-end'
      }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFilterClose}
          sx={{ 
            borderRadius: '12px',
            px: 3,
            py: 1,
            fontWeight: 600
          }}
          size={isMobile ? 'small' : 'medium'}
        >
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        flexDirection: 'column',
        p: 3
      }}>
        <Typography color="error" variant="h6" gutterBottom>
          Error loading data
        </Typography>
        <Typography sx={{ mb: 2 }}>{error}</Typography>
        <Button 
          onClick={() => window.location.reload()} 
          variant="contained" 
          startIcon={<ArrowBack />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: isMobile ? 1 : isTablet ? 2 : 4,
      maxWidth: '1400px',
      margin: '0 auto',
      minHeight: '100vh'
    }}>
      <Typography 
        variant={isMobile ? 'h4' : 'h3'} 
        gutterBottom 
        sx={{ 
          mb: 4, 
          fontWeight: 800,
          textAlign: 'center',
          color: 'primary.main',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontSize: isMobile ? '1.8rem' : '2.4rem'
        }}
      >
        Intern Fee Portal
      </Typography>
      
      {activeView === 'due'
        ? renderFeeDueList()
        : activeView === 'collection'
        ? renderFeeCollectionTable()
        : renderDashboard()}

      {renderPaymentDetails()}
      {renderFilterDialog()}
    </Box>
  );
};

export default PaymentStatusPage;