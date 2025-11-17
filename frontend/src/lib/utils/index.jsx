import {franc} from 'franc';

/**
 * Plays a notification sound from the specified URL.
 * The sound file should be located at "/alert.mp3" by default.
 *
 * @param {string} [url="/alert.mp3"] - The URL of the audio file to be played. Defaults to "/alert.mp3".
 */
export const playNotificationSound = (url = "/alert.mp3") => {
    const audio = new Audio(url);
    audio.play();
};
/**
 * Plays a sound repeatedly (e.g., for incoming calls) and returns a controller
 * that can be used to stop it.
 *
 * @param {string} [url="/alert.mp3"] - The URL of the audio file to be played.
 * @returns {{ stop: Function }} An object with a stop method to end playback.
 */
export const playRingingSound = (url = "/phone-ringing.mp3") => {
    const audio = new Audio(url);
    audio.loop = true;
    audio.play().catch(err => {
        console.warn("Failed to play audio:", err);
    });

    return {
        stop: () => {
            audio.pause();
            audio.currentTime = 0;
        },
    };
};


/**
 * Repeats a React component a specified number of times.
 * Throws an error if the arguments are invalid.
 *
 * @param {React.ComponentType} Component - The React component to be repeated.
 * @param {number} length - The number of times to repeat the component.
 * @returns {React.Element[]} An array of repeated components.
 * @throws {Error} Throws an error if the arguments are not valid.
 */
export const repeatComponent = (Component, length) => {
    if (typeof Component !== 'function' || typeof length !== 'number') {
        throw new Error('Invalid arguments: Expected a component and a length number');
    }

    return Array.from({length}, (_, i) => <Component key={i}/>);
};

/**
 * Converts a string into a URL-friendly slug.
 * Slugifies the string by removing accents, converting to lowercase,
 * and replacing spaces and non-alphanumeric characters with hyphens.
 *
 * @param {string} str - The string to be slugified.
 * @returns {string} The slugified string.
 */
export const slugify = (str) => {
    return String(str)
        .normalize('NFKD') // Split accented characters into their base characters and diacritical marks
        .replace(/[\u0300-\u036f]/g, '') // Remove all the accents
        .trim() // Trim leading or trailing whitespace
        .toLowerCase() // Convert to lowercase
        .replace(/[^a-z0-9 -]/g, '') // Remove non-alphanumeric characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Remove consecutive hyphens
};

/**
 * Inserts or updates a URL parameter and updates the browser history.
 *
 * @param {string} key - The parameter key to be updated.
 * @param {string} value - The new value for the parameter.
 */
export const insertUrlParam = (key, value) => {
    if (history.pushState) {
        let searchParams = new URLSearchParams(window.location.search);
        searchParams.set(key, value);
        let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
        window.history.pushState({path: newurl}, '', newurl);
    }
};

/**
 * Removes a URL parameter and updates the browser history.
 *
 * @param {string} paramKey - The parameter key to be removed.
 */
export const removeUrlParam = (paramKey) => {
    const url = window.location.href;
    const r = new URL(url);
    r.searchParams.delete(paramKey);
    const newUrl = r.href;
    window.history.pushState({path: newUrl}, '', newUrl);
};

/**
 * Detects the language of a given text using the franc library.
 *
 * @param {string} data - The text data to analyze.
 * @returns {string} The detected language code.
 */
export const getLanguage = (data) => {
    return franc(data);
};

/**
 * Determines the text direction (RTL or LTR) based on the detected language.
 *
 * @param {string} data - The text data to analyze.
 * @returns {string} The text direction ('rtl' or 'ltr').
 */
export const getDirectionMessage = (data) => {
    const language = getLanguage(data);

    const rtlLanguages = [
        'arb', 'ara', // Arabic
        'fas', 'pes', 'prs', 'fa', // Persian/Farsi
        'heb', // Hebrew
        'urd', // Urdu
        'yid', // Yiddish
        'syr', // Syriac
        'pus', // Pashto
        'kur', // Kurdish
        'div', // Dhivehi/Maldivian
        'arc', // Aramaic
    ];

    return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
};

/**
 * Formats a file size from bytes to a human-readable string.
 *
 * @param {number} size - The file size in bytes.
 * @returns {string} The formatted file size.
 */
export const formatFileSize = (size) => {
    if (size < 1024) {
        return `${size} bytes`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    } else {
        return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
};


/**
 * Generates a random number within a specified range.
 *
 * @param {number} min - The minimum value (inclusive) of the random number. Default is 0.
 * @param {number} max - The maximum value (exclusive) of the random number. Default is 1,000,000.
 * @returns {number} A random number between min (inclusive) and max (exclusive).
 * @throws {Error} Throws an error if min is greater than or equal to max.
 */
export const getRandomNumber = (min = 0, max = 1000000) => {
    // Ensure min and max are integers
    min = Math.floor(min);
    max = Math.floor(max);

    // Validate input values
    if (min >= max) {
        throw new Error("The minimum value must be less than the maximum value.");
    }

    return Math.floor(Math.random() * (max - min)) + min;
};
