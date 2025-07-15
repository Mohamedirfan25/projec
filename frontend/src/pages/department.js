import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  MenuItem,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Domain as DomainIcon,
  Business as BusinessIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";

// Styled components
const DepartmentCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(145deg, ${color}10, ${theme.palette.background.paper})`,
  borderLeft: `5px solid ${color}`,
  borderRadius: "12px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: theme.shadows[2],
  position: "relative",
  overflow: "hidden",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
    "& .department-actions": {
      opacity: 1,
    },
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    background: `linear-gradient(90deg, ${color}, ${color}80)`,
  },
}));

const DomainCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(145deg, ${color}10, ${theme.palette.background.paper})`,
  borderLeft: `5px solid ${color}`,
  borderRadius: "12px",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: theme.shadows[2],
  position: "relative",
  overflow: "hidden",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
    "& .domain-actions": {
      opacity: 1,
    },
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    background: `linear-gradient(90deg, ${color}, ${color}80)`,
  },
}));

const AddDepartmentCard = styled(Card)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[100],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  height: "100%",
  minHeight: 260,
  borderRadius: "12px",
  border: `2px dashed ${theme.palette.divider}`,
  "&:hover": {
    background:
      theme.palette.mode === "dark"
        ? theme.palette.grey[700]
        : theme.palette.grey[200],
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
    "& .add-icon": {
      transform: "scale(1.1)",
      color: theme.palette.primary.main,
    },
  },
}));

const AddDomainCard = styled(Card)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[100],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  height: "100%",
  minHeight: 260,
  borderRadius: "12px",
  border: `2px dashed ${theme.palette.divider}`,
  "&:hover": {
    background:
      theme.palette.mode === "dark"
        ? theme.palette.grey[700]
        : theme.palette.grey[200],
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
    "& .add-icon": {
      transform: "scale(1.1)",
      color: theme.palette.primary.main,
    },
  },
}));

const CountBadge = ({ value, label, color, icon }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 1.5,
        borderRadius: "8px",
        background: theme.palette.mode === "dark" ? `${color}20` : `${color}10`,
        minWidth: 90,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "3px",
          height: "100%",
          backgroundColor: color,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {icon &&
          React.cloneElement(icon, {
            fontSize: "small",
            sx: { color: `${color}` },
          })}
        <Typography variant="h6" fontWeight="bold" color={color}>
          {value}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: "center" }}
      >
        {label}
      </Typography>
    </Box>
  );
};

const ColorOption = styled(Box)(({ color }) => ({
  width: 24,
  height: 24,
  borderRadius: "50%",
  backgroundColor: color,
  marginRight: 8,
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  border: "1px solid rgba(0,0,0,0.1)",
}));

const DepartmentManagement = () => {
  const theme = useTheme();
  const [departments, setDepartments] = useState([]);
  const [domains, setDomains] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDomainDialog, setOpenDomainDialog] = useState(false);
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [openInternDialog, setOpenInternDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [currentDomain, setCurrentDomain] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("departments"); // 'departments' or 'domains'
  const [filteredDepartment, setFilteredDepartment] = useState(null);

  // Form states
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    description: "",
    code: "",
    color: "#6a11cb",
    icon: "⚙️",
  });

  const [domainForm, setDomainForm] = useState({
    name: "",
    description: "",
    color: "#3a7bd5",
    icon: "🌐",
  });

  const [staffForm, setStaffForm] = useState({
    id: "",
    name: "",
    email: "",
    position: "",
    departmentId: "",
  });

  const [internForm, setInternForm] = useState({
    id: "",
    name: "",
    university: "",
    program: "",
    departmentId: "",
  });

  const colorOptions = [
    { value: "#6a11cb", label: "Violet" },
    { value: "#fc4a1a", label: "Orange" },
    { value: "#11998e", label: "Teal" },
    { value: "#f46b45", label: "Coral" },
    { value: "#3a7bd5", label: "Blue" },
    { value: "#00d2ff", label: "Cyan" },
    { value: "#a8ff78", label: "Green" },
    { value: "#ff7e5f", label: "Peach" },
    { value: "#f857a6", label: "Pink" },
    { value: "#ff5858", label: "Red" },
  ];

  const iconOptions = [
    "⚙️",
    "📈",
    "👥",
    "💻",
    "🎨",
    "📊",
    "🔍",
    "📱",
    "🌐",
    "🧠",
    "💰",
    "🚀",
  ];

  const domainIconOptions = [
    "🌐",
    "💻",
    "📱",
    "🔐",
    "📊",
    "📈",
    "🧠",
    "🤖",
    "👨‍💻",
    "👩‍💻",
  ];

  const positionOptions = [
    "Software Engineer",
    "Product Manager",
    "UX Designer",
    "Data Scientist",
    "Marketing Specialist",
    "HR Business Partner",
    "Finance Analyst",
    "Sales Representative",
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Token ${token}` },
      };

      try {
        // Fetch departments
        const deptResponse = await axios.get(
          "http://localhost:8000/Sims/departments/",
          config
        );
        const departmentsData = deptResponse.data.map((dept, i) => ({
          ...dept,
          id: dept.id,
          name: dept.department,
          color: colorOptions[i % colorOptions.length].value,
          icon: iconOptions[i % iconOptions.length],
          staffCount: 0,
          internCount: 0,
        }));
        setDepartments(departmentsData);

        // Fetch domains
        const domainResponse = await axios.get(
          "http://localhost:8000/Sims/domains/",
          config
        );
        const domainsData = domainResponse.data.map((domain, i) => ({
          ...domain,
          color: colorOptions[(i + 2) % colorOptions.length].value,
          icon: domainIconOptions[i % domainIconOptions.length],
          internCount: 0,
        }));
        setDomains(domainsData);

        // Fetch user data for counts
        const userResponse = await axios.get(
          "http://localhost:8000/Sims/user-data/",
          config
        );
        const users = userResponse.data;

        // Update department counts
        const updatedDepartments = departmentsData.map((dept) => {
          const deptUsers = users.filter(
            (user) => user.department === dept.department
          );
          const staffCount = deptUsers.filter(
            (user) => user.temp_details?.role === "staff"
          ).length;
          const internCount = deptUsers.filter(
            (user) => user.temp_details?.role === "intern"
          ).length;

          return {
            ...dept,
            staffCount,
            internCount,
          };
        });
        setDepartments(updatedDepartments);

        // Update domain counts
        const updatedDomains = domainsData.map((domain) => {
          const domainInterns = users.filter(
            (user) =>
              user.domain === domain.domain &&
              user.temp_details?.role === "intern"
          );
          return {
            ...domain,
            internCount: domainInterns.length,
          };
        });
        setDomains(updatedDomains);
      } catch (err) {
        console.error("Error fetching data:", err);
        setSnackbar({
          open: true,
          message: "Error fetching data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Department handlers
  const handleOpenAddDepartment = () => {
    setEditMode(false);
    setDepartmentForm({
      name: "",
      description: "",
      code: "",
      color: "#6a11cb",
      icon: "⚙️",
    });
    setOpenDialog(true);
  };

  const handleOpenEditDepartment = (dept) => {
    setEditMode(true);
    setCurrentDepartment(dept);
    setDepartmentForm({
      name: dept.department,
      description: dept.description || "",
      code: dept.code_word || "",
      color: dept.color,
      icon: dept.icon,
    });
    setOpenDialog(true);
  };

  const handleDepartmentSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      if (editMode) {
        await axios.patch(
          `http://localhost:8000/Sims/departments/${currentDepartment.id}/`,
          {
            department: departmentForm.name,
            description: departmentForm.description,
            code_word: departmentForm.code,
          },
          config
        );

        setDepartments(
          departments.map((dept) =>
            dept.id === currentDepartment.id
              ? {
                  ...dept,
                  department: departmentForm.name,
                  description: departmentForm.description,
                  code_word: departmentForm.code,
                  color: departmentForm.color,
                  icon: departmentForm.icon,
                }
              : dept
          )
        );

        setSnackbar({
          open: true,
          message: "Department updated successfully!",
          severity: "success",
        });
      } else {
        const res = await axios.post(
          "http://localhost:8000/Sims/departments/",
          {
            department: departmentForm.name,
            description: departmentForm.description,
            code_word: departmentForm.code,
          },
          config
        );

        const newDept = {
          ...res.data,
          name: res.data.department,
          color: departmentForm.color,
          icon: departmentForm.icon,
          staffCount: 0,
          internCount: 0,
        };

        setDepartments([...departments, newDept]);
        setSnackbar({
          open: true,
          message: "Department created successfully!",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Department submit error:", err);
      setSnackbar({
        open: true,
        message: "Error saving department!",
        severity: "error",
      });
    }

    setLoading(false);
    setOpenDialog(false);
  };

  const handleDeleteDepartment = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this department? All associated staff and interns will be removed."
      )
    ) {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Token ${token}` },
      };

      try {
        await axios.patch(
          `http://localhost:8000/Sims/departments/${id}/`,
          {
            is_deleted: true,
          },
          config
        );

        setDepartments(departments.filter((dept) => dept.id !== id));
        setSnackbar({
          open: true,
          message: "Department deleted successfully!",
          severity: "success",
        });
      } catch (err) {
        console.error("Failed to delete department:", err);
        setSnackbar({
          open: true,
          message: "Error deleting department!",
          severity: "error",
        });
      }

      setLoading(false);
    }
  };

  // Domain handlers
  const handleViewDomains = async (department) => {
    setFilteredDepartment(department);
    setViewMode("domains");
    setLoading(true);
  
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Token ${token}` },
    };
  
    try {
      const res = await axios.get(
        `http://localhost:8000/Sims/domains-by-department/?department=${department.department}`,
        config
      );
  
      console.log("Fetched domains:", res.data);
      const fetchedDomains = res.data.map((domain, i) => ({
        ...domain,
        color: colorOptions[i % colorOptions.length].value,
        icon: domainIconOptions[i % domainIconOptions.length],
        internCount: 0,
      }));
  
      setDomains(fetchedDomains);
  
      // Optional: Count interns from user-data again (if needed)
      const userRes = await axios.get("http://localhost:8000/Sims/user-data/", config);
      const interns = userRes.data.filter(user =>
        user.temp_details?.role === "intern"
      );

      const updatedDomains = fetchedDomains.map(domain => {
        const count = interns.filter(i =>
          i.domain === domain.domain &&
          i.department === domain.department
        ).length;

        return { ...domain, internCount: count };
      });

      setDomains(updatedDomains);

    } catch (err) {
      console.error("Failed to fetch domains by department", err);
      setSnackbar({
        open: true,
        message: "Error loading domains",
        severity: "error",
      });
    }
  
    setLoading(false);
  };
  
  const handleBackToDepartments = () => {
    setViewMode("departments");
    setFilteredDepartment(null);
  };

  const handleOpenAddDomain = () => {
    setEditMode(false);
    setDomainForm({
      name: "",
      description: "",
      color: "#3a7bd5",
      icon: "🌐",
    });
    setOpenDomainDialog(true);
  };

  const handleOpenEditDomain = (domain) => {
    setEditMode(true);
    setCurrentDomain(domain);
    setDomainForm({
      name: domain.domain,
      description: domain.description || "",
      color: domain.color,
      icon: domain.icon,
    });
    setOpenDomainDialog(true);
  };

  const handleDomainSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      if (editMode) {
        await axios.patch(
          `http://localhost:8000/Sims/domains/${currentDomain.id}/`,
          {
            domain: domainForm.name,
            description: domainForm.description,
          },
          config
        );

        setDomains(
          domains.map((domain) =>
            domain.id === currentDomain.id
              ? {
                  ...domain,
                  domain: domainForm.name,
                  description: domainForm.description,
                  color: domainForm.color,
                  icon: domainForm.icon,
                }
              : domain
          )
        );

        setSnackbar({
          open: true,
          message: "Domain updated successfully!",
          severity: "success",
        });
      } else {
        const res = await axios.post(
          "http://localhost:8000/Sims/domains/",
          {
            domain: domainForm.name,
            description: domainForm.description,
            department: filteredDepartment?.department, // auto-include department
          },
          config
        );
        

        const newDomain = {
          ...res.data,
          color: domainForm.color,
          icon: domainForm.icon,
          internCount: 0,
        };

        setDomains([...domains, newDomain]);
        setSnackbar({
          open: true,
          message: "Domain created successfully!",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Domain submit error:", err);
      setSnackbar({
        open: true,
        message: "Error saving domain!",
        severity: "error",
      });
    }

    setLoading(false);
    setOpenDomainDialog(false);
  };

  const handleDeleteDomain = async (id) => {
    if (window.confirm("Are you sure you want to delete this domain?")) {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Token ${token}` },
      };

      try {
        await axios.delete(
          `http://localhost:8000/Sims/domains/${id}/`,
          config
        );

        setDomains(domains.filter((domain) => domain.id !== id));
        setSnackbar({
          open: true,
          message: "Domain deleted successfully!",
          severity: "success",
        });
      } catch (err) {
        console.error("Failed to delete domain:", err);
        setSnackbar({
          open: true,
          message: "Error deleting domain!",
          severity: "error",
        });
      }

      setLoading(false);
    }
  };

  // Staff/Intern handlers
  const handleOpenAddStaff = (deptId) => {
    setStaffForm({
      id: "",
      name: "",
      email: "",
      position: "",
      departmentId: deptId,
    });
    setOpenStaffDialog(true);
  };

  const handleOpenAddIntern = (deptId) => {
    setInternForm({
      id: "",
      name: "",
      university: "",
      program: "",
      departmentId: deptId,
    });
    setOpenInternDialog(true);
  };

  const handleAddStaff = () => {
    // Redirect to registration page
    window.location.href = "/register";
  };

  const handleAddIntern = () => {
    // Redirect to registration page
    window.location.href = "/register";
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOpenDomainDialog(false);
    setOpenStaffDialog(false);
    setOpenInternDialog(false);
    setCurrentDepartment(null);
    setCurrentDomain(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Render departments view
  const renderDepartmentsView = () => (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 1,
            }}
          >
            <BusinessIcon
              sx={{ fontSize: 40, color: theme.palette.primary.main }}
            />
            Department Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your organization's departments, staff, and interns
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDepartment}
          sx={{ 
            height: "fit-content",
            borderRadius: "8px",
            px: 3,
            py: 1.5,
            fontSize: "0.875rem",
          }}
        >
          New Department
        </Button>
      </Box>

      {loading && departments.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {departments.map((dept) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={dept.id}>
              <DepartmentCard color={dept.color}>
                <CardContent sx={{ position: "relative", flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${dept.color}20`,
                          color: dept.color,
                          width: 48,
                          height: 48,
                          fontSize: 24,
                        }}
                      >
                        {dept.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {dept.department}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {dept.description || "No description"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      className="department-actions"
                      sx={{
                        opacity: { xs: 1, sm: 0 },
                        transition: "opacity 0.2s",
                      }}
                    >
                      <Tooltip title="More options">
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 1.5,
                      mt: 3,
                      mb: 3,
                    }}
                  >
                    <CountBadge
                      value={dept.staffCount}
                      label="Staff Members"
                      color={dept.color}
                      icon={<PeopleIcon />}
                    />
                    <CountBadge
                      value={dept.internCount}
                      label="Interns"
                      color={dept.color}
                      icon={<SchoolIcon />}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      pt: 1,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      mt: "auto",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<PeopleIcon />}
                        onClick={() => handleOpenAddStaff(dept.id)}
                        sx={{
                          color: dept.color,
                          borderColor: `${dept.color}50`,
                          "&:hover": {
                            borderColor: dept.color,
                            backgroundColor: `${dept.color}10`,
                          },
                        }}
                      >
                        Add Staff
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<SchoolIcon />}
                        onClick={() => handleOpenAddIntern(dept.id)}
                        sx={{
                          color: dept.color,
                          borderColor: `${dept.color}50`,
                          "&:hover": {
                            borderColor: dept.color,
                            backgroundColor: `${dept.color}10`,
                          },
                        }}
                      >
                        Add Intern
                      </Button>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      startIcon={<DomainIcon />}
                      onClick={() => handleViewDomains(dept)}
                      sx={{
                        backgroundColor: `${dept.color}`,
                        "&:hover": {
                          backgroundColor: `${dept.color}cc`,
                        },
                      }}
                    >
                      View Domains
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Tooltip title="Edit department">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDepartment(dept);
                        }}
                        sx={{
                          backgroundColor: `${dept.color}20`,
                          color: dept.color,
                          "&:hover": {
                            backgroundColor: `${dept.color}30`,
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete department">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDepartment(dept.id);
                        }}
                        sx={{
                          backgroundColor: `${theme.palette.error.light}20`,
                          color: theme.palette.error.main,
                          "&:hover": {
                            backgroundColor: `${theme.palette.error.light}30`,
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </DepartmentCard>
            </Grid>
          ))}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AddDepartmentCard onClick={handleOpenAddDepartment}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AddIcon
                  className="add-icon"
                  color="action"
                  fontSize="large"
                  sx={{
                    transition: "all 0.3s ease",
                    fontSize: 40,
                  }}
                />
                <Typography variant="subtitle1" fontWeight="medium">
                  Create New Department
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add a new team or division
                </Typography>
              </Box>
            </AddDepartmentCard>
          </Grid>
        </Grid>
      )}
    </>
  );

  // Render domains view
  const renderDomainsView = () => (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToDepartments}
            sx={{ mr: 2 }}
          >
            Back to Departments
          </Button>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 1,
              mt: 2,
            }}
          >
            <DomainIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            {filteredDepartment
              ? `${filteredDepartment.department} Domains`
              : "All Domains"}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage domains and associated interns
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDomain}
          sx={{
            height: "fit-content",
            borderRadius: "8px",
            px: 3,
            py: 1.5,
            fontSize: "0.875rem",
          }}
        >
          New Domain
        </Button>
      </Box>

      {loading && domains.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {domains
            .filter((domain) =>
              filteredDepartment
                ? domain.department === filteredDepartment.department
                : true
            )
            
            .map((domain) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={domain.id}>
                <DomainCard color={domain.color}>
                  <CardContent sx={{ position: "relative", flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: `${domain.color}20`,
                            color: domain.color,
                            width: 48,
                            height: 48,
                            fontSize: 24,
                          }}
                        >
                          {domain.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {domain.domain}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {domain.description || "No description"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        className="domain-actions"
                        sx={{
                          opacity: { xs: 1, sm: 0 },
                          transition: "opacity 0.2s",
                        }}
                      >
                        <Tooltip title="More options">
                          <IconButton size="small">
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(1, 1fr)",
                        gap: 1.5,
                        mt: 3,
                        mb: 3,
                      }}
                    >
                      <CountBadge
                        value={domain.internCount}
                        label="Interns"
                        color={domain.color}
                        icon={<SchoolIcon />}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        pt: 1,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        mt: "auto",
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<SchoolIcon />}
                        onClick={() => handleOpenAddIntern(domain.id)}
                        sx={{
                          color: domain.color,
                          borderColor: `${domain.color}50`,
                          "&:hover": {
                            borderColor: domain.color,
                            backgroundColor: `${domain.color}10`,
                          },
                        }}
                      >
                        Add Intern
                      </Button>
                    </Box>

                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <Tooltip title="Edit domain">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditDomain(domain);
                          }}
                          sx={{
                            backgroundColor: `${domain.color}20`,
                            color: domain.color,
                            "&:hover": {
                              backgroundColor: `${domain.color}30`,
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete domain">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDomain(domain.id);
                          }}
                          sx={{
                            backgroundColor: `${theme.palette.error.light}20`,
                            color: theme.palette.error.main,
                            "&:hover": {
                              backgroundColor: `${theme.palette.error.light}30`,
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </DomainCard>
              </Grid>
            ))}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AddDomainCard onClick={handleOpenAddDomain}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AddIcon
                  className="add-icon"
                  color="action"
                  fontSize="large"
                  sx={{
                    transition: "all 0.3s ease",
                    fontSize: 40,
                  }}
                />
                <Typography variant="subtitle1" fontWeight="medium">
                  Create New Domain
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add a new business domain
                </Typography>
              </Box>
            </AddDomainCard>
          </Grid>
        </Grid>
      )}
    </>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {viewMode === "departments" ? renderDepartmentsView() : renderDomainsView()}

      {/* Department Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: `linear-gradient(135deg, ${departmentForm.color}, ${departmentForm.color}cc)`,
            color: "white",
            py: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: "white",
                color: departmentForm.color,
                width: 36,
                height: 36,
              }}
            >
              {departmentForm.icon}
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              {editMode
                ? `Edit ${departmentForm.name}`
                : "Create New Department"}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Department Name"
                fullWidth
                variant="outlined"
                value={departmentForm.name}
                onChange={(e) =>
                  setDepartmentForm({ ...departmentForm, name: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={departmentForm.description}
                onChange={(e) =>
                  setDepartmentForm({
                    ...departmentForm,
                    description: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Department Code"
                fullWidth
                variant="outlined"
                value={departmentForm.code}
                onChange={(e) =>
                  setDepartmentForm({ ...departmentForm, code: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Color Theme"
                fullWidth
                variant="outlined"
                value={departmentForm.color}
                onChange={(e) =>
                  setDepartmentForm({
                    ...departmentForm,
                    color: e.target.value,
                  })
                }
              >
                {colorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ColorOption color={option.value} />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Icon"
                fullWidth
                variant="outlined"
                value={departmentForm.icon}
                onChange={(e) =>
                  setDepartmentForm({ ...departmentForm, icon: e.target.value })
                }
              >
                {iconOptions.map((icon, index) => (
                  <MenuItem key={index} value={icon}>
                                        <Box component="span" sx={{ fontSize: 20, mr: 1 }}>
                      {icon}
                    </Box>
                    <Box
                      component="span"
                      sx={{ fontSize: 12, color: "text.secondary" }}
                    >
                      {icon}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderRadius: "8px",
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDepartmentSubmit}
            variant="contained"
            disabled={!departmentForm.name || loading}
            sx={{
              borderRadius: "8px",
              px: 3,
              background: `linear-gradient(135deg, ${departmentForm.color}, ${departmentForm.color}cc)`,
              "&:hover": {
                background: `linear-gradient(135deg, ${departmentForm.color}, ${departmentForm.color}dd)`,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : editMode ? (
              "Update Department"
            ) : (
              "Create Department"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Domain Dialog */}
      <Dialog
        open={openDomainDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: `linear-gradient(135deg, ${domainForm.color}, ${domainForm.color}cc)`,
            color: "white",
            py: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: "white",
                color: domainForm.color,
                width: 36,
                height: 36,
              }}
            >
              {domainForm.icon}
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              {editMode ? `Edit ${domainForm.name}` : "Create New Domain"}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Domain Name"
                fullWidth
                variant="outlined"
                value={domainForm.name}
                onChange={(e) =>
                  setDomainForm({ ...domainForm, name: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={domainForm.description}
                onChange={(e) =>
                  setDomainForm({
                    ...domainForm,
                    description: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Color Theme"
                fullWidth
                variant="outlined"
                value={domainForm.color}
                onChange={(e) =>
                  setDomainForm({
                    ...domainForm,
                    color: e.target.value,
                  })
                }
              >
                {colorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ColorOption color={option.value} />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Icon"
                fullWidth
                variant="outlined"
                value={domainForm.icon}
                onChange={(e) =>
                  setDomainForm({ ...domainForm, icon: e.target.value })
                }
              >
                {domainIconOptions.map((icon, index) => (
                  <MenuItem key={index} value={icon}>
                    <Box component="span" sx={{ fontSize: 20, mr: 1 }}>
                      {icon}
                    </Box>
                    <Box
                      component="span"
                      sx={{ fontSize: 12, color: "text.secondary" }}
                    >
                      {icon}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderRadius: "8px",
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDomainSubmit}
            variant="contained"
            disabled={!domainForm.name || loading}
            sx={{
              borderRadius: "8px",
              px: 3,
              background: `linear-gradient(135deg, ${domainForm.color}, ${domainForm.color}cc)`,
              "&:hover": {
                background: `linear-gradient(135deg, ${domainForm.color}, ${domainForm.color}dd)`,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : editMode ? (
              "Update Domain"
            ) : (
              "Create Domain"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog
        open={openStaffDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: `linear-gradient(135deg, #3a7bd5, #00d2ff)`,
            color: "white",
            py: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PeopleIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              Add New Staff Member
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Staff ID"
                fullWidth
                variant="outlined"
                value={staffForm.id}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, id: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Full Name"
                fullWidth
                variant="outlined"
                value={staffForm.name}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, name: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Email Address"
                fullWidth
                variant="outlined"
                type="email"
                value={staffForm.email}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, email: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                margin="dense"
                label="Position"
                fullWidth
                variant="outlined"
                value={staffForm.position}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, position: e.target.value })
                }
              >
                {positionOptions.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                margin="dense"
                label="Department"
                fullWidth
                variant="outlined"
                value={staffForm.departmentId}
                onChange={(e) =>
                  setStaffForm({ ...staffForm, departmentId: e.target.value })
                }
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box component="span" sx={{ color: dept.color }}>
                        {dept.icon}
                      </Box>
                      {dept.department}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: "8px", px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddStaff}
            variant="contained"
            disabled={!staffForm.id || !staffForm.name || loading}
            sx={{
              borderRadius: "8px",
              px: 3,
              background: `linear-gradient(135deg, #3a7bd5, #00d2ff)`,
              "&:hover": {
                background: `linear-gradient(135deg, #3a7bd5, #00d2ffcc)`,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Add Staff Member"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Intern Dialog */}
      <Dialog
        open={openInternDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: `linear-gradient(135deg, #11998e, #38ef7d)`,
            color: "white",
            py: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SchoolIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              Add New Intern
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Intern ID"
                fullWidth
                variant="outlined"
                value={internForm.id}
                onChange={(e) =>
                  setInternForm({ ...internForm, id: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Full Name"
                fullWidth
                variant="outlined"
                value={internForm.name}
                onChange={(e) =>
                  setInternForm({ ...internForm, name: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="University"
                fullWidth
                variant="outlined"
                value={internForm.university}
                onChange={(e) =>
                  setInternForm({ ...internForm, university: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Program/Field of Study"
                fullWidth
                variant="outlined"
                value={internForm.program}
                onChange={(e) =>
                  setInternForm({ ...internForm, program: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                margin="dense"
                label={viewMode === "departments" ? "Department" : "Domain"}
                fullWidth
                variant="outlined"
                value={internForm.departmentId}
                onChange={(e) =>
                  setInternForm({ ...internForm, departmentId: e.target.value })
                }
              >
                {viewMode === "departments"
                  ? departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box component="span" sx={{ color: dept.color }}>
                            {dept.icon}
                          </Box>
                          {dept.department}
                        </Box>
                      </MenuItem>
                    ))
                  : domains.map((domain) => (
                      <MenuItem key={domain.id} value={domain.id}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box component="span" sx={{ color: domain.color }}>
                            {domain.icon}
                          </Box>
                          {domain.domain}
                        </Box>
                      </MenuItem>
                    ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: "8px", px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddIntern}
            variant="contained"
            disabled={!internForm.id || !internForm.name || loading}
            sx={{
              borderRadius: "8px",
              px: 3,
              background: `linear-gradient(135deg, #11998e, #38ef7d)`,
              "&:hover": {
                background: `linear-gradient(135deg, #11998e, #38ef7dcc)`,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Add Intern"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            boxShadow: theme.shadows[6],
            alignItems: "center",
          }}
          variant="filled"
        >
          <Typography variant="subtitle2">{snackbar.message}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentManagement;