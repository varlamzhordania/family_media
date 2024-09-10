import {
    Alert,
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Grid,
    IconButton,
    Paper, Typography
} from "@mui/material";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import toast from "react-hot-toast";
import VisuallyHiddenInput from "@components/VisuallyHiddenInput/VisuallyHiddenInput.jsx";
import {Diversity2, Edit, PhotoCameraRounded} from "@mui/icons-material";
import {useQuery} from "@tanstack/react-query";
import {patchService, retrieveService} from "@lib/services/familyService.js";
import FamilyTabs from "@components/FamilyTabs/FamilyTabs.jsx";
import BackLink from "@components/BackLink/BackLink.jsx";
import FamilyEvents from "@components/FamilyEvents/FamilyEvents.jsx";
import FamilyCode from "@components/FamilyCode/FamilyCode.jsx";
import FamilyMembers from "@components/FamilyMemebrs/FamilyMembers.jsx";
import {havePermission} from "@lib/utils/family.js";
import {handleError} from "@lib/utils/service.js";
import {useUserContext} from "@lib/context/UserContext.jsx";

const bgImage = "/bg_cover_compress.jpg"
const FamilyDashboard = () => {
    const {id} = useParams()
    const [showAlert, setShowAlert] = useState(true)

    const familyQuery = useQuery({
        queryKey: ['family', id],
        queryFn: () => retrieveService(id)
    })


    return (
        <Grid item xs sm={12} md={9} lg={9} xl={10} pb={4}>
            <BackLink href={"/family/"}/>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <CardCover query={familyQuery}/>
                </Grid>
                <Grid item xs={12} md={12} lg={7} xl={8} order={{xs: 2, lg: 1}}>
                    {familyQuery?.data?.description && showAlert &&
                        <Alert sx={{mb: 2}} color={"info"} severity={"info"} variant={"standard"}
                               onClose={() => setShowAlert(false)}>
                            <Typography textAlign={"justify"}
                                        variant={"body1"}>{familyQuery?.data?.description}</Typography>
                        </Alert>}
                    <FamilyTabs query={familyQuery} family={id}/>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={5} xl={4} order={{xs: 1, lg: 2}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={12} lg={12}>
                            <FamilyMembers family={id} query={familyQuery}/>
                        </Grid>
                        <Grid item xs={12} sm md={6} lg={12}>
                            <FamilyCode family={id} query={familyQuery}/>
                        </Grid>
                        <Grid item xs={12} sm md={6} lg={12}>
                            <FamilyEvents family={id}/>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

const CardCover = ({query}) => {
    const {user}= useUserContext()
    const [bgCover, setBgCover] = useState(bgImage)
    const [avatarImage, setAvatarImage] = useState(null)


    const handleImageChange = async (event, field) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const formData = new FormData()
                formData.append(field, file)
                await patchService(formData, "none", query?.data?.id)
                query.refetch()
                toast.success("Changes saved successfully.")
            } catch (error) {
                handleError(error)
            }


        }
    };

    useEffect(() => {
        setBgCover(prevState => query?.data?.bg_cover || bgImage)
        setAvatarImage(prevState => query?.data?.avatar || null)
    }, [query])

    return (
        <Card sx={{position: "relative", overflow: "visible"}}>
            <Box sx={{overflow: "hidden"}} component={Paper}>
                <CardMedia component={"img"}
                           src={bgCover}
                           sx={{
                               height: {xs: 180, sm: 200, md: 250, lg: 250, xl: 250}
                           }}
                />
            </Box>
            <CardContent sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                position: "absolute",
                left: "50%",
                bottom: 0,
                top: {xs: 10, sm: 30, md: 60, xl: 70},
                transform: "translateX(-50%)",
                margin: "auto"
            }}>
                <IconButton component={"label"} role={undefined}>
                    {
                        havePermission(user, query) &&
                        <VisuallyHiddenInput type={"file"} accept={"image/jpeg,image/png"}
                                             onChange={(e) => handleImageChange(e, "avatar")}/>
                    }

                    <Badge
                        overlap="circular"
                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                        badgeContent={havePermission(user, query) ? <PhotoCameraRounded fontSize={"large"} sx={{
                            background: "rgba(0,0,0,0.6)",
                            color: "white",
                            borderRadius: "50%",
                            p: 0.8,
                        }}/> : null}
                    >
                        <Avatar sx={{
                            width: {xs: 86, md: 86},
                            height: {xs: 86, md: 86},
                            outlineWidth: 5,
                            outlineColor: theme => theme.palette.background.default,
                            outlineStyle: "solid",
                            outlineOffset: 0,
                        }}
                                alt={"family avatar"}
                                src={avatarImage}
                        >
                            <Diversity2 fontSize={"large"}/>
                        </Avatar>
                    </Badge>
                </IconButton>
                <Typography variant={"h6"} fontWeight={"bold"} mt={1}
                            textTransform={"capitalize"} color={"white"}>{query?.data?.name}</Typography>
            </CardContent>
            {
                havePermission(user, query) && <CardActions sx={{
                    position: "absolute",
                    right: "5px",
                    bottom: "5px",
                    margin: "auto",
                }}>
                    <Button variant={"soft"} startIcon={<Edit/>} color={"dark"} component="label"
                            role={undefined}>
                        Edit
                        <VisuallyHiddenInput type={"file"} accept={"image/jpeg,image/png"}
                                             onChange={(e) => handleImageChange(e, "bg_cover")}/>
                    </Button>
                </CardActions>
            }

        </Card>
    )
}

export default FamilyDashboard