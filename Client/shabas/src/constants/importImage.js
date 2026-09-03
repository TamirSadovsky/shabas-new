export const getImageUrl = (imageName = "") => {
    if (typeof imageName !== 'string' || imageName.trim().length === 0) {
        return undefined;
    }

    return `/assets/${imageName}`;
};