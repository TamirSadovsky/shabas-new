export const getImageUrl = (imageName = "") => {
    if(imageName.length == 0) return undefined;
    return `/assets/${imageName}`;
  };