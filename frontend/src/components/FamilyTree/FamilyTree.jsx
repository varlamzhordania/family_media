import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Modal,
    TextField,
    Typography
} from "@mui/material";
import Tree from "react-d3-tree";
import NodeElement from "@components/FamilyTree/NodeElement.jsx";
import {useQuery} from "@tanstack/react-query";
import {treeCreateService, treeDeleteService, treeListService, treePatchService} from "@lib/services/familyService.js";
import {useEffect, useState} from "react";
import {useCenteredTree} from "@components/FamilyTree/helpers.jsx";
import {formatDateForDjango, getFormattedDate} from "@lib/utils/times.js";
import {Add, CloudUpload, Create, Delete, Edit} from "@mui/icons-material";
import {DatePicker} from "@mui/x-date-pickers";
import VisuallyHiddenInput from "@components/VisuallyHiddenInput/VisuallyHiddenInput.jsx";
import {handleError} from "@lib/utils/service.js";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {useUser} from "@lib/hooks/useUser.jsx";
import {havePermission} from "@lib/utils/family.js";
import {ModalStyle} from "@lib/theme/styles.js";


const FamilyTree = ({family, query}) => {
    const [user, _] = useUser()
    const [showModal, setShowModal] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedNode, setSelectedNode] = useState(null)
    const [dimensions, translate, containerRef] = useCenteredTree();

    const handleModal = () => {
        setShowModal(prevState => !prevState)
        setIsEditing(false)
        setShowForm(false)
    }
    const handleShowForm = () => {
        setShowForm(prevState => !prevState)
    }
    const handleIsEditing = () => {
        setIsEditing(prevState => !prevState)
    }


    const treeQuery = useQuery({
        queryKey: ["family", family, "tree"],
        queryFn: () => treeListService(family)
    })


    return (
        <Card>
            <CardContent>
                {!treeQuery.isLoading && treeQuery?.data.length > 0 ?
                    <Box sx={WrapperStyle} id="treeWrapper" ref={containerRef}>
                        {
                            <Tree data={treeQuery?.data} orientation={"vertical"}
                                  renderCustomNodeElement={(rd3tNodeProps) => NodeElement({
                                      ...rd3tNodeProps, showModal, setSelectedNode, handleModal, treeQuery

                                  })}
                                  hasInteractiveNodes={true}
                                  transitionDuration={1000}
                                  nodeSize={{x: 310, y: 150}}
                                  dimensions={dimensions}
                                  translate={translate}
                            />
                        }
                    </Box> :
                    havePermission(user, query) ?
                        <Button variant={"soft"}
                                startIcon={<Create/>}
                                fullWidth onClick={handleModal}
                        >
                            Create family tree
                        </Button> : <Typography variant={"body1"}>You dont have access to family tree.</Typography>
                }
            </CardContent>
            {
                havePermission(user, query) &&
                <TreeModal showModal={showModal} handleModal={handleModal} selectedNode={selectedNode}
                           setSelectedNode={setSelectedNode}
                           handleShowForm={handleShowForm} family={family} isEditing={isEditing}
                           handleIsEditing={handleIsEditing} treeQuery={treeQuery} showForm={showForm}/>

            }
        </Card>
    )
}

const TreeModal = ({
                       showModal,
                       handleModal,
                       selectedNode, setSelectedNode,
                       handleShowForm,
                       treeQuery,
                       showForm,
                       family,
                       isEditing,
                       handleIsEditing
                   }) => {

    const handleEdit = () => {
        handleIsEditing()
        handleShowForm()
    }

    const handleDelete = async () => {
        if (selectedNode.id) {
            try {
                await treeDeleteService(selectedNode.id)
                toast.success(`${selectedNode?.name} deleted from your family tree.`)
                treeQuery.refetch()
                setSelectedNode(null)
                handleModal()
            } catch (error) {
                handleError(error)
            }
        }

    }

    return (
        <Modal open={showModal} onClose={handleModal}>
            <Card sx={ModalStyle}>
                {
                    selectedNode && <CardHeader title={selectedNode?.name}
                                                titleTypographyProps={{
                                                    textTransform: "capitalize",
                                                    fontWeight: 500,
                                                    variant: "h4"
                                                }}/>
                }

                {
                    showForm ?
                        <FormCardContent selectedNode={selectedNode} handleShowForm={handleShowForm}
                                         handleModal={handleModal} family={family}
                                         query={treeQuery} isEditing={isEditing}
                                         handleIsEditing={handleIsEditing}/> :
                        <InfoCardContent selectedNode={selectedNode}/>
                }
                <CardActions>
                    {
                        !showForm && <>
                            <Button variant={"soft"} startIcon={<Add/>} onClick={handleShowForm} fullWidth>
                                Add Children
                            </Button>
                            {
                                selectedNode && <>
                                    <Button variant={"soft"} color={"info"} startIcon={<Edit/>}
                                            onClick={handleEdit} fullWidth>Edit</Button>
                                    <Button variant={"soft"} color={"error"} startIcon={<Delete/>}
                                            onClick={handleDelete} fullWidth>Delete</Button>
                                </>
                            }
                        </>
                    }

                </CardActions>
            </Card>
        </Modal>
    )

}


const FormCardContent = ({selectedNode, handleShowForm, handleModal, family, query, isEditing, handleIsEditing}) => {
    const [avatarFile, setAvatarFile] = useState("")
    const [data, setData] = useState({
        id: null,
        family: family,
        name: "",
        date_of_birth: "",
        date_of_death: "",
        parent: selectedNode?.id || "",
    })

    const handleChange = (e) => {
        const {name, value} = e.target
        setData(prevState => ({...prevState, [name]: value}))
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData()
            Object.keys(data).forEach(key => formData.append(key, data[key]))
            if (avatarFile && typeof avatarFile !== "string")
                formData.append("avatar", avatarFile)
            if (isEditing) {
                await treePatchService(formData, selectedNode.id)
                toast.success("Changes saved successfully.")
            } else {
                await treeCreateService(formData, family)
                toast.success("New person added to your family tree.")
            }
            query.refetch()
            handleIsEditing()
            handleShowForm()
            handleModal()

        } catch (error) {
            handleError(error)
        }
    }

    useEffect(() => {
        if (isEditing) {
            setData({
                id: selectedNode?.id || null,
                family: selectedNode?.family || family,
                name: selectedNode?.name || "",
                date_of_birth: selectedNode?.date_of_birth || "",
                date_of_death: selectedNode?.date_of_death || "",
                parent: selectedNode?.parent || ""
            });
            setAvatarFile(selectedNode?.avatar || "")
        }

    }, [family, selectedNode]);

    return (
        <CardContent>
            <form onSubmit={handleSubmit}>
                <Box display={"flex"} justifyContent={"flex-start"} alignItems={"center"} gap={1} mb={3}>
                    <Avatar
                        src={typeof avatarFile === "string" ? avatarFile : URL.createObjectURL(avatarFile)}
                        alt={data.name}
                        sx={{width: "64px", height: "64px"}}/>
                    <Button
                        component="label"
                        role={"button"}
                        variant="soft"
                        tabIndex={-1}
                        startIcon={<CloudUpload/>}
                    >
                        Upload file
                        <VisuallyHiddenInput type="file" accept={"image/jpeg,image/png"}
                                             onChange={(e) => setAvatarFile(prevState => e.target.files[0])}
                        />
                    </Button>
                </Box>
                <TextField name={"name"}
                           label={"Person Name"}
                           type={"text"}
                           placeholder={"Write the name of the person here..."}
                           sx={{mb: 2}}
                           value={data.name}
                           onChange={handleChange}
                           fullWidth
                           required
                />
                {
                    data?.date_of_birth ? <DatePicker label={"Date of Birth"}
                                            name={"date_of_birth"}
                                            sx={{mb: 2, width: "100%"}}
                                            value={dayjs(data?.date_of_birth)}
                                            onChange={(newValue) => setData(prevState => ({
                                                ...prevState,
                                                date_of_birth: formatDateForDjango(newValue, {
                                                    showTime: false,
                                                    useMidnight: false
                                                })
                                            }))}
                        /> :
                        <DatePicker label={"Date of Birth"}
                                    name={"date_of_birth"}
                                    sx={{mb: 2, width: "100%"}}
                                    onChange={(newValue) => setData(prevState => ({
                                        ...prevState,
                                        date_of_birth: formatDateForDjango(newValue, {
                                            showTime: false,
                                            useMidnight: false
                                        })
                                    }))}
                        />
                }
                {
                    data?.date_of_death ? <DatePicker label={"Date of Death"}
                                            name={"date_of_death"}
                                            sx={{mb: 2, width: "100%"}}
                                            onChange={(newValue) => setData(prevState => ({
                                                ...prevState,
                                                date_of_death: formatDateForDjango(newValue, {
                                                    showTime: false,
                                                    useMidnight: false
                                                })
                                            }))}
                        /> :
                        <DatePicker label={"Date of Death"}
                                    name={"date_of_death"}
                                    sx={{mb: 2, width: "100%"}}
                                    onChange={(newValue) => setData(prevState => ({
                                        ...prevState,
                                        date_of_death: formatDateForDjango(newValue, {
                                            showTime: false,
                                            useMidnight: false
                                        })
                                    }))}
                        />
                }

                <Box display={"flex"} gap={1}>
                    <Button variant={"soft"} fullWidth type={"submit"} role={"button"}>
                        Submit
                    </Button>
                    <Button variant={"soft"} fullWidth color={"dark"} onClick={handleShowForm}>Cancel</Button>
                </Box>
            </form>

        </CardContent>
    )

}
const InfoCardContent = ({selectedNode}) => {


    return (
        <CardContent sx={{pt: 0}}>
            {
                selectedNode?.date_of_birth &&
                <Typography>Date of Birth : {getFormattedDate(selectedNode?.date_of_birth,)}</Typography>
            }
            {
                selectedNode?.date_of_death &&
                <Typography>Date of Death : {getFormattedDate(selectedNode?.date_of_birth,)}</Typography>
            }
        </CardContent>
    )
}

const WrapperStyle = {
    width: "100%",
    height: "45dvh",
    padding: 0,
}

export default FamilyTree