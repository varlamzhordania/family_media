import {blue, brown, cyan, green, grey, pink, purple, red, teal, yellow} from "@mui/material/colors";

export const PRIMARY = {
    light: teal[200],
    main: teal[500],
    dark: teal[700],
    contrastText: "white",
}
export const SECONDARY = {
    light: brown[500],
    main: brown[800],
    dark: brown[900],
}

export const LIGHT_GREY = {
    light: grey[100],
    main: grey[200],
    dark: grey[300],
    contrast: grey[500],
    contrastText: grey[700],
}
export const DARK_GREY = {
    light: "#777777",
    main: "#555555",
    dark: "#222222",
    contrast: "#999999",
    contrastText: "#f5f5f5",
}

export const LIGHT_BACKGROUND = {
    default: '#f3f3f3',
    light: '#fcfcfc',
    main: '#FAFCFE',
    dark: '#f5f5f5',
    contrast: '#f3f3f3',
    contrastText: "#191919",
}
export const DARK_BACKGROUND = {
    light: '#3d3d3d',
    main: '#272727',
    dark: '#333333',
    contrast: '#555555',
    contrastText: "#FAFCFE",
}


export const BRUSH_COLORS = [
    {
        title: "Black",
        color: "#000000",
    },
    {
        title: "White",
        color: "#FFFFFF",
    },
    {
        title: "Grey",
        color: grey[500],
    },
    {
        title: "Red",
        color: red[700], // Darker shade for more impact
    },
    {
        title: "Pink",
        color: pink[600], // Slightly deeper pink for better visibility
    },
    {
        title: "Magenta",
        color: purple[700], // Stronger shade of purple
    },
    {
        title: "Blue",
        color: blue[700], // Deeper blue for richness
    },
    {
        title: "Cyan",
        color: cyan[500], // More vivid cyan
    },
    {
        title: "Green",
        color: green[600], // Deeper green for better contrast
    },
    {
        title: "Yellow",
        color: yellow[700], // Richer yellow for better visibility
    },
];