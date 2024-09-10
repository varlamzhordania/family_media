import {Button, Card, CardContent, CardHeader, Typography} from "@mui/material";
import {ContentCopy, Mail} from "@mui/icons-material";
import toast from "react-hot-toast";
import {requestInviteCodeService} from "@lib/services/familyService.js";
import {useEffect, useState} from "react";
import {havePermission} from "@lib/utils/family.js";
import {useUserContext} from "@lib/context/UserContext.jsx";
import InviteModal from "@components/FamilyCode/InviteModal.jsx";

const FamilyCode = ({family, query}) => {
    const {user} = useUserContext()
    const [code, setCode] = useState(null)
    const [showModal, setShowModal] = useState(false)


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
            <InviteModal family={family} showModal={showModal} handleModalClose={handleModalClose}/>
        </Card>
    );
};

export default FamilyCode;
