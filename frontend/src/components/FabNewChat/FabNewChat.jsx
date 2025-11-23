import {
    Avatar, Box, Button,
    Card,
    CardContent,
    CardHeader, Checkbox, CircularProgress,
    Fab,
    List,
    ListItem,
    ListItemButton, ListItemIcon, ListItemSecondaryAction,
    ListItemText, ListSubheader,
    Modal, Stack, TextField,
} from "@mui/material";
import {Create, Group, Person} from "@mui/icons-material";
import {useState} from "react";
import {ModalStyle} from "@lib/theme/styles.js";
import {useFriendshipsContext} from "@lib/context/FriendshipContext.jsx";
import {handleName} from "@lib/utils/family.js";
import {useRelationsContext} from "@lib/context/RelationsContext.jsx";
import {LIGHT_GREY} from "@lib/theme/VARIABLES.js";
import {useNavigate} from "react-router-dom";
import {handleError} from "@lib/utils/service.js";
import toast from "react-hot-toast";
import {createGroupService} from "@lib/services/chatService.js";
import {useWebSocketContext} from "@lib/context/WebSocketContext.jsx";
import {useRoomsContext} from "@lib/context/RoomsContext.jsx";

const FabNewChat = () => {
    const [open, setOpen] = useState(false)


    const handleClose = () => {
        setOpen(false)
    }
    return (
        <>
            <Fab color={"primary"} aria-label={"new-chat"} size={"large"} sx={{right: -15, bottom: 15}}
                 onClick={() => setOpen(true)}
            >
                <Create/>
            </Fab>
            <ActionModal open={open} handleClose={handleClose}/>
        </>
    )
}

const ActionModal = ({open, handleClose}) => {
    const [groupMode, setGroupMode] = useState(false)
    const [groupInfo, setGroupInfo] = useState({title: "", description: ""})
    const [selectedUsers, setSelectedUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const {friendships} = useFriendshipsContext()
    const {relations} = useRelationsContext()
    const {setRooms} = useRoomsContext();
    const navigate = useNavigate()

    const handleGroupMode = () => {
        setGroupMode(prevState => !prevState)
        setGroupInfo({title: "", description: ""})
        setSelectedUsers([])
    }

    const handleDm = (user) => {
        handleClose()
        navigate(`/message/?dm=${user.id}`)
    }

    const handleChange = (e) => {
        const {name, value} = e.target
        setGroupInfo(prevState => ({...prevState, [name]: value}))
    }

    const handleCheckBox = (user) => {
        const numericValue = Number(user.id);

        setSelectedUsers(prevState => {
            const exists = prevState.includes(numericValue);

            if (exists) {
                return prevState.filter(x => x !== numericValue);
            } else {
                return [...prevState, numericValue];
            }
        });
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)
            const res = await createGroupService({
                title: groupInfo.title,
                description: groupInfo.description,
                participants: selectedUsers
            });
            setRooms(prev => [...prev, res])
            handleClose();
        } finally {
            setLoading(false)
        }
    };


    return (
        <Modal open={open} onClose={() => {
            handleClose()
            setGroupMode(false)
        }}
        >
            <Card sx={ModalStyle}>
                <CardHeader title={groupMode ? "New Group" : "New Message"}
                            titleTypographyProps={{variant: "h5", fontWeight: 500}}/>
                <CardContent sx={{px: 2}}>
                    <form onSubmit={handleCreateGroup}>

                        {
                            groupMode && <Box sx={{pb: 2}}>
                                <TextField
                                    type="text"
                                    name="title"
                                    id="id_title"
                                    label="Group name"
                                    fullWidth
                                    required
                                    onChange={handleChange}
                                    value={groupInfo.title}
                                />
                            </Box>
                        }

                        {
                            !groupMode && <List disablePadding>
                                <ListItem sx={{px: 0, py: 0}}>
                                    <ListItemButton onClick={handleGroupMode}>
                                        <ListItemIcon>
                                            <Group/>
                                        </ListItemIcon>
                                        <ListItemText primary={"New Group"}/>
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        }

                        <List
                            disablePadding
                            subheader={
                                <ListSubheader sx={{background: LIGHT_GREY.main}} component="div"
                                               id="nested-list-subheader">
                                    {groupMode ? "Select between your friend" : "Your friends"}
                                </ListSubheader>
                            }
                        >
                            {friendships.map((user, index) =>
                                <ListItem sx={{px: 0, py: 0}} key={index}>
                                    <ListItemButton onClick={() => groupMode ? handleCheckBox(user) : handleDm(user)}>
                                        <ListItemIcon sx={{minWidth: 40}}>
                                            <Avatar sx={{width: 32, height: 32}}
                                                    src={user.avatar}>{user.initial_name}</Avatar>
                                        </ListItemIcon>
                                        <ListItemText primary={handleName(relations, user)}/>
                                    </ListItemButton>
                                    {
                                        groupMode && <ListItemSecondaryAction>
                                            <Checkbox onClick={() => handleCheckBox(user)}
                                                      checked={selectedUsers.includes(user.id)}/>
                                        </ListItemSecondaryAction>
                                    }

                                </ListItem>
                            )}
                        </List>
                        {
                            groupMode && <Box sx={{display: "flex", justifyContent: "space-between", gap: 2, pt: 2}}>
                                <Button variant={"soft"} color={"primary"} disabled={loading}
                                        type={"submit"} fullWidth>
                                    {loading ? <CircularProgress color={"background"} size={24}/> : 'Post'}
                                </Button>
                                <Button variant={"soft"} color={"dark"} disabled={loading} onClick={handleGroupMode}
                                        fullWidth>
                                    Cancel
                                </Button>
                            </Box>
                        }
                    </form>
                </CardContent>
            </Card>
        </Modal>
    )
}


export default FabNewChat