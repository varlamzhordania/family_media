import {useState} from "react";
import {Box, Tab, Tabs} from "@mui/material";
import FamilyFeeds from "@components/FamilyFeeds/FamilyFeeds.jsx";
import FamilySettings from "@components/FamilySettings/FamilySettings.jsx";
import FamilyTree from "@components/FamilyTree/FamilyTree.jsx";
import {useUserContext} from "@lib/context/UserContext.jsx";

const FamilyTabs = ({family, query}) => {
    const {user} = useUserContext()
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{width: '100%'}}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Feeds" {...a11yProps(0)} />
                    <Tab label="Tree" {...a11yProps(1)} />
                    {
                        query?.data?.creator === user.id && <Tab label="Settings" {...a11yProps(3)} />
                    }

                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <FamilyFeeds/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <FamilyTree family={family} query={query}/>
            </CustomTabPanel>
            {
                query?.data?.creator === user.id &&
                <CustomTabPanel value={value} index={2}>
                    <FamilySettings family={family} query={query}/>
                </CustomTabPanel>
            }

        </Box>
    );
}

function CustomTabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`family-tabpanel-${index}`}
            aria-labelledby={`family-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{py: 3}}>{children}</Box>}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `family-tab-${index}`,
        'aria-controls': `family-tabpanel-${index}`,
    };
}

export default FamilyTabs