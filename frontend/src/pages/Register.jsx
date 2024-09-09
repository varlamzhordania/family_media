import {
    Box, Button,
    Card,
    CardContent,
    CardHeader, CircularProgress,
    Container,
    IconButton,
    InputAdornment,
    Link,
    TextField,
} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {Link as RouterLink, Navigate, useNavigate} from "react-router-dom";
import {useState} from "react";
import {handleError} from "@lib/utils/service.js";
import {createService, loginService} from "@lib/services/authService.js";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import toast from "react-hot-toast";

const Register = () => {
    const [accessToken, setAccessToken] = useAccessToken()
    const [data, setData] = useState({
        email: "",
        first_name: "",
        last_name: "",
        password1: "",
        password2: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleClickShowPassword = () => {
        setShowPassword(prevState => !prevState)
    }

    const handleChange = (e) => {
        const {name, value} = e.target
        setData(prevState => ({...prevState, [name]: value}))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const prepData = JSON.stringify(data)
            await createService(prepData)
            const loginResponse = await loginService({email: data.email, password: data.password1})
            setAccessToken(loginResponse.access_token, null)
            setLoading(false)
            toast.success("Welcome.")

        } catch (error) {
            handleError(error)
            setData(prevState => ({...prevState, password1: "", password2: ""}))
            setLoading(false)
        }
    }

    if (accessToken)
        return <Navigate to={"/"} replace={true}/>


    return (
            <Card elevation={0}>
                <CardHeader
                    title="Sign Up"
                    titleTypographyProps={{
                        fontWeight: "bold",
                        fontSize: 42,
                        color: "primary",
                        textAlign: "center",
                    }}
                    subheader="Create your account and start sharing moments."
                    subheaderTypographyProps={{
                        fontSize: 16,
                        color: "textSecondary",
                        textAlign: "center",
                    }}
                    sx={{paddingBottom: 2}}
                />
                <CardContent>
                    <Box sx={boxStyles} component={"form"} onSubmit={handleSubmit}>
                        <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"} gap={1}>
                            <TextField type={"text"} name={"first_name"} label={"First Name"}
                                       placeholder={"Write your first name here..."}
                                       value={data.first_name}
                                       onChange={handleChange}
                                       fullWidth
                                       required
                                       autoComplete={"off"}

                            />
                            <TextField type={"text"} name={"last_name"} label={"Last Name"}
                                       placeholder={"Write your last name here..."}
                                       value={data.last_name}
                                       onChange={handleChange}
                                       fullWidth
                                       required
                                       autoComplete={"off"}
                            />
                        </Box>
                        <TextField type={"email"} name={"email"} label={"Email"}
                                   placeholder={"Write your email address here..."}
                                   value={data.email}
                                   onChange={handleChange}
                                   fullWidth
                                   required
                        />
                        <TextField type={showPassword ? "text" : "password"} name={"password1"}
                                   placeholder={"********"}
                                   label={"Password"}
                                   fullWidth
                                   required
                                   autoComplete={"off"}
                                   value={data.password1}
                                   onChange={handleChange}
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
                        <TextField type={showPassword ? "text" : "password"} name={"password2"}
                                   placeholder={"********"}
                                   label={"Confirm Password"}
                                   fullWidth
                                   required
                                   autoComplete={"off"}
                                   value={data.password2}
                                   onChange={handleChange}
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
                        <Button variant={"soft"} type={"submit"}>
                            {loading ? <CircularProgress color={"primary"} size={25}/> : "Sign Up"}
                        </Button>
                        <Link to={"/auth/login/"} component={RouterLink} color={"textSecondary"}>
                            Already have an account ? <strong>Sign in here.</strong>
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
    minWidth: {xs: "100%", md: "400px", lg: "500px", xl: "500px"},
}

export default Register