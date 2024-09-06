import { createContext } from "react";
import PropTypes from "prop-types";

import { defaultSettings } from "@config";
import { useLocalStorage } from "@hooks";

const initialState = {
    ...defaultSettings,
    onChangeMode: () => {},
    onToggleMode: () => {},
    onChangeDirection: () => {},
    onChangeLayout: () => {},
    onToggleStretch: () => {},
    onResetSetting: () => {},
};

export const SettingsContext = createContext(initialState);

export default function SettingsProvider({ children }) {
    const [settings, setSettings] = useLocalStorage("settings", {
        themeMode: initialState.themeMode,
        themeDirection: initialState.themeDirection,
        themeLayout: initialState.themeLayout,
        themeStretch: initialState.themeStretch,
    });

    const onChangeMode = (event) => {
        setSettings({ ...settings, themeMode: event.target.value });
    };

    const onToggleMode = () => {
        setSettings({ ...settings, themeMode: settings.themeMode === "light" ? "dark" : "light" });
    };

    const onChangeDirection = (event) => {
        setSettings({ ...settings, themeDirection: event.target.value });
    };

    const onChangeLayout = (event) => {
        setSettings({ ...settings, themeLayout: event.target.value });
    };

    const onToggleStretch = () => {
        setSettings({ ...settings, themeStretch: !settings.themeStretch });
    };

    const onResetSetting = () => {
        setSettings({
            themeMode: initialState.themeMode,
            themeDirection: initialState.themeDirection,
            themeLayout: initialState.themeLayout,
            themeStretch: initialState.themeStretch,
        });
    };

    return (
        <SettingsContext.Provider
            value={{
                ...settings,
                // Mode
                onChangeMode,
                onToggleMode,
                // Direction
                onChangeDirection,
                // Stretch
                onToggleStretch,
                // Navbar Horizontal
                onChangeLayout,
                // Reset Setting
                onResetSetting,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

SettingsProvider.propTypes = {
    children: PropTypes.node,
};
