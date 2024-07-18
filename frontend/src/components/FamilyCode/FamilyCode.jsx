import {Box, Button, Card, CardContent, CardHeader, Modal, TextField, Typography} from "@mui/material";
import {ContentCopy, Mail} from "@mui/icons-material";
import toast from "react-hot-toast";
import {requestInviteCodeService} from "@lib/services/familyService.js";
import {useEffect, useRef, useState} from "react";
import {havePermission} from "@lib/utils/family.js";
import {HorizontalStyle, ModalStyle} from "@lib/theme/styles.js";
import {handleError} from "@lib/utils/service.js";
import {sendInvitationService} from "@lib/services/eventsService.js";
import {useUserContext} from "@lib/context/UserContext.jsx";

const FamilyCode = ({family, query}) => {
    const {user} = useUserContext()
    const [code, setCode] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const inputRef = useRef(null)

    const handleModalClose = () => {
        setShowModal(prevState => !prevState)
    }

    const copyToClipboard = () => {
        if (query?.data?.invite_code) {
            navigator.clipboard.writeText(code);
            toast.success("Invite code copied to clipboard!")
        }
    };

    const handleGetCode = async () => {
        try {
            const {invite_code} = await requestInviteCodeService(family)
            setCode(invite_code)
            query.refetch()

        } catch (error) {
            toast.error(error.detail || "Operation failed.\nPlease try later.")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const value = inputRef.current.value
        try {
            const prepData = JSON.stringify({
                family: family,
                email: value,
            })
            await sendInvitationService(prepData)
            handleModalClose()
            toast.success("Invitation sent successfully.")
            inputRef.current.value = "";
        } catch (error) {
            handleError(error)
        }
    }

    useEffect(() => {
        setCode(query?.data?.invite_code || null)
    }, [query.data])


    return (
        <Card>
            <CardHeader title="Invite Code"/>
            <CardContent>
                {code ? (
                    <>
                        <Button
                            variant="soft"
                            onClick={copyToClipboard}
                            endIcon={
                                <ContentCopy fontSize={"25px"}/>
                            }
                            fullWidth
                        >
                            {code}
                        </Button>
                        {
                            havePermission(user, query) &&
                            <Typography role={"button"}
                                        variant={"subtitle2"}
                                        sx={{
                                            textDecoration: "underline",
                                            cursor: "pointer"
                                        }}
                                        color={"info.main"}
                                        onClick={handleGetCode}
                                        mt={1}
                            >
                                refresh code
                            </Typography>
                        }
                    </>

                ) : havePermission(user, query) ?
                    <Button
                        variant="soft"
                        fullWidth
                        onClick={handleGetCode}
                    >
                        Get Code
                    </Button>
                    : <Button variant="soft" color={"error"} fullWidth>code unavailable</Button>

                }

                <Button variant={"soft"} color={"grey"} fullWidth sx={{mt: 1}} endIcon={<Mail/>}
                        onClick={handleModalClose}>
                    Send Invite
                </Button>
            </CardContent>
            <Modal open={showModal} onClose={handleModalClose}>
                <Card sx={ModalStyle}>
                    <CardHeader title={"Send invite link to your family."} titleTypographyProps={{fontWeight: 600,}}/>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <TextField type={"email"} label={"Email"} placeholder={"Write your family email here..."}
                                       inputRef={inputRef} fullWidth required autoFocus={true}/>
                            <Box sx={{...HorizontalStyle, mt: 2}}>
                                <Button variant={"soft"} type={"submit"} fullWidth>Send</Button>
                                <Button variant={"soft"} color={"dark"} fullWidth
                                        onClick={handleModalClose}>Cancel</Button>
                            </Box>
                        </form>
                    </CardContent>
                </Card>
            </Modal>
        </Card>
    );
};

export default FamilyCode;
