import React, { useState, useEffect } from 'react';
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
    InputAdornment,
    FormControl,
    Select,
    InputLabel,
    Button
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

const staffData = [
    {
        id: 'EMP001',
        name: 'John Smith',
        dept: 'Engineering',
        role: 'Full Stack',
        domain: 'Web Development',
        status: 'Working'
    },
    // ... (keep all other staff data entries unchanged)
];

const roles = ['Payroll', 'Intern Management', 'Asset Management', 'Attendance Management'];
const domains = ['Full Stack', 'Machine Learning', 'Data Analysis', 'DevOps', 'UI/UX'];
const statuses = ['Working', 'Resigned'];
const rowsPerPageOptions = [5, 10, 25, 50];

const StaffList = () => {
    const [staff, setStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        role: '',
        domain: '',
        status: '',
    });
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [formMode, setFormMode] = useState(null); // 'add' or 'edit'
    const [editStaffId, setEditStaffId] = useState(null);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters({ ...filters, [filterType]: value });
        setPage(1);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    const handleReset = () => {
        setSearchTerm('');
        setFilters({
            role: '',
            domain: '',
            status: '',
        });
        setPage(1);
    };

    const handleAddStaff = () => {
        setFormMode('add');
    };

    const handleEditStaff = (id) => {
        setEditStaffId(id);
        setFormMode('edit');
    };

    const handleCloseForm = () => {
        setFormMode(null);
        setEditStaffId(null);
    };

    const filteredStaff = staff.filter((employee) => {
        const matchesSearch =
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilters =
            (filters.role === '' || employee.role === filters.role) &&
            (filters.domain === '' || employee.domain === filters.domain) &&
            (filters.status === '' || employee.status === filters.status);

        return matchesSearch && matchesFilters;
    });

    const paginatedStaff = filteredStaff.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    useEffect(() => {
        const fetchStaffData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get("http://localhost:8000/Sims/user-data/", {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                });

                const userData = response.data;

                const formattedData = userData
                    .filter(item => item.temp_details?.role !== 'intern')  // Filter out interns
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
            }
        };

        fetchStaffData();
    }, []);

    const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);

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
                      staffId: editStaffId,
                      workUndertaken: [], // Add default empty array
                      // Add other necessary default values
                      ...staff.find(e => e.id === editStaffId) // Spread existing staff data
                    }}
                  />
                )}
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
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

            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, bgcolor: 'background.paper' }}>
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
                            sx={{ width: 300 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { color: 'text.primary' }
                            }}
                            InputLabelProps={{ sx: { color: 'text.primary' } }}
                        />
                        <Button variant="outlined" onClick={handleReset}>
                            Reset
                        </Button>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
                            <InputLabel sx={{ color: 'text.primary' }}>Role</InputLabel>
                            <Select
                                value={filters.role}
                                onChange={(e) => handleFilterChange('role', e.target.value)}
                                label="Role"
                                sx={{ color: 'text.primary' }}
                            >
                                <MenuItem value="" sx={{ color: 'text.primary' }}>All Roles</MenuItem>
                                {roles.map((role) => (
                                    <MenuItem key={role} value={role} sx={{ color: 'text.primary' }}>
                                        {role}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
                            <InputLabel sx={{ color: 'text.primary' }}>Domain</InputLabel>
                            <Select
                                value={filters.domain}
                                onChange={(e) => handleFilterChange('domain', e.target.value)}
                                label="Domain"
                                sx={{ color: 'text.primary' }}
                            >
                                <MenuItem value="" sx={{ color: 'text.primary' }}>All Domains</MenuItem>
                                {domains.map((domain) => (
                                    <MenuItem key={domain} value={domain} sx={{ color: 'text.primary' }}>
                                        {domain}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                            <InputLabel sx={{ color: 'text.primary' }}>Status</InputLabel>
                            <Select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                label="Status"
                                sx={{ color: 'text.primary' }}
                            >
                                <MenuItem value="" sx={{ color: 'text.primary' }}>All Statuses</MenuItem>
                                {statuses.map((status) => (
                                    <MenuItem key={status} value={status} sx={{ color: 'text.primary' }}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>

                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="staff table">
                        <TableHead sx={{ bgcolor: 'grey.100' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Emp ID</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Emp Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Domain</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedStaff.length > 0 ? (
                                paginatedStaff.map((employee) => (
                                    <TableRow key={employee.id} hover>
                                        <TableCell sx={{ color: 'text.primary' }}>{employee.id}</TableCell>
                                        <TableCell sx={{ color: 'text.primary' }}>{employee.name}</TableCell>
                                        <TableCell sx={{ color: 'text.primary' }}>{employee.dept}</TableCell>
                                        <TableCell sx={{ color: 'text.primary' }}>{employee.role}</TableCell>
                                        <TableCell sx={{ color: 'text.primary' }}>{employee.domain}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={employee.status}
                                                color={employee.status === 'Working' ? 'success' : 'error'}
                                                size="small"
                                                sx={{
                                                    fontWeight: 500,
                                                    borderRadius: 1,
                                                    px: 1,
                                                    color: 'white'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleEditStaff(employee.id)}
                                                color="primary"
                                                aria-label="edit"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                    
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" sx={{ color: 'text.primary' }}>
                                            No employees found matching your criteria
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {filteredStaff.length > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3}>
                        <FormControl variant="standard" sx={{ minWidth: 120 }}>
                            <InputLabel sx={{ color: 'text.primary' }}>Rows per page</InputLabel>
                            <Select
                                value={rowsPerPage}
                                onChange={handleRowsPerPageChange}
                                label="Rows per page"
                                sx={{ color: 'text.primary' }}
                            >
                                {rowsPerPageOptions.map((option) => (
                                    <MenuItem key={option} value={option} sx={{ color: 'text.primary' }}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(event, value) => setPage(value)}
                            shape="rounded"
                            color="primary"
                            showFirstButton
                            showLastButton
                            sx={{ '& .MuiPaginationItem-root': { color: 'text.primary' } }}
                        />
                    </Stack>
                )}
            </Paper>
        </Box>
    );
};

export default StaffList;