import React from 'react';
import { Container, Typography, Box, Grid, Paper, Link } from '@mui/material';
import { Phone, Email, Fax, LocationOn } from '@mui/icons-material';

const ContactUs = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Updated Typography with blue color */}
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        align="center"
        sx={{ color: 'primary.main' }} // Set the color to blue
      >
        How can we help you?
      </Typography>
      <Typography variant="body1" paragraph align="center">
        <strong>We are here to assist you! If you have any inquiries or require support regarding the Smart Intern Management System, feel free to reach out to us.</strong>
      </Typography> 
      <Typography variant="body1" paragraph align="center">
        Our team is dedicated to providing you with the best experience. Whether you need guidance, have questions, or want to share feedback, we are happy to help.
      </Typography>

      <Box sx={{ my: 4 }}>
        <Grid container spacing={4}>
          {/* OUR MAIN OFFICE */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
              }}
            >
              <LocationOn sx={{ fontSize: 40, color: 'red' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                OUR MAIN OFFICE
              </Typography>
              <Typography variant="body1">
                30, Chennai – Theni Hwy<br />
                Mannarpuram, Sangillyandapuram<br />
                Tiruchirappalli, Tamil Nadu
                India 620020
              </Typography>
            </Paper>
          </Grid>

          {/* PHONE NUMBER */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
              }}
            >
              <Phone sx={{ fontSize: 40, color: 'green' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                PHONE NUMBER
              </Typography>
              <Typography variant="body1">
                0431- 4241441 (INDIA)<br />
                (678) 685-8650 (US)<br />
                (Toll Free)
              </Typography>
            </Paper>
          </Grid>

          {/* FAX */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
              }}
            >
              <Fax sx={{ fontSize: 40, color: 'green' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                FAX
              </Typography>
              <Typography variant="body1">
                (866) 431-2320
              </Typography>
            </Paper>
          </Grid>

          {/* EMAIL */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
              }}
            >
              <Email sx={{ fontSize: 40, color: 'red' }} />
              <Typography variant="h5" component="h2" gutterBottom>
                EMAIL
              </Typography>
              <Typography variant="body1">
                <Link href="mailto:csm@vdartinc.com" color="primary">
                  csm@vdartinc.com
                </Link>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ContactUs;