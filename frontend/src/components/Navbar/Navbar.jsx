import {
    AppBar,
    Box,
    Container,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Toolbar,
    Typography
} from "@mui/material";
import {AccountCircle, Logout, Person, Settings} from "@mui/icons-material";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {logout} from "@lib/utils/auth.js";

const Navbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate()
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout()
        navigate("/auth/login");
    };

    return (
        <Box sx={{flexGrow: 1, position: "sticky", top: 0, zIndex: (theme) => theme?.zIndex?.appBar}}>
            <AppBar position="static" sx={{backgroundColor: "background.main"}}>
                <Toolbar>
                    <Container maxWidth={"xl"} sx={{display: "flex", alignItems: "end"}}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "start",
                            alignItems: "flex-end",
                            gap: 2,
                            flexGrow: 1,
                        }}>
                            <img src={"/logo2.jpg"} alt={"logo"} className={"logo"}/>
                            <Typography variant={"h4"} component={"h1"} fontWeight={600} color={"primary"}>
                                Family
                            </Typography>
                        </Box>
                        <Box>
                            <IconButton color={"primary"} size={"medium"} onClick={handleMenu}>
                                <AccountCircle sx={{fontSize: "34px"}}/>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                keepMounted
                                PaperProps={{
                                    elevation: 0,
                                    sx: {
                                        width: 165,
                                        overflow: 'visible',
                                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                        '& .MuiAvatar-root': {
                                            width: 32,
                                            height: 32,
                                            ml: -0.5,
                                            mr: 1,
                                        },
                                        '&::before': {
                                            content: '""',
                                            display: 'block',
                                            position: 'absolute',
                                            top: 0,
                                            right: 18,
                                            width: 10,
                                            height: 10,
                                            bgcolor: 'background.paper',
                                            transform: 'translateY(-50%) rotate(45deg)',
                                            zIndex: 0,
                                        },
                                    },
                                }}
                                transformOrigin={{horizontal: 'right', vertical: 'top'}}
                                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={()=>navigate("/account")}>
                                    <ListItemIcon>
                                        <Person/>
                                    </ListItemIcon>
                                    Account
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout/>
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Container>
                </Toolbar>
            </AppBar>
        </Box>
    )
}


export default Navbar