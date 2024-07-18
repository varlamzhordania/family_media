import {
    Avatar, Badge, IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemSecondaryAction,
    ListItemText
} from "@mui/material";
import {Diversity2, MoreVert} from "@mui/icons-material";
import {getAvatar, getChatName, getLastMessage, getOpponent} from "@lib/utils/chat.jsx";
import {insertUrlParam, removeUrlParam} from "@lib/utils/index.jsx";
import {useEffect, useRef, useState} from "react";
import {completeServerUrl} from "@lib/utils/socket.js";
import {useRoomsContext} from "@lib/context/RoomsContext.jsx";
import useSearchParamChange from "@lib/hooks/useSearchParamChange.jsx";
import {useUserContext} from "@lib/context/UserContext.jsx";

const ChatLists = ({selected, setSelected, height}) => {
    const {rooms} = useRoomsContext();
    const [sortedRooms, setSortedRooms] = useState([]);
    useEffect(() => {
        const sortRoomsByLastMessage = (rooms) => {
            return rooms?.slice()?.sort((a, b) => {
                const aLastMessageDate = a?.last_message ? new Date(a?.last_message?.created_at) : new Date(0);
                const bLastMessageDate = b?.last_message ? new Date(b?.last_message?.created_at) : new Date(0);
                return bLastMessageDate - aLastMessageDate;
            });
        };

        setSortedRooms(sortRoomsByLastMessage(rooms));
    }, [rooms]);

    return (
        <List sx={{overflow: "auto", maxHeight: height}} disablePadding>
            {
                sortedRooms?.map((room, index) =>
                    <ChatItem key={index} selected={selected} setSelected={setSelected} data={room}/>
                )}
        </List>
    )
}


const ChatItem = ({selected, setSelected, data}) => {
    const room = useSearchParamChange("room")
    const dm = useSearchParamChange("dm")
    const {user} = useUserContext()

    const handleSelect = () => {
        setSelected(data)
        insertUrlParam("room", data?.id)
        removeUrlParam("dm")
    }

    useEffect(() => {
        if (room == data?.id) {
            handleSelect()
        }

        if (data.type === "private") {
            if (getOpponent(data, user).id == dm) {
                handleSelect()
            }
        }

    }, [room, dm])

    if (data.type === "private")
        return <PrivateRoom selected={selected} data={data} handleSelect={handleSelect}/>
    if (data.type === "family")
        return <FamilyRoom selected={selected} data={data} handleSelect={handleSelect}/>
}

const PrivateRoom = ({data, selected, handleSelect}) => {
    const {user} = useUserContext()
    const isSelected = selected?.id === data?.id


    return (
        <ListItem sx={ChatItemStyle} className={isSelected ? "active" : ""}>
            <ListItemButton onClick={handleSelect}>
                <ListItemAvatar>
                    <Badge variant={"dot"} overlap={"circular"}
                           color={getOpponent(data, user).is_online ? "success" : "unset"}
                           anchorOrigin={{
                               vertical: 'bottom',
                               horizontal: 'right',
                           }}>
                        <Avatar src={completeServerUrl(getAvatar(data, user))} alt={data?.title}>
                            <Diversity2/>
                        </Avatar>
                    </Badge>
                </ListItemAvatar>
                <ListItemText primary={getChatName(data, user)} secondary={getLastMessage(data)}
                              secondaryTypographyProps={{
                                  variant: "caption", sx: {wordBreak: "keep-all", width: "max-content"}
                              }}
                />
            </ListItemButton>
            <ListItemSecondaryAction>
                <IconButton>
                    <MoreVert/>
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

const FamilyRoom = ({data, selected, handleSelect}) => {
    const buttonRef = useRef(null)
    const isSelected = selected?.id === data?.id

    return (
        <ListItem sx={ChatItemStyle} className={isSelected ? "active" : ""}>
            <ListItemButton itemRef={buttonRef} onClick={handleSelect}>
                <ListItemAvatar>
                    <Avatar src={completeServerUrl(getAvatar(data))} alt={data?.title}>
                        <Diversity2/>
                    </Avatar>
                </ListItemAvatar>
                <ListItemText primary={getChatName(data)}
                              secondary={getLastMessage(data)}
                              secondaryTypographyProps={{
                                  variant: "caption", sx: {wordBreak: "keep-all", width: "max-content"}
                              }}
                />
            </ListItemButton>
            <ListItemSecondaryAction>
                <IconButton>
                    <MoreVert/>
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}


const ChatItemStyle = {
    borderLeft: "3px solid transparent",
    "&:focus-within,&:hover, &.active": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
        borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
    },
    ".MuiButtonBase-root:hover": {
        backgroundColor: "unset",
    }
}

export default ChatLists