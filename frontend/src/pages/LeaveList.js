import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    useMediaQuery,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Avatar,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    Button,
    Tooltip,
    Badge,
    Grid,
    InputAdornment,
    Paper
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
    CheckCircle as ApprovedIcon,
    Cancel as RejectedIcon,
    Schedule as PendingIcon,
    TrendingUp as TrendsIcon,
    MoreVert as MoreVertIcon,
    FileDownload as FileDownloadIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { saveAs } from 'file-saver'; 
import dayjs from 'dayjs';
import axios from 'axios';

const StatusChip = ({ status }) => (
    <Chip
        label={status}
        size="small"
        variant="outlined"
        color={
            status === 'APPROVED' ? 'success' :
                status === 'REJECTED' ? 'error' : 'warning'
        }
        sx={{ fontWeight: 500 }}
    />
);

const LeaveTrendCard = ({ title, value, trend, color }) => (
    <Card sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        height: '100%',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px 0 rgba(0,0,0,0.12)'
        }
    }}>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
        </Box>
    </Card>
);

const LeaveList = ({ userRole = 'staff' }) => {
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState({
        approved: 0,
        pending: 0,
        rejected: 0,
        used: 0,
        remaining: 0
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const isMobile = useMediaQuery('(max-width:600px)');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaveData();
    }, []);

    const fetchLeaveData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Token not found");
            return;
        }
    
        try {
            const response = await axios.get('http://localhost:8000/Sims/attendances/leave_history/', {
                headers: {
                    Authorization: `Token ${token}`
                }
            });

            const formattedLeaves = response.data.map(leave => ({
                id: leave.id,
                emp_id: leave.user,
                internName: leave.user_name || leave.user, // Use user_name if available
                type: leave.leave_type,
                startDate: dayjs(leave.from_date).toDate(),
                endDate: dayjs(leave.to_date).toDate(),
                days: leave.number_of_days,
                status: leave.status,
                reason: leave.request_reason,
                avatar: getInitials(leave.user_name || leave.user),
                remainingLeaves: leave.remaining_leave_count,
                reportingManager: leave.reporting_manager_username
            }));
    
            setLeaves(formattedLeaves);
            updateStats(formattedLeaves);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching leave data:", error);
            setError("Failed to fetch leave data");
            setLoading(false);
        }
    };

    const updateStats = (leaves) => {
        const approvedLeaves = leaves.filter(l => l.status === 'APPROVED');
        setStats({
            approved: approvedLeaves.length,
            pending: leaves.filter(l => l.status === 'PENDING').length,
            rejected: leaves.filter(l => l.status === 'REJECTED').length,
            used: approvedLeaves.reduce((sum, leave) => sum + leave.days, 0),
            remaining: 15 - approvedLeaves.reduce((sum, leave) => sum + leave.days, 0)
        });
    };

    const handleMenuClick = (event, leave) => {
        setAnchorEl(event.currentTarget);
        setSelectedLeave(leave);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedLeave(null);
    };

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };
      
    const handleStatusChange = async (newStatus) => {
        if (!selectedLeave) return;
      
        setLoading(true);
        const token = localStorage.getItem('token');
      
        try {
            await axios.patch(
                `http://localhost:8000/Sims/attendances/leave_approval/${selectedLeave.id}/`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                }
            );
            
            // Optimistically update the UI
            const updatedLeaves = leaves.map(leave => 
                leave.id === selectedLeave.id ? { ...leave, status: newStatus } : leave
            );
            
            setLeaves(updatedLeaves);
            updateStats(updatedLeaves);
        } catch (error) {
            console.error("Error updating leave status:", error);
            setError("Failed to update leave status. You may not have permission.");
        } finally {
            setLoading(false);
            handleMenuClose();
        }
    };
      
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setFilterType("");
        setStatusFilter("all");
        setPage(0);
    };

    const handleExportCSV = () => {
        const headers = [
            'Intern ID',
            'Intern Name',
            'Leave Type',
            'Start Date',
            'End Date',
            'Duration',
            'Status',
            'Reason',
            'Remaining Leaves',
            'Reporting Manager'
        ];

        const csvData = filteredLeaves.map(leave => ({
            'Intern ID': leave.emp_id,
            'Intern Name': leave.internName,
            'Leave Type': leave.type,
            'Start Date': formatDate(leave.startDate),
            'End Date': formatDate(leave.endDate),
            'Duration': `${leave.days} day${leave.days > 1 ? 's' : ''}`,
            'Status': leave.status,
            'Reason': leave.reason,
            'Remaining Leaves': leave.remainingLeaves,
            'Reporting Manager': leave.reportingManager
        }));

        let csv = headers.join(',') + '\n';
        csvData.forEach(row => {
            csv += Object.values(row).map(value => `"${value}"`).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `leave_records_${new Date().toISOString().slice(0, 10)}.csv`);
    };

    const filteredLeaves = leaves.filter(leave => {
        const matchesSearch = leave.internName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            leave.emp_id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType ? leave.type === filterType : true;
        const matchesStatus = statusFilter === "all" ? true : 
                            statusFilter === "Approved" ? leave.status === "APPROVED" :
                            statusFilter === "Pending" ? leave.status === "PENDING" :
                            leave.status === "REJECTED";

        return matchesSearch && matchesType && matchesStatus;
    });

    const formatDate = (date) => {
        return dayjs(date).format('DD/MM/YYYY');
    };

    const stringToColor = (string) => {
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
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(part => part[0]).join('').toUpperCase();
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography>Loading leave data...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography color="error">{error}</Typography>
                <Button onClick={fetchLeaveData} sx={{ ml: 2 }}>Retry</Button>
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                    {userRole === 'staff' ? 'Intern Leave Management' : 'My Leave Requests'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {userRole === 'staff' ? 'Review and manage intern leave requests' : 'Track your leave applications'}
                </Typography>
            </Box>

            {userRole === 'staff' && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <LeaveTrendCard
                            title="Approved Leaves"
                            value={stats.approved}
                            color="rgba(76, 175, 80, 0.1)"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <LeaveTrendCard
                            title="Pending Requests"
                            value={stats.pending}
                            color="rgba(255, 152, 0, 0.1)"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <LeaveTrendCard
                            title="Rejected Requests"
                            value={stats.rejected}
                            color="rgba(244, 67, 54, 0.1)"
                        />
                    </Grid>
                </Grid>
            )}

            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)' }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            Leave Records
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={handleResetFilters}
                                disabled={loading}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<FileDownloadIcon />}
                                onClick={handleExportCSV}
                                disabled={loading || leaves.length === 0}
                            >
                                Export CSV
                            </Button>
                        </Box>
                    </Box>

                    <Box mb={3}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search interns..."
                                    size="small"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small" disabled={loading}>
                                    <InputLabel>Leave Type</InputLabel>
                                    <Select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        label="Leave Type"
                                    >
                                        <MenuItem value="">All Types</MenuItem>
                                        <MenuItem value="PERSONAL">Personal</MenuItem>
                                        <MenuItem value="CASUAL">Casual</MenuItem>
                                        <MenuItem value="SICK">Sick</MenuItem>
                                        <MenuItem value="EMERGENCY">Emergency</MenuItem>
                                        <MenuItem value="VACATION">Vacation</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small" disabled={loading}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        label="Status"
                                    >
                                        <MenuItem value="all">All Statuses</MenuItem>
                                        <MenuItem value="Approved">Approved</MenuItem>
                                        <MenuItem value="Pending">Pending</MenuItem>
                                        <MenuItem value="Rejected">Rejected</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 500 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.default' }}>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Intern</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Leave Type</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Dates</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Duration</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Reason</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Remaining</TableCell>
                                    {userRole === 'staff' && <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Actions</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLeaves.length > 0 ? (
                                    filteredLeaves.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((leave) => (
                                        <TableRow key={leave.id} hover>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <Avatar
                                                        sx={{
                                                            width: 32,
                                                            height: 32,
                                                            mr: 2,
                                                            backgroundColor: stringToColor(leave.internName),
                                                            color: 'white',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {leave.avatar}
                                                    </Avatar>
                                                    <Typography variant="subtitle2">{leave.internName}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{leave.emp_id}</TableCell>
                                            <TableCell>{leave.type}</TableCell>
                                            <TableCell>
                                                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                                            </TableCell>
                                            <TableCell>{leave.days} day{leave.days > 1 ? 's' : ''}</TableCell>
                                            <TableCell>
                                                <Tooltip title={leave.reason}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 1,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}
                                                    >
                                                        {leave.reason}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip status={leave.status} />
                                            </TableCell>
                                            <TableCell>
                                                {leave.remainingLeaves}
                                            </TableCell>
                                            {userRole === 'staff' && (
                                                <TableCell>
                                                    <IconButton
                                                        onClick={(e) => handleMenuClick(e, leave)}
                                                        size="small"
                                                        disabled={loading}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={userRole === 'staff' ? 9 : 8} align="center">
                                            <Typography variant="body2" color="textSecondary" py={3}>
                                                No leave records found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredLeaves.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                            borderTop: '1px solid rgba(224, 224, 224, 1)'
                        }}
                        disabled={loading}
                    />
                </CardContent>
            </Card>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 1,
                    sx: {
                        minWidth: 180,
                        borderRadius: 1
                    }
                }}
            >
                <MenuItem 
                    onClick={() => handleStatusChange('APPROVED')}
                    disabled={selectedLeave?.status === 'APPROVED' || loading}
                >
                    <ListItemIcon>
                        <ApprovedIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    Approve
                </MenuItem>
                <MenuItem 
                    onClick={() => handleStatusChange('REJECTED')}
                    disabled={selectedLeave?.status === 'REJECTED' || loading}
                >
                    <ListItemIcon>
                        <RejectedIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    Reject
                </MenuItem>
                <MenuItem 
                    onClick={() => handleStatusChange('PENDING')}
                    disabled={selectedLeave?.status === 'PENDING' || loading}
                >
                    <ListItemIcon>
                        <PendingIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    Set Pending
                </MenuItem>
            </Menu>
        </LocalizationProvider>
    );
};

export default LeaveList;