import toast from "react-hot-toast";
import {playNotificationSound} from "@lib/utils/index.jsx";
import {Box, Typography} from "@mui/material";
import {Link} from "react-router-dom";

export const getOpponent = (data, user) => {
    return data?.participants?.filter(item => item?.id !== user?.id)[0]
}

export const getAvatar = (data, user = null) => {
    switch (data?.type) {
        case "family":
            return data?.family?.avatar
        case "private":
            return getOpponent(data, user).avatar
        case "group":
            return data?.avatar
    }
}

export const updateRoomLastMessage = (rooms, message) => {
    return rooms.map(room => {
        if (room.id === parseInt(message.room)) {
            return {
                ...room,
                last_message: message
            };
        }
        return room;
    });
};

export const getChatName = (data, user = null) => {
    switch (data?.type) {
        case "family":
            return data?.title + " family"
        case "private":
            return getOpponent(data, user).full_name
        case "group":
            return data?.title
    }
}


export const getLastMessage = (data) => {
    if (data?.last_message?.id) {
        const message = data?.last_message?.content
        const content = message?.length > 10 ? message.substr(0, 10) + "..." : message
        return data?.last_message?.user?.full_name + ": " + content
    } else
        return null
}


export const showMessageNotification = (messageData) => {
    toast(
        <Box component={Link} to={`/message/?room=${messageData.room}`} sx={{textDecoration: "none", width: "100%"}}>
            <Typography fontWeight={"bold"} variant={"subtitle1"} color={"primary"}>
                New Message
            </Typography>
            <Typography variant={"subtitle2"} color={"black"}>
                {messageData?.user?.full_name + ": "}{messageData?.content?.length > 20 ? messageData?.content?.substr(0, 20) + "..." : messageData?.content}
            </Typography>
        </Box>,
        {
            duration: 5000,
            id: `notification-${messageData.id}`,
            style: {
                minWidth: "200px",
                border: '1px solid #009688',
                padding: '4px',
            },
        }
    );
    playNotificationSound();
};