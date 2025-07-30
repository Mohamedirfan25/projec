import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Card,
    ListItemIcon,
    ListItemText,
    CardContent,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    IconButton,
    Chip,
    Paper,
    InputAdornment,
    Modal,
    CircularProgress,
    Skeleton,
    TablePagination,
    Menu
} from '@mui/material';
import {
    Add as AddIcon,
    FilterAlt as FilterAltIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon
} from '@mui/icons-material';

// Shimmer loading component
const ShimmerRow = ({ columns = 9 }) => (
    <TableRow>
        {Array(columns).fill(0).map((_, index) => (
            <TableCell key={index}>
                <Box sx={{ py: 1 }}>
                    <Skeleton variant="rectangular" width="100%" height={20} />
                </Box>
            </TableCell>
        ))}
    </TableRow>
);

const AssetManagement = () => {
    // State management
    const [assets, setAssets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null);
    const [currentActionAsset, setCurrentActionAsset] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [expanded, setExpanded] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100); 
    const [loading, setLoading] = useState(true); // Start with loading true to show shimmer on initial load
    const [initialLoad, setInitialLoad] = useState(true);
    const [error, setError] = useState(null);
    const [hasFetched, setHasFetched] = useState(false);
    
    // Modal and form states
    const [openModal, setOpenModal] = useState(false);
    const [currentAsset, setCurrentAsset] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    // Asset assignment states
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [internList, setInternList] = useState([]);
    const [availableInterns, setAvailableInterns] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedIntern, setSelectedIntern] = useState('');
    const [selectedAssetType, setSelectedAssetType] = useState('');
    
    // History modal states
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [selectedAssetId, setSelectedAssetId] = useState('');

    // Handle view action
    const handleView = (assetId) => {
        const asset = assets.find(a => a.assetId === assetId);
        if (asset) {
            setCurrentAsset(asset);
            setOpenModal(true);
        }
    };
    
    // Handle asset type change
    const handleAssetTypeChange = (event) => {
        setSelectedAssetType(event.target.value);
    };
    
    // Handle department change
    const handleDepartmentChange = (event) => {
        const dept = event.target.value;
        setSelectedDepartment(dept);
        
        // Filter interns by selected department
        const filtered = internList.filter(intern => 
            intern.department && 
            intern.department.toLowerCase() === dept.toLowerCase()
        );
        
        setAvailableInterns(filtered);
        
        // Reset selected intern when department changes
        setSelectedIntern('');
        
        // If there's only one intern in the department, select them by default
        if (filtered.length === 1) {
            setSelectedIntern(filtered[0].emp_id);
        }
    };
    
    // Handle intern selection change
    const handleInternChange = (event) => {
        setSelectedIntern(event.target.value);
    };



    // Handle action menu open
    const handleActionMenuOpen = (event, asset) => {
        setActionMenuAnchorEl(event.currentTarget);
        setCurrentActionAsset(asset);
    };

    // Handle action menu close
    const handleActionMenuClose = () => {
        setActionMenuAnchorEl(null);
        setCurrentActionAsset(null);
    };

    // Handle edit action
    const handleEdit = (asset) => {
        if (asset) {
            setCurrentAsset({
                ...asset,
                assetName: asset.assetName || asset.asset || '',
                asset: asset.assetName || asset.asset || ''
            });
            // Set the selected asset type if it exists
            if (asset.type && asset.type !== 'N/A') {
                setSelectedAssetType(asset.type);
            }
            // Set the selected department and intern if they exist
            if (asset.department) {
                setSelectedDepartment(asset.department);
                if (asset.empId) {
                    setSelectedIntern(asset.empId);
                }
            }
            setOpenModal(true);
        }
        handleActionMenuClose();
    };

    // Handle delete action
    const handleDelete = async (assetId) => {
        if (!assetId) {
            console.error('No asset ID provided for deletion');
            return;
        }
        
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error('No authentication token found');
                }
                
                const response = await fetch(`http://localhost:8000/Sims/assert-stock/${assetId}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Error deleting asset:', response.status, errorData);
                    throw new Error(errorData.detail || 'Failed to delete asset');
                }
                
                // Optimistically update the UI
                setAssets(prevAssets => prevAssets.filter(asset => asset.id !== assetId));
                
                // Also remove from selected assets if it was selected
                setSelectedAssets(prev => prev.filter(id => id !== assetId));
                
                // Show success message
                alert('Asset deleted successfully');
                
            } catch (error) {
                console.error('Error deleting asset:', error);
                alert(`Error: ${error.message || 'Failed to delete asset. Please try again.'}`);
                // Refresh the list to ensure it's in sync with the server
                fetchAssets();
            }
        }
    };

    // Fetch assets data
    const fetchAssets = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No authentication token found");
            setError(new Error("Authentication required"));
            setLoading(false);
            setInitialLoad(false);
            setHasFetched(true);
            return [];
        }

        try {
            console.log("Fetching assets and user data...");
            const [assetResponse, userResponse] = await Promise.all([
                fetch("http://localhost:8000/Sims/assert-stock/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                        "Content-Type": "application/json"
                    }
                }),
                fetch("http://localhost:8000/Sims/user-data/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                        "Content-Type": "application/json"
                    }
                })
            ]);
            
            console.log("Asset response status:", assetResponse.status);
            console.log("User response status:", userResponse.status);
    
            if (!assetResponse.ok) {
                const errorText = await assetResponse.text();
                console.error("Asset API error:", errorText);
                throw new Error(`Failed to fetch asset data: ${assetResponse.status} ${assetResponse.statusText}`);
            }
            if (!userResponse.ok) {
                const errorText = await userResponse.text();
                console.error("User API error:", errorText);
                throw new Error(`Failed to fetch user data: ${userResponse.status} ${userResponse.statusText}`);
            }
            
            const [assetsData, usersData] = await Promise.all([
                assetResponse.json(),
                userResponse.json()
            ]);
            
            console.log("Raw assets data:", assetsData);
            console.log("Users data:", usersData);
            
            setUsers(usersData);
            
            console.log('Processing assets data:', assetsData);
            // Process and return the formatted assets
            console.log('Raw assets data from API:', assetsData);
            const processedAssets = assetsData.map(asset => {
                // Format department name to be more readable
                const formatDepartment = (dept) => {
                    if (!dept) return 'N/A';
                    // Convert from snake_case to Title Case
                    return dept
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                };

                // Get assigned user details
                let assignedTo = 'Unassigned';
                let departmentName = 'N/A';
                
                if (asset.emp_id) {
                    const assignedUser = usersData.find(user => user.temp_details?.emp_id === asset.emp_id);
                    if (assignedUser) {
                        assignedTo = `${assignedUser.first_name || ''} ${assignedUser.last_name || ''}`.trim() || 
                                    assignedUser.username || 
                                    `ID: ${asset.emp_id}`;
                    }
                }

                if (asset.department) {
                    departmentName = formatDepartment(asset.department);
                }

                // Map the asset data to match the table columns
                const mappedAsset = {
                    id: asset.assert_id,
                    assetId: asset.assert_id,  // For the Asset ID column
                    assetName: asset.assert_model || 'N/A',  // For the Asset Name column
                    type: asset.allocated_type || 'N/A',  // For the Type column
                    department: departmentName,  // For the Department column
                    configuration: asset.configuration || 'N/A',  // For the Configuration column
                    assignedTo: assignedTo,  // For the Assigned To column
                    status: asset.inhand ? "Available" : "Assigned",  // For the Status column
                    // Additional fields that might be needed for actions
                    inhand: asset.inhand || false,
                    createdDate: asset.created_date || 'N/A',
                    updatedDate: asset.updated_date || 'N/A',
                    empId: asset.emp_id || null,
                    userId: asset.user || null,
                    // Add any other fields needed for your table
                    actions: [
                        {
                            label: 'View',
                            onClick: () => handleView(asset.assert_id)
                        },
                        {
                            label: 'Edit',
                            onClick: () => handleEdit(asset.assert_id)
                        },
                        {
                            label: 'Delete',
                            onClick: () => handleDelete(asset.assert_id)
                        }
                    ]
                };

                console.log('Mapped asset:', mappedAsset);

                // Set assignedTo based on user data if available
                if (asset.emp_id) {
                    const assignedUser = usersData.find(user => user.temp_details?.emp_id === asset.emp_id);
                    if (assignedUser) {
                        mappedAsset.assignedTo = `${assignedUser.username} (ID: ${asset.emp_id})`;
                    } else {
                        mappedAsset.assignedTo = `ID: ${asset.emp_id}`;
                    }
                }
                
                console.log('Mapped asset:', mappedAsset);
                return mappedAsset;
            });
            
            console.log('Processed assets:', processedAssets);
            return processedAssets;
        } catch (error) {
            console.error("Error fetching assets:", error);
            setError(error);
            return [];
        } finally {
            setLoading(false);
            setInitialLoad(false);
            setHasFetched(true);
        }
    }, [initialLoad]);

    // Fetch departments
    const fetchDepartments = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:8000/Sims/departments/", {
                headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) throw new Error("Failed to fetch departments");
            const data = await response.json();
            setDepartments(data);
            return data;
        } catch (error) {
            console.error("Error fetching departments:", error);
            setError(error);
            return [];
        }
    }, []);

    // Fetch intern list
    const fetchInternList = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return [];

        try {
            // Fetch both temps and user data to get department info
            const [tempsResponse, userDataResponse] = await Promise.all([
                fetch("http://localhost:8000/Sims/temps/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                        "Content-Type": "application/json"
                    }
                }),
                fetch("http://localhost:8000/Sims/user-data/", {
                    headers: {
                        "Authorization": `Token ${token}`,
                        "Content-Type": "application/json"
                    }
                })
            ]);
            
            if (!tempsResponse.ok || !userDataResponse.ok) {
                throw new Error("Failed to fetch intern data");
            }
            
            const tempsData = await tempsResponse.json();
            const userDataList = await userDataResponse.json();
            
            // Combine temps with their department info from UserData
            const internsWithDept = tempsData
                .filter(temp => temp.role === 'intern')
                .map(temp => {
                    const userData = userDataList.find(ud => ud.emp_id === temp.emp_id);
                    return {
                        ...temp,
                        department: userData?.department?.department || userData?.department
                    };
                });
            
            setInternList(internsWithDept);
            return internsWithDept;
        } catch (error) {
            console.error("Error fetching intern list:", error);
            setError(error);
            return [];
        }
    }, []);

    // Initial data fetch
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log("Starting to fetch data...");
            // Fetch all data in parallel
            const [assetsData, depts, interns] = await Promise.all([
                fetchAssets(),
                fetchDepartments(),
                fetchInternList()
            ]);
            
            console.log("Fetched data:", { assetsData, depts, interns });
            
            // Update assets if we got valid data
            if (Array.isArray(assetsData)) {
                console.log(`Setting ${assetsData.length} assets to state`);
                setAssets(assetsData);
                console.log("Assets state should now be updated");
            } else {
                console.error("Invalid assets data received:", assetsData);
                setError(new Error("Failed to load asset data"));
            }
        } catch (err) {
            console.error("Error in initial data fetch:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch effect
    useEffect(() => {
        const loadData = async () => {
            try {
                const [assetsData, depts, interns] = await Promise.all([
                    fetchAssets(),
                    fetchDepartments(),
                    fetchInternList()
                ]);
                
                if (Array.isArray(assetsData)) {
                    setAssets(assetsData);
                }
            } catch (error) {
                console.error("Error loading data:", error);
                setError(error);
            }
        };
        
        loadData();
    }, [fetchAssets, fetchDepartments, fetchInternList]);

    const fetchAssetHistory = async (assetId) => {
        if (!assetId) {
            console.error("No asset ID provided for history");
            return;
        }
        
        const token = localStorage.getItem("token");
        if (!token) {
            setError(new Error("Authentication required"));
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:8000/Sims/asserthistory/?asset_id=${assetId}`, {
                headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch asset history: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error("Invalid history data format received");
            }
            
            setHistoryData(data);
            setSelectedAssetId(assetId);
            setHistoryModalOpen(true);
        } catch (error) {
            console.error("Error fetching asset history:", error);
            setError(error instanceof Error ? error : new Error(String(error)));
        }
    };

    const handleAssetClick = (assetId) => {
        fetchAssetHistory(assetId);
    };

    // Function to fetch available interns for a department
    const fetchAvailableInterns = useCallback(async (department) => {
        if (!department) {
            setAvailableInterns([]);
            return [];
        }
        
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found");
                return [];
            }
            
            // First, get all temps
            const tempsResponse = await fetch("http://localhost:8000/Sims/temps/", {
                headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!tempsResponse.ok) {
                throw new Error("Failed to fetch interns");
            }
            
            const tempsData = await tempsResponse.json();
            
            // Then get user data to match departments
            const userDataResponse = await fetch("http://localhost:8000/Sims/user-data/", {
                headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!userDataResponse.ok) {
                throw new Error("Failed to fetch user data");
            }
            
            const userDataList = await userDataResponse.json();
            
            // Combine temps with their department info
            const internsWithDept = tempsData
                .filter(temp => temp.role === 'intern')
                .map(temp => {
                    const userData = userDataList.find(ud => ud.emp_id === temp.emp_id);
                    return {
                        ...temp,
                        department: userData?.department?.department || userData?.department || ''
                    };
                });
            
            // Filter interns by the selected department
            const filteredInterns = internsWithDept.filter(
                intern => intern.department && 
                         intern.department.toLowerCase() === department.toLowerCase()
            );
            
            setAvailableInterns(filteredInterns);
            return filteredInterns;
            
        } catch (error) {
            console.error("Error fetching available interns:", error);
            setAvailableInterns([]);
            return [];
        }
    }, []);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleSelectAsset = (assetId) => {
        setSelectedAssets(prev =>
            prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const newSelected = paginatedAssets.map((asset) => asset.id);
            setSelectedAssets(newSelected);
        } else {
            setSelectedAssets([]);
        }
    };

    const handleBulkDelete = async () => {
        const token = localStorage.getItem("token");
        try {
            setLoading(true);
            const deletePromises = selectedAssets.map(id => 
                fetch(`http://localhost:8000/Sims/assert-stock/${id}/`, {
                    method: 'DELETE',
                    headers: {
                        "Authorization": `Token ${token}`,
                    }
                })
            );
            
            await Promise.all(deletePromises);
            // Refresh the asset list
            await fetchAssets();
            setSelectedAssets([]);
        } catch (error) {
            console.error("Error deleting assets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const getFilteredAssets = () => {
        return assets.filter(asset => {
            const searchMatch = asset.asset.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              asset.id.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = !statusFilter || asset.status === statusFilter;
            const typeMatch = !typeFilter || asset.type === typeFilter;

            return searchMatch && statusMatch && typeMatch;
        });
    };

    const filteredAssets = React.useMemo(() => {
        console.log('Filtering assets with searchTerm:', searchTerm, 'statusFilter:', statusFilter, 'typeFilter:', typeFilter);
        console.log('Current assets array:', assets);
        
        const result = assets.filter(asset => {
            if (!asset) return false;
            
            const searchLower = searchTerm.toLowerCase();
            const assetName = asset.asset ? asset.asset.toLowerCase() : '';
            const assetId = asset.id ? asset.id.toString().toLowerCase() : '';
            
            const searchMatch = assetName.includes(searchLower) || 
                              assetId.includes(searchLower);
            const statusMatch = !statusFilter || (asset.status && asset.status === statusFilter);
            const typeMatch = !typeFilter || (asset.type && asset.type === typeFilter);

            const include = searchMatch && statusMatch && typeMatch;
            if (include) {
                console.log('Including asset:', asset);
            }
            return include;
        });
        
        console.log('Filtered assets result:', result);
        return result;
    }, [assets, searchTerm, statusFilter, typeFilter]);

    const paginatedAssets = React.useMemo(() => {
        console.log('Calculating paginated assets...');
        console.log('Page:', page, 'Rows per page:', rowsPerPage);
        console.log('Filtered assets length:', filteredAssets.length);
        
        if (!Array.isArray(filteredAssets)) {
            console.log('Filtered assets is not an array');
            return [];
        }
        
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        console.log('Start index:', startIndex, 'End index:', endIndex);
        
        const paginated = filteredAssets.slice(startIndex, endIndex);
        console.log('Paginated assets:', paginated);
        return paginated;
    }, [filteredAssets, page, rowsPerPage]);

    const handleOpenModal = async (asset = null) => {
        console.log('Opening modal with asset:', asset);
        setCurrentAsset(asset);
        
        // Reset form first
        setSelectedDepartment('');
        setSelectedIntern('');
        setSelectedAssetType('');
        
        if (!asset) {
            setOpenModal(true);
            return;
        }
        
        // Set department first
        const department = asset.department || '';
        setSelectedDepartment(department);
        
        // Set other form fields from the asset
        const empId = asset.empId || asset.emp_id || '';
        const assetType = asset.type || '';
        const configuration = asset.configuration || '';
        const status = asset.status || 'Available';
        const assetName = asset.asset || asset.assetName || '';
        
        // Set form values using React state
        setSelectedAssetType(assetType);
        
        // Set form values directly to ensure they're immediately visible
        const form = document.forms[0];
        if (form) {
            if (form.elements['assetId']) form.elements['assetId'].value = asset.id || '';
            if (form.elements['assetName']) form.elements['assetName'].value = assetName;
            if (form.elements['configuration']) form.elements['configuration'].value = configuration;
            if (form.elements['status']) form.elements['status'].value = status;
        }
        
        // Fetch available interns if department is specified
        if (department) {
            try {
                const interns = await fetchAvailableInterns(department);
                console.log('Available interns:', interns);
                
                // After fetching interns, set the selected intern if we have one
                if (empId) {
                    // Check if the empId exists in the available interns
                    const internExists = interns.some(intern => intern.emp_id === empId);
                    if (internExists) {
                        setSelectedIntern(empId);
                    } else {
                        console.warn(`Intern with ID ${empId} not found in available interns`);
                        setSelectedIntern('');
                    }
                } else {
                    setSelectedIntern('');
                }
            } catch (error) {
                console.error('Error fetching interns:', error);
                setAvailableInterns([]);
            }
        } else {
            setAvailableInterns([]);
        }
        
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        // Reset all form-related state
        setCurrentAsset(null);
        setSelectedDepartment('');
        setSelectedIntern('');
        setSelectedAssetType('');
        setAvailableInterns([]);
        setOpenModal(false);
        
        // Reset the form fields
        const form = document.forms[0];
        if (form) {
            form.reset();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem("token");
        
        if (!token) {
            alert('Please login first');
            return;
        }
      
        const formData = new FormData(event.currentTarget);
      
        // Validate required fields
        const assetId = formData.get('assetId')?.trim();
        const assetName = formData.get('assetName')?.trim();
        const configuration = formData.get('configuration')?.trim();
        
        if (!assetId || !assetName || !selectedAssetType || !configuration) {
          alert('Please fill in all required fields: Asset ID, Asset Name, Asset Type, and Configuration');
          return;
        }
        
        // Prepare the data to send to backend
        const assetData = {
          assert_id: assetId,
          assert_model: assetName,  // This is the correct field name for asset name in backend
          allocated_type: selectedAssetType,
          configuration: configuration,
          ...(currentAsset && { id: currentAsset.id }),
          ...(selectedDepartment && { department: selectedDepartment }),
          ...(selectedIntern && { emp_id: selectedIntern })
        };
        
        // Remove emp_id if it's explicitly set to null/empty
        if (selectedIntern === null || selectedIntern === '') {
          assetData.emp_id = null;
        }
        
        const url = currentAsset
          ? `http://localhost:8000/Sims/assert-stock/${currentAsset.id}/`
          : "http://localhost:8000/Sims/assert-stock/";

        const method = currentAsset ? 'PUT' : 'POST';
        
        console.log('Submitting asset data:', assetData);
        console.log('URL:', url);
        console.log('Method:', method);
        
        setSubmitting(true);
        
        try {
          const response = await fetch(url, {
            method,
            headers: {
              "Authorization": `Token ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(assetData)
          });
      
          console.log('Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Server error:", errorText);
            console.error("Request data:", assetData);
            
            // Try to parse as JSON for better error display
            try {
              const errorJson = JSON.parse(errorText);
              console.error("Parsed error:", errorJson);
              const errorMessage = Object.entries(errorJson)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('\n');
              alert(`Failed to ${currentAsset ? 'update' : 'add'} asset:\n${errorMessage}`);
            } catch {
              alert(`Failed to ${currentAsset ? 'update' : 'add'} asset: ${errorText}`);
            }
            return;
          }

          const result = await response.json();
          console.log('Success result:', result);
          
          // Success - update the UI with the new data
          try {
            // For better UX, we'll update the UI optimistically first
            if (currentAsset) {
              // For updates, update the existing asset in the state
              setAssets(prevAssets => 
                prevAssets.map(asset => 
                  asset.id === currentAsset.id 
                    ? { 
                        ...asset, 
                        ...result, 
                        assetName: result.assert_model,  // Ensure assetName is set from assert_model
                        allocated_type: result.allocated_type,
                        configuration: result.configuration,
                        department: selectedDepartment || asset.department,
                        emp_id: selectedIntern || null
                      }
                    : asset
                )
              );
            } else {
              // For new assets, add to the beginning of the list
              setAssets(prevAssets => [
                { 
                  ...result, 
                  assetName: result.assert_model,  // Ensure assetName is set from assert_model
                  department: selectedDepartment || null,
                  emp_id: selectedIntern || null
                },
                ...prevAssets
              ]);
            }
            
            // Then refresh from server to ensure consistency
            const [assetsData, depts, interns] = await Promise.all([
                fetchAssets(),
                fetchDepartments(),
                fetchInternList()
            ]);
            
            // Update the assets state with the fresh data if needed
            if (Array.isArray(assetsData)) {
                console.log(`Refreshed ${assetsData.length} assets in state`);
                setAssets(assetsData);
            }
            
            // Show success message and close the modal
            alert(currentAsset ? "Asset updated successfully!" : "Asset added successfully!");
            handleCloseModal();
            
          } catch (error) {
            console.error("Error refreshing data after submission:", error);
            alert("Asset operation successful, but there was an error refreshing the list. Please refresh the page to see changes.");
            handleCloseModal();
          }

        } catch (error) {
          console.error("Operation failed:", error);
          alert(`Failed to ${currentAsset ? 'update' : 'add'} asset. Please try again.`);
        } finally {
          setSubmitting(false);
        }
      };
      
    
    const getStatusColor = (status) => {
        switch (status) {
            case "Available":
                return "success"; 
            case "Assigned":
                return "warning"; 
            case "Maintenance":
                return "error"; 
            default:
                return "default";
        }
    };

    const renderAssetList = () => (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        Asset Management
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenModal()}
                        
                    >
                    Add Asset   
                    </Button>
                    
                </Box>

                <Accordion expanded={expanded} onChange={handleExpandClick} sx={{ mb: 3 }}>
                    <AccordionSummary expandIcon={<FilterAltIcon />}>
                        <Box display="flex" alignItems="center">
                            <FilterAltIcon color="action" sx={{ mr: 1 }} />
                            <Typography>Filters</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search assets..."
                                    size="small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        label="Status"
                                    >
                                        <MenuItem value="">All Statuses</MenuItem>
                                        <MenuItem value="Assigned">Assigned</MenuItem>
                                        <MenuItem value="Available">Available</MenuItem>
                                        <MenuItem value="Maintenance">Maintenance</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            

                            <Grid item xs={12} sm={6} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        label="Type"
                                    >
                                        <MenuItem value="">All Types</MenuItem>
                                        <MenuItem value="Laptop">Laptop</MenuItem>
                                        <MenuItem value="Desktop">Desktop</MenuItem>
                                        <MenuItem value="Mouse">Mouse</MenuItem>
                                        <MenuItem value="Tablet">Tablet</MenuItem>
                                        <MenuItem value="Charger">Charger</MenuItem>
                                        <MenuItem value="Headphone">Headphone</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="flex-end" gap={1}>
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        startIcon={<FilterListIcon />}
                                        onClick={() => {
                                            setStatusFilter("");
                                            setTypeFilter("");
                                            setSearchTerm("");
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
                <Modal open={historyModalOpen} onClose={() => setHistoryModalOpen(false)}>
  <Box sx={{
    width: '80%',
    maxHeight: '80vh',
    overflowY: 'auto',
    margin: '5% auto',
    backgroundColor: 'white',
    p: 4,
    borderRadius: 2,
    boxShadow: 24
  }}>
    <Typography variant="h6" mb={2}>
      Asset History - {selectedAssetId}
    </Typography>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Actor</TableCell>
          <TableCell>Asset</TableCell>
          <TableCell>Intern ID</TableCell>
          <TableCell>Event Type</TableCell>
          <TableCell>Timestamp</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {historyData.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.actor}</TableCell>
            <TableCell>{entry.asset}</TableCell>
            <TableCell>{entry.emp_id || '—'}</TableCell>
            <TableCell>{entry.event_type}</TableCell>
            <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
    
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
</Modal>

                       
                {selectedAssets.length > 0 && (
                    <Box mb={2} display="flex" alignItems="center" gap={2}>
                        <Typography color="textSecondary">
                            {selectedAssets.length} selected
                        </Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleBulkDelete}
                            size="small"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={24} />
                                    Processing...
                                </>
                            ) : 'Delete Selected'}
                        </Button>
                    </Box>
                )}

                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'background.default' }}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={
                                            selectedAssets.length > 0 && selectedAssets.length < filteredAssets.length
                                        }
                                        checked={
                                            filteredAssets.length > 0 && selectedAssets.length === filteredAssets.length
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Asset ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Asset Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Configuration</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Assigned To</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                // Show shimmer effect when loading
                                Array(5).fill(0).map((_, index) => (
                                    <ShimmerRow key={`shimmer-${index}`} columns={9} />
                                ))
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                        <Typography color="error">
                                            Error loading assets: {error.message}
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            onClick={() => {
                                                setInitialLoad(true);
                                                fetchAssets();
                                            }}
                                            sx={{ mt: 2 }}
                                        >
                                            Retry
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedAssets.length > 0 ? (
                                // Show assets if we have them
                                paginatedAssets.map((asset) => (
                                    <TableRow key={asset.id} hover>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedAssets.includes(asset.id)}
                                                onChange={() => handleSelectAsset(asset.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="text"
                                                onClick={() => fetchAssetHistory(asset.id)}
                                                sx={{ textTransform: 'none', padding: 0 }}
                                            >
                                                {asset.id}
                                            </Button>
                                        </TableCell>
                                        <TableCell>{asset.assetName}</TableCell>
                                        <TableCell>{asset.type}</TableCell>
                                        <TableCell>{asset.department || 'Not specified'}</TableCell>
                                        <TableCell>{asset.configuration}</TableCell>
                                        <TableCell>{asset.assignedTo || 'Unassigned'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={asset.status}
                                                color={getStatusColor(asset.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleActionMenuOpen(e, asset);
                                                    }}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                                <Menu
                                                    anchorEl={actionMenuAnchorEl}
                                                    open={Boolean(actionMenuAnchorEl && currentActionAsset?.id === asset.id)}
                                                    onClose={handleActionMenuClose}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MenuItem onClick={() => handleEdit(asset)}>
                                                        <ListItemIcon>
                                                            <EditIcon fontSize="small" />
                                                        </ListItemIcon>
                                                        <ListItemText>Edit</ListItemText>
                                                    </MenuItem>
                                                    <MenuItem onClick={() => {
                                                        handleActionMenuClose();
                                                        handleDelete(asset.id);
                                                    }}>
                                                        <ListItemIcon>
                                                            <DeleteIcon fontSize="small" color="error" />
                                                        </ListItemIcon>
                                                        <ListItemText primaryTypographyProps={{ color: 'error' }}>Delete</ListItemText>
                                                    </MenuItem>
                                                </Menu>
                                            </Box>
                                        </TableCell>
                                        </TableRow>
                                    ))
                            ) : (
                                // Show empty state when no assets are found
                                <TableRow>
                                    <TableCell colSpan={9}></TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {loading ? (
                    // Show loading indicator in the pagination area
                    <Box display="flex" justifyContent="center" p={2}>
                        <CircularProgress size={24} />
                    </Box>
                ) : filteredAssets.length > 0 ? (
                    <TablePagination
                        rowsPerPageOptions={[25, 50, 100, { label: 'All', value: -1 }]}
                        component="div"
                        count={filteredAssets.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            const newRowsPerPage = parseInt(e.target.value, 10);
                            setRowsPerPage(newRowsPerPage === -1 ? filteredAssets.length : newRowsPerPage);
                            setPage(0);
                        }}
                        labelRowsPerPage="Rows per page:"
                        labelDisplayedRows={({ from, to, count }) => 
                            rowsPerPage === -1 
                                ? `All ${count} rows` 
                                : `${from}-${to} of ${count}${count !== filteredAssets.length ? ` (filtered from ${filteredAssets.length})` : ''}`
                        }
                        sx={{ 
                            mt: 2,
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                marginTop: '0.5rem',
                                marginBottom: '0.5rem',
                            },
                        }}
                    />
                ) : (
                    <Box mt={2} textAlign="center">
                        <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body1" color="textSecondary">
                            {assets.length === 0 
                                ? 'No assets found. Add your first asset using the "Add Asset" button.'
                                : 'No assets match your current filters'
                            }
                        </Typography>
                        {assets.length > 0 && (
                            <Button
                                variant="text"
                                onClick={() => {
                                    setStatusFilter("");
                                    setTypeFilter("");
                                    setSearchTerm("");
                                }}
                                sx={{ mt: 1 }}
                            >
                                Clear all filters
                            </Button>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    const renderModal = () => (
        <Modal open={openModal} onClose={handleCloseModal}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: '95%', sm: 600 },
                    maxWidth: 600,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
                    {currentAsset ? "Edit Asset" : "Add New Asset"}
                </Typography>
    
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* First row: Asset ID and Asset Name */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Asset ID"
                                name="assetId"
                                defaultValue={currentAsset?.id || ''}
                                required
                                size="small"
                                InputProps={{ readOnly: currentAsset !== null}}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Asset Name"
                                name="assetName"
                                defaultValue={currentAsset?.assetName || currentAsset?.asset || ''}
                                required
                                size="small"
                            />
                        </Grid>
                        
                        {/* Second row: Type and Department */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small" required>
                                <InputLabel>Asset Type</InputLabel>
                                <Select
                                    label="Asset Type"
                                    name="assetType"
                                    value={selectedAssetType}
                                    onChange={handleAssetTypeChange}
                                >
                                    <MenuItem value="Laptop">Laptop</MenuItem>
                                    <MenuItem value="Desktop">Desktop</MenuItem>
                                    <MenuItem value="Mouse">Mouse</MenuItem>
                                    <MenuItem value="Tablet">Tablet</MenuItem>
                                    <MenuItem value="Charger">Charger</MenuItem>
                                    <MenuItem value="Headphone">Headphone</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Department</InputLabel>
                                <Select
                                    label="Department"
                                    name="department"
                                    value={selectedDepartment}
                                    onChange={handleDepartmentChange}
                                >
                                    <MenuItem value="">Not specified</MenuItem>
                                    <MenuItem value="Academy">Academy</MenuItem>
                                    <MenuItem value="Recruitment">Recruitment</MenuItem>
                                    <MenuItem value="Developer">Developer</MenuItem>
                                    <MenuItem value="HR">HR</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        
                        {/* Third row: Configuration (full width) */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Configuration"
                                name="configuration"
                                defaultValue={currentAsset?.configuration || ''}
                                required
                                size="small"
                                multiline
                                rows={3}
                            />
                        </Grid>
                        
                        {/* Fourth row: Assign to Intern (full width) */}
                        <Grid item xs={12}>
                        <FormControl fullWidth size="small" sx={{ mt: 2 }}>
    <InputLabel>Assign to Intern</InputLabel>
    <Select
        name="empId"
        value={selectedIntern}
        onChange={handleInternChange}
        label="Assign to Intern"
        disabled={!selectedDepartment}
    >
        <MenuItem value="">None</MenuItem>
        {internList
            .filter(intern => {
                if (!selectedDepartment) return false;
                console.log('Filtering intern:', intern.emp_id, 'Department:', intern.department, 'Selected:', selectedDepartment);
                return intern.department?.toLowerCase() === selectedDepartment.toLowerCase();
            })
            .map((intern) => (
            <MenuItem key={intern.emp_id} value={intern.emp_id}>
                {intern.emp_id} - {intern.username || 'Unknown User'}
            </MenuItem>
        ))}
    </Select>
    {selectedDepartment && internList.filter(intern => 
        intern.department?.toLowerCase() === selectedDepartment.toLowerCase()
    ).length === 0 && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            No interns available in {selectedDepartment} department
        </Typography>
    )}
    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
        Select "None" to unassign the asset from any intern
    </Typography>
</FormControl>

                        </Grid>
                    </Grid>
    
                    {/* Action buttons */}
                    <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
                        <Button 
                            onClick={handleCloseModal} 
                            variant="outlined" 
                            disabled={submitting}
                        >
                            CANCEL
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <CircularProgress size={20} />
                                    Processing...
                                </>
                            ) : currentAsset ? (
                                "UPDATE ASSET"
                            ) : (
                                "ADD ASSET"
                            )}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
    
    return (
        <div>
            {renderAssetList()}
            {renderModal()}
        </div>
    );
};

export default AssetManagement;