import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader, Checkbox,
    FormControl, FormControlLabel, InputAdornment,
    InputLabel, ListItemIcon, ListItemText, MenuItem,
    Modal,
    Select,
    TextField
} from "@mui/material";
import {HorizontalStyle, ModalStyle} from "@lib/theme/styles.js";
import {sendInvitationService} from "@lib/services/eventsService.js";
import toast from "react-hot-toast";
import {handleError} from "@lib/utils/service.js";
import {useRef, useState} from "react";
import {Services} from "@components/FamilyCode/services.jsx";

const InviteModal = ({family, showModal, handleModalClose}) => {
    const [service, setService] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false)
    const targetRef = useRef(null);
    const expireRef = useRef(null)

    const selectedService = Services.find((item) => item.value === service);

    const handleChange = (e) => {
        const {value} = e.target;
        setService(value);
    };
    const handleCheckBox = (e) => {
        setShowAdvanced(e.target.checked);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const target = targetRef.current.value;
        const expireHour = expireRef?.current?.value
        try {
            const prepData = JSON.stringify({
                family: family,
                service: service,
                target: target,
                expire: showAdvanced ? expireHour : null,
            });
            await sendInvitationService(prepData);
            handleModalClose();
            toast.success("Invitation sent successfully.");
            target.current.value = "";
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <Modal open={showModal} onClose={handleModalClose}>
            <Card sx={ModalStyle}>
                <CardHeader title={"Send invite link to your family."} titleTypographyProps={{fontWeight: 600,}}/>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FormControl fullWidth>
                            <InputLabel id="service-label">Service</InputLabel>
                            <Select
                                labelId="service-label"
                                id="service-select"
                                value={service}
                                label="Service"
                                onChange={handleChange}
                                renderValue={(selected) => <Box sx={{
                                    ...HorizontalStyle,
                                    justifyContent: "flex-start"
                                }}>
                                    {selectedService.icon}
                                    {selectedService.label}
                                </Box>
                                }
                                required
                            >
                                {
                                    Services.map((item, index) =>
                                        <MenuItem key={index} value={item.value}>
                                            <ListItemIcon>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.label}/>
                                        </MenuItem>
                                    )
                                }
                            </Select>
                        </FormControl>

                        {selectedService && (
                            <>
                                <TextField
                                    type={selectedService.inputType || "text"}
                                    label={selectedService.inputLabel || "Recipient"}
                                    placeholder={selectedService.inputPlaceholder || "Enter recipient information..."}
                                    inputRef={targetRef}
                                    margin={"normal"}
                                    autoComplete="off"
                                    fullWidth
                                    required
                                    autoFocus
                                />
                                <FormControlLabel control={<Checkbox checked={showAdvanced} onChange={handleCheckBox}/>}
                                                  label="Show Advanced Options"/>
                            </>)
                        }
                        {
                            showAdvanced && (
                                <TextField
                                    type={"number"}
                                    label={"Expiration Time (Hours)"}
                                    inputProps={{min: 0}}
                                    inputRef={expireRef}
                                    margin={"normal"}
                                    helperText={"Set how many hours the invitation link should remain active after being sent."}
                                    required={showAdvanced}
                                    fullWidth
                                />
                            )
                        }

                        <Box sx={{...HorizontalStyle, mt: 2}}>
                            <Button variant={"soft"} type={"submit"} fullWidth>Send</Button>
                            <Button variant={"soft"} color={"dark"} fullWidth onClick={handleModalClose}>Cancel</Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Modal>
    )
        ;
};

export default InviteModal;
