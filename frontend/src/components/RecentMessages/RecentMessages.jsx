import {
    Avatar, IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Paper
} from "@mui/material";
import {Send} from "@mui/icons-material";

const RecentMessages = () => {
    return (
        <List component={Paper} dense={true} disablePadding={true}
              sx={{boxShadow: 2, position: "sticky", top: (theme) => theme.StickyTop}}>
            <ListItem sx={{borderBottom: "1px solid lightgrey"}}>
                <ListItemText primary={"Inbox"}
                              primaryTypographyProps={{variant: "h4", fontWeight: "bold", color: "primary"}}/>
            </ListItem>
            {Array.from(Array(5)).map((item, index) =>
                <ListItem sx={{px: 0}} key={index}>
                    <ListItemButton>
                        <ListItemIcon sx={{minWidth: 40}}>
                            <Avatar sx={{width: 32, height: 32}}>AA</Avatar>
                        </ListItemIcon>
                        <ListItemText primary={"Varlam zhordania"} secondary={"new message"}/>
                    </ListItemButton>
                    <ListItemSecondaryAction>
                        <IconButton size={"large"}>
                            <Send/>
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            )}

        </List>
    )
}

export default RecentMessages