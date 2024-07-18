import {Box, Button, Card, CardContent, Skeleton, TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {patchService} from "@lib/services/familyService.js";
import {handleError} from "@lib/utils/service.js";
import toast from "react-hot-toast";
import {useUserContext} from "@lib/context/UserContext.jsx";

const FamilySettings = ({family, query}) => {
    const [data, setData] = useState({
        id: null,
        name: "",
        description: "",

    })
    const {user} = useUserContext()
    const navigate = useNavigate()

    const handleChange = (e) => {
        const {name, value} = e.target
        setData(prevState => ({...prevState, [name]: value}))
    }
    const handleReset = () => {

    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const prepData = JSON.stringify(data)
            await patchService(prepData, "json", family);
            query.refetch()
            toast.success("Changes saved successfully.")

        } catch (error) {
            handleError(error)
        }

    }

    useEffect(() => {
        setData({
            id: query?.data?.id,
            name: query?.data?.name,
            description: query?.data?.description,
        })

    }, [family, query?.data])

    if (query?.data?.creator !== user?.id)
        return navigate(`/family/`)

    if (query?.isLoading)
        return <Skeleton variant={"rounded"} height={"60dvh"} width={"100%"}/>

    return (
        <Card>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <Box display={"flex"} flexDirection={"column"} gap={4}>
                        <TextField type={"text"}
                                   name={"name"}
                                   label={"Name"}
                                   placeholder={"Write name of the family..."}
                                   value={data.name}
                                   fullWidth
                                   required
                                   onChange={handleChange}

                        />
                        <TextField type={"text"}
                                   name={"description"}
                                   label={"Message"}
                                   placeholder={"Write your message here..."}
                                   helperText={"will be display on family page and family info for all users to see."}
                                   value={data.description}
                                   multiline
                                   rows={5}
                                   fullWidth
                                   required
                                   onChange={handleChange}

                        />
                    </Box>

                    <Box display={"flex"} justifyContent={"center"} alignItems={"center"} gap={2} mt={2}>
                        <Button variant={"soft"} color={"primary"} role={"button"} type={"submit"} fullWidth>
                            Create Family
                        </Button>
                        <Button variant={"soft"} color={"dark"} fullWidth onClick={handleReset}>Cancel</Button>
                    </Box>
                </form>
            </CardContent>
        </Card>
    )
}

export default FamilySettings