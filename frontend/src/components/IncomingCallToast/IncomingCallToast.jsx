import {Box, Paper, Typography, Stack, Button} from "@mui/material";
import {Call, CallEnd} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {toast} from "react-hot-toast";

const IncomingCallToast = ({
                               t,
                               roomId,
                               roomTitle,
                               roomType,
                               creator,
                               ringingController,
                           }) => {
    const navigate = useNavigate();

    const handleAccept = () => {
        if (ringingController.current) {
            ringingController.current.stop();
            ringingController.current = null;
        }
        navigate(`/call/${roomId}`);
        toast.dismiss(t.id);
    };

    const handleReject = () => {
        if (ringingController.current) {
            ringingController.current.stop();
            ringingController.current = null;
        }
        toast.dismiss(t.id);
    };

    return (
        <Box
            component={Paper}
            sx={{
                p: 1.5,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                width: '300px',
                textAlign: 'center',
                animation: 'ringing 1s infinite',
                borderLeft: '5px solid #4caf50',
            }}
        >
            <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                Incoming Call
            </Typography>

            <Typography variant="body2" sx={{color: '#555'}}>
                From: {roomType === "private"
                ? <strong>{creator}</strong>
                : <strong>{roomTitle}</strong>}
            </Typography>

            <Stack direction="row" justifyContent="center" spacing={2} sx={{mt: 2}}>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<Call/>}
                    onClick={handleAccept}
                >
                    Accept
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CallEnd/>}
                    onClick={handleReject}
                >
                    Reject
                </Button>
            </Stack>
        </Box>
    );
};

export default IncomingCallToast;
