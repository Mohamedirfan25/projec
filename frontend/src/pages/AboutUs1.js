import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Avatar, Box } from '@mui/material';
import { People, School, Work, Code, Dashboard, Analytics } from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import AboutImage from '../assets/About.png'; // Import the image

// Keyframe for hover animation
const hoverAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const AboutUs = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        About Smart Intern Management System
      </Typography>
      <Typography variant="h6" align="center" color="textSecondary" paragraph>
        Empowering the future of internships with advanced technology and innovative solutions.
      </Typography>

      {/* Feature Cards with Hover and Shadow Effects */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {[
          { icon: <People />, title: 'Streamlined Intern Onboarding', description: 'Simplify the onboarding process for interns.', color: 'primary.main' },
          { icon: <School />, title: 'Educational Integration', description: 'Integrate with educational institutions for seamless tracking.', color: 'secondary.main' },
          { icon: <Work />, title: 'Real-World Experience', description: 'Provide hands-on experience with real-world projects.', color: 'success.main' },
          { icon: <Code />, title: 'Advanced Technology', description: 'Leverage cutting-edge technology for internship management.', color: 'error.main' },
        ].map((feature, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 4,
                  animation: `${hoverAnimation} 0.5s ease-in-out`,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: feature.color, mb: 1, width: 40, height: 40 }}>
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Image above the Mission Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <img
          src={AboutImage} // Use the imported image
          alt="Our Mission"
          style={{ width: '100%', maxWidth: '800px', height: 'auto', borderRadius: '8px' }}
        />
      </Box>

      {/* Mission Section */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Our Mission
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          To revolutionize the internship experience by providing a comprehensive platform that bridges the gap between education and industry.
        </Typography>
      </Box>

      {/* Why Choose Us Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Why Choose Us?
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[
            { icon: <Dashboard fontSize="medium" color="primary" />, title: 'Intuitive Dashboard', description: 'User-friendly interface for easy navigation and management.' },
            { icon: <Analytics fontSize="medium" color="secondary" />, title: 'Advanced Analytics', description: 'Gain insights with detailed analytics and reporting tools.' },
            { icon: <Code fontSize="medium" color="success" />, title: 'Custom Solutions', description: 'Tailored solutions to meet the unique needs of your organization.' },
          ].map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 4,
                  },
                }}
              >
                {feature.icon}
                <Typography variant="subtitle1" component="h3" gutterBottom sx={{ mt: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Advanced Features Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Advanced Features
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[
            { title: 'AI-Powered Matching', description: 'Match interns with the best-suited projects using AI algorithms.' },
            { title: 'Real-Time Collaboration', description: 'Enable real-time collaboration between interns and mentors.' },
            { title: 'Performance Tracking', description: 'Track intern performance with detailed metrics and feedback.' },
          ].map((feature, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 2,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 4,
                  },
                }}
              >
                <Typography variant="subtitle1" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default AboutUs;