import {useEffect, useRef, useState} from "react";
import {uploadFilesWithProgress} from "@lib/services/xhrService.js";
import {API_BASE_URL} from "@src/conf/index.js";
import {Box, LinearProgress, Typography} from "@mui/material";
import {HorizontalStyle} from "@lib/theme/styles.js";


const UploadProgress = ({task, setTasks}) => {
    const [uploadProgress, setUploadProgress] = useState(task.last_progress);
    const renderAfterCalled = useRef(false);

    useEffect(() => {
        if (!renderAfterCalled.current) {
            const initiateTask = async () => {
                try {
                    await uploadFilesWithProgress(`${API_BASE_URL}/api/chat/`, task.data, (percentage) => {
                        setUploadProgress(percentage);
                    });
                    setTasks(null);
                } catch (error) {
                    console.error("Upload failed:", error);
                    setTasks(null);
                }
            };
            initiateTask();
        }
        renderAfterCalled.current = true;

    }, []);

    return <Box sx={{...HorizontalStyle,}}>
        <LinearProgress variant="determinate" value={uploadProgress} sx={{width:"100%"}}/>
        <Typography>{uploadProgress}%</Typography>
    </Box>;
};

export default UploadProgress;
