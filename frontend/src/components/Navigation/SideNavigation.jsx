import {List, ListItem, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import {routes} from "./routes.jsx";
import {Link} from "react-router-dom";

const SideNavigation = () => {
    return (
        <List sx={{padding: 0, position: "sticky", top: (theme) => theme.StickyTop}}>
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
        </List>
    )
}

const buttonStyle = {
    backgroundColor: "background.main",
    boxShadow: 2,
    borderRadius: (theme) => theme.shape.borderRadius / 2.5,
    "&:hover": {
        backgroundColor: "primary.main",
        color: "white",
        boxShadow: 5,
    },
    "&:hover .MuiListItemIcon-root": {
        color: "white",
    }
}


export default SideNavigation