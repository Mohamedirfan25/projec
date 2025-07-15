import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ResetBody = styled("div")({
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#ffffff", // White background
});

const ResetCard = styled(Card)({
  width: "500px",
  minHeight: "400px",
  border: "1px solid #e0e0e0", // Light border
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Subtle shadow
  color: "#333333", // Dark text for contrast
  borderRadius: "12px",
  padding: "30px 40px",
  background: "#ffffff", // White card background
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
});

const GradientText = styled(Typography)({
  fontSize: "32px",
  fontWeight: "bold",
  backgroundImage: "linear-gradient(45deg, #1976d2, #1565c0)", // Professional blue gradient
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  display: "inline-block",
});

const OtpInput = styled(TextField)({
  width: "50px",
  height: "50px",
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#1976d2", // Blue border
    },
    "&:hover fieldset": {
      borderColor: "#1565c0", // Darker blue on hover
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0d47a1", // Dark blue on focus
    },
  },
  "& .MuiOutlinedInput-input": {
    textAlign: "center",
    fontSize: "20px",
    color: "#333333", // Dark text for contrast
  },
});

const Reset = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [showOtpFields, setShowOtpFields] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isResendVisible, setIsResendVisible] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (showOtpFields && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setIsResendVisible(true);
    }
  }, [showOtpFields, timer]);

  const validateEmail = (email) => {
    const emailRegex = /^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && !/^[A-Z]/.test(email);
  };

  const handleEmailChange = (event) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
    setIsEmailValid(validateEmail(newEmail));
  };

  const handleContinue = async () => {
    if (!isEmailValid) {
      alert("Please enter a valid email.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/Sims/password-reset/request/",
        { email }
      );

      console.log("OTP Request Response:", response.data);

      setShowOtpFields(true);
      setTimer(60);
      setIsResendVisible(false);
    } catch (error) {
      console.error("Error sending OTP:", error.response?.data || error.message);
      alert(error.response?.data.error || "Failed to send OTP");
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length < otp.length) {
      alert("Please enter the complete OTP.");
      return;
    }
 
    try {
      const response = await axios.post("http://localhost:8000/Sims/password-reset/verify/", {
        email,
        otp: enteredOtp,
        new_password: "NewSecurePassword123",
        confirm_password: "NewSecurePassword123",
      });

      console.log(response.data.message);
      alert("Password reset successfully!");
      navigate("/Recovery");
    } catch (error) {
      console.error("Error verifying OTP:", error.response?.data || error.message);
      alert(error.response?.data.error || "Invalid OTP or expired OTP");
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post("http://localhost:8000/Sims/password-reset/request/", {
        email,
      });
      setTimer(60);
      setIsResendVisible(false);
      console.log("New OTP sent to:", email);
    } catch (error) {
      console.error("Error resending OTP:", error.response?.data || error.message);
      alert(error.response?.data.error || "Failed to resend OTP");
    }
  };

  return (
    <ResetBody>
      <Container maxWidth="sm">
        <ResetCard>
          <CardContent>
            <GradientText variant="h4" align="center" gutterBottom>
              Forgot Password?
            </GradientText>
            <Typography variant="subtitle1" color="textSecondary" align="center" sx={{ mt: 1.5, mb: 3 }}>
              We will send you a One Time Password to this email address.
            </Typography>

            <TextField
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={handleEmailChange}
              error={email && !isEmailValid}
              helperText={
                email && !isEmailValid
                  ? "Please enter a valid email (must start with a lowercase letter)"
                  : ""
              }
              sx={{ mt: 2 }}
              InputLabelProps={{ style: { color: "#333333" } }}
              InputProps={{ style: { color: "#333333" } }}
            />

            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: "bold",
                borderRadius: "12px",
                background: "linear-gradient(to right, #1976d2, #1565c0)", // Professional blue gradient
                transition: "0.3s",
                "&:hover": {
                  background: "linear-gradient(to right, #1565c0, #0d47a1)",
                  transform: "scale(1.06)",
                  boxShadow: "0px 5px 15px rgba(25, 118, 210, 0.5)",
                },
              }}
              onClick={handleContinue}
              disabled={!isEmailValid}
            >
              Verify
            </Button>

            {showOtpFields && (
              <Box mt={4} textAlign="center">
                <Grid container justifyContent="center" spacing={2}>
                  {otp.map((digit, index) => (
                    <Grid item key={index}>
                      <OtpInput
                        inputRef={(ref) => (otpRefs.current[index] = ref)}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        disabled={isOtpSubmitted}
                        inputProps={{ maxLength: 1 }}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Typography sx={{ mt: 2, fontSize: "14px", fontWeight: "bold", color: timer < 10 ? "#d32f2f" : "#333333" }}>
                  {timer > 0 ? `Resend OTP in ${Math.floor(timer / 60)}:${timer % 60 < 10 ? `0${timer % 60}` : timer % 60}` : "OTP Expired"}
                </Typography>
                {isResendVisible && (
                  <Typography sx={{ mt: 2, textAlign: "center" }}>
                    Didn't receive the OTP?{" "}
                    <Button
                      variant="text"
                      onClick={handleResendOtp}
                      disabled={timer > 0}
                      sx={{
                        color: timer > 0 ? "#9e9e9e" : "#d32f2f",
                        fontWeight: "bold",
                        textDecoration: "underline",
                        "&:hover": { color: timer > 0 ? "#9e9e9e" : "#b71c1c" },
                      }}
                    >
                      Resend OTP
                    </Button>
                  </Typography>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 4,
                    py: 1.5,
                    fontWeight: "bold",
                    borderRadius: "12px",
                    background: "linear-gradient(to right, #1976d2, #1565c0)", // Professional blue gradient
                    transition: "0.3s",
                    "&:hover": {
                      background: "linear-gradient(to right, #1565c0, #0d47a1)",
                      transform: "scale(1.06)",
                      boxShadow: "0px 5px 15px rgba(25, 118, 210, 0.5)",
                    },
                  }}
                  onClick={handleSubmit}
                  disabled={isOtpSubmitted || otp.some((digit) => digit === "")}
                >
                  Submit
                </Button>


              </Box>
            )}
          </CardContent>
        </ResetCard>
      </Container>
    </ResetBody>
  );
};

export default Reset;