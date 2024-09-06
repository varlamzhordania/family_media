import {getHeaders} from "@lib/utils/service.js";

export const uploadFilesWithProgress = (url, formData, onProgress) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('POST', url, true);

        // Set headers from the headers parameter
        const headers = getHeaders("none")
        for (const [key, value] of Object.entries(headers)) {
            if (value) {
                xhr.setRequestHeader(key, value);
            }
        }

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentage = Math.floor((event.loaded * 100) / event.total);
                onProgress(percentage);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error('Upload failed with status ' + xhr.status));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network error'));
        };

        xhr.send(formData);
    });
};
