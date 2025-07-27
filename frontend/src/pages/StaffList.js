import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    Stack,
    Pagination,
    PaginationItem,
    InputAdornment,
    FormControl,
    Select,
    InputLabel,
    Button,
    styled,
    keyframes
} from '@mui/material';
import {
    Edit as EditIcon,
    Search as SearchIcon,
    PersonAdd as PersonAddIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import StaffRegistrationForm from '../components/StaffRegistrationForm';
import axios from 'axios';
import StaffCreationForm from "../components/StaffCreationForm";
import { useColorMode } from '../index';
import { useTheme } from '@mui/material/styles';


const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const ShimmerRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    padding: '12px 16px',
  },
}));

const ShimmerCell = styled(Box)(({ theme }) => ({
    height: '24px',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(90deg, #333 25%, #444 50%, #333 75%)' 
      : 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 1.5s infinite linear`,
    borderRadius: '4px',
    margin: '4px 0',
  }));

const StaffList = () => {
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [staffData, setStaffData] = useState({
        staffId: '',
        staffName: '',
        teamName: '',
        department: '',
        workUndertaken: [], // Initialize as empty array
        mobileNumber: '',
        email: '',
        staffDomain: '',
        staffTiming: '',
        loginTime: null,
        joinDate: null,
        endDate: null,
        dob: null,
        gender: '',
        location: '',
      });
    const [filters, setFilters] = useState({
        role: '',
        domain: '',
        status: '',
    });
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [formMode, setFormMode] = useState(null);
    const [editStaffId, setEditStaffId] = useState(null);
    const { colorMode } = useColorMode();
    const theme = useTheme();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const fetchStaffData = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get("http://localhost:8000/Sims/user-data/", {
                headers: { Authorization: `Token ${token}` },
                timeout: 10000
            });

            const userData = response.data;
            const formattedData = userData
                .filter(item => item.temp_details?.role !== 'intern')
                .map(item => ({
                    id: item.temp_details.emp_id,
                    name: item.username,
                    dept: item.department || 'N/A',
                    role: item.temp_details.role || 'N/A',
                    domain: item.domain_name || 'N/A',
                    status: item.user_status === 'active' ? 'Working' : 'Resigned'
                }));

            setStaff(formattedData);
        } catch (error) {
            console.error("Error fetching staff data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStaffData();
    }, [fetchStaffData]);


    const handleFetchStaffData = async (employeeId) => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `http://localhost:8000/Sims/user-data/${employeeId}/`,
            {
              headers: {
                Authorization: `Token ${token}`,
              },
            }
          );
    
          const data = response.data;
          console.log("staff data:",data)
    
          setStaffData((prev) => ({
            ...prev,
            staffName: data.username || "",
            email: data.temp_details?.email || "",
            staffDomain: data.domain_name || data.domain || "",
            department: data.department || "",
            staffTiming: data.shift_timing || "",
            teamName: data.team_name || "",
            joinDate: data.start_date ? new Date(data.start_date) : null,
            endDate: data.end_date ? new Date(data.end_date) : null,
            workUndertaken: [
              ...(data.is_attendance_access ? ["Attendance Management"] : []),
              ...(data.is_payroll_access ? ["Payment Management"] : []),
              ...(data.is_internmanagement_access ? ["Intern Management"] : []),
              ...(data.is_assert_access ? ["Asset Management"] : []),
            ],
            loginTime: prev.loginTime,
            dob: prev.dob,
            gender: prev.gender,
            location: prev.location,
            mobileNumber: prev.mobileNumber,
          }));
          setEditStaffId(employeeId); // Make sure to set the edit ID
          setFormMode('edit'); // Make sure form is in edit mode         
          
          setSnackbarMessage("Staff data loaded successfully.");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        } catch (err) {
          setSnackbarMessage("Staff not found.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          console.error("Fetch error:", err.response?.data || err.message);
        }
      };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
        setPage(1);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    const handleReset = () => {
        setSearchTerm('');
        setFilters({ role: '', domain: '', status: '' });
        setPage(1);
    };

    const handleAddStaff = () => setFormMode('add');
    
    const handleEditStaff = (id) => {
        setEditStaffId(id);
        setFormMode('edit');
    };

    const handleCloseForm = () => {
        setFormMode(null);
        setEditStaffId(null);
        fetchStaffData();
    };

    const filteredStaff = staff.filter((employee) => {
        const matchesSearch =
            employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilters =
            (!filters.role || employee.role === filters.role) &&
            (!filters.domain || employee.domain === filters.domain) &&
            (!filters.status || employee.status === filters.status);

        return matchesSearch && matchesFilters;
    });

    const paginatedStaff = filteredStaff.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const totalPages = Math.ceil(filteredStaff.length / rowsPerPage) || 1;

    if (formMode) {
        return (
            <Box sx={{ p: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleCloseForm}
                    variant="outlined"
                    sx={{ mb: 3 }}
                >
                    Back to Staff List
                </Button>
                {formMode === 'add' ? (
                    <StaffRegistrationForm 
                        switchToUpdate={handleCloseForm}
                        setFormDataForUpdate={() => {}}
                    />
                ) : (
                    <StaffCreationForm 
                        switchToRegister={() => setFormMode('add')}
                        formData={{
                            ...staffData,
                            staffId: editStaffId,
                            workUndertaken: staffData.workUndertaken,
                            ...staff.find(e => e.id === editStaffId)
                        }}
                    />
                )}
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    Staff Management
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={handleAddStaff}
                >
                    Add Staff
                </Button>
            </Box>

            <Paper 
        elevation={0} 
        sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 4, 
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
        }}
    >
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    mb={3}
                    rowGap={2}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
        variant="outlined"
        placeholder="Search by Emp ID or Name..."
        size="small"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ 
            width: 300,
            '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
                '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                },
            },
        }}
        InputProps={{
            startAdornment: (
                <InputAdornment position="start">
                    <SearchIcon 
                        color="action" 
                        sx={{ 
                            color: theme.palette.text.secondary 
                        }} 
                    />
                </InputAdornment>
            ),
        }}
    />
                        <Button variant="outlined" onClick={handleReset}>
                            Reset
                        </Button>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <FormControl 
        variant="outlined" 
        size="small" 
        sx={{ 
            minWidth: 180,
            '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
            },
            '& .MuiInputLabel-root': {
                color: theme.palette.text.secondary,
            },
        }}
    >                            <InputLabel>Role</InputLabel>
                            <Select
                                value={filters.role}
                                onChange={(e) => handleFilterChange('role', e.target.value)}
                                label="Role"
                            >
                                <MenuItem value="">All Roles</MenuItem>
                                {Array.from(new Set(staff.map(s => s.role))).map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl 
        variant="outlined" 
        size="small" 
        sx={{ 
            minWidth: 180,
            '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
            },
            '& .MuiInputLabel-root': {
                color: theme.palette.text.secondary,
            },
        }}
    >                            <InputLabel>Domain</InputLabel>
                            <Select
                                value={filters.domain}
                                onChange={(e) => handleFilterChange('domain', e.target.value)}
                                label="Domain"
                            >
                                <MenuItem value="">All Domains</MenuItem>
                                {Array.from(new Set(staff.map(s => s.domain))).map((domain) => (
                                    <MenuItem key={domain} value={domain}>
                                        {domain}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl 
        variant="outlined" 
        size="small" 
        sx={{ 
            minWidth: 180,
            '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
            },
            '& .MuiInputLabel-root': {
                color: theme.palette.text.secondary,
            },
        }}
    >                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                label="Status"
                            >
                                <MenuItem value="">All Statuses</MenuItem>
                                <MenuItem value="Working">Working</MenuItem>
                                <MenuItem value="Resigned">Resigned</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>

                <TableContainer 
        component={Paper} 
        elevation={0} 
        sx={{ 
            borderRadius: 4,
            minHeight: 400,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            '&:after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(110deg, #1a1a1a 8%, #2a2a2a 18%, #1a1a1a 33%)'
                    : 'linear-gradient(110deg, #f5f7fa 8%, #f0f2f5 18%, #f5f7fa 33%)',
                backgroundSize: '200% 100%',
                animation: isLoading ? `${shimmer} 1.5s infinite linear` : 'none',
                opacity: isLoading ? 0.6 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
                zIndex: 1,
            },
        }}
    >
        <Table sx={{ minWidth: 650, position: 'relative', zIndex: 2 }}>
            <TableHead sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.100',
                '& th': {
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                }
            }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Emp ID</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Emp Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Domain</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, index) => (
                                    <ShimmerRow key={`shimmer-${index}`}>
                                        <TableCell><ShimmerCell width="60%" /></TableCell>
                                        <TableCell><ShimmerCell width="70%" /></TableCell>
                                        <TableCell><ShimmerCell width="50%" /></TableCell>
                                        <TableCell><ShimmerCell width="40%" /></TableCell>
                                        <TableCell><ShimmerCell width="50%" /></TableCell>
                                        <TableCell><ShimmerCell width="40%" /></TableCell>
                                        <TableCell><ShimmerCell width="30%" /></TableCell>
                                    </ShimmerRow>
                                ))
                            ) : filteredStaff.length > 0 ? (
                                paginatedStaff.map((employee) => (
                                    <TableRow key={employee.id} hover>
                                        <TableCell>{employee.id}</TableCell>
                                        <TableCell>{employee.name}</TableCell>
                                        <TableCell>{employee.dept}</TableCell>
                                        <TableCell>{employee.role}</TableCell>
                                        <TableCell>{employee.domain}</TableCell>
                                        <TableCell>
                                        <Chip
        label={employee.status}
        color={employee.status === 'Working' ? 'success' : 'error'}
        size="small"
        sx={{
            fontWeight: 500,
            borderRadius: 1,
            px: 1,
            color: 'white',
            '&.MuiChip-colorSuccess': {
                backgroundColor: theme.palette.success.main,
            },
            '&.MuiChip-colorError': {
                backgroundColor: theme.palette.error.main,
            },
        }}
    />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => {
                                                    handleEditStaff(employee.id);
                                                    handleFetchStaffData(employee.id);
                                                }}
                                                color="primary"
                                                aria-label="edit"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            No staff members found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {!isLoading && filteredStaff.length > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography>Rows per page:</Typography>
                      <Select
                        value={rowsPerPage}
                        onChange={handleRowsPerPageChange}
                        size="small"
                        variant="standard"
                        disableUnderline
                        sx={{
                          '& .MuiSelect-select': {
                            paddingRight: '24px',
                          }
                        }}
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                      </Select>
                      <Typography>{`${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, filteredStaff.length)} of ${filteredStaff.length}`}</Typography>
                      <Pagination
                        count={Math.ceil(filteredStaff.length / rowsPerPage)}
                        page={page}
                        onChange={(event, value) => setPage(value)}
                        shape="rounded"
                        size="small"
                        renderItem={(item) => {
                            // Only render the previous and next buttons
                            if (item.type === 'previous' || item.type === 'next') {
                            return <PaginationItem {...item} />;
                            }
                            // Return null for all other items (page numbers, etc.)
                            return null;
                        }}
                      />
                    </Box>
                  </Box>
                )}
            </Paper>
        </Box>
    );
};

export default StaffList;