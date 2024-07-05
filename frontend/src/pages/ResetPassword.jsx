import {
    Box, Button,
    Card,
    CardContent,
    CardHeader, CircularProgress,
    Container, IconButton, InputAdornment,
    TextField,
} from "@mui/material";
import {Navigate, useNavigate, useParams} from "react-router-dom";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import {useMemo, useState} from "react";
import {Login, Send, Visibility, VisibilityOff} from "@mui/icons-material";
import {passwordResetConfirmService} from "@lib/services/authService.js";
import {handleError} from "@lib/utils/service.js";
import toast from "react-hot-toast";

const ResetPassword = () => {
    const {uid, token} = useParams()
    const [data, setData] = useState({
        new_password: "",
        uidb64: "",
        token: "",
    })
    const [accessToken, setAccessToken] = useAccessToken()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        const {name, value} = e.target
        setData(prevState => ({...prevState, [name]: value}))
    }
    const handleClickShowPassword = () => {
        setShowPassword(prevState => !prevState)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const prepData = JSON.stringify(data)
            const response = await passwordResetConfirmService(prepData)
            toast.success(response.message)
            setLoading(false)
            navigate("/auth/login/")
        } catch (error) {
            handleError(error)
            setLoading(false)
            navigate("/auth/login/")
        }

    }

    useMemo(() => {
        setData(prevState => ({...prevState, uidb64: uid, token: token}))
    }, [uid, token])


    if (accessToken) {
        return <Navigate to={"/"} replace={true}/>
    }

    return (
        <Container className={"center-container"} maxWidth={"sm"}>
            <Card sx={{boxShadow: 1}}>
                <CardHeader
                    title={"Reset Password"}
                    titleTypographyProps={{fontWeight: "bold", fontSize: 42, color: "primary"}}
                />
                <CardContent>
                    <Box sx={boxStyles} component={"form"} onSubmit={handleSubmit}>
                        <TextField type={showPassword ? "text" : "password"} id={"id_password"} name={"new_password"}
                                   placeholder={"********"}
                                   label={"Password"}
                                   fullWidth
                                   required
                                   onChange={handleChange}
                                   value={data.new_password}
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
                        <Button variant={"soft"} endIcon={<Send/>} type={"submit"}>
                            {loading ? <CircularProgress color={"primary"} size={25}/> : "Reset"}
                        </Button>
                        <Button variant={"soft"} color={"grey"} type={"submit"}
                                onClick={() => navigate("/auth/login/")}
                                endIcon={<Login/>}
                        >
                            back
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    )

}

const boxStyles = {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    minWidth: {xs: "100%", lg: "400px", xl: "400px"},
}

export default ResetPassword