// File: src/LeaveManagement.js
// Description: This file contains the LeaveManagement component which handles leave requests, history, and status of the intern in intern dashboard(Dash.js).

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Popover,
    Button,
    Container,
    TextField,
    Typography,
    MenuItem,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Menu,
    ListItemIcon,
    InputAdornment,
    useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { CssBaseline } from '@mui/material';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import { PieChart } from 'react-minimal-pie-chart';
import FormControlLabel from '@mui/material/FormControlLabel';
import CheckIcon from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';
import axios from "axios";

const RedDeleteIcon = styled(DeleteIcon)(({ theme }) => ({
    color: 'red',
}));

const StyledMoreVertIcon = styled(MoreVertIcon)(({ theme }) => ({
    color: '#777',
}));

const StyledCard = styled(Card)(({ theme }) => ({
    boxShadow: theme.shadows[3],
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(3),
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.02)',
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    margin: theme.spacing(1),
    textTransform: 'none',
    borderRadius: '25px',
    padding: theme.spacing(1, 3),
    transition: 'all 0.3s ease',
}));

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
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
    },
});

const LeaveManagement = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedLeaveIndex, setSelectedLeaveIndex] = useState(null);
    const [leaveType, setLeaveType] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [reason, setReason] = useState('');
    const [startLeaveDuration, setStartLeaveDuration] = useState('Full Day');
    const [endLeaveDuration, setEndLeaveDuration] = useState('Full Day');
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const maxLeaveBalance = 40;
    const [leaveRequestType, setLeaveRequestType] = useState('days');
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [leaveCounter, setLeaveCounter] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState('idle');
    const [leaveData, setLeaveData] = useState({
        emp_id: "",
        from_date: "",
        to_date: "",
        reason: ""
    });

    const handleChange = (e) => {
        setLeaveData({ ...leaveData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Token not found");
            return;
        }
    
        axios.get("http://localhost:8000/Sims/attendances/leave_history/", {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then(res => {
            const formattedHistory = res.data.map((item, index) => {
                return {
                  id: item.id || index + 1,
                  leaveType: item.leave_type?.charAt(0).toUpperCase() + item.leave_type?.slice(1).toLowerCase() || "Unknown",
                  startDate: dayjs(item.from_date),
                  endDate: dayjs(item.to_date),
                  status: item.status || "unknown",
                  reason: item.request_reason || "Not provided",
                  leaveRequestType: item.half_day_start || item.half_day_end ? "half-day" : "days",
                  leaveDuration: item.number_of_days || 1,
                  appliedDate: dayjs(item.created_at)
                };
              });
              

    
            setLeaveHistory(formattedHistory);
        })
        .catch(err => {
            console.error("Error fetching leave history:", err);
        });
    }, []);
// ---------------------------------------------    
    const formatDate = (date) => {
        return dayjs(date).format('DD/MM/YYYY');
    };

    const formatTime = (time) => {
        return dayjs(time).format('HH:mm');
    };

    const handleMenuClick = (event, index) => {
        setAnchorEl(event.currentTarget);
        setSelectedLeaveIndex(index);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedLeaveIndex(null);
    };

    const handleEditLeave = (index) => {
        console.log('Edit leave at index:', index);
        handleMenuClose();
    };

    const handleDeleteLeaveAction = (index) => {
        handleDeleteConfirmation(index);
        handleMenuClose();
    };

    const calculateDuration = () => {
        let duration = 0;
        if (leaveRequestType === 'days') {
            if (startDate && endDate) {
                let diff = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
                if (startLeaveDuration === 'Half Day') diff -= 0.5;
                if (endLeaveDuration === 'Half Day' && dayjs(endDate).isAfter(startDate, 'day')) diff -= 0.5;
                duration = diff;
            }
        } else {
            if (startTime && endTime) {
                duration = dayjs(endTime).diff(dayjs(startTime), 'hour', true);
            }
        }
        return duration;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem("token");
    
        if (!token) {
            alert("Authentication token is missing! Please log in.");
            return;
        }
    
        const leaveData = {
            leave_type: leaveType.toUpperCase(),
            from_date: startDate ? startDate.toISOString().split("T")[0] : null,
            to_date: endDate ? endDate.toISOString().split("T")[0] : null,
            half_day_start: startLeaveDuration === "Half Day",
            half_day_end: endLeaveDuration === "Half Day",
            request_reason: reason,
        };
    
        try {
            const response = await fetch("http://localhost:8000/Sims/attendances/leave_request/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify(leaveData),
            });
    
            const result = await response.json();
            if (response.ok) {
                alert("Leave request submitted successfully!");
            } else {
                alert(result.error || "Failed to submit leave request.");
            }
        } catch (error) {
            console.error("Error submitting leave request:", error);
        }
    };

    const handleDeleteConfirmation = (index) => {
        setDeleteIndex(index);
        setOpenDeleteDialog(true);
    };

    const handleDeleteLeave = () => {
        const updatedHistory = [...leaveHistory];
        updatedHistory.splice(deleteIndex, 1);
        setLeaveHistory(updatedHistory);
        setOpenDeleteDialog(false);
        setDeleteIndex(null);
        updateLeaveBalance(updatedHistory);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeleteIndex(null);
    };

    const handleViewLeaveDetails = (leave) => {
        setSelectedLeave(leave);
        setOpenDetailsDialog(true);
    };

    const handleCloseDetailsDialog = () => {
        setSelectedLeave(null);
        setOpenDetailsDialog(false);
    };

    const disablePastDates = (date) => {
        return date.isBefore(dayjs(), 'day');
    };

    const handleChangeTab = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const filteredLeaveHistory = leaveHistory.filter(leave => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            leave.leaveType.toLowerCase().includes(searchTermLower) ||
            formatDate(leave.startDate).includes(searchTermLower) ||
            formatDate(leave.endDate).includes(searchTermLower) ||
            leave.status.toLowerCase().includes(searchTermLower)
        );
    });

    const handleStartDurationChange = (duration) => {
        setStartLeaveDuration(duration);
    };

    const handleEndDurationChange = (duration) => {
        setEndLeaveDuration(duration);
    };

    const calculateLeaveBalance = useCallback((leaveList) => {
        let taken = leaveList.reduce((acc, leave) => {
            if (leave.status === 'Approved' || leave.status === 'Pending') {
                return acc + leave.leaveDuration;
            }
            return acc;
        }, 0);

        return {
            taken: taken,
            remaining: Math.max(0, maxLeaveBalance - taken),
        };
    }, [maxLeaveBalance]);

    const [leaveBalances, setLeaveBalances] = useState(calculateLeaveBalance(leaveHistory));

    const updateLeaveBalance = useCallback(
        (updatedHistory) => {
            setLeaveBalances(calculateLeaveBalance(updatedHistory));
        },
        [calculateLeaveBalance]
    );

    useEffect(() => {
        updateLeaveBalance(leaveHistory);
    }, [leaveHistory, updateLeaveBalance]);

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    }));

    const tableHeaderStyle = {
        backgroundColor: '#F0F4F8',
        fontWeight: 'bold',
    };

    const [leaveBalance, setLeaveBalance] = useState({
        used: 0,
        remaining: 0,
        total: 0,
        leaves_taken: 0
    });
    
    useEffect(() => {
        const token = localStorage.getItem('token');
    
        axios.get('http://localhost:8000/Sims/attendances/leave_balance/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then(res => {
            setLeaveBalance(res.data);
        })
        .catch(err => {
            console.error("Error fetching leave balance:", err);
        });
    }, []);
    
    const [leaveStatusList, setLeaveStatusList] = useState([]);
  
    useEffect(() => {
        const token = localStorage.getItem("token");
    
        if (!token) {
            console.error("Token missing!");
            return;
        }
    
        axios.get("http://localhost:8000/Sims/leave-status/", {
            headers: {
                Authorization: `Token ${token}`
            }
        })
        .then((res) => {
            const formattedData = res.data.map((item, index) => ({
                id: item.id || index + 1,
                leaveType: item.leave_type || "Leave",
                startDate: dayjs(item.from_date),
                endDate: dayjs(item.to_date),
                leaveDuration: item.number_of_days,
                status: item.status,
                appliedDate: dayjs(item.created_date),
                leaveRequestType: "days"
            }));
            setLeaveStatusList(formattedData);
        })
        .catch((err) => {
            console.error("Error fetching leave status:", err);
        });
    }, []);

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

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Container maxWidth="lg" sx={{ padding: 3 }}>
                    <Typography variant="h5" align="center" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
                        Leave Management
                    </Typography>
                    <Divider sx={{ marginBottom: 2 }} />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: 3,
                            flexDirection: isSmallScreen ? 'column' : 'row',
                            gap: isSmallScreen ? 3 : 0,
                        }}
                    >
                        <Box sx={{ width: isSmallScreen ? '100%' : '70%' }}>
                            <Box sx={{ width: '100%', marginBottom: 3 }}>
                                <Tabs value={selectedTab} onChange={handleChangeTab} aria-label="leave management tabs" centered>
                                    <Tab label="Leave Application" />
                                    <Tab label="Application Status" />
                                    <Tab label="History" />
                                </Tabs>
                            </Box>
                            {selectedTab === 0 && (
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={12}>
                                        <StyledCard >
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom sx={{ color: '#4a4a4a', fontWeight: '500' }}>
                                                    Leave Request Form
                                                </Typography>
                                                <form onSubmit={handleSubmit}>
                                                    <FormControl component="fieldset">
                                                        <FormLabel component="legend">Leave Request For</FormLabel>
                                                        <RadioGroup
                                                            row
                                                            aria-label="leaveRequestType"
                                                            name="leaveRequestType"
                                                            value={leaveRequestType}
                                                            onChange={(e) => setLeaveRequestType(e.target.value)}
                                                        >
                                                            <FormControlLabel value="days" control={<Radio />} label="Days" />
                                                            <FormControlLabel value="hours" control={<Radio />} label="Hours" />
                                                        </RadioGroup>
                                                    </FormControl>

                                                    {leaveRequestType === 'hours' && (
                                                        <Grid container spacing={2} alignItems="center">
                                                            <Grid item xs={12} md={6}>
                                                                <TextField
                                                                    select
                                                                    label="Leave Type"
                                                                    fullWidth
                                                                    margin="normal"
                                                                    value={leaveType}
                                                                    onChange={(e) => setLeaveType(e.target.value)}
                                                                    required
                                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
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
                                                                value={startDate}
                                                                onChange={(date) => setStartDate(date)}
                                                                shouldDisableDate={disablePastDates}
                                                                slots={{ textField: (params) => <TextField {...params} fullWidth margin="normal" required /> }}
                                                            />

                                                            </Grid>
                                                        </Grid>
                                                    )}

                                                    {leaveRequestType === 'days' ? (
                                                        <>
                                                            <Grid container spacing={2} alignItems="center">
                                                                <Grid item xs={12} md={12} marginBottom={"25px"}>
                                                                    <TextField
                                                                        select
                                                                        label="Leave Type"
                                                                        fullWidth
                                                                        margin="normal"
                                                                        value={leaveType}
                                                                        onChange={(e) => setLeaveType(e.target.value)}
                                                                        required
                                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                                                    >
                                                                        <MenuItem value="Personal">Personal</MenuItem>
                                                                        <MenuItem value="Casual">Casual</MenuItem>
                                                                        <MenuItem value="Sick">Sick</MenuItem>
                                                                        <MenuItem value="Emergency">Emergency</MenuItem>
                                                                        <MenuItem value="Vacation">Vacation</MenuItem>
                                                                    </TextField>
                                                                </Grid>
                                                            </Grid>

                                                            <Grid container spacing={2} alignItems="center">
                                                                <Grid item xs={4}>
                                                                    <DatePicker
                                                                        label="Start Date"
                                                                        value={startDate}
                                                                        onChange={(date) => setStartDate(date)}
                                                                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Button variant={startLeaveDuration === 'Full Day' ? 'contained' : 'outlined'} color="primary"
                                                                        onClick={() => setStartLeaveDuration('Full Day')}>
                                                                        Full Day
                                                                    </Button>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Button variant={startLeaveDuration === 'Half Day' ? 'contained' : 'outlined'} color="primary"
                                                                        onClick={() => setStartLeaveDuration('Half Day')}>
                                                                        Half Day
                                                                    </Button>
                                                                </Grid>
                                                            </Grid>

                                                            <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
                                                                <Grid item xs={4}>
                                                                    <DatePicker
                                                                        label="End Date"
                                                                        value={endDate}
                                                                        onChange={(date) => setEndDate(date)}
                                                                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Button variant={endLeaveDuration === 'Full Day' ? 'contained' : 'outlined'} color="primary"
                                                                        onClick={() => setEndLeaveDuration('Full Day')}>
                                                                        Full Day
                                                                    </Button>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Button variant={endLeaveDuration === 'Half Day' ? 'contained' : 'outlined'} color="primary"
                                                                        onClick={() => setEndLeaveDuration('Half Day')}>
                                                                        Half Day
                                                                    </Button>
                                                                </Grid>
                                                            </Grid>
                                                        </>
                                                    ) : (
                                                        <Grid container spacing={2} marginTop={1}>
                                                            <Grid item xs={4}>
                                                                <TimePicker
                                                                    label="Start Time"
                                                                    value={startTime}
                                                                    onChange={(time) => setStartTime(time)}
                                                                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={4}>
                                                                <TimePicker
                                                                    label="End Time"
                                                                    value={endTime}
                                                                    onChange={(time) => setEndTime(time)}
                                                                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    )}

                                                    <TextField
                                                        label="Reason"
                                                        fullWidth
                                                        margin="normal"
                                                        multiline
                                                        rows={4}
                                                        value={reason}
                                                        onChange={(e) => setReason(e.target.value)}
                                                        required
                                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                                                    />

                                                    <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>
                                                        {submissionStatus === "submitting" ? <CircularProgress size={24} color="inherit" /> :
                                                        submissionStatus === "success" ? <CheckIcon /> : "Submit"}
                                                    </Button>
                                                </form>
                                            </CardContent>
                                        </StyledCard>
                                    </Grid>
                                </Grid>
                            )}
                            {selectedTab === 1 && (
                                <Grid container spacing={4}>
                                    <Grid item xs={12}>
                                        <StyledCard>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom sx={{ color: '#4a4a4a', fontWeight: '500' }}>
                                                    Application Status
                                                </Typography>
                                                {/* <TextField
                                                    label="Type to filter..."
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <SearchIcon />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    variant="outlined"
                                                    fullWidth
                                                    margin="normal"
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                /> */}
                                                <TableContainer component={Paper}>
                                                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                        <TableHead>
                                                            
                                                            <TableRow>
                                                                <TableCell style={tableHeaderStyle}>Request ID</TableCell>
                                                                <TableCell style={tableHeaderStyle}>Applied Date</TableCell>
                                                                <TableCell style={tableHeaderStyle}>No of Days/Hours</TableCell>
                                                                <TableCell style={tableHeaderStyle}>From - To</TableCell>
                                                                <TableCell style={tableHeaderStyle}>Leave Type</TableCell>
                                                                <TableCell style={tableHeaderStyle}>Status</TableCell>
                                                            </TableRow>
                                                        </TableHead>

                                                        <TableBody>
                                                            {leaveStatusList.map((row) => (
                                                                <TableRow key={row.id}>
                                                                    <TableCell>{row.id}</TableCell>
                                                                    <TableCell>{formatDate(row.appliedDate)}</TableCell>
                                                                    <TableCell>{row.leaveDuration}</TableCell>
                                                                    <TableCell>{formatDate(row.startDate)}- {formatDate(row.endDate)}</TableCell>
                                                                    <TableCell>{row.leaveType}</TableCell>
                                                                    
                                                                    
                                                                    <TableCell> <span style={getStatusStyle(row.status)}> {row.status} </span></TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>

                                                    </Table>
                                                </TableContainer>
                                            </CardContent>
                                        </StyledCard>
                                    </Grid>
                                </Grid>
                            )}
                            {selectedTab === 2 && (
                                <Grid container spacing={4}>
                                    <Grid item xs={12}>
                                        <StyledCard>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom sx={{ color: '#4a4a4a', fontWeight: '500' }}>
                                                    Leave History
                                                </Typography>
                                                <Divider sx={{ mb: 2 }} />
                                                {leaveHistory.length > 0 ? (
                                                    <List>
                                                        {leaveHistory.map((leave, index) => (
                                                            <ListItem
                                                                key={index}
                                                                divider={index !== leaveHistory.length - 1}
                                                                secondaryAction={
                                                                    <Box>
                                                                        <IconButton
                                                                            aria-label="more"
                                                                            aria-controls={`leave-menu-${index}`}
                                                                            aria-haspopup="true"
                                                                            onClick={(event) => handleMenuClick(event, index)}
                                                                        >
                                                                            <StyledMoreVertIcon />
                                                                        </IconButton>
                                                                        <Menu
                                                                            id={`leave-menu-${index}`}
                                                                            anchorEl={anchorEl}
                                                                            open={Boolean(anchorEl) && selectedLeaveIndex === index}
                                                                            onClose={handleMenuClose}
                                                                            MenuListProps={{
                                                                                'aria-labelledby': 'basic-button',
                                                                            }}
                                                                            PaperProps={{
                                                                                style: {
                                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                                                    borderRadius: '12px',
                                                                                },
                                                                            }}
                                                                        >
                                                                            <MenuItem onClick={() => handleViewLeaveDetails(leave)}>
                                                                                <ListItemIcon>
                                                                                    <InfoIcon />
                                                                                </ListItemIcon>
                                                                                View Details
                                                                            </MenuItem>
                                                                            {/* <MenuItem onClick={() => handleDeleteLeaveAction(index)}>
                                                                                <ListItemIcon>
                                                                                    <RedDeleteIcon />
                                                                                </ListItemIcon>
                                                                                <ListItemText sx={{ color: 'red' }}>Delete</ListItemText>
                                                                            </MenuItem> */}
                                                                        </Menu>
                                                                    </Box>
                                                                }
                                                            >
                                                                <ListItemText
                                                                    primary={leave.leaveType}
                                                                    secondary={`${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                ) : (
                                                    <Typography variant="body2" sx={{ color: '#777' }}>No leave history available.</Typography>
                                                )}
                                            </CardContent>
                                        </StyledCard>
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                        <Box sx={{ width: isSmallScreen ? '100%' : '25%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Card sx={{ width: '100%',marginTop: '70px'}}>
                                <CardContent>
                                    <Typography variant="h6" align="center" gutterBottom>
                                        Leave Balance
                                    </Typography>
                                    <Box sx={{ width: '100%', maxWidth: 200, margin: '0 auto' }}>
                                        <PieChart
                                            data={[
                                                { title: 'Used', value: leaveBalance.used, color: '#e0e0e0' },
                                                { title: 'Remaining', value: leaveBalance.remaining, color: '#01579b' },
                                            ]}
                                            totalValue={maxLeaveBalance}
                                            lineWidth={20}
                                            startAngle={270}
                                            label={() => `${leaveBalance.used}/${leaveBalance.total} Used`}
                                            labelStyle={{
                                                fontSize: '10px',
                                                fontFamily: 'sans-serif',
                                                fill: '#333',
                                            }}
                                            labelPosition={0}
                                            background="#f0f0f0"
                                            paddingAngle={0}
                                            rounded
                                        />
                                    </Box>
                                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                                        Remaining: {leaveBalance.remaining} days
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                </Container>
            </LocalizationProvider>
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this leave request?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteLeave} color="primary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openDetailsDialog}
                onClose={handleCloseDetailsDialog}
                aria-labelledby="leave-details-dialog-title"
                PaperProps={{
                    style: {
                        height: '520px',
                        width: '400px',
                        maxWidth: '90%',
                    },
                }}
            >
                <DialogTitle id="leave-details-dialog-title">Leave Details</DialogTitle>
                <DialogContent>
                    {selectedLeave && (
                        <List>
                            <ListItem>
                                <ListItemText primary="Leave Type" secondary={selectedLeave.leaveType} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Start Date" secondary={formatDate(selectedLeave.startDate)} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="End Date" secondary={formatDate(selectedLeave.endDate)} />
                            </ListItem>
                            {selectedLeave.leaveRequestType === 'hours' && (
                                <>
                                    <ListItem>
                                        <ListItemText primary="Start Time" secondary={formatTime(selectedLeave.startTime)} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="End Time" secondary={formatTime(selectedLeave.endTime)} />
                                    </ListItem>
                                </>
                            )}
                            <ListItem>
                                <ListItemText primary="Duration" secondary={`${selectedLeave.leaveDuration} ${selectedLeave.leaveRequestType === 'days' ? 'days' : 'hours'}`} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary="Status" secondary={selectedLeave.status} />
                            </ListItem>
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailsDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    ); 
}; 

export default LeaveManagement;