import RootLayout from "./RootLayout.jsx";
import SideNavigation from "@components/Navigation/SideNavigation.jsx";
import {Container, Grid} from "@mui/material";
import Navbar from "@components/Navbar/Navbar.jsx";
import {useEffect} from "react";
import {userService} from "@src/lib/services/authService.js";
import {useMemberships, useUser} from "@lib/hooks/useUser.jsx";

const DefaultLayout = ({children}) => {
    const [user, setUser] = useUser()
    const [memberShips, setMemberShips] = useMemberships()

    useEffect(() => {
        const setup = async () => {
            const [user, memberShips] = await userService()
            setUser(user, null)
            setMemberShips(memberShips, null)

        }

        setup()
    }, [user, memberShips])


    return (
        <RootLayout>
            <Navbar/>
            <Container maxWidth={"xl"} sx={{marginTop: {xs: "2rem", lg: "100px", xl: "50px"}, position: "relative"}}>
                <Grid container spacing={2} justifyContent={"end"}>
                    <Grid item xs={12} sm={4} md={3} lg={3} xl={2}>
                        <SideNavigation/>
                    </Grid>
                    {children}
                </Grid>
            </Container>
        </RootLayout>
    )
}


export default DefaultLayout