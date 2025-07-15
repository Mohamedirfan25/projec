import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const ResetBody = styled("div")({
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#ffffff",
});

const ResetCard = styled(Card)({
  width: "500px",
  height: "500px",
  border: "1px solid #e0e0e0",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
  color: "#333333",
  borderRadius: "12px",
  padding: "30px 40px",
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
});

const GradientText = styled(Typography)({
  fontSize: "32px",
  fontWeight: "bold",
  backgroundImage: "linear-gradient(45deg, #1976d2, #1565c0)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  display: "inline-block",
});

function Recovery() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and Confirm password do not match.");
      return;
    }

    if (!isPasswordStrong(newPassword)) {
      setError(
        "New password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters."
      );
      return;
    }

    const storedEmail = localStorage.getItem("userEmail");
    const storedOtp = localStorage.getItem("userOTP");

    if (!storedEmail || !storedOtp) { 
      setError("❌ Missing email or OTP. Please restart the reset process.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/password-reset/update/",
        { email: storedEmail, otp: storedOtp, new_password: newPassword, confirm_password: confirmPassword }
      );

      console.log("✅ Password Updated Successfully:", response.data);
      alert("Password changed successfully!");

      localStorage.removeItem("userEmail");
      localStorage.removeItem("userOTP");

      navigate("/login");
    } catch (error) {
      console.error("❌ Error updating password:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Failed to update password.");
    }
  };

  const isPasswordStrong = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialCharacters = /[!@#$%^&*]/.test(password);
    const hasMinLength = password.length >= 8;
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialCharacters && hasMinLength;
  };

  const handleBackToLogin = () => {
    navigate('/LoginPage');
  };

  return (
    <ResetBody>
      <Container maxWidth="sm">
        <ResetCard>
          <CardContent>
            <GradientText variant="h4" align="center" gutterBottom>
              Password Recovery
            </GradientText>
            <Typography variant="subtitle1" color="textSecondary" align="center" sx={{ mt: 1.5, mb: 3 }}>
              Enter your new password to reset your account.
            </Typography>

            {error && (
              <Typography variant="body2" color="error" align="center" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mt: 2 }}
              InputLabelProps={{ style: { color: "#333333" } }}
              InputProps={{ style: { color: "#333333" } }}
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                background: "linear-gradient(to right, #1976d2, #1565c0)",
                transition: "0.3s",
                "&:hover": {
                  background: "linear-gradient(to right, #1565c0, #0d47a1)",
                  transform: "scale(1.06)",
                  boxShadow: "0px 5px 15px rgba(25, 118, 210, 0.5)",
                },
              }}
              onClick={handleSubmit}
            >
              Reset Password
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={handleBackToLogin}
              sx={{
                mt: 2,
                py: 1.5,
                fontWeight: "bold",
                borderRadius: "12px",
                borderColor: "#1976d2",
                color: "#1976d2",
                transition: "0.3s",
                "&:hover": {
                  borderColor: "#1565c0",
                  color: "#1565c0",
                  transform: "scale(1.06)",
                  boxShadow: "0px 5px 15px rgba(25, 118, 210, 0.3)",
                },
              }}
            >
              Back to Login
            </Button>
          </CardContent>
        </ResetCard>
      </Container>
    </ResetBody>
  );
}

export default Recovery;
