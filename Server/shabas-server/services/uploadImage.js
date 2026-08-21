const fbinit = require("./firebaseinit");
const fbstorage = require("firebase/storage");
const axios = require('axios')

const uploadImage = async (imageData) => {
  try {
    const storageRef = fbstorage.ref(fbinit.storage, `/puzzle/${imageData.name}`);

    const response = await axios.get(imageData.src);
    const blob = await response.blob();

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result;

        const uploadTask = await fbstorage.uploadString(
        storageRef,
        imageData.base64,
        "data_url"
        );
        const imageUrl = await fbstorage.getDownloadURL(storageRef);
        return imageUrl;
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {uploadImage}
