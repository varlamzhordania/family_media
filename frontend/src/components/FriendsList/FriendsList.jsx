import {
    Avatar, IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText, Menu, MenuItem,
    Paper
} from "@mui/material";
import {Cancel, Chat, Check, Lan, MoreVert, PersonAdd, PersonRemove} from "@mui/icons-material";
import {useFriendshipsContext} from "@lib/context/FriendshipContext.jsx";
import {useQuery} from "@tanstack/react-query";
import {friendshipsListService, friendshipsSendRequestService} from "@lib/services/userServices.js";
import {handleName} from "@lib/utils/family.js";
import {useRelationsContext} from "@lib/context/RelationsContext.jsx";
import {handleError} from "@lib/utils/service.js";
import toast from "react-hot-toast";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {MenuStyle} from "@lib/theme/styles.js";
import RelationModal from "@components/Relations/RelationModal.jsx";
import {IsFriend} from "@lib/utils/friendships.js";
import {useUserContext} from "@lib/context/UserContext.jsx";

const FriendsList = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showRelationModal, setShowRelationModal] = useState(false)
    const {user} = useUserContext()
    const {friendships, setFriendships} = useFriendshipsContext()
    const {relations, setRelations} = useRelationsContext()
    const navigate = useNavigate()


    const requestsQuery = useQuery({
        queryKey: ["friendships", "requests"],
        queryFn: () => friendshipsListService()
    })

    const handleMenu = (event, member) => {
        setAnchorEl(event.currentTarget);
        setSelectedMember(member);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleDm = () => {
        navigate(`/message/?dm=${selectedMember.id}`)
    }
    const handleRelationModal = () => {
        setShowRelationModal(prevState => !prevState)
    }

    const handleAccept = async (data) => {
        try {
            const response = await friendshipsSendRequestService(JSON.stringify({action: "accept"}), data?.from_user?.id)
            setFriendships(prevState => [...prevState, data?.from_user])
            toast.success(response.detail)
            requestsQuery.refetch()
        } catch (e) {
            handleError(e)
        }
    }

    const handleDecline = async (data) => {
        try {
            const response = await friendshipsSendRequestService(JSON.stringify({action: "decline"}), data?.from_user?.id)
            toast.success(response.detail)
            requestsQuery.refetch()
        } catch (e) {
            handleError(e)
        }
    }

    return (
        <>
            <List component={Paper} dense={true} disablePadding={true}
                  sx={{boxShadow: "card", position: "sticky"}}>
                <ListItem sx={{borderBottom: "1px solid lightgrey"}}>
                    <ListItemText primary={"Families"}
                                  primaryTypographyProps={{variant: "h5", fontWeight: "bold", color: "primary"}}/>
                </ListItem>

                {
                    friendships.length === 0 && <ListItem sx={{px: 0}}>
                        <ListItemButton>
                            <ListItemText primary={"Your family list is empty."}
                                          primaryTypographyProps={{textAlign: "center", variant: "subtitle2"}}/>
                        </ListItemButton>
                    </ListItem>
                }

                {friendships.map((item, index) =>
                    <ListItem sx={{px: 0}} key={index}>
                        <ListItemButton>
                            <ListItemIcon sx={{minWidth: 40}}>
                                <Avatar sx={{width: 32, height: 32}} src={item.avatar}>{item.initial_name}</Avatar>
                            </ListItemIcon>
                            <ListItemText primary={handleName(relations, item)}/>
                        </ListItemButton>
                        <ListItemSecondaryAction>
                            <IconButton onClick={(e) => handleMenu(e, item)}>
                                <MoreVert/>
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                )}

                <ListItem sx={{borderBottom: "1px solid lightgrey", borderTop: "1px solid lightgrey",}}>
                    <ListItemText primary={"Requests"}
                                  primaryTypographyProps={{variant: "h5", fontWeight: "bold", color: "primary"}}/>
                </ListItem>
                {
                    requestsQuery?.data?.length === 0 && <ListItem sx={{px: 0}}>
                        <ListItemButton>
                            <ListItemText primary={"You have 0 friend request."}
                                          primaryTypographyProps={{textAlign: "center", variant: "subtitle2"}}/>
                        </ListItemButton>
                    </ListItem>
                }
                {
                    requestsQuery?.data?.map((item, index) =>
                        <ListItem sx={{px: 0}} key={index}>
                            <ListItemButton>
                                <ListItemIcon sx={{minWidth: 40}}>
                                    <Avatar sx={{width: 32, height: 32}}
                                            src={item.from_user.avatar}>{item.from_user.initial_name}</Avatar>
                                </ListItemIcon>
                                <ListItemText primary={handleName(relations, item.from_user)}
                                              secondary={"friend request"}/>
                            </ListItemButton>
                            <ListItemSecondaryAction>
                                <IconButton color={"error"} onClick={() => handleDecline(item)}>
                                    <Cancel/>
                                </IconButton>
                                <IconButton color={"success"} onClick={() => handleAccept(item)}>
                                    <Check/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    )
                }


            </List>
            <Menu
                anchorEl={anchorEl}
                keepMounted
                PaperProps={{...MenuStyle}}
                transformOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem key={1} onClick={handleDm}>
                    <ListItemIcon>
                        <Chat/>
                    </ListItemIcon>
                    Direct Message
                </MenuItem>
                <MenuItem key={2} onClick={handleRelationModal}>
                    <ListItemIcon>
                        <Lan/>
                    </ListItemIcon>
                    Relation
                </MenuItem>
                <FriendMenuItems key={3} user={user} selectedMember={selectedMember} handleClose={handleClose}/>

            </Menu>
            <RelationModal relations={relations} setRelations={setRelations} member={selectedMember}
                           showModal={showRelationModal} handleModal={handleRelationModal}/>
        </>

    )
}
const FriendMenuItems = ({user, selectedMember, handleClose}) => {
    const {friendships, setFriendships} = useFriendshipsContext()
    const handleAddFriend = async () => {
        try {

            const response = await friendshipsSendRequestService(JSON.stringify({action: "request"}), selectedMember?.id)
            toast.success(response.detail)
        } catch (e) {
            handleError(e)
        }

    }

    const handleRemoveFriend = async () => {
        try {
            const response = await friendshipsSendRequestService(JSON.stringify({action: "remove"}), selectedMember?.id)
            setFriendships(prevState => prevState.filter(item => item.id !== selectedMember.id))
            toast.success(response.detail)
            handleClose()
        } catch (e) {
            handleError(e)
        }

    }

    if (IsFriend(user, selectedMember, friendships)) {
        return (
            <MenuItem onClick={handleRemoveFriend}>
                <ListItemIcon>
                    <PersonRemove/>
                </ListItemIcon>
                Remove friend
            </MenuItem>
        )
    } else {
        return (
            <MenuItem onClick={handleAddFriend}>
                <ListItemIcon>
                    <PersonAdd/>
                </ListItemIcon>
                Add friend
            </MenuItem>
        )
    }
}

export default FriendsList