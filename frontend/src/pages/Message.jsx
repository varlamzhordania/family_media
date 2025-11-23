import {Card, Grid, useMediaQuery, useTheme} from "@mui/material";
import ChatLists from "@components/ChatList/ChatList.jsx";
import {useState} from "react";
import ChatPanel from "@components/ChatPanel/ChatPanel.jsx";
import FabNewChat from "@components/FabNewChat/FabNewChat.jsx";

const Message = () => {
    const [selected, setSelected] = useState(null)
    const height = {xs: "85dvh", lg: "80dvh"}
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.up("lg"))

    return (
        <Grid item xs={12} lg paddingTop={matches === false && "0 !important"}>
            <Card>
                <Grid container spacing={0}>
                    <Grid item xs={12} lg={3} position={"relative"}>
                        <ChatLists selected={selected} setSelected={setSelected} height={height}/>
                        <FabNewChat />
                    </Grid>

                    <Grid item xs={12} lg={9}>
                        {
                            matches ?
                                <ChatPanel selected={selected} setSelected={setSelected} height={height}
                                           matches={matches}/>
                                :
                                selected &&
                                <ChatPanel selected={selected} setSelected={setSelected} height={height}
                                           matches={matches}/>
                        }
                    </Grid>
                </Grid>
            </Card>

        </Grid>
    )
}

export default Message