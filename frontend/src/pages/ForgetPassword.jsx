import {
    Box, Button,
    Card,
    CardContent,
    CardHeader, CircularProgress,
    Container,
    Link,
    TextField,
} from "@mui/material";
import {Link as RouterLink, Navigate, useNavigate} from "react-router-dom";
import {useAccessToken} from "@lib/hooks/useToken.jsx";
import {useRef, useState} from "react";
import {Login, Send} from "@mui/icons-material";
import {passwordResetService} from "@lib/services/authService.js";
import {handleError} from "@lib/utils/service.js";
import toast from "react-hot-toast";

const ForgetPassword = () => {
    const [accessToken, setAccessToken] = useAccessToken()
    const [loading, setLoading] = useState(false)
    const emailRef = useRef()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const value = emailRef.current.value
            const prepData = JSON.stringify({email: value})
            const response = await passwordResetService(prepData)
            toast.success(response.message)
        } catch (error) {
            handleError(error)
        }

    }

    if (accessToken) {
        return <Navigate to={"/"} replace={true}/>
    }

    return (
        <Container className={"center-container"} maxWidth={"sm"}>
            <Card sx={{boxShadow: 1}}>
                <CardHeader
                    title={"Forget Password"}
                    titleTypographyProps={{fontWeight: "bold", fontSize: 42, color: "primary"}}
                />
                <CardContent>
                    <Box sx={boxStyles} component={"form"} onSubmit={handleSubmit}>
                        <TextField type={"email"} id={"id_email"} name={"email"} label={"Email"}
                                   placeholder={"Write your email address here..."}
                                   fullWidth inputRef={emailRef}
                                   autoComplete={"off"}
                                   required
                        />
                        <Button variant={"soft"} endIcon={<Send/>} type={"submit"}>
                            {loading ? <CircularProgress color={"primary"} size={25}/> : "Send Email"}
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

export default ForgetPassword