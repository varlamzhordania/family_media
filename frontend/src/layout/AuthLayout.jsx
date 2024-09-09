import {Box, Container, Grid, Paper, Typography} from "@mui/material";
import RootLayout from "@layout/RootLayout.jsx";
import {VerticalStyle} from "@lib/theme/styles.js";

const AuthLayout = ({children}) => {
    return (
        <RootLayout>
            <Grid container height={"100dvh"} bgcolor={"primary.main"}>
                <Grid item xs={12} sm={6} md={6} lg={6}
                      sx={{py: {xs: 2, sm: 3, md: 5}, height: {xs: "auto", md: "100%"}}}>
                    <Container maxWidth={"md"} sx={{...centerElement, height: "100%"}}>
                        <Box component={"img"} src={"/family-auth.svg"} alt={"family connection illustration"}
                             sx={{width: {xs: "50%", sm: "75%"}, marginBottom: {xs: 0, sm: "24px"}}}/>
                        <Typography variant="h4" align="center" color={"white"} fontWeight={"bold"}
                                    display={{xs: "none", sm: "block"}} gutterBottom>
                            Welcome to Family Arbore
                        </Typography>
                        <Typography variant="body1" align="center" color={"white"} display={{xs: "none", sm: "block"}}>
                            A platform built for families to connect, share, and grow together. Share posts, likes, and
                            comments,
                            message each other, set up family events, and even create your family tree heritage. Join us
                            and keep your family legacy alive.
                        </Typography>
                    </Container>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={6} component={Paper}
                      sx={{borderRadius: {xs: "18px 18px 0 0", sm: "18px 0 0 18px",position:"relative",}}}>
                    <Box component={"img"} src={"/logo2.jpg"}
                         sx={{width: 64, height: 64, objectFit: "cover", position: "absolute", top: 10, left: 10}}/>
                    <Container maxWidth={"sm"} sx={{...centerElement, height: "100%"}}>
                        {children}
                    </Container>
                </Grid>
            </Grid>
        </RootLayout>
    )
}


const centerElement = {
    ...VerticalStyle, justifyContent: "center", alignItems: "center"
}


export default AuthLayout