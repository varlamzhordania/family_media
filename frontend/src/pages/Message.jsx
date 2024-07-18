import {Card, Grid} from "@mui/material";
import ChatLists from "@components/ChatList/ChatList.jsx";
import {useState} from "react";
import ChatPanel from "@components/ChatPanel/ChatPanel.jsx";

const Message = () => {
    const [selected, setSelected] = useState(null)
    const height = {xs: "80dvh"}


    return (
        <Grid item xs>
            <Card>
                <Grid container spacing={0}>
                    <Grid item xs={12} lg={3}>
                        <ChatLists selected={selected} setSelected={setSelected} height={height}/>
                    </Grid>
                    <Grid item xs={12} lg={9}>
                        <ChatPanel selected={selected} setSelected={setSelected} height={height}/>
                    </Grid>
                </Grid>
            </Card>

        </Grid>
    )
}

export default Message