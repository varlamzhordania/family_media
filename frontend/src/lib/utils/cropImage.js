/**
 * Create an image element from a URL
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>}
 */
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous"); // Needed to avoid cross-origin issues
        image.src = url;
    });

/**
 * Convert degree value to radian
 * @param {number} degreeValue - Degree value
 * @returns {number} - Radian value
 */
function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180;
}

/**
 * Crop and rotate an image
 * @param {string} imageSrc - Image URL
 * @param {Object} pixelCrop - Object containing crop dimensions and position
 * @param {number} rotation - Rotation angle in degrees
 * @returns {Promise<string>} - Data URL of the cropped and rotated image
 */
export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    // Set canvas dimensions to accommodate the rotated image
    canvas.width = safeArea;
    canvas.height = safeArea;

    // Translate context to rotate around the center of the image
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate(getRadianAngle(rotation));
    ctx.translate(-safeArea / 2, -safeArea / 2);

    // Draw the image on the canvas
    ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    // Set canvas dimensions to the final crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Paste the rotated image with the correct offsets
    ctx.putImageData(
        data,
        0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
        0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
    );

    // Return as Data URL
    return canvas.toDataURL("image/jpeg");
}


/**
 * Generate a File object from a cropped image
 * @param {string} imageSrc - Image URL
 * @param {Object} crop - Object containing crop dimensions and position
 * @returns {Promise<File>} - File object of the cropped image
 */
export const generateImage = async (imageSrc, crop) => {
    if (!crop || !imageSrc) {
        throw new Error("Image source and crop parameters are required.");
    }

    try {
        const croppedImageDataUrl = await getCroppedImg(imageSrc, crop);

        return new Promise((resolve, reject) => {
            fetch(croppedImageDataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'croppedImage.jpg', {type: 'image/jpeg'});
                    resolve(file);
                })
                .catch(error => reject(error));
        });
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
};
