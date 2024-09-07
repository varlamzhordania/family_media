import {Box, Button, CardContent, CardHeader, Divider, Drawer, IconButton, TextField,} from "@mui/material";
import {useState} from "react";
import {Close} from "@mui/icons-material";
import {createService} from "@lib/services/familyService.js";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";

const FamilyDrawer = ({showDrawer, handleDrawer}) => {
    const [data, setData] = useState({
        name: "",
    })
    const navigate = useNavigate()
    const handleChange = (e) => {
        const {name, value} = e.target
        setData(prevState => ({...prevState, [name]: value}))
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const prepData = JSON.stringify(data)
            const response = await createService(prepData)
            console.log(response)
            toast.success("You Family Journey Started.")
            navigate(`/family/${response?.id}/`)
        } catch (error) {
            toast.error(error.detail || "Operation failed.\nPlease try later.")
        }
    }

    return (
        <Drawer
            open={showDrawer}
            anchor="right"
            onClose={handleDrawer}
            PaperProps={{
                sx: {width: {xs: "100%", sm: "75%", md: "60%", lg: "50%", xl: "40%"}}
            }}
            transitionDuration={400}
        >
            <CardHeader
                title="Build Your Family"
                titleTypographyProps={{color: "primary", fontWeight: 600, variant: "h4"}}
                subheader="Create your own family, share daily activities, plan events, make a family tree, message each other, and more."
                action={<IconButton onClick={handleDrawer}><Close/></IconButton>}
            />

            <Divider sx={{marginBottom: 2}}/>
            <CardContent>
                <img src={"/cat-family-bro.svg"}/>
                <form onSubmit={handleSubmit}>
                    <TextField type={"text"}
                               name={"name"}
                               label={"Name"}
                               placeholder={"Write name of the family..."}
                               value={data.name}
                               fullWidth
                               required
                               onChange={handleChange}

                    />
                    <Box display={"flex"} justifyContent={"center"} alignItems={"center"} gap={2} mt={2}>
                        <Button variant={"soft"} color={"primary"} role={"button"} type={"submit"} fullWidth>
                            Create Family
                        </Button>
                        <Button variant={"soft"} color={"dark"} fullWidth onClick={handleDrawer}>Cancel</Button>
                    </Box>
                </form>
            </CardContent>

        </Drawer>
    )
}

export default FamilyDrawer