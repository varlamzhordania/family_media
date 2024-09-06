import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    useTheme
} from "@mui/material";
import {routes} from "./routes.jsx";
import {Link, useNavigate} from "react-router-dom";
import Logo from "@components/Logo/Logo.jsx";
import {VerticalStyle} from "@lib/theme/styles.js";
import {Logout} from "@mui/icons-material";
import {logout} from "@lib/utils/auth.js";

const SideNavigation = ({open, handleClose}) => {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.up("lg"))
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        return navigate("/auth/login/")
    }

    const buttonStyle = {
        backgroundColor: "#fff",
        boxShadow: matches ? 1 : 0,
        borderRadius: (theme) => theme.shape.borderRadius / 8,
        "&:hover": {
            backgroundColor: "primary.main",
            color: "white",
            boxShadow: 0,
        },
        "&:hover .MuiListItemIcon-root": {
            color: "white",
        }
    }

    if (matches)
        return (
            <Box sx={{...VerticalStyle}}>
                <Logo variant={"h4"} />
                <List sx={{padding: 0, position: "sticky", width: "100%"}}>
                    {routes.map((route, index) => (
                        <ListItem key={index} sx={{padding: 0, paddingBottom: 2}}>
                            <ListItemButton sx={buttonStyle} component={Link} to={route.href}>
                                <ListItemIcon>
                                    {route.icon}
                                </ListItemIcon>
                                <ListItemText primary={route.title} className={"nav-link"}/>
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <ListItem sx={{padding: 0,}}>
                        <ListItemButton sx={buttonStyle} onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout/>
                            </ListItemIcon>
                            <ListItemText primary={"Logout"} className={"nav-link"}/>
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>

        )

    return (
        <Drawer open={open} onClose={handleClose} PaperProps={{
            sx: {
                width: "65%",
            }
        }}>
            <Box sx={{...VerticalStyle, justifyContent: "flex-start", alignItems: "center", height: "100%", px: 2}}>
                <Logo flexGrow={0}/>
                {routes.map((route, index) => (
                    <ListItem key={index} sx={{padding: 0,}}>
                        <ListItemButton sx={buttonStyle} component={Link} to={route.href}>
                            <ListItemIcon>
                                {route.icon}
                            </ListItemIcon>
                            <ListItemText primary={route.title} className={"nav-link"}/>
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItem sx={{padding: 0,}}>
                    <ListItemButton sx={buttonStyle} onClick={handleLogout}>
                        <ListItemIcon>
                            <Logout/>
                        </ListItemIcon>
                        <ListItemText primary={"Logout"} className={"nav-link"}/>
                    </ListItemButton>
                </ListItem>
            </Box>
        </Drawer>
    )
}


export default SideNavigation