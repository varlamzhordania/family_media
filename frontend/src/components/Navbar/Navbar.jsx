import {
    AppBar,
    Box,
    Container,
    IconButton,
    Toolbar,
} from "@mui/material";
import {Menu} from "@mui/icons-material";
import Logo from "@components/Logo/Logo.jsx";

const Navbar = ({open, handleClose}) => {

    return (
        <Box sx={{
            display: {xs: "block", lg: "none"},
            flexGrow: 1,
            position: "sticky",
            top: 0,
            zIndex: (theme) => theme?.zIndex?.appBar
        }}>
            <AppBar position="static" sx={{backgroundColor: "background.main"}}>
                <Toolbar>
                    <Container maxWidth={"xl"} sx={{display: "flex", alignItems: "end"}}>
                        <Logo variant={"h4"}/>
                        <Box>
                            <IconButton onClick={handleClose}>
                                <Menu sx={{fontSize: "34px"}}/>
                            </IconButton>
                        </Box>
                    </Container>
                </Toolbar>
            </AppBar>
        </Box>
    )
}


export default Navbar