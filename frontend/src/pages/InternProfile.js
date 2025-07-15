import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  IconButton,
  Input,
  Dialog,
  DialogTitle, 
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import Cropper from 'react-easy-crop';
import axios from "axios";

const InternProfile = ({ personalInfo, onPhotoUpdate }) => {
  const [intern, setIntern] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [cropBoxVisible, setCropBoxVisible] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [image, setImage] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [temp, setTemp] = useState(null);
 
  useEffect(() => {    
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = await axios.get("http://localhost:8000/Sims/user-data/", {
          headers: { Authorization: `Token ${token}` },
        });
        setIntern(userData.data); 

        const personalData = await axios.get("http://localhost:8000/Sims/personal-data/", {
          headers: { Authorization: `Token ${token}` },
        });
        setPersonal(personalData.data);

        const tempData = await axios.get("http://localhost:8000/Sims/temps/", {
          headers: { Authorization: `Token ${token}` },
        });
        setTemp(tempData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setCropBoxVisible(true);
    }
  };

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        p: 3,
      }}
    >
      <Grid container spacing={0} sx={{ maxWidth: '80vw', gap: '2%' }}>
        {/* Profile Card */}
        <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pr: '3px' }}>
          <Card elevation={4} sx={{ width: '100%', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderRadius: '12px', border: '1px solid #ccc' }}>
            <CardContent>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={newPhoto || personalInfo?.photo || "/static/images/avatar/1.jpg"}
                  sx={{ width: 100, height: 100, boxShadow: '0px 4px 10px rgba(0,0,0,0.2)', margin: '0 auto' }}
                />
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, mt: 2 }}>
                {intern ? intern.username : "Loading..."}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#FFB300', mb: 1 }}>
                {intern ? intern.domain : "Loading..."}
              </Typography>
              <Typography variant="body2" sx={{ color: 'gray' }}>
                ID: {intern ? intern.emp_id : "Loading..."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Details Card */}
        <Grid item xs={8} sx={{ display: 'flex', alignItems: 'center' }}>
          <Card elevation={4} sx={{ width: '100%', height: '420px', borderRadius: '12px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', padding: '20px' }}>
            <CardContent sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                {[
                  { label: "Intern ID", value: intern?.emp_id },
                  { label: "Intern Name", value: intern?.username },
                  { label: "Phone Number", value: personal?.phone_no },
                  { label: "Role", value: temp?.role },
                  { label: "Asset ID", value: intern?.asset_code },
                  { label: "Date of Birth", value: personal?.date_of_birth },
                  { label: "Joining Date", value: intern?.start_date },
                  { label: "Ending Date", value: intern?.end_date },
                  { label: "Mentor", value: intern?.reporting_supervisor_username },
                ].map((field, idx) => (
                  <Grid item xs={idx === 8 ? 12 : 6} key={field.label}>
                    <fieldset style={{ border: '1px solid #ccc', padding: '8px 12px', borderRadius: '5px' }}>
                      <legend style={{ fontSize: '12px', fontWeight: 'bold' }}>{field.label}</legend>
                      <Typography variant="body1">{field.value || "Loading..."}</Typography>
                    </fieldset>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default InternProfile;
