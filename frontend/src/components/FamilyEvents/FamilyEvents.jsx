import {
    Badge, Box, Button,
    Card, CardActions,
    CardContent,
    CardHeader,
    IconButton,
    Modal,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {DateCalendar, DayCalendarSkeleton, PickersDay} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {useQuery} from "@tanstack/react-query";
import {createService, deleteService, listService, patchService} from "@lib/services/eventsService.js";
import {useEffect, useState} from "react";
import {getFormattedDate, formatDateForDjango} from "@lib/utils/times.js";
import {Close, Delete, Edit} from "@mui/icons-material";
import toast from "react-hot-toast";
import {ModalStyle} from "@lib/theme/styles.js";


const FamilyEvents = ({family}) => {
    const [showModal, setShowModal] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [selectedDay, setSelectedDay] = useState(null)
    const handleClose = () => {
        setShowModal(prevState => !prevState)
    }

    const eventsQuery = useQuery({
        queryKey: ['events', 'family', family],
        queryFn: () => listService(family)
    })


    return (
        <Card>
            <CardContent>
                <DateCalendar

                    loading={eventsQuery.isLoading}
                    renderLoading={() => <DayCalendarSkeleton/>}

                    slots={{
                        day: CustomDays
                    }}
                    slotProps={{
                        day: {eventsQuery, handleClose, setSelectedEvent, setSelectedDay},
                    }}
                />
            </CardContent>
            <EventModal family={family} query={eventsQuery} selectedEvent={selectedEvent} showModal={showModal}
                        handleClose={handleClose}
                        selectedDay={selectedDay}/>
        </Card>
    )
}

const EventModal = ({family, query, showModal, handleClose, selectedEvent, selectedDay}) => {
    const [data, setData] = useState({
        id: null,
        family: "",
        name: "",
        description: "",
        event_date: "",
    })
    const [editable, setEditable] = useState(false)

    const handleChange = (e) => {
        const {name, value} = e.target;
        setData(prevState => ({...prevState, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        let message
        try {
            const prepData = data;
            if (editable) {
                await patchService(prepData, data.id)
                message = "Changes saved successfully."
            } else {
                await createService(prepData)
                message = "New event added successfully."
            }
            toast.success(message)
            query.refetch()
            handleClose()

        } catch (error) {
            toast.error(error?.detail || "Operation failed")
        }
    }

    const handleDelete = async () => {
        try {
            await deleteService(data.id)
            toast.success("Event deleted successfully.")
            query.refetch()
            handleClose()

        } catch (error) {
            toast.error(error?.detail || "Operation failed")
        }
    }

    useEffect(() => {
        setData({
            id: selectedEvent?.id || null,
            family: selectedEvent?.family || family,
            name: selectedEvent?.name || "",
            description: selectedEvent?.description || "",
            event_date: selectedEvent?.event_date || formatDateForDjango(selectedDay, {
                showTime: false,
                useMidnight: false
            }),
        });
        return () => {
            setData({
                id: null,
                family: "",
                name: "",
                description: "",
                event_date: "",
            })
            setEditable(false)
        }
    }, [selectedEvent, family, selectedDay]);


    if (selectedEvent && !editable)
        return (
            <Modal
                open={showModal}
                onClose={handleClose}
            >
                <Card sx={ModalStyle}
                >
                    <CardHeader title={`Event: ${data.name}`}
                                titleTypographyProps={{fontWeight: "bold"}}
                                subheader={getFormattedDate(data?.event_date)}
                                action={<IconButton onClick={handleClose}><Close/></IconButton>}
                    />
                    <CardContent sx={{pt: 0}}>
                        <Typography variant={"body1"}>
                            {data?.description}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button variant={"soft"} color={"info"} startIcon={<Edit/>}
                                onClick={() => setEditable(true)}>Edit</Button>
                        <Button variant={"soft"} color={"error"} startIcon={<Delete/>}
                                onClick={handleDelete}>Delete</Button>
                    </CardActions>
                </Card>
            </Modal>
        )

    return (
        <Modal
            open={showModal}
            onClose={handleClose}
        >
            <Card sx={ModalStyle}
            >
                <CardHeader title={`Set Event`}
                            subheader={getFormattedDate(data.event_date)}
                            titleTypographyProps={{fontWeight: "bold"}}
                            action={<IconButton onClick={handleClose}><Close/></IconButton>}
                />
                <CardContent sx={{pt: 0}}>
                    <form onSubmit={handleSubmit}>
                        <TextField type={"text"}
                                   label={"Name"}
                                   name={"name"}
                                   placeholder={"Write event name here..."}
                                   sx={{my: 1}}
                                   fullWidth
                                   required
                                   autoComplete={"off"}
                                   value={data.name}
                                   onChange={handleChange}
                        />
                        <TextField type={"text"}
                                   label={"Description"}
                                   name={"description"}
                                   placeholder={"Write event description here..."}
                                   sx={{my: 1}}
                                   rows={4}
                                   fullWidth
                                   autoComplete={"off"}
                                   multiline={true}
                                   value={data.description}
                                   onChange={handleChange}
                        />
                        <Box display={"flex"} justifyContent={"center"} alignItems={"center"} gap={1}>
                            <Button variant={"soft"} role={"button"} type={"submit"}
                                    fullWidth>{editable ? "Update" : "Submit"}</Button>
                            <Button variant={"soft"} color={"dark"} onClick={handleClose} fullWidth>Cancel</Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Modal>
    )
}

const CustomDays = ({
                        day,
                        outsideCurrentMonth,
                        eventsQuery,
                        handleClose,
                        setSelectedEvent,
                        setSelectedDay,
                        ...other
                    }) => {
    const eventForDay = eventsQuery?.data?.find(event =>
        dayjs(day).isSame(dayjs(event.event_date), 'day')
    );

    const handleClick = () => {
        if (eventForDay) {
            setSelectedEvent(eventForDay)
        } else {
            setSelectedEvent(null)
            setSelectedDay(dayjs(day))
        }

        handleClose()
    };

    if (eventForDay) {
        return (
            <Tooltip title={eventForDay.name} placement={"top"}>
                <Badge key={day.toString()} variant="dot" color="error" overlap="circular">
                    <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} onClick={handleClick}/>
                </Badge>
            </Tooltip>
        );
    } else {
        return (
            <PickersDay key={day.toString()} {...other} outsideCurrentMonth={outsideCurrentMonth} day={day}
                        onClick={handleClick}/>
        );
    }
};

export default FamilyEvents