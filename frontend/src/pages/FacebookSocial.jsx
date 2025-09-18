import {useEffect, useState} from "react";
import {Navigate, useNavigate} from "react-router-dom";
import {handleError} from "@lib/utils/service.js";
import {facebookLoginService} from "@lib/services/authService.js";
import toast from "react-hot-toast";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import {Alert, Box, Card, CardContent, CardHeader, CircularProgress, Typography} from "@mui/material";

export default function FacebookSocial() {
    const [accessToken, setAccessToken] = useAccessToken()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (token) => {
        try {
            const response = await facebookLoginService(token)
            setAccessToken(response.access_token, null)
            toast.success("Successfully logged in.")
        } catch (e) {
            setError("Failed to log in with Facebook. Please try again.");
            handleError(e)
            // navigate("/auth/login/");
        } finally {
            window.history.replaceState(null, "", window.location.pathname);
            setLoading(false)
        }
    }

    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get("access_token");
        if (accessToken) {
            setLoading(true)
            handleLogin(accessToken)
        } else {
            // navigate("/auth/login/");
        }
    }, [navigate]);

    if (accessToken) {
        return <Navigate to={"/"} replace={true}/>
    }

    return <Card elevation={0}>
        <CardHeader
            title="Facebook Sign In"
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
                {error && <Alert severity="error">{error}</Alert>}
                <Typography>
                    {loading
                        ? "Verifying your facebook account and signing you in..."
                        : "Redirecting..."}
                </Typography>
                {loading && <CircularProgress color="primary"/>}
            </Box>
        </CardContent>
    </Card>
}
