import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Avatar, 
  Button, 
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Tooltip,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  FormControl,
  Divider
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  Wc as GenderIcon, 
  Schedule as ScheduleIcon, 
  CalendarToday as CalendarIcon, 
  Person as PersonIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 12px 28px rgba(0, 0, 0, 0.12)'
  }
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: 'auto',
  border: '4px solid #ffffff',
  boxShadow: theme.shadows[3]
}));

const DetailItem = ({ icon, label, value }) => (
  <Grid item xs={12} sm={6}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ color: 'primary.main', mr: 1 }}>{icon}</Box>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
      {value}
    </Typography>
  </Grid>
);


const AdminProfile = () => {
  const [open, setOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    emp_id: '',
    user: '',
    phone_no: '',
    aadhar_number: '',
    gender: '',
    created_date: '',
    updated_date: '',
    start_date: '',
    shift_timing: '',
    department: '',
    domain: '',
    email: '',
    photo: ''
  });
  
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
  
        // Fetch user-data
        const userDataResponse = await axios.get('http://localhost:8000/Sims/user-data/0/', {
          headers: { Authorization: `Token ${token}` }
        });
  
        // Fetch personal-data
        const personalDataResponse = await axios.get('http://localhost:8000/Sims/personal-data/0/', {
          headers: { Authorization: `Token ${token}` }
        });
  
        const userData = userDataResponse.data;
        const personalData = personalDataResponse.data;
  
        setFormData({
          id: userData.id || '',
          emp_id: userData.emp_id || userData.temp_details?.emp_id || '',
          user: userData.username || '',
          phone_no: personalData.phone_no || '',
          aadhar_number: personalData.aadhar_number || '',
          gender: personalData.gender || '',
          created_date: userData.temp_details?.created_date || '',
          updated_date: userData.temp_details?.updated_date || '',
          start_date: userData.start_date || '',
          shift_timing: userData.shift_timing || '',
          department: userData.department || '',
          domain: userData.domain || '',
          email: personalData.email || '',
          photo: personalData.photo || ''
        });
  
        // Also set profile image if available
        if (personalData.photo) {
          setProfileImage(`http://localhost:8000${personalData.photo}`); 
          // Assuming the photo is served by your Django server
        }
  
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      }
    };
  
    fetchAdminData();
  }, []);
  
  const [profileImage, setProfileImage] = useState('/static/images/avatar/admin.png');

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleGenderChange = (e) => {
    setFormData(prev => ({ ...prev, gender: e.target.value }));
  };

  const handleEmailClick = () => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=first@vdartinc.com&su=Regarding Admin Profile&body=Hello Admin,`);
  };

  const handleCalendarClick = () => {
    setCurrentDateTime(new Date().toLocaleString());
    setTimeout(() => setCurrentDateTime(''), 3000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setProfileImage(event.target.result);
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, photo: file.name }));
    }
  };
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
  
      // Update user-data
      await axios.put('http://localhost:8000/Sims/user-data/0/', {
        start_date: formData.start_date,
        shift_timing: formData.shift_timing,
        department: formData.department,
        domain: formData.domain,
        user_status: formData.user_status
        // add more fields if needed
      }, {
        headers: { Authorization: `Token ${token}` }
      });
  
      // Update personal-data
      await axios.put('http://localhost:8000/Sims/personal-data/0/', {
        phone_no: formData.phone_no,
        aadhar_number: formData.aadhar_number,
        gender: formData.gender,
        email: formData.email
        // add more fields if needed
      }, {
        headers: { Authorization: `Token ${token}` }
      });
  
      alert('Profile updated successfully!');
      setOpen(false);  // Close dialog
      window.location.reload();  // (Optional) Hard reload to see changes instantly
  
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 4, 
      padding: 4,
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      {/* Profile Card */}
      <StyledCard sx={{ width: 320 }}>
        <CardContent sx={{ textAlign: 'center', pt: 4 }}>
        <ProfileAvatar alt="Admin" src={profileImage} />

          
          <Typography variant="h6" sx={{ 
            mt: 2, 
            mb: 0.5, 
            color: 'text.primary',
            fontWeight: 600
          }}>
            {formData.user}
          </Typography>
          
          <Button variant="contained" size="small" sx={{ 
            borderRadius: 20,
            px: 2,
            textTransform: 'none',
            fontWeight: 600,
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}>
            Administrator
          </Button>
          
          <Typography variant="body2" sx={{ 
            mt: 1.5, 
            color: 'text.secondary',
            fontSize: 14
          }}>
            IT Department
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 1.5, 
            mt: 3,
            mb: 1
          }}>
            <Tooltip title="Email: first@vdartinc.com">
              <IconButton onClick={handleEmailClick} sx={{ 
                backgroundColor: 'rgba(212, 70, 56, 0.1)',
                '&:hover': { backgroundColor: 'rgba(212, 70, 56, 0.2)' }
              }}>
                <EmailIcon sx={{ color: '#D44638' }} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={`Phone: ${formData.phone_no}`}>
              <IconButton sx={{ 
                backgroundColor: 'rgba(52, 183, 241, 0.1)',
                '&:hover': { backgroundColor: 'rgba(52, 183, 241, 0.2)' }
              }}>
                <PhoneIcon sx={{ color: '#34B7F1' }} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={currentDateTime || 'Click to see current date/time'}>
              <IconButton onClick={handleCalendarClick} sx={{ 
                backgroundColor: 'rgba(11, 128, 67, 0.1)',
                '&:hover': { backgroundColor: 'rgba(11, 128, 67, 0.2)' }
              }}>
                <CalendarIcon sx={{ color: '#0B8043' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </StyledCard>

      {/* Details Card */}
      <StyledCard sx={{ flex: 1 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ 
            color: 'text.primary',
            fontWeight: 600,
            mb: 3
          }}>
            Profile Details
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
          <DetailItem label="Employee ID" value={formData.emp_id} />
<DetailItem label="Username" value={formData.user} />
<DetailItem label="Phone" value={formData.phone_no || "Not Available"} />
<DetailItem label="Aadhar Number" value={formData.aadhar_number || "Not Available"} />
<DetailItem label="Gender" value={formData.gender ? (formData.gender === 'male' ? 'Male' : 'Female') : "Not Available"} />
<DetailItem label="Email" value={formData.email || "Not Available"} />
<DetailItem label="Department" value={formData.department || "Not Available"} />
<DetailItem label="Domain" value={formData.domain || "Not Available"} />
<DetailItem label="Shift Timing" value={formData.shift_timing || "Not Available"} />
<DetailItem label="Start Date" value={formData.start_date || "Not Available"} />

          </Grid>

          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleClickOpen}
              sx={{ 
                borderRadius: 20,
                px: 3,
                textTransform: 'none',
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  borderColor: 'primary.dark'
                }
              }}
            >
              Edit Profile
            </Button>
          </Box>
        </CardContent>
      </StyledCard>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'text.primary',
          fontWeight: 600,
          fontSize: 20,
          pt: 3,
          pb: 1
        }}>
          Edit Profile Information
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText sx={{ 
            color: 'text.secondary',
            mb: 3,
            fontSize: 14
          }}>
            Update your personal and professional details
          </DialogContentText>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                id="id"
                label="ID"
                value={formData.id}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                id="emp_id"
                label="Employee ID"
                value={formData.emp_id}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                id="user"
                label="Username"
                value={formData.user}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                id="phone_no"
                label="Phone Number"
                value={formData.phone_no}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                id="aadhar_number"
                label="Aadhar Number"
                value={formData.aadhar_number}
                onChange={handleChange}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel component="legend" sx={{ 
                  color: 'text.secondary',
                  fontSize: 14,
                  mb: 1
                }}>
                  Gender
                </FormLabel>
                <RadioGroup 
                  row 
                  value={formData.gender} 
                  onChange={handleGenderChange}
                >
                  <FormControlLabel 
                    value="male" 
                    control={<Radio size="small" />} 
                    label="Male" 
                  />
                  <FormControlLabel 
                    value="female" 
                    control={<Radio size="small" />} 
                    label="Female" 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ 
                    mt: 1,
                    borderRadius: 20,
                    px: 3,
                    textTransform: 'none'
                  }}
                >
                  Upload New Photo
                </Button>
              </label>
              {formData.photo && (
                <Typography variant="caption" sx={{ 
                  display: 'block',
                  mt: 1,
                  color: 'text.secondary'
                }}>
                  Selected: {formData.photo}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                id="created_date"
                label="Created Date"
                type="date"
                value={formData.created_date}
                onChange={handleChange}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                id="updated_date"
                label="Updated Date"
                type="date"
                value={formData.updated_date}
                onChange={handleChange}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3,
          py: 2
        }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              borderRadius: 20,
              px: 3,
              textTransform: 'none',
              color: 'text.secondary'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            sx={{ 
              borderRadius: 20,
              px: 3,
              textTransform: 'none',
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProfile;