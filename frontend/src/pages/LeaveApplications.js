import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    Divider,
    IconButton,
    Menu,
    ListItemIcon,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const theme = createTheme({
    palette: {
        primary: {
            main: '#64b5f6',
        },
        secondary: {
            main: '#81c784',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h4: {
            fontWeight: 600,
            color: '#333',
            textAlign: 'center'
        },
        h6: {
            fontWeight: 500,
            color: '#4a4a4a',
        },
        body1: {
            fontSize: '1rem',
            color: '#666',
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '25px',
                    padding: '8px 24px',
                    minWidth: '80px',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                    },
                },
            },
        },
    },
});

// Dummy data for leave status
const dummyLeaveStatus = [
    {
        id: 1,
        leaveType: "Casual",
        startDate: dayjs("2023-05-10"),
        endDate: dayjs("2023-05-12"),
        leaveDuration: 3,
        status: "APPROVED",
        reason: "Family function",
        appliedDate: dayjs("2023-05-01"),
        remainingBalance: 12
    },
    {
        id: 2,
        leaveType: "Sick",
        startDate: dayjs("2023-06-15"),
        endDate: dayjs("2023-06-15"),
        leaveDuration: 1,
        status: "APPROVED",
        reason: "Doctor appointment",
        appliedDate: dayjs("2023-06-10"),
        remainingBalance: 11
    },
    {
        id: 3,
        leaveType: "Personal",
        startDate: dayjs("2023-07-20"),
        endDate: dayjs("2023-07-21"),
        leaveDuration: 2,
        status: "PENDING",
        reason: "Personal work",
        appliedDate: dayjs("2023-07-15"),
        remainingBalance: 11
    },
    {
        id: 4,
        leaveType: "Vacation",
        startDate: dayjs("2023-08-05"),
        endDate: dayjs("2023-08-10"),
        leaveDuration: 6,
        status: "REJECTED",
        reason: "Family vacation",
        appliedDate: dayjs("2023-07-25"),
        remainingBalance: 11
    },
    {
        id: 5,
        leaveType: "Emergency",
        startDate: dayjs("2023-09-01"),
        endDate: dayjs("2023-09-01"),
        leaveDuration: 1,
        status: "PENDING",
        reason: "Emergency at home",
        appliedDate: dayjs("2023-08-30"),
        remainingBalance: 11
    }
];

// Dummy leave balance data
const dummyLeaveBalance = {
    used: 5,
    remaining: 15,
    total: 20,
    leaves_taken: 3
};

const LeaveApplicationStatus = () => {
    const [leaveStatusList, setLeaveStatusList] = useState([]);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [editData, setEditData] = useState({
        from_date: null,
        to_date: null,
        leave_type: '',
        reason: '',
        status: ''
    });
    const [leaveBalance, setLeaveBalance] = useState({
        used: 0,
        remaining: 0,
        total: 0
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        // Using dummy data instead of API calls
        setLeaveStatusList(dummyLeaveStatus);
        setLeaveBalance(dummyLeaveBalance);
    }, []);

    const formatDate = (date) => {
        return dayjs(date).format('DD/MM/YYYY');
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED':
                return {
                    backgroundColor: '#C8E6C9',
                    color: '#1B5E20',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    display: 'inline-block',
                };
            case 'PENDING':
                return {
                    backgroundColor: '#FFCC80',
                    color: '#E65100',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    display: 'inline-block',
                };
            case 'REJECTED':
                return {
                    backgroundColor: '#FFCDD2',
                    color: '#B71C1C',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    display: 'inline-block',
                };
            default:
                return {};
        }
    };

    const handleMenuClick = (event, row) => {
        setAnchorEl(event.currentTarget);
        setSelectedRow(row);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const handleEditClick = () => {
        if (selectedRow) {
            setSelectedLeave(selectedRow);
            setEditData({
                from_date: selectedRow.startDate,
                to_date: selectedRow.endDate,
                leave_type: selectedRow.leaveType,
                reason: selectedRow.reason,
                status: selectedRow.status
            });
            setOpenEditDialog(true);
        }
        handleMenuClose();
    };

    const handleViewDetails = () => {
        if (selectedRow) {
            setSelectedLeave(selectedRow);
            setOpenDetailsDialog(true);
        }
        handleMenuClose();
    };

    const handleEditSubmit = () => {
        if (selectedLeave) {
            const duration = dayjs(editData.to_date).diff(dayjs(editData.from_date), 'day') + 1;
            const updatedList = leaveStatusList.map(item =>
                item.id === selectedLeave.id ? {
                    ...item,
                    leaveType: editData.leave_type,
                    startDate: editData.from_date,
                    endDate: editData.to_date,
                    reason: editData.reason,
                    status: editData.status,
                    leaveDuration: duration
                } : item
            );
            setLeaveStatusList(updatedList);
            setOpenEditDialog(false);
        }
    };

    const handleEditChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Container maxWidth="lg" sx={{ padding: 3 }}>
                    <Typography variant="h5" align="center" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
                        Leave Application Status
                    </Typography>
                    <Divider sx={{ marginBottom: 2 }} />

                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#4a4a4a', fontWeight: '500' }}>
                                        Application Status
                                    </Typography>
                                    <TableContainer component={Paper}>
                                        <Table sx={{ minWidth: 650 }} aria-label="leave status table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F0F4F8' }}>Request ID</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F0F4F8' }}>Applied Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F0F4F8' }}>No of Days</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F0F4F8' }}>From - To</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F0F4F8' }}>Leave Type</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F0F4F8' }}>Remaining Balance</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F0F4F8' }}>Status</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F0F4F8' }}>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>

                                            <TableBody>
                                                {leaveStatusList.map((row) => (
                                                    <TableRow key={row.id}>
                                                        <TableCell>{row.id}</TableCell>
                                                        <TableCell>{formatDate(row.appliedDate)}</TableCell>
                                                        <TableCell>{row.leaveDuration}</TableCell>
                                                        <TableCell>{formatDate(row.startDate)} - {formatDate(row.endDate)}</TableCell>
                                                        <TableCell>{row.leaveType}</TableCell>
                                                        <TableCell>{row.remainingBalance || leaveBalance.remaining} days</TableCell>
                                                        <TableCell>
                                                            <span style={getStatusStyle(row.status)}>
                                                                {row.status}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                aria-label="more"
                                                                aria-controls={`menu-${row.id}`}
                                                                aria-haspopup="true"
                                                                onClick={(e) => handleMenuClick(e, row)}
                                                            >
                                                                <MoreVertIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Actions Menu */}
                    <Menu
                        id="actions-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            style: {
                                width: '20ch',
                            },
                        }}
                    >
                        <MenuItem onClick={handleViewDetails}>
                            <ListItemIcon>
                                <InfoIcon fontSize="small" />
                            </ListItemIcon>
                            View Details
                        </MenuItem>
                        <MenuItem onClick={handleEditClick}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            Edit
                        </MenuItem>
                    </Menu>

                    {/* Edit Dialog */}
                    <Dialog
                        open={openEditDialog}
                        onClose={() => setOpenEditDialog(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>Edit Leave Request</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Leave Type"
                                        fullWidth
                                        value={editData.leave_type}
                                        onChange={(e) => handleEditChange('leave_type', e.target.value)}
                                    >
                                        <MenuItem value="Personal">Personal</MenuItem>
                                        <MenuItem value="Casual">Casual</MenuItem>
                                        <MenuItem value="Sick">Sick</MenuItem>
                                        <MenuItem value="Emergency">Emergency</MenuItem>
                                        <MenuItem value="Vacation">Vacation</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <DatePicker
                                        label="Start Date"
                                        value={editData.from_date}
                                        onChange={(date) => handleEditChange('from_date', date)}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <DatePicker
                                        label="End Date"
                                        value={editData.to_date}
                                        onChange={(date) => handleEditChange('to_date', date)}
                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={editData.status}
                                            label="Status"
                                            onChange={(e) => handleEditChange('status', e.target.value)}
                                        >
                                            <MenuItem value="PENDING">Pending</MenuItem>
                                            <MenuItem value="APPROVED">Approved</MenuItem>
                                            <MenuItem value="REJECTED">Rejected</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Reason"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={editData.reason}
                                        onChange={(e) => handleEditChange('reason', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                            <Button onClick={handleEditSubmit} variant="contained" color="primary">
                                Save Changes
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Details Dialog */}
                    <Dialog
                        open={openDetailsDialog}
                        onClose={() => setOpenDetailsDialog(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle>Leave Request Details</DialogTitle>
                        <DialogContent>
                            {selectedLeave && (
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                            <strong>Request ID:</strong> {selectedLeave.id}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                            <strong>Applied Date:</strong> {formatDate(selectedLeave.appliedDate)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                            <strong>Leave Type:</strong> {selectedLeave.leaveType}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                            <strong>Duration:</strong> {selectedLeave.leaveDuration} days
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                            <strong>From:</strong> {formatDate(selectedLeave.startDate)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                            <strong>To:</strong> {formatDate(selectedLeave.endDate)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                            <strong>Remaining Balance:</strong> {selectedLeave.remainingBalance || leaveBalance.remaining} days
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                            <strong>Status:</strong> <span style={getStatusStyle(selectedLeave.status)}>
                                                {selectedLeave.status}
                                            </span>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">
                                            <strong>Reason:</strong> {selectedLeave.reason || 'Not specified'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </LocalizationProvider>
        </ThemeProvider>
    );
};

export default LeaveApplicationStatus;