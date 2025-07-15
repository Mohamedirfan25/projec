import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Container, Card, CardContent, Box, IconButton, Drawer, List, ListItem, ListItemText, styled, Grid } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LocationOnIcon from "@mui/icons-material/LocationOn"; // Added location icon
import MenuIcon from "@mui/icons-material/Menu";
import backgroundImage from '../assets/img.jpg'; // Ensure the path to your logo image is correct
import exampleImage from '../assets/emp.jpg'; // Path to your employee image
import documentImage from '../assets/web.png'; // Path to the new image for the "View Reports" feature
import vdart from '../assets/vdart.jpeg'; // Update the path according to your file
import teamImage from '../assets/team.png'; // Path to the team image
import team2 from '../assets/team2.jpg'; // Second background image
import team3 from '../assets/team3.jpg'; // Third background image
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import newImage from '../assets/newImage.jpg';
import './AboutUs1';
import ContactUs1 from '../components/ContactUs1';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import gmap from '../assets/gmap.jpg'; // Add the path to your new image for the left side of the Google Map section

const backgroundImages = [backgroundImage, team2, team3];

// Define the Header component
const Header = styled(AppBar)(({ theme, navbarColor }) => ({
  background: navbarColor,
  transition: "0.3s",
  boxShadow: "none", // Remove the box shadow (border-like effect)
}));

const HeroSection = styled(Box)(({ theme, currentImage }) => ({
  position: "relative",
  width: "100%",
  minHeight: "100vh",
  backgroundImage: `url(${backgroundImages[currentImage]})`,
  backgroundSize: "cover",
  backgroundAttachment: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#f0f0f0",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "50px",
    background: "linear-gradient(to bottom, transparent 10%, rgba(255, 255, 255, 0.5) 50%, rgb(255, 255, 255) 100%)",
    zIndex: 1,
  },
}));

const ArrowButton = styled(IconButton)({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  color: "white",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
});

const DotsContainer = styled(Box)({
  position: "absolute",
  bottom: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: "10px",
});

const Dot = styled(Box)(({ active }) => ({
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: active ? "white" : "gray",
  cursor: "pointer",
}));

const HeroOverlay = styled(Box)(({ theme }) => ({
  width: "40%",
  height: "300px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "10px",
  zIndex: 2, // Ensures it appears above the image
  marginLeft: "50%",
  borderRadius: "2%",
  backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent dark overlay
  color: "white", // White text for better visibility
}));

const GridContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '100px',
  flexWrap: 'nowrap',
  marginTop: '150px',
});

const FeatureCard = styled(Card)({
  width: '35%', // Adjusted to take up more space
  textAlign: 'center',
  padding: '20px',
  background: 'white',
  borderRadius: '10px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)', // Box shadow
  transition: '0.3s ease-in-out',

  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.3)', // Hover shadow
  }
});

const Footer = styled(Box)({
  width: '100%',
  background: 'rgb(214, 220, 255)', // Same color as the navigation bar
  color: 'black',
  textAlign: 'center',
  padding: '20px 0',
  marginTop: '50px',
  position: 'relative'
});

const WhiteCard = styled(Card)({
  backgroundColor: "white",
  color: "black",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
});

const theme = createTheme({
  palette: {
    primary: { main: "#2E3B55" },
    secondary: { main: "#F50057" },
  },
});

const InternHomePage = () => {
  const [navbarColor, setNavbarColor] = useState("transparent");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavbarColor("#2E3B55"); // Same color as the footer
      } else {
        setNavbarColor("transparent");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 3000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
  };

  const handlePrevious = () => {
    setCurrentImage((prev) => (prev - 1 + backgroundImages.length) % backgroundImages.length);
  };

  const handleDotClick = (index) => {
    setCurrentImage(index);
  };

  return (
    <ThemeProvider theme={theme}>
      {/* Navbar */}
      <Header position="absolute" navbarColor={navbarColor}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <img
              src={vdart}
              alt="Vdart Logo"
              style={{
                height: "45px",
                marginRight: "30px",
                filter: "drop-shadow(0px 0px 10px rgba(255, 255, 255, 1)) drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.9))",
              }}
            />
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {[
              { label: "About Us", path: "/AboutUs" },
              { label: "Contact Us", path: "/ContactUs" },
            ].map((item, index) => (
              <Button 
                key={index} 
                component={Link} // Use Link for all navigation items
                to={item.path} // Navigate to corresponding page
                color="inherit" 
                sx={{ 
                  "&:hover": {
                    backgroundColor: '#F50057',
                    color: 'white'
                  },
                  marginLeft: '10px',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <IconButton
            sx={{ display: { xs: "block", md: "none" } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Header>

      {/* Mobile Drawer Menu */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List>
          {["Home", "About Us", "Contact Us"].map((text, index) => (
            <ListItem button key={index} onClick={() => setDrawerOpen(false)}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Hero Section */}
      <HeroSection currentImage={currentImage}>
        {/* Left Arrow */}
        <ArrowButton
          onClick={handlePrevious}
          sx={{ left: "20px" }}
        >
          <ArrowBackIosIcon />
        </ArrowButton>

        {/* Right Arrow */}
        <ArrowButton
          onClick={handleNext}
          sx={{ right: "20px" }}
        >
          <ArrowForwardIosIcon />
        </ArrowButton>

        {/* HeroOverlay Component */}
        <HeroOverlay currentImage={currentImage}>
          <Typography variant="h4" gutterBottom>
            Internship Management Platform
          </Typography>
          <Typography variant="h6" paragraph>
            Track Progress. Boost Performance. Achieve More.
          </Typography>
          <Button
            variant="contained"
            href="/LoginPage"
            sx={{
              display: 'inline-block',
              padding: '10px 25px',
              border: '2px solid white',
              borderRadius: '5px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              transition: '0.3s ease-in-out',
              marginTop: "5%",
              '&:hover': {
                background: 'rgb(20, 19, 19)',
                color: 'lightgray',
              }
            }}
          >
            Get Started
          </Button>
        </HeroOverlay>

        {/* Dots for Navigation */}
        <DotsContainer>
          {backgroundImages.map((_, index) => (
            <Dot
              key={index}
              active={index === currentImage}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </DotsContainer>
      </HeroSection>

      {/* Image and Message Section */}
      <Container>
        <Grid container spacing={4} sx={{ alignItems: 'stretch', marginTop: '40px' }}>
          {/* Left Column: Team Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={teamImage}
                alt="Team"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '10px',
                  objectFit: 'cover',
                }}
              />
            </Box>
          </Grid>

          {/* Right Column: Message */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h4" gutterBottom>
                Intern Management System
              </Typography>
              <Typography variant="body1" paragraph>
                The Intern Management System is a comprehensive platform designed to track attendance, monitor performance, manage payments, streamline task assignments, and oversee every aspect of the internship process. It ensures efficient evaluation, seamless communication, and enhanced productivity, creating a structured and rewarding experience for both interns and organizations.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* New Section: White Card and Image */}
      <Container sx={{ marginTop: '80px', marginBottom: '40px', position: 'relative' }}>
        <Grid container spacing={4} sx={{ alignItems: 'center', position: 'relative' }}>
          {/* Right Column: Image with Gradient */}
          <Grid item xs={12} md={12}>
            <Box
              sx={{
                position: 'relative',
                width: '50%', // Expanded left
                marginLeft: '50%', // Moves left
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transform: 'translateY(20px)', // Moves slightly downward
              }}
            >
              {/* Background Image */}
              <img
                src={newImage}
                alt="New Section"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '10px',
                  objectFit: 'cover',
                }}
              />

              {/* Gradient Overlay (Left-Side Fade) */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '40%', // Covers left side
                  height: '100%',
                  background: 'linear-gradient(to right, white 0%, transparent 50%)',
                  borderRadius: '10px',
                }}
              />
            </Box>
          </Grid>

          {/* White Card Over Image */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: '30%',
              transform: 'translate(-50%, -40%)', // Slightly above center
              width: { xs: '90%', md: '50%' },
              zIndex: 2,
            }}
          >
            <WhiteCard>
              <CardContent>
                <Typography variant="h4" gutterBottom textAlign="center">
                  Internship Program
                </Typography>
                <Typography variant="body1" paragraph textAlign="center">
                  Our Intern Management System promotes teamwork, communication, and real-time collaboration, helping interns coordinate tasks, track progress, and grow professionally.
                </Typography>
              </CardContent>
            </WhiteCard>
          </Box>
        </Grid>
      </Container>

      {/* Two Cards Section */}
      <Container>
        <GridContainer>
          {[
            {
              title: "Talent Acquisition & Workforce Solutions",
              icon: <img src={exampleImage} alt="Feature" style={{ width: '100%', height: 'auto', borderRadius: '10px' }} />,
              desc: "We illuminate digital transformation, empowering businesses with top talent, innovative solutions, advanced technologies, seamless integration, and sustainability..."
            },
            {
              title: "Advanced Digital Solutions",
              icon: <img src={documentImage} alt="Feature" style={{ width: '100%', height: 'auto', borderRadius: '10px' }} />,
              desc: "Dimiour, our specialized digital solutions division, delivers innovative, scalable, efficient, customized, and cutting-edge services that empower businesses to transform, grow, and stay ahead in dynamic digital era..."
            },
          ].map((feature, index) => (
            <FeatureCard key={index}>
              <CardContent>
                <Box>{feature.icon}</Box>
                <Typography variant="h6">{feature.title}</Typography>
                <Typography color="textSecondary">{feature.desc}</Typography>
              </CardContent>
            </FeatureCard>
          ))}
        </GridContainer>
      </Container>
      {/* Google Map Section */}
            <Container sx={{ marginTop: '80px', marginBottom: '80px' }}>
              <Grid container spacing={4} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                <Grid item xs={12} md={8}>
                  <Card
                    sx={{
                      borderRadius: '10px',
                      overflow: 'hidden',
                      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                      width: '100%',
                      margin: '0 auto', // Center the card
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                        {/* Left Column: gmap Image */}
                        <Grid item xs={12} md={4}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              flexDirection: 'column',
                            }}
                          >
                            <img
                              src={gmap}
                              alt="Map Side Image"
                              style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '10px',
                                objectFit: 'cover',
                              }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                              <LocationOnIcon sx={{ color: 'black', marginRight: '10px' }} />
                              <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold' }}>
                                Location
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
      
                        {/* Right Column: Google Map */}
                        <Grid item xs={12} md={8}>
                          <div className="mapouter">
                            <div className="gmap_canvas">
                              <iframe
                                className="gmap_iframe"
                                width="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                src="https://maps.google.com/maps?width=600&amp;height=250&amp;hl=en&amp;q=VDart, 30, Chennai - Theni Hwy, Mannarpuram, Sangillyandapuram, Tiruchirappalli, Tamil Nadu 620020, India&amp;t=&amp;z=8&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                                style={{ borderRadius: '10px' }}
                              ></iframe>
                              <a href="https://embed-googlemap.com">embed google map</a>
                            </div>
                            <style>
                              {`
                                .mapouter {
                                  position: relative;
                                  text-align: right;
                                  width: 100%;
                                  height: 250px;
                                }
                                .gmap_canvas {
                                  overflow: hidden;
                                  background: none !important;
                                  width: 100%;
                                  height: 250px;
                                }
                                .gmap_iframe {
                                  height: 250px !important;
                                }
                              `}
                            </style>
                          </div>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Container>

      {/* Footer */}
      <Footer>
        <Typography variant="body1">Connect with us:</Typography>
        <div>
          <IconButton href="https://facebook.com" target="_blank" sx={{ color: "white" }}>
            <FacebookIcon />
          </IconButton>
          <IconButton href="https://twitter.com" target="_blank" sx={{ color: "white" }}>
            <TwitterIcon />
          </IconButton>
          <IconButton href="https://instagram.com" target="_blank" sx={{ color: "white" }}>
            <InstagramIcon />
          </IconButton>
        </div>
        <Typography variant="body2">© 2024 Intern Dashboard. All rights reserved.</Typography>
      </Footer>
    </ThemeProvider>
  );
};

export default InternHomePage;