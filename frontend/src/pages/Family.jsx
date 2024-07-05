import {
    Avatar,
    AvatarGroup,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Paper,
    Skeleton,
    TextField,
    Typography
} from "@mui/material";
import {useQuery} from "@tanstack/react-query";
import {joinService, leaveService, listService} from "@lib/services/familyService.js";
import {Diversity1, Diversity2, ExitToApp, MoreVert, Visibility} from "@mui/icons-material";
import {useRef, useState} from "react";
import toast from "react-hot-toast";
import {Link, useNavigate} from "react-router-dom";
import FamilyDrawer from "@components/FamilyDrawer/FamilyDrawer.jsx";

const Family = () => {

    const familyQueryset = useQuery({
        queryKey: ['families'],
        queryFn: () => listService()
    })

    return (
        <Grid item xs>
            <Grid container spacing={3}>
                <FamilyJoin query={familyQueryset}/>
                {familyQueryset.isLoading && <FamilyCardSkeleton/>}
                {
                    familyQueryset?.data?.map((item, index) => <FamilyCard data={item} query={familyQueryset}
                                                                           key={index}/>)
                }
            </Grid>
        </Grid>
    )
}

const FamilyJoin = ({query}) => {
    const [isError, setIsError] = useState(false)
    const [showDrawer, setShowDrawer] = useState(false)
    const codeRef = useRef(null)


    const handleDrawer = () => {
        setShowDrawer(prevState => !prevState)
    }

    const validateInput = () => {
        const value = codeRef.current.value.trim();
        const inviteCodePattern = /^[A-Z0-9]{10}$/;

        if (!value) {
            toast.error("Please enter the invite code.");
            setIsError(true);
            return false;
        }

        if (!inviteCodePattern.test(value)) {
            toast.error("Invalid format.\nPlease enter a valid invite code.");
            setIsError(true);
            return false;
        }

        setIsError(false);
        return value;
    };

    const handleJoin = async () => {
        const value = validateInput();
        if (!value) return;

        try {
            const response = await joinService(JSON.stringify({code: value.toString()}));
            toast.success(response.message);
            query.refetch();
        } catch (error) {
            if (error.detail === "No Family matches the given query.") {
                toast.error("Invalid invite code.");
                setIsError(true);
            } else {
                toast.error(error.detail || "Operation failed. Please try again.");
                setIsError(true);
            }
        }
    };


    return (
        <Grid item xs={12}>
            <Box sx={{px: 1, display: "flex", justifyContent: "space-between", alignItems: "center"}}
                 component={Paper}>
                <Box sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 2,
                    p: 1,
                    borderRadius: theme => theme.shape.borderRadius / 8
                }}>
                    <TextField
                        inputRef={codeRef}
                        type="text"
                        color={isError ? "error" : "secondary"}
                        label="CODE"
                        placeholder="XXXXXXXXXX"
                        error={isError}
                        inputProps={{maxLength: 10}} // Limit input to 10 characters
                    />
                    <Button variant={"soft"} color={"secondary"} onClick={handleJoin}>JOIN</Button>
                </Box>
                <Box>
                    <Button variant={"soft"} startIcon={<Diversity1/>} onClick={handleDrawer}>BUILD YOUR OWN FAMILY </Button>
                </Box>
            </Box>
            <FamilyDrawer showDrawer={showDrawer} handleDrawer={handleDrawer}/>
        </Grid>

    )
}


const FamilyCardSkeleton = () => {
    return (
        <Grid item xs={1} sm={2} md={3} lg={4}>
            <Card>
                <CardHeader avatar={<Skeleton variant={"circular"} width={42} height={42}/>}
                            title={<Skeleton variant={"text"}/>}
                            subheader={<Skeleton variant={"text"}/>}

                />
                <CardContent>
                    <Skeleton variant={"text"} width={"100%"} height={"130px"}/>
                    <AvatarGroup sx={{
                        mt: 2,
                        justifyContent: "flex-end",
                        bgcolor: "background.dark",
                        p: 1,
                        borderRadius: theme => theme.shape.borderRadius / 8
                    }}>
                        <Skeleton variant={"circular"} width={42} height={42}/>
                    </AvatarGroup>
                </CardContent>
            </Card>
        </Grid>
    )

}
const FamilyCard = ({data, query}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate()
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const goToFamilyDashboard = () => {
        return navigate(`/family/${data.id}/`);
    }

    const handleLeave = async () => {
        try {
            await leaveService(data.id)
            toast.success(`You left the ${data.name} family.`)
            query.refetch()
        } catch (error) {
            toast.error(error.detail || "Operation Failed.\ntry again")
        }
    }

    return (
        <Grid item xs={1} sm={2} md={3} lg={4} key={data.id}>
            <Card>
                <CardHeader avatar={<Avatar src={data?.avatar} alt={data.name}><Diversity2/></Avatar>}
                            title={data.name}
                            titleTypographyProps={{
                                component: Link,
                                to: `/family/${data.id}/`,
                                textTransform: "capitalize",
                                sx: {
                                    textDecoration: "none",
                                    color: "black",
                                },
                                fontSize: 22,
                                fontWeight: "bold"
                            }}
                            subheader={data.established}
                            action={<IconButton onClick={handleMenu}>
                                <MoreVert/>
                            </IconButton>}

                />
                <CardContent>
                    <Typography variant={"body1"} textAlign={"start"}>
                        {data?.description?.length > 200 ? data?.description?.substr(0, 200) + "..." : data?.description}
                    </Typography>
                    <AvatarGroup sx={{
                        mt: 2,
                        justifyContent: "flex-end",
                        bgcolor: "background.dark",
                        p: 1,
                        borderRadius: theme => theme.shape.borderRadius / 8
                    }}>
                        {data?.members.map((member, index) => <Avatar key={index} src={member?.avatar}
                                                                      alt={member?.full_name}>{member?.initial_name.toUpperCase()}</Avatar>)}
                    </AvatarGroup>
                </CardContent>
                <Menu
                    anchorEl={anchorEl}
                    keepMounted
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            width: 165,
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
                    <MenuItem onClick={goToFamilyDashboard}>
                        <ListItemIcon>
                            <Visibility/>
                        </ListItemIcon>
                        Visit Family
                    </MenuItem>
                    <MenuItem onClick={handleLeave}>
                        <ListItemIcon>
                            <ExitToApp/>
                        </ListItemIcon>
                        Leave Family
                    </MenuItem>
                </Menu>
            </Card>
        </Grid>

    )
}


export default Family