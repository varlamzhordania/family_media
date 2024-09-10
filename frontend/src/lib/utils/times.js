export const getFormattedDate = (date = null, options = {}) => {
    if (!date) return false;

    const {
        showDate = true,
        showTime = false,
        locale = navigator.language || "en-US",  // Use system locale or fallback to "en"
        dateOptions = {year: "numeric", month: "long", day: "2-digit"},
        timeOptions = {hour: "2-digit", minute: "2-digit"},
        isUTC = false  // New option to handle UTC dates, default is false for backward compatibility
    } = options;

    const dateTimeFormatOptions = {};

    if (showDate) {
        Object.assign(dateTimeFormatOptions, dateOptions);
    }

    if (showTime) {
        Object.assign(dateTimeFormatOptions, timeOptions);
    }

    let parsedDate;

    if (isUTC) {
        // Parse the date as UTC if isUTC is true
        parsedDate = new Date(date + 'Z');
    } else {
        // Parse as a normal local date
        parsedDate = new Date(date);
    }

    return Intl.DateTimeFormat(locale, dateTimeFormatOptions).format(parsedDate);
};


export const formatDateForDjango = (date = null, options = {}) => {
    if (!date) return null;

    const {
        showTime = true,
        useMidnight = true,
        useISO = false
    } = options;

    let dateObj = new Date(date);

    // Convert date to UTC if needed
    if (!useISO) {
        dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
    }

    if (useISO) {
        return dateObj.toISOString();
    }

    if (!showTime) {
        if (useMidnight) {
            return dateObj.toISOString().split('T')[0] + 'T00:00:00Z';
        } else {
            return dateObj.toISOString().split('T')[0];
        }
    }

    return dateObj.toISOString();
};
