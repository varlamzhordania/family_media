import {
    Avatar, Badge,
    Card,
    IconButton,
    List,
    ListItem,
    ListItemAvatar, ListItemIcon,
    ListItemSecondaryAction,
    ListItemText, Menu, MenuItem
} from "@mui/material";
import {Chat, MoreVert, Person, Star, SupervisorAccount} from "@mui/icons-material";
import {useState} from "react";
import {useUser} from "@lib/hooks/useUser.jsx";
import {groupService} from "@lib/services/familyService.js";
import {handleError} from "@lib/utils/service.js";
import toast from "react-hot-toast";
import {isAdmin, isCreator} from "@lib/utils/family.js";

const FamilyMembers = ({family, query}) => {
    const [user, _] = useUser()
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const handleMenu = (event, member) => {
        setAnchorEl(event.currentTarget);
        setSelectedMember(member);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };


    return (
        <Card>
            <List sx={{maxHeight:"300px",overflowY:"auto"}}>
                {query?.data?.members?.map((member, index) =>
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
                        <ListItemText primary={member?.id === user?.id ? "You" : member?.full_name}
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
                )}

            </List>

            <Menu
                anchorEl={anchorEl}
                keepMounted
                PaperProps={{
                    elevation: 0,
                    sx: {
                        width: 185,
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&::before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 12,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {selectedMember?.id !== user?.id && [
                    <MenuItem key={1}>
                        <ListItemIcon>
                            <Chat/>
                        </ListItemIcon>
                        Send Message
                    </MenuItem>,
                    <ExtraMenuItems key={2} family={family} query={query} user={user}
                                    selectedMember={selectedMember}/>
                ]}
            </Menu>
        </Card>
    )
}

const ExtraMenuItems = ({family, query, user, selectedMember}) => {

    const handleGroupPermission = async (action, rank) => {
        const prepData = JSON.stringify({
            action: action,
            rank: rank,
            member: selectedMember.id
        })
        try {
            const {message} =await groupService(family, prepData)
            query.refetch()
            toast.success(message)
        } catch (error) {
            handleError(error)

        }
    }


    if (isCreator(user,query)) {
        if (!isAdmin(selectedMember,query) && !isCreator(selectedMember,query)) {
            return (
                <MenuItem onClick={() => handleGroupPermission("promote", "admin")}>
                    <ListItemIcon>
                        <SupervisorAccount/>
                    </ListItemIcon>
                    Make admin
                </MenuItem>
            )
        } else if (isAdmin(selectedMember,query)) {
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