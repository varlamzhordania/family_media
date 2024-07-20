import {
    Article,
    Assessment, AudioFile,
    Description,
    InsertDriveFile,
    PictureAsPdf,
} from "@mui/icons-material";

const FileIcons = ({fileName, sx}) => {
    const extension = fileName.split('.').pop().toLowerCase();

    switch (extension) {
        case 'pdf':
            return <PictureAsPdf sx={sx}/>;
        case 'doc':
        case 'docx':
            return <Article sx={sx}/>;
        case 'xls':
        case 'xlsx':
            return <InsertDriveFile sx={sx}/>;
        case 'ppt':
        case 'pptx':
            return <Assessment sx={sx}/>;
        case 'txt':
            return <Description sx={sx}/>;
        case 'rtf':
            return <InsertDriveFile sx={sx}/>;
        case 'csv':
            return <InsertDriveFile sx={sx}/>;
        case 'mp3':
        case 'wav':
        case 'ogg':
        case 'flac':
            return <AudioFile sx={sx}/>;
        default:
            return <InsertDriveFile sx={sx}/>;
    }
};

export default FileIcons;
