import {
    Avatar,
    Badge,
    Card,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Menu,
    MenuItem
} from "@mui/material";
import {Chat, Lan, MoreVert, Person, PersonAdd, PersonRemove, Star, SupervisorAccount} from "@mui/icons-material";
import {useState} from "react";
import {groupService} from "@lib/services/familyService.js";
import {handleError} from "@lib/utils/service.js";
import toast from "react-hot-toast";
import {handleName, isAdmin, isCreator} from "@lib/utils/family.js";
import RelationModal from "@components/Relations/RelationModal.jsx";
import {useUserContext} from "@lib/context/UserContext.jsx";
import {useRelationsContext} from "@lib/context/RelationsContext.jsx";
import {useNavigate} from "react-router-dom";
import {useFriendshipsContext} from "@lib/context/FriendshipContext.jsx";
import {IsFriend} from "@lib/utils/friendships.js";
import {friendshipsSendRequestService} from "@lib/services/userServices.js";
import {MenuStyle} from "@lib/theme/styles.js";

const FamilyMembers = ({family, query}) => {
    const {relations, setRelations} = useRelationsContext()
    const [showRelationModal, setShowRelationModal] = useState(false)
    const {user} = useUserContext()
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const navigate = useNavigate()
    const handleMenu = (event, member) => {
        setAnchorEl(event.currentTarget);
        setSelectedMember(member);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleRelationModal = () => {
        setShowRelationModal(prevState => !prevState)
    }

    const handleDm = () => {
        console.log(selectedMember)
        navigate(`/message/?dm=${selectedMember.id}`)
    }



    return (
        <Card>
            <List sx={{maxHeight: "300px", overflowY: "auto"}}>
                {query?.data?.members?.map((member, index) => {


                        return (
                            <ListItem key={index}>
                                <ListItemAvatar>
                                    <Badge
                                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                        overlap={"circular"}
                                        badgeContent={
                                            isCreator(member, query) ? <Star sx={{color: "warning.light"}}/>
                                                : isAdmin(member, query) ? <Star color={"info"}/> : null
                                        }>
                                        <Avatar src={member?.avatar}
                                                alt={member?.full_name}>
                                            {member?.initial_name?.toUpperCase()}
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText primary={member?.id === user?.id ? "You" : handleName(relations,member)}
                                              secondary={isCreator(member, query) ? "Creator" : isAdmin(member, query) ? "Admin" : "Member"}
                                />
                                {
                                    member?.id !== user?.id && <ListItemSecondaryAction>
                                        <IconButton onClick={(e) => handleMenu(e, member)}>
                                            <MoreVert/>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                }

                            </ListItem>
                        )
                    }
                )}

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
                {selectedMember?.id !== user?.id && [
                    <MenuItem key={1} onClick={handleDm}>
                        <ListItemIcon>
                            <Chat/>
                        </ListItemIcon>
                        Direct Message
                    </MenuItem>,
                    <MenuItem key={2} onClick={handleRelationModal}>
                        <ListItemIcon>
                            <Lan/>
                        </ListItemIcon>
                        Relation
                    </MenuItem>,
                    <FriendMenuItems key={3} user={user} selectedMember={selectedMember}/>,
                    <ExtraMenuItems key={4} family={family} query={query} user={user}
                                    selectedMember={selectedMember}/>
                ]}
            </Menu>
            <RelationModal relations={relations} setRelations={setRelations} member={selectedMember}
                           showModal={showRelationModal} handleModal={handleRelationModal}/>
        </Card>
    )
}

const FriendMenuItems = ({user, selectedMember}) => {
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

const ExtraMenuItems = ({family, query, user, selectedMember}) => {

    const handleGroupPermission = async (action, rank) => {
        const prepData = JSON.stringify({
            action: action,
            rank: rank,
            member: selectedMember.id
        })
        try {
            const {message} = await groupService(family, prepData)
            query.refetch()
            toast.success(message)
        } catch (error) {
            handleError(error)

        }
    }


    if (isCreator(user, query)) {
        if (!isAdmin(selectedMember, query) && !isCreator(selectedMember, query)) {
            return (
                <MenuItem onClick={() => handleGroupPermission("promote", "admin")}>
                    <ListItemIcon>
                        <SupervisorAccount/>
                    </ListItemIcon>
                    Make admin
                </MenuItem>
            )
        } else if (isAdmin(selectedMember, query)) {
            return (
                <MenuItem onClick={() => handleGroupPermission("demote", "admin")}>
                    <ListItemIcon>
                        <Person/>
                    </ListItemIcon>
                    Make member
                </MenuItem>
            )
        }
    }
    return null
}

export default FamilyMembers