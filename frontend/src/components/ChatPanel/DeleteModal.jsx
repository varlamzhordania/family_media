import {Button, Card, CardActions, CardContent, Typography,Modal} from "@mui/material";
import {ModalStyle} from "@lib/theme/styles.js";

const DeleteModal = ({showModal, handleClose, handleDelete}) => {
    return (
        <Modal
            open={showModal}
            onClose={handleClose}
        >
            <Card sx={ModalStyle}>
                <CardContent>
                    <Typography variant="body1">
                        Are you sure you want to delete this message? This action will delete it for everyone.
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button variant={"soft"} color={"error"} fullWidth
                            onClick={handleDelete}>Delete</Button>
                    <Button variant={"soft"} color={"dark"} fullWidth
                            onClick={handleClose}>Cancel</Button>
                </CardActions>
            </Card>

        </Modal>
    )
}

export default DeleteModal