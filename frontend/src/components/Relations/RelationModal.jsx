import {Box, Button, Card, CardContent, CardHeader, Modal, TextField} from "@mui/material";
import {HorizontalStyle, ModalStyle} from "@lib/theme/styles.js";
import {useMemo, useState} from "react";
import {handleError} from "@lib/utils/service.js";
import {relationUpdateOrCreateService} from "@lib/services/userServices.js";
import toast from "react-hot-toast";
import {findRelationByMemberId} from "@lib/utils/relations.js";

const RelationModal = ({relations, setRelations, member, showModal, handleModal}) => {
    const [data, setData] = useState({
        related: null,
        relation: "",
    })

    const handleChange = (e) => {
        const {name, value} = e.target
        setData(prevState => ({...prevState, [name]: value}))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const prepData = data
            const response = await relationUpdateOrCreateService(prepData)
            setRelations(response)
            toast.success(`Your relation to ${member.full_name} updated.`)
            handleModal()


        } catch (error) {
            handleError(error)
        }
    }


    useMemo(() => {
        setData({
            related: member?.id,
            relation: findRelationByMemberId(relations, member?.id)?.relation || "",
        })
    }, [member])


    return (
        <Modal open={showModal} onClose={handleModal} aria-label={"make a relation"}>
            <Card sx={ModalStyle}>
                <CardHeader title={`Relation`} titleTypographyProps={{variant: "h5", fontWeight: 500}}/>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label={"Relation"}
                            placeholder={"Write your relation here..."}
                            helperText={"brother, sister, cousin...etc"}
                            name={"relation"}
                            onChange={handleChange}
                            value={data.relation}
                            required
                            fullWidth
                        />

                        <Box sx={{...HorizontalStyle, mt: 2}}>
                            <Button variant={"soft"} color={"primary"} type={"submit"} fullWidth>Submit</Button>
                            <Button variant={"soft"} color={"dark"} fullWidth onClick={handleModal}>Cancel</Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Modal>
    )
}

export default RelationModal