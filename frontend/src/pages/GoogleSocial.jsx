import {startTransition, useEffect, useState} from "react";
import {Navigate, useNavigate, useLocation} from "react-router-dom";
import {handleError} from "@lib/utils/service.js";
import {googleLoginService} from "@lib/services/authService.js";
import toast from "react-hot-toast";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Typography
} from "@mui/material";

export default function GoogleSocial() {
    const [accessToken, setAccessToken] = useAccessToken();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (token) => {
        try {
            const response = await googleLoginService(token);
            setAccessToken(response.access_token, null);
            toast.success("Successfully logged in.");
        } catch (e) {
            setError("Failed to log in with Google. Please try again.");
            handleError(e);
        } finally {
            window.history.replaceState(null, "", window.location.pathname);
            setLoading(false);
        }
    };

    useEffect(() => {
        // --- Step 1: Handle OAuth errors in query ---
        const queryParams = new URLSearchParams(location.search);
        const errorParam = queryParams.get("error");
        const errorDesc = queryParams.get("error_description");

        if (errorParam) {
            let friendlyMsg = "Google sign-in failed.";
            if (errorDesc) {
                friendlyMsg = decodeURIComponent(errorDesc);
            }

            setError(friendlyMsg);
            window.history.replaceState(null, "", window.location.pathname);
            return; // Stop here, don't process token
        }

        // --- Step 2: Check for token in hash ---
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const token = hashParams.get("access_token");

        if (token) {
            startTransition(() => {
                setLoading(true);
                handleLogin(token);
            });
        } else {
            setError("No login token was found. Please try signing in again.");
        }
    }, [location]);

    if (accessToken) {
        return <Navigate to="/" replace/>;
    }

    return (
        <Card elevation={0}>
            <CardHeader
                title="Google Sign In"
                titleTypographyProps={{
                    fontWeight: "bold",
                    fontSize: 42,
                    color: "primary",
                    textAlign: "center",
                }}
                sx={{paddingBottom: 2}}
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
                    {error && (
                        <>
                            <Alert severity="error">{error}</Alert>
                            <Button
                                variant="soft"
                                type={"button"}
                                fullWidth
                                onClick={() => navigate("/auth/login")}
                            >
                                Go Back
                            </Button>
                        </>
                    )}

                    {!error && (
                        <>
                            <Typography>
                                {loading
                                    ? "Verifying your Google account and signing you in..."
                                    : "Redirecting..."}
                            </Typography>
                            {loading && <CircularProgress color="primary"/>}
                        </>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
