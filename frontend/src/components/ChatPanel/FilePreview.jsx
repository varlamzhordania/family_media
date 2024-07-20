import {useCallback, useEffect, useRef, useState} from "react";
import {Box, Fab, IconButton, Slider, TextField, Typography} from "@mui/material";
import {CHAT_UPLOAD_MODAL, HorizontalStyle, VerticalStyle} from "@lib/theme/styles.js";
import {
    Brush, Check, Clear,
    Close,
    Crop,
    RotateLeft,
    RotateRight, Save, Send,
    Title,
    Undo,
} from "@mui/icons-material";
import {fabric} from "fabric"
import {FabricJSCanvas, useFabricJSEditor} from 'fabricjs-react'
import EraserIcon from "@components/EraserIcon/EraserIcon.jsx";
import Cropper from 'react-easy-crop'
import {generateImage} from "@lib/utils/cropImage.js";
import {BRUSH_COLORS} from "@lib/theme/VARIABLES.js";
import {handleError} from "@lib/utils/service.js";
import {formatFileSize, getRandomNumber} from "@lib/utils/index.jsx";
import FileIcons from "@components/ChatPanel/FileIcons.jsx";

const FilePreview = ({handleSendXhr, selected, reply, selectedFiles, setSelectedFiles}) => {
    const [preview, setPreview] = useState(null)
    const [cropMode, setCropMode] = useState(false);
    const [brushing, setBrushing] = useState({
        color: BRUSH_COLORS[0].color,
        width: 5,
        active: false,
    })
    const [crop, setCrop] = useState({x: 0, y: 0})
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const originalCanvasDimensions = useRef({width: 0, height: 0});
    const isErasingRef = useRef(false);
    const textRef = useRef(null)
    const {editor, onReady} = useFabricJSEditor()

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const clearFiles = () => {
        setSelectedFiles({media: [], documents: []})
    }
    const getPreviewType = (file) => {
        const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml', 'image/heif', 'image/heic'];
        const videoTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mkv', 'video/mpeg', 'video/mpg', 'video/mov', 'video/wmv', 'video/flv', 'video/3gp', 'video/m4v'];
        const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'application/rtf', 'text/csv'];

        if (imageTypes.includes(file.type)) {
            return 'image';
        } else if (videoTypes.includes(file.type)) {
            return 'video';
        } else if (documentTypes.includes(file.type)) {
            return 'document';
        }
        return 'unknown';
    };

    const sendImageToBack = () => {
        const canvas = editor.canvas;
        const imageObject = canvas.getObjects().find(obj => obj.type === 'image');
        if (imageObject) {
            canvas.sendToBack(imageObject);
        }
    };

    const handleBrushClick = () => {
        // Example: Switch to brush tool
        const canvas = editor.canvas;
        if (cropMode)
            setCropMode(false)

        if (brushing.active) {
            canvas.isDrawingMode = false;
        } else {
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush.color = brushing.color;
            canvas.freeDrawingBrush.width = brushing.width;
        }
        setBrushing(prevState => ({...prevState, active: !prevState.active}))

    };
    const handleBrushChange = (palette) => {
        const canvas = editor.canvas;
        canvas.freeDrawingBrush.color = palette.color;
        setBrushing(prevState => ({...prevState, color: palette.color}))
    }

    const handleEraserClick = () => {
        const canvas = editor.canvas;
        if (canvas) {
            isErasingRef.current = !isErasingRef.current;
            canvas.isDrawingMode = isErasingRef.current;

            if (isErasingRef.current) {
                canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
                canvas.freeDrawingBrush.width = 10; // Set the eraser width
            } else {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas); // Reset to pencil brush
            }
        }
    };

    const handleTitleClick = () => {
        const canvas = editor.canvas;

        // Example: Add text to the canvas
        if (brushing.active) {
            setBrushing(prevState => ({...prevState, active: false}))
            canvas.isDrawingMode = false;
        }
        if (cropMode) {
            setCrop(false)
        }

        const text = new fabric.IText('Your text here...', {
            left: 100,
            top: 100,
            originX: 'center',
            originY: 'center',
            fontSize: 30,
            fontFamily: 'Arial',
            fill: brushing.color,
            isEditing: true,

        });
        canvas.add(text);
        canvas.renderAll();
    };

    const handleCropClick = () => {
        if (brushing.active)
            setBrushing(prevState => ({...prevState, active: false}))
        const canvas = editor.canvas;
        const imageObject = canvas.getObjects().find(obj => obj.type === 'image');

        if (imageObject) {
            setCropMode(true);
        }
    };
    const handleCropDone = async () => {
        const canvas = editor.canvas;
        const imageObject = canvas.getObjects().find(obj => obj.type === 'image');
        const imageDataUrl = imageObject.toDataURL();
        const croppedImage = await generateImage(imageDataUrl, croppedAreaPixels)
        setPreview(croppedImage)
        setCropMode(false)
    };

    const handleCropCancel = () => {
        setCropMode(false);
    };

    const handleRotateRightClick = () => {
        const canvas = editor.canvas;
        const imageObject = canvas.getObjects().find(obj => obj.type === 'image');

        if (imageObject) {
            // canvas.setActiveObject(imageObject);
            imageObject.rotate((imageObject.angle + 15) % 360);
            sendImageToBack()
            canvas.renderAll();
            // canvas.setActiveObject(null);
        }
    };

    const handleRotateLeftClick = () => {
        const canvas = editor.canvas;
        const imageObject = canvas.getObjects().find(obj => obj.type === 'image');

        if (imageObject) {
            // canvas.setActiveObject(imageObject);
            imageObject.rotate((imageObject.angle - 15) % 360);
            sendImageToBack()
            canvas.renderAll();
            // canvas.setActiveObject(null);
        }
    };

    const handleUndoClick = () => {
        const canvas = editor.canvas;
        const lastActionIndex = canvas.getObjects().length - 1;
        const lastAction = canvas.item(lastActionIndex);

        if (lastAction && lastAction.get('type') !== "image") {
            canvas.remove(lastAction);
            canvas.renderAll();
        }
    };

    const handleRemoveActiveObject = () => {
        const canvas = editor.canvas;
        const activeObject = canvas.getActiveObjects()

        activeObject.forEach(item => canvas.remove(item))
        canvas.renderAll();
    }

    const handleSaveClick = () => {
        const canvas = editor?.canvas;

        if (cropMode)
            setCropMode(false)
        if (brushing.active)
            setBrushing(prevState => ({...prevState, active: false}))

        if (canvas) {
            // Get the format extension from the original image
            const originalExtension = originalImage.name.split('.').pop().toLowerCase();
            const format = originalExtension === 'jpg' ? 'jpeg' : originalExtension;

            // Convert canvas to data URL
            const dataURL = canvas.toDataURL(`image/${format}`, 1.0);

            // Convert the data URL to a Blob
            fetch(dataURL)
                .then(res => res.blob())
                .then(blob => {
                    // Generate a random number
                    const randomNum = getRandomNumber(10, 999999999)

                    // Create a File object from the Blob with a unique name
                    const file = new File([blob], `edited-image-${randomNum}.${originalExtension}`, {type: `image/${format}`});

                    // Set the file for preview
                    setPreview(file); // Assuming setPreview is available in your scope
                    setOriginalImage(file);

                    // Update the selectedFiles state
                    setSelectedFiles(prevFiles => {
                        // Find the index of the old file (assuming you have a way to identify it)
                        const mediaIndex = prevFiles.media.findIndex(f => f.name === originalImage.name);

                        // Replace the old file with the new one
                        const updatedMedia = [...prevFiles.media];
                        if (mediaIndex !== -1) {
                            updatedMedia[mediaIndex] = file;
                        } else {
                            updatedMedia.push(file);
                        }

                        return {
                            ...prevFiles,
                            media: updatedMedia,
                        };
                    });
                })
                .catch(error => console.error('Error creating file from canvas:', error));
        }
    };


    const handleKeyPress = (e) => {
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }


    const handleSend = () => {
        try {
            const caption = textRef.current.value
            const formData = new FormData();
            formData.append("content", caption);
            formData.append("room", selected?.id);
            if (reply) formData.append("reply_to", reply?.id);
            selectedFiles?.media?.forEach(media => {
                formData.append("media", media);
            });
            selectedFiles?.documents?.forEach(document => {
                formData.append("media", document);
            });

            clearFiles();
            textRef.current.value = ""

            handleSendXhr(formData)
        } catch (error) {
            handleError(error);
        }
    };


    useEffect(() => {
        if (selectedFiles?.media?.length > 0) {
            setPreview(selectedFiles.media[0]);
            setOriginalImage(selectedFiles.media[0])
        } else if (selectedFiles?.documents?.length > 0) {
            setPreview(selectedFiles.documents[0]);
        } else {
            setPreview(null);
        }

    }, [selectedFiles]);

    useEffect(() => {
        if (editor?.canvas && originalCanvasDimensions.current.width === 0) {
            originalCanvasDimensions.current.width = editor.canvas.getWidth();
            originalCanvasDimensions.current.height = editor.canvas.getHeight();
        }
    }, [editor]);

    useEffect(() => {
        if (preview instanceof File) {
            fabric.Image.fromURL(URL.createObjectURL(preview), img => {
                if (editor?.canvas) {
                    const canvas = editor.canvas;

                    // Reset canvas to its original dimensions
                    canvas.setWidth(originalCanvasDimensions.current.width);
                    canvas.setHeight(originalCanvasDimensions.current.height);

                    // Get the image dimensions
                    const imgWidth = img.width;
                    const imgHeight = img.height;

                    // Calculate the aspect ratios
                    const imgAspectRatio = imgWidth / imgHeight;
                    const canvasAspectRatio = canvas.getWidth() / canvas.getHeight();

                    // Determine new canvas dimensions to fit the image
                    if (imgAspectRatio > canvasAspectRatio) {
                        // Image is wider than the canvas
                        const newCanvasHeight = canvas.getWidth() / imgAspectRatio;
                        canvas.setHeight(newCanvasHeight);
                    } else {
                        // Image is taller than the canvas
                        const newCanvasWidth = canvas.getHeight() * imgAspectRatio;
                        canvas.setWidth(newCanvasWidth);
                    }

                    // Clear the canvas before adding the new image
                    canvas.clear();

                    // Scale image to fit the canvas
                    img.scaleToWidth(canvas.getWidth());
                    img.scaleToHeight(canvas.getHeight());

                    // Center the image on the canvas
                    img.set({
                        left: (canvas.getWidth() - img.getScaledWidth()) / 2,
                        top: (canvas.getHeight() - img.getScaledHeight()) / 2,
                        selectable: false,
                    });

                    canvas.add(img);
                    canvas.renderAll();
                }
            })
        }
    }, [preview, editor]);


    if (!preview) {
        return null;
    }

    const previewType = getPreviewType(preview);
    const previewUrl = preview instanceof File ? URL.createObjectURL(preview) : null;


    return (
        <Box sx={CHAT_UPLOAD_MODAL}>
            <Box sx={{position: "absolute", top: 10, left: 10}}>
                <IconButton onClick={clearFiles}>
                    <Close/>
                </IconButton>
            </Box>
            <Box sx={{
                ...VerticalStyle,
                borderRadius: theme => theme.shape.borderRadius,
                py: 1,
                px: 2,
                mb: 1,
                width: "auto",
                margin: "auto",
                alignItems: "center",
                justifyContent: "flex-start"
            }}>
                <Box sx={{...HorizontalStyle}}>
                    <IconButton onClick={handleBrushClick} disabled={previewType !== "image"}>
                        <Brush sx={{color: previewType === "image" ? brushing.color : "disable"}}/>
                    </IconButton>
                    <IconButton onClick={handleEraserClick} disabled>
                        <EraserIcon/>
                    </IconButton>
                    <IconButton onClick={handleTitleClick} disabled={previewType !== "image"}>
                        <Title/>
                    </IconButton>
                    <IconButton onClick={handleCropClick} disabled={previewType !== "image"}>
                        <Crop/>
                    </IconButton>
                    <IconButton onClick={handleRotateRightClick} disabled={previewType !== "image"}>
                        <RotateRight/>
                    </IconButton>
                    <IconButton onClick={handleRotateLeftClick} disabled={previewType !== "image"}>
                        <RotateLeft/>
                    </IconButton>
                    <IconButton onClick={handleUndoClick} disabled={previewType !== "image"}>
                        <Undo/>
                    </IconButton>
                    <IconButton onClick={handleRemoveActiveObject} disabled={previewType !== "image"}>
                        <Clear/>
                    </IconButton>
                    <IconButton onClick={handleSaveClick} color={"primary"}
                                disabled={previewType !== "image"}><Save/></IconButton>
                </Box>
            </Box>
            <Box sx={{
                position: "relative",
                display: "flex",
                justifyContent: "center", alignItems: "center",
                py: 1,
                px: 2,
                mb: 1,
                width: "100%",
                height: "100%",
                maxHeight: "55%",
                margin: "auto",
            }}>
                {(previewType === 'image' && previewUrl) && (
                    <FabricJSCanvas className={`my-canvas ${cropMode && 'hidden'}`} onReady={onReady}/>
                )}
                {cropMode && (
                    <Box className="crop-container">
                        <Cropper
                            image={previewUrl}
                            crop={crop}
                            zoom={zoom}
                            zoomWithScroll={false}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />

                    </Box>
                )}
                {previewType === 'video' && previewUrl && (
                    <Box component="video" controls src={previewUrl}
                         sx={{objectFit: "contain", objectPosition: "center", width: "100%", height: "100%"}}/>
                )}
                {previewType === 'document' && (
                    <Box sx={{
                        ...VerticalStyle,
                        alignItems: "center",
                        justifyContent: "center",
                        width: "250px",
                        height: "250px",
                        bgcolor: "rgba(240,242,245,1)",
                        borderRadius: "8px"
                    }}>
                        <FileIcons fileName={preview.name} sx={{width: "64px", height: "64px"}}/>
                        <Box sx={{
                            ...VerticalStyle, gap: 0, alignItems: "center", justifyContent: "center",
                        }}>
                            <Typography variant={"subtitle1"} color={"primary"}>No preview available</Typography>
                            <Typography variant={"subtitle2"}>{preview.name}</Typography>
                            <Typography variant={"caption"}
                                        component={"small"}>{formatFileSize(preview.size)}</Typography>
                        </Box>

                    </Box>
                )}
            </Box>
            <Box sx={{
                ...VerticalStyle,
                position: "relative",
                py: 1,
                px: 2,
                mb: 1,
                width: "100%",
                height: "auto",
                justifyContent: "flex-start",
                alignItems: "center",
            }}>
                {
                    cropMode &&
                    <Box sx={ACTION_ITEM_STYLES}>
                        <IconButton onClick={handleCropCancel} color={"error"}><Close/></IconButton>
                        <Slider min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(e.target.value)}/>
                        <IconButton onClick={handleCropDone} color={"success"}><Check/></IconButton>
                    </Box>
                }
                {
                    brushing.active &&
                    <Box sx={ACTION_ITEM_STYLES}>
                        {
                            BRUSH_COLORS.map((item, index) =>
                                <IconButton key={index} title={item.title}
                                            sx={{
                                                bgcolor: brushing.color === item.color ? "rgba(0,0,0,0.15)" : "unset",
                                                "&:hover": {
                                                    bgcolor: brushing.color === item.color ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.1)",
                                                }
                                            }}
                                            onClick={() => handleBrushChange(item)}>
                                    <Brush sx={{color: item.color}}/>
                                </IconButton>)
                        }
                    </Box>
                }
                {
                    (!cropMode && !brushing.active) &&
                    <TextField type={"text"} title={"caption"} name={"caption"} placeholder={"Add a caption"}
                               sx={{
                                   bgcolor: "white",
                                   borderRadius: "8px",
                                   maxWidth: {
                                       xs: "100%",
                                       md: "75%",
                                       lg: "60%",
                                       xl: "50%"
                                   }
                               }}
                               inputRef={textRef}
                               onKeyDown={handleKeyPress}
                               fullWidth
                    />
                }

                <Box sx={{
                    ...HorizontalStyle,
                    position: "relative",
                    justifyContent: "flex-start",
                    gap: 2,
                    overflowX: "auto",
                    width: "100%",
                    height: "100%",
                }}>
                    {
                        selectedFiles?.media?.map((media, index) =>
                            <Box key={index} component={getPreviewType(media) === "image" ? "img" : "video"}
                                 onClick={() => setPreview(media)}
                                 src={URL.createObjectURL(media)}
                                 alt={`media ${index}`}
                                 sx={{
                                     position: "relative",
                                     objectFit: "cover",
                                     objectPosition: "center",
                                     width: "100px",
                                     height: "100px",
                                     borderRadius: "8px",
                                     border: theme => media === preview ? `3px solid ${theme.palette.primary.main}` : `3px solid rgba(189,195,199,1)`
                                 }}
                            />
                        )
                    }
                    {
                        selectedFiles?.documents?.map((document, index) =>
                            <Box key={index} sx={{
                                ...VerticalStyle,
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100px",
                                height: "100px",
                                bgcolor: "rgba(240,242,245,1)",
                                borderRadius: "8px",
                                border: theme => document === preview ? `3px solid ${theme.palette.primary.main}` : `3px solid rgba(189,195,199,1)`
                            }}
                                 onClick={() => setPreview(document)}
                            >
                                <FileIcons fileName={document.name} sx={{width: "50px", height: "50px"}}/>
                            </Box>
                        )
                    }
                </Box>
            </Box>
            <Box sx={{position: "absolute", bottom: 70, right: 60}}>
                <Fab color="primary" aria-label="send" onClick={handleSend}>
                    <Send/>
                </Fab>
            </Box>
        </Box>
    );
}

const ACTION_ITEM_STYLES = {
    ...HorizontalStyle,
    width: "100%",
    maxWidth: {
        xs: "100%",
        md: "75%",
        lg: "60%",
        xl: "50%",
    }
}

export default FilePreview

