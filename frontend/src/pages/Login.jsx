import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Container,
    Divider,
    TextField,
    Typography,
    Link, InputAdornment, IconButton, CircularProgress
} from "@mui/material";
import {Facebook, Google, Visibility, VisibilityOff} from "@mui/icons-material";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import {useRef, useState} from "react";
import {loginService} from "@lib/services/authService.js";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import {logout} from "@lib/utils/auth.js";

const Login = () => {
    const [accessToken, setAccessToken] = useAccessToken()
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState({email: false, password: false})
    const [errorMessages, setErrorMessages] = useState({email: "", password: "", general: ""});
    const [loading, setLoading] = useState(false)
    const emailRef = useRef()
    const passwordRef = useRef()
    const navigate = useNavigate()
    const handleClickShowPassword = () => {
        setShowPassword(prevState => !prevState)
    }
    const handleResetErrors = () => {
        setErrors({email: false, password: false})
    }

    const handleLogin = async () => {
        handleResetErrors();
        const prepData = {
            email: emailRef.current.value,
            password: passwordRef.current.value,
        };

        if (!prepData.email) {
            setErrors(prevState => ({...prevState, email: true}));
            setErrorMessages(prevState => ({...prevState, email: "This field cannot be empty."}));
            return;
        }
        if (!prepData.password) {
            setErrors(prevState => ({...prevState, password: true}));
            setErrorMessages(prevState => ({...prevState, password: "This field cannot be empty."}));
            return;
        }

        setLoading(true);
        try {
            const response = await loginService(prepData);
            setAccessToken(response.access_token, null)
            navigate("/")
        } catch (error) {
            console.error("Login failed:", error);
            setErrorMessages(prevState => ({...prevState, general: error.message}));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        handleLogin()
    }

    const handleLogout = () => {
        logout()
        navigate("/auth/login");
    };

    if (accessToken) {
        return (
            <Container className={"center-container"} maxWidth={"sm"}>
                <Card sx={{boxShadow: "unset"}}>
                    <CardHeader
                        title={"You Are Already Signed In"}
                        titleTypographyProps={{fontWeight: "bold", fontSize: 42}}
                        subheader={"You are already logged into your account."}
                    />
                    <CardContent>
                        <Box sx={boxStyles}>
                            <Button
                                variant={"contained"}
                                onClick={() => navigate("/")}
                                fullWidth
                            >
                                Go to Dashboard
                            </Button>
                            <Button
                                variant={"outlined"}
                                onClick={handleLogout} fullWidth
                            >
                                Log Out
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container className={"center-container"} maxWidth={"sm"}>
            <Card sx={{boxShadow: 1}}>
                <CardHeader
                    title={"Sign In"}
                    titleTypographyProps={{fontWeight: "bold", fontSize: 42}}
                    subheader={"sign in to your account to continue using platform"}
                />
                <CardContent>
                    <Box sx={boxStyles} component={"form"} onSubmit={handleSubmit}>
                        <TextField type={"email"} id={"id_email"} name={"email"} variant={"outlined"} label={"Email"}
                                   placeholder={"please enter your email address"}
                                   fullWidth inputRef={emailRef} error={errors.email}
                                   helperText={errorMessages.email}
                                   required
                        />
                        <TextField type={showPassword ? "text" : "password"} id={"id_password"} name={"password"}
                                   placeholder={"********"}
                                   variant={"outlined"}
                                   label={"Password"}
                                   inputRef={passwordRef}
                                   fullWidth
                                   error={errors.password}
                                   helperText={errorMessages.password}
                                   required
                                   InputProps={{
                                       endAdornment:
                                           <InputAdornment position="end">
                                               <IconButton
                                                   aria-label="toggle password visibility"
                                                   onClick={handleClickShowPassword}
                                                   edge="end"
                                               >
                                                   {showPassword ? <VisibilityOff/> : <Visibility/>}
                                               </IconButton>
                                           </InputAdornment>
                                   }}
                        />
                        <Link to={"/auth/forget-password/"} component={RouterLink} color={"secondary"}>forget your
                            password ?</Link>
                        <Button variant={"contained"} type={"submit"}>
                            {loading ? <CircularProgress color={"background"} size={25}/> : "Sign In"}
                        </Button>
                        <Divider>OR</Divider>
                        <Box sx={{maxWidth: "450px"}}>
                            <Button variant={"soft"} fullWidth
                                    sx={{justifyContent: "flex-start", textTransform: "unset"}}>
                                <Google sx={{mx: 1}}/>
                                <Typography variant={"body1"} fontWeight={"bold"}>Continue with Google</Typography>
                            </Button>
                            <Button variant={"soft"} fullWidth
                                    sx={{my: 2, justifyContent: "flex-start", textTransform: "unset"}}>
                                <Facebook sx={{mx: 1}}/>
                                <Typography variant={"body1"} fontWeight={"bold"}>Continue with Facebook
                                    account</Typography>
                            </Button>
                        </Box>

                    </Box>
                </CardContent>
            </Card>
        </Container>
    )
}


const boxStyles = {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: {xs: "100%", lg: "400px", xl: "400px"},
}


export default Login