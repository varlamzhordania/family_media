import {
    Box,
    Button,
    Card,
    CardActions,
    CardMedia, CircularProgress,
    Divider,
    Drawer,
    Fab, IconButton,
    TextField,
    Typography
} from '@mui/material';
import {Check, Close, CloudUpload, Delete, Edit} from '@mui/icons-material';
import {useRef, useState} from "react";
import {createService} from "@src/lib/services/postService.js";
import {useQueryClient} from "@tanstack/react-query";

const FabAddPost = ({handleDrawer, showDrawer}) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [coverFile, setCoverFile] = useState(null);
    const [loading, setLoading] = useState(false)
    const desRef = useRef()
    const queryClient = useQueryClient()
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
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

        if (coverFile)
            formData.append('cover_image', coverFile);

        uploadedFiles.forEach(file => {
            formData.append('media', file);
        });

        try {

            await createService(formData)
            setLoading(false)
            queryClient.refetchQueries({queryKey: ["posts"]})
            handleDrawer()
        } catch (error) {
            console.error('Error creating post:', error);
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
                                variant="contained"
                                color={"secondary"}
                                startIcon={<CloudUpload/>}
                                sx={{width: "200px"}}
                            >
                                Upload file
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
                                <Button variant={"contained"} color={"info"} disabled={loading}
                                        type={"submit"} fullWidth>
                                    {loading ? <CircularProgress color={"background"} size={24}/> : 'Post'}
                                </Button>
                                <Button variant={"contained"} color={"action"} disabled={loading} onClick={handleDrawer} fullWidth>
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
