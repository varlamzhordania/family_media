import { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { handleError } from "@lib/utils/service.js";
import { facebookLoginService } from "@lib/services/authService.js";
import toast from "react-hot-toast";
import { useAccessToken } from "@lib/hooks/useToken.jsx";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography
} from "@mui/material";

export default function FacebookSocial() {
  const [accessToken, setAccessToken] = useAccessToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (token) => {
    try {
      const response = await facebookLoginService(token);
      setAccessToken(response.access_token, null);
      toast.success("Successfully logged in.");
    } catch (e) {
      setError("Failed to log in with Facebook. Please try again.");
      handleError(e);
    } finally {
      window.history.replaceState(null, "", window.location.pathname);
      setLoading(false);
    }
  };

  useEffect(() => {
    // --- Step 1: Check for OAuth errors in query ---
    const queryParams = new URLSearchParams(location.search);
    const errorParam = queryParams.get("error");
    const errorDesc = queryParams.get("error_description");
    const errorReason = queryParams.get("error_reason");

    if (errorParam) {
      // Example: access_denied, user_denied, etc.
      let friendlyMsg = "Facebook sign-in failed.";
      if (errorReason === "user_denied") {
        friendlyMsg = "You cancelled the Facebook login process.";
      } else if (errorDesc) {
        friendlyMsg = decodeURIComponent(errorDesc);
      }

      setError(friendlyMsg);
      window.history.replaceState(null, "", window.location.pathname);
      return; // Don't try to process access_token if there's an error
    }

    // --- Step 2: Otherwise, check for access token in hash ---
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const token = hashParams.get("access_token");
    if (token) {
      setLoading(true);
      handleLogin(token);
    } else {
      // Optional: navigate("/auth/login/");
    }
  }, [location]);

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <Card elevation={0}>
      <CardHeader
        title="Facebook Sign In"
        titleTypographyProps={{
          fontWeight: "bold",
          fontSize: 42,
          color: "primary",
          textAlign: "center",
        }}
        sx={{ paddingBottom: 2 }}
      />
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          <Typography>
            {loading
              ? "Verifying your Facebook account and signing you in..."
              : "Redirecting..."}
          </Typography>
          {loading && <CircularProgress color="primary" />}
        </Box>
      </CardContent>
    </Card>
  );
}
