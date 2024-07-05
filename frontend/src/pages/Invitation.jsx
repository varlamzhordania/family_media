import {useNavigate, useParams} from "react-router-dom";
import {Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import {VerticalStyle} from "@lib/theme/styles.js";
import {useEffect, useState} from "react";
import {handleError} from "@lib/utils/service.js";
import {checkInvitationService} from "@lib/services/eventsService.js";
import toast from "react-hot-toast";

const Invitation = () => {
    const {code} = useParams()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()


    useEffect(() => {
        const handleCode = async () => {
            try {
                setLoading(true)
                const response = await checkInvitationService(code)
                toast.success(response?.message)
                navigate(`/family/${response.family_id}/`)
                setLoading(false)

            } catch (error) {
                handleError(error)
                setLoading(false)
            }
        }
        handleCode()

    }, [code]);

    return (
        <Grid item xs>
            <Card>
                <CardContent sx={{...VerticalStyle, justifyContent: "center", alignItems: "center"}}>
                    <Typography variant={"h1"} fontWeight={600} color={"primary"}>Invitation</Typography>
                    <Typography variant={"body1"}>{code}</Typography>
                    {
                        loading && <CircularProgress/>
                    }
                </CardContent>
            </Card>

        </Grid>
    )

}

export default Invitation