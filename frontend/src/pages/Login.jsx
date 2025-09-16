import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Divider,
    TextField,
    Typography,
    Link, InputAdornment, IconButton, CircularProgress
} from "@mui/material";
import {Facebook, Google, Visibility, VisibilityOff} from "@mui/icons-material";
import {Link as RouterLink, Navigate} from "react-router-dom";
import {useRef, useState} from "react";
import {loginService} from "@lib/services/authService.js";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import toast from "react-hot-toast";
import {handleError} from "@lib/utils/service.js";
import {SOCIAL_GOOGLE_PUBLIC_KEY} from "@src/conf/index.js";

const Login = () => {
    const [accessToken, setAccessToken] = useAccessToken()
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState({email: false, password: false})
    const [errorMessages, setErrorMessages] = useState({email: "", password: "", general: ""});
    const [loading, setLoading] = useState(false)
    const emailRef = useRef()
    const passwordRef = useRef()
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
            toast.success("Welcome back.")
        } catch (error) {
            setErrorMessages(prevState => ({...prevState, general: error?.error}));
            handleError(error)
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const redirectUri = `${window.location.origin}/auth/social/google/`;
        const scope = encodeURIComponent("openid email profile");
        window.location.href =
            `https://accounts.google.com/o/oauth2/v2/auth` +
            `?client_id=${SOCIAL_GOOGLE_PUBLIC_KEY}` +
            `&redirect_uri=${redirectUri}` +
            `&response_type=token` +   // <-- gives access_token
            `&scope=${scope}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        handleLogin()
    }


    if (accessToken) {
        return <Navigate to={"/"} replace={true}/>
    }

    return (
        <Card elevation={0}>
            <CardHeader
                title="Sign In"
                titleTypographyProps={{
                    fontWeight: "bold",
                    fontSize: 42,
                    color: "primary",
                    textAlign: "center",
                }}
                subheader="Sign in to your account to continue."
                subheaderTypographyProps={{
                    fontSize: 16,
                    color: "textSecondary",
                    textAlign: "center",
                }}
                sx={{paddingBottom: 2}}
            />

            <CardContent>
                <Box sx={boxStyles} component={"form"} onSubmit={handleSubmit}>
                    <TextField type={"email"} id={"id_email"} name={"email"} label={"Email"}
                               placeholder={"Write your email address here..."}
                               fullWidth inputRef={emailRef} error={errors.email}
                               helperText={errorMessages.email}
                               required
                    />
                    <TextField type={showPassword ? "text" : "password"} id={"id_password"} name={"password"}
                               placeholder={"********"}
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
                    <Link to={"/auth/forget-password/"} component={RouterLink} color={"textSecondary"}>
                        forget your password ?
                    </Link>
                    <Button variant={"soft"} type={"submit"}>
                        {loading ? <CircularProgress color={"primary"} size={25}/> : "Sign In"}
                    </Button>
                    <Divider>OR</Divider>
                    <Box sx={{maxWidth: "450px"}}>
                        <Button variant={"soft"} color={"grey"} fullWidth onClick={handleGoogleLogin}
                                sx={{my: 2, justifyContent: "flex-start", textTransform: "unset"}}>
                            <Google sx={{mx: 1}}/>
                            <Typography variant={"body1"} fontWeight={"bold"}>Continue with Google</Typography>
                        </Button>
                        <Button variant={"soft"} color={"grey"} fullWidth
                                sx={{my: 2, justifyContent: "flex-start", textTransform: "unset"}}>
                            <Facebook sx={{mx: 1}}/>
                            <Typography variant={"body1"} fontWeight={"bold"}>Continue with Facebook</Typography>
                        </Button>
                    </Box>
                    <Link to={"/auth/register/"} component={RouterLink} color={"textSecondary"}>
                        Dont have an account ? <strong>create one here.</strong>
                    </Link>

                </Box>
            </CardContent>
        </Card>
    )
}


const boxStyles = {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    minWidth: {xs: "100%", lg: "400px", xl: "400px"},
}


export default Login