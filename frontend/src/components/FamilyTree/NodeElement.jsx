import {Avatar, Box, Typography} from "@mui/material";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {getFormattedDate} from "@lib/utils/times.js";


const NodeElement = ({nodeDatum, toggleNode, showModal, setSelectedNode, handleModal, treeQuery}) => {

    const handleAvatarClick = () => {
        if (!showModal) {
            setSelectedNode(nodeDatum)
        } else {
            setSelectedNode(null)
        }
        handleModal()
    }


    return (
        <g>
            <foreignObject width="60" height="60" x="-30" y="-30" onClick={handleAvatarClick}>
                <Avatar src={nodeDatum?.avatar} alt={nodeDatum?.name} sx={ImageStyle} />
            </foreignObject>
            <foreignObject width="220" height="320" x="40" y="-35" onClick={toggleNode}>
                <Box sx={{display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
                    <Typography variant={"body1"} fontWeight={600} textTransform={"capitalize"}>
                        {nodeDatum?.name}
                    </Typography>
                    {nodeDatum?.children?.length > 0 ? nodeDatum?.__rd3t?.collapsed ? <ExpandLess/> :
                        < ExpandMore/> : <></>}
                </Box>
                <Box>
                    {
                        nodeDatum?.date_of_birth &&
                        <Typography variant={"caption"} component={"p"}><strong>Date of Birth :</strong> {getFormattedDate(nodeDatum?.date_of_birth,)}</Typography>
                    }
                    {
                        nodeDatum?.date_of_death &&
                        <Typography variant={"caption"} component={"p"}><strong>Date of Death :</strong> {getFormattedDate(nodeDatum?.date_of_death,)}</Typography>
                    }

                </Box>
            </foreignObject>
        </g>
    );
};

const ImageStyle = {
    width: "100%",
    height: "100%",
};


export default NodeElement;
