import {
    Avatar,
    Badge, Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Grid,
    IconButton, Paper, TextField,
    Typography
} from "@mui/material";
import {Edit, PhotoCameraRounded} from "@mui/icons-material";
import VisuallyHiddenInput from "@components/VisuallyHiddenInput/VisuallyHiddenInput.jsx";
import {useEffect, useRef, useState} from "react";
import {userPatchService} from "@lib/services/userServices.js";
import toast from "react-hot-toast";
import {MuiTelInput} from "mui-tel-input";
import {handleError} from "@lib/utils/service.js";
import {useUserContext} from "@lib/context/UserContext.jsx";


const bgImage = "/bg_cover_compress.jpg"

const Account = () => {


    return (
        <>
            <Grid item xs>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    paddingBottom: 5
                }}>
                    <CardCover/>
                    <CardForms/>
                </Box>
            </Grid>
        </>
    )
}

const CardForms = () => {
    const {user} = useUserContext()
    const [data, setData] = useState({
        username: {
            value: "",
            label: "Username",
        },
        first_name: {
            value: "",
            label: "Username",
        },
        last_name: {
            value: "",
            label: "Username",
        },
        email: {
            value: "",
            label: "Username",
        },
        bio: {
            value: "",
            label: "Username",
        },
        phone_number: {
            value: "",
            label: "Username",
        },
    })


    useEffect(() => {
        setData({
            first_name: {
                value: user.first_name || "",
                label: "First name",
                disabled: true,
                multiLine: false,
                type: "text",
                rows: 1,
                placeholder: "enter your first name",
                error: false,
                errorMessage: "",
                editable: true,

            },
            last_name: {
                value: user.last_name || "",
                label: "Last name",
                disabled: true,
                multiLine: false,
                type: "text",
                rows: 1,
                placeholder: "enter your last name",
                error: false,
                errorMessage: "",
                editable: true,

            },
            email: {
                value: user.email || "",
                label: "Email",
                disabled: true,
                multiLine: false,
                type: "email",
                rows: 1,
                placeholder: "enter your email address",
                error: false,
                errorMessage: "",
                editable: false,

            },
            phone_number: {
                value: user.phone_number || "",
                label: "Phone number",
                disabled: true,
                multiLine: false,
                type: "tel",
                rows: 1,
                placeholder: "enter your phone number",
                error: false,
                errorMessage: "",
                editable: true,

            },
            bio: {
                value: user.bio || "",
                label: "Biography",
                disabled: true,
                multiLine: true,
                type: "text",
                rows: 4,
                placeholder: "enter your biography",
                error: false,
                errorMessage: "",
                editable: true,

            },
        })
    }, [user]);

    return (
        <Card>
            <CardContent>
                <Box component={"table"} sx={{
                    width: "100%",
                    borderSpacing: "1em 2em",
                    borderCollapse: "separate",
                }}>
                    <Box component={"tbody"}>
                        {Object.keys(data).map((key, index) => <TableItem key={index} data={data} setData={setData}
                                                                          dataField={key}/>)}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}


const TableItem = ({data, dataField, setData}) => {
    const {user, setUser} = useUserContext()
    const myRef = useRef(null)

    const handleChange = (e) => {
        setData(prevState => ({
            ...prevState,
            [dataField]: {...prevState[dataField], value: dataField === "phone_number" ? e : e.target.value}
        }))
    }
    const handleEdit = async () => {
        if (data[dataField].editable) {
            if (!data[dataField].disabled) {
                try {
                    let prepData = {}
                    prepData[dataField] = myRef.current.value
                    if (dataField === "phone_number")
                        prepData["phone_number"] = prepData["phone_number"].replace(/\s/g, '');
                    const response = await userPatchService(JSON.stringify(prepData), "json")
                    setUser(response, user)
                    toast.success(data[dataField].label + " updated successfully.")
                } catch (error) {
                    handleError(error)
                }
            } else {
                //do something
            }
            setData(prevState => ({
                ...prevState,
                [dataField]: {...prevState[dataField], disabled: !data[dataField].disabled}
            }))

        }
    }
    return (
        <Box component={"tr"} sx={{
            display: {xs: "flex", lg: "table-row"},
            flexDirection: {xs: "column", lg: ""},
            marginBottom: 3,
            position: "relative",
        }}>

            <Box component={"td"} colSpan={1} align={"start"}
                 sx={{verticalAlign: "top", maxWidth: {xs: "100%", lg: "40px"}}}>
                <Typography variant={"body1"} fontWeight={500}>{data[dataField].label}</Typography>
                <Typography variant={"caption"}>{data[dataField].placeholder}</Typography>
            </Box>
            <Box component={"td"} colSpan={12} align={"start"}
                 sx={{verticalAlign: "top"}}>
                {
                    dataField === "phone_number" ? <MuiTelInput
                            onlyCountries={['CA', 'US']}
                            defaultCountry="US"
                            name={dataField}
                            id={`id_${dataField}`}
                            size={"medium"}
                            autoComplete={"off"}
                            variant={"outlined"}
                            type={data[dataField].type}
                            multiline={data[dataField].multiLine}
                            rows={data[dataField].rows}
                            value={data[dataField].value || ""}
                            disabled={data[dataField].disabled}
                            error={data[dataField].error}
                            helperText={data[dataField].errorMessage}
                            placeholder={data[dataField].placeholder}
                            fullWidth
                            inputProps={{sx: {"&.Mui-disabled": {"-webkitTextFillColor": "grey"}}}}
                            inputRef={myRef}
                            onChange={handleChange}
                        />
                        :
                        <TextField name={dataField}
                                   id={`id_${dataField}`}
                                   size={"medium"}
                                   autoComplete={"off"}
                                   variant={"outlined"}
                                   type={data[dataField].type}
                                   multiline={data[dataField].multiLine}
                                   rows={data[dataField].rows}
                                   value={data[dataField].value || ""}
                                   disabled={data[dataField].disabled}
                                   error={data[dataField].error}
                                   helperText={data[dataField].errorMessage}
                                   placeholder={data[dataField].placeholder}
                                   fullWidth
                                   inputProps={{sx: {"&.Mui-disabled": {"-webkitTextFillColor": "grey"}}}}
                                   inputRef={myRef}
                                   onChange={handleChange}

                        />
                }

            </Box>
            <Box component={"td"} colSpan={1} maxWidth={"15px"}
                 sx={{verticalAlign: "top", position: {xs: "absolute", lg: "unset"}, top: 0, right: 50}}>
                {
                    data[dataField].editable &&
                    <Button variant={"soft"} color={data[dataField].disabled ? "info" : "success"}
                            onClick={handleEdit}>{data[dataField].disabled ? "Edit" : "Save"}</Button>
                }

            </Box>
        </Box>
    )
}


const CardCover = () => {
    const {user, setUser} = useUserContext()
    const [bgCover, setBgCover] = useState(bgImage)
    const [avatarImage, setAvatarImage] = useState(null)

    const handleImageChange = async (event, field) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const formData = new FormData()
                formData.append(field, file)
                const response = await userPatchService(formData, "none")
                setUser(response)
                toast.success("Changes saved successfully.")
            } catch (error) {
                handleError(error)
            }


        }
    };

    useEffect(() => {
        setBgCover(prevState => user.bg_cover || bgImage)
        setAvatarImage(prevState => user.avatar || null)
    }, [user])

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
                bottom: -90,
                transform: "translateX(-50%)",
                margin: "auto"
            }}>
                <IconButton component={"label"} role={undefined}>
                    <VisuallyHiddenInput type={"file"} accept={"image/jpeg,image/png"}
                                         onChange={(e) => handleImageChange(e, "avatar")}/>
                    <Badge
                        overlap="circular"
                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                        badgeContent={<PhotoCameraRounded fontSize={"large"} sx={{
                            background: "rgba(0,0,0,0.6)",
                            color: "white",
                            borderRadius: "50%",
                            p: 0.5,
                        }}/>}
                    >
                        <Avatar sx={{
                            width: {xs: 112, md: 128},
                            height: {xs: 112, md: 128},
                            outlineWidth: 5,
                            outlineColor: theme => theme.palette.background.default,
                            outlineStyle: "solid",
                            outlineOffset: 0,
                        }}
                                alt={"user avatar"}
                                src={avatarImage}
                        />
                    </Badge>
                </IconButton>
                {/*<Typography variant={"h5"} fontWeight={"bold"}>{user?.full_name}</Typography>*/}
            </CardContent>
            <CardActions sx={{
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
        </Card>
    )
}

export default Account