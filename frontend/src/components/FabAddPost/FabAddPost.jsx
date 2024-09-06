import {
    Box,
    Button,
    Card,
    CardActions,
    CardMedia, CircularProgress,
    Divider,
    Drawer,
    Fab, FormControl, FormHelperText, IconButton, InputLabel, MenuItem, Select,
    TextField,
    Typography
} from '@mui/material';
import {Check, Close, Delete, Edit} from '@mui/icons-material';
import {useRef, useState} from "react";
import {createService} from "@src/lib/services/postService.js";
import {useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {handleError} from "@lib/utils/service.js";
import {useMembershipsContext} from "@lib/context/MembershipsContext.jsx";

const FabAddPost = ({handleDrawer, showDrawer}) => {
    const {memberships}= useMembershipsContext()
    const [family, setFamily] = useState(null)
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [coverFile, setCoverFile] = useState(null);
    const [loading, setLoading] = useState(false)
    const desRef = useRef()
    const queryClient = useQueryClient()
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleRemoveFile = (fileToRemove) => {
        setUploadedFiles((prevFiles) => prevFiles.filter(file => file !== fileToRemove));
    };

    const handleSetCoverFile = (fileToSet) => {
        setCoverFile(fileToSet);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true)

        const formData = new FormData();
        formData.append('text', desRef.current.value);
        formData.append("family", family)

        if (coverFile)
            formData.append('cover_image', coverFile);

        uploadedFiles.forEach(file => {
            if (file !== coverFile)
                formData.append('media', file);
        });

        try {

            await createService(formData)
            setLoading(false)
            toast.success("Your new post successfully added.")
            queryClient.refetchQueries({queryKey: ["posts"]})
            handleDrawer()
        } catch (error) {
            handleError(error)
            setLoading(false)
        }
    };

    return (
        <>
            <Fab
                sx={{position: "fixed", right: 30, bottom: 30}}
                size="large"
                color="secondary"
                aria-label="Write a post"
                onClick={handleDrawer}
            >
                <Edit/>
            </Fab>
            <Drawer
                open={showDrawer}
                anchor="right"
                onClose={handleDrawer}
                PaperProps={{
                    sx: {width: {xs: "100%", sm: "75%", md: "60%", lg: "50%", xl: "40%"}}
                }}
                transitionDuration={400}
            >
                <Box sx={wrapperStyle}>
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <Typography variant="h4" fontWeight={500} color="primary">
                            Create a New Post
                        </Typography>
                        <IconButton size={"large"} onClick={handleDrawer}>
                            <Close/>
                        </IconButton>
                    </Box>
                    <Typography variant="body1" fontWeight={400} gutterBottom>
                        Share new posts with your family members and cherish the moments together.
                    </Typography>
                    <Divider sx={{marginBottom: 2}}/>
                    <form onSubmit={handleSubmit}>
                        <Box sx={{...wrapperStyle, padding: 0}}>
                            <FormControl fullWidth>
                                <InputLabel id="family-select-label">Family</InputLabel>
                                <Select
                                    labelId="family-select-label"
                                    id="family-select"
                                    value={family}
                                    label="Family"
                                    onChange={(e) => setFamily(e.target.value)}
                                    required
                                >
                                    {memberships?.map(item => <MenuItem key={item.id}
                                                                        value={item?.family?.id}>{item?.family?.name}</MenuItem>)}
                                </Select>
                                <FormHelperText>Which family this post belong ?</FormHelperText>
                            </FormControl>
                            <TextField
                                type="text"
                                name="text"
                                id="id_text"
                                label="Description"
                                helperText="Tell us about the post you want to create"
                                rows={5}
                                inputRef={desRef}
                                multiline
                                fullWidth
                                required
                            />
                            <Button
                                component="label"
                                variant="outlined"
                                fullWidth={true}
                                color={"secondary"}
                                sx={{
                                    height: "200px",
                                    borderStyle: "dashed",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textTransform: "capitalize",
                                    textAlign: "center",
                                }}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                Click to upload file or <br/> drag your files here
                                <input
                                    hidden
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                />
                            </Button>
                            {uploadedFiles.length > 0 && (
                                <UploadedFilesList
                                    files={uploadedFiles}
                                    coverFile={coverFile}
                                    onRemoveFile={handleRemoveFile}
                                    onSetCoverFile={handleSetCoverFile}
                                />
                            )}
                            <Box sx={{display: "flex", justifyContent: "space-between", gap: 2}}>
                                <Button variant={"soft"} color={"primary"} disabled={loading}
                                        type={"submit"} fullWidth>
                                    {loading ? <CircularProgress color={"background"} size={24}/> : 'Post'}
                                </Button>
                                <Button variant={"soft"} color={"dark"} disabled={loading} onClick={handleDrawer}
                                        fullWidth>
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </form>

                </Box>
            </Drawer>
        </>
    );
};

const wrapperStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: 3,
};

const UploadedFilesList = ({files, coverFile, onRemoveFile, onSetCoverFile}) => {
    return (
        <Box sx={{marginTop: 2}}>
            <Typography variant="h6" fontWeight={500}>
                Uploaded Files
            </Typography>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: "nowrap",
                overflowY: "auto",
                gap: 2,
                padding: 2
            }}>
                {files.map((file, index) => (<UploadedFile
                    file={file}
                    key={index}
                    isCover={file === coverFile}
                    onRemoveFile={() => onRemoveFile(file)}
                    onSetCoverFile={() => onSetCoverFile(file)}

                />))}
            </Box>
        </Box>
    );
};

const UploadedFile = ({file, isCover, onRemoveFile, onSetCoverFile}) => {
    return (
        <Card elevation={2} sx={{
            position: "relative",
            minWidth: 350,
        }}>
            {file.type.startsWith('image') ? (
                <CardMedia component="img" src={URL.createObjectURL(file)} sx={{height: 250}}/>
            ) : (
                <CardMedia component="video" src={URL.createObjectURL(file)} controls
                           sx={{height: "auto", width: "100%"}}/>
            )}
            <CardActions>
                <Button startIcon={<Check/>} color={isCover ? "primary" : "warning"} onClick={onSetCoverFile}>
                    {isCover ? "Cover Image" : "Set as Cover"}
                </Button>
                <Button startIcon={<Delete/>} color="error" onClick={onRemoveFile}>
                    Remove
                </Button>
            </CardActions>
        </Card>
    );
};


export default FabAddPost;
