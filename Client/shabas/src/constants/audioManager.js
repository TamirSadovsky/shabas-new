// audioManager.js
import song from "../assets/sounds/אם חיים נולד ב.mp3";

const basePath = "../assets/sounds/";

// Object to hold all audio file references
const audioFiles = {
    "אם חיים נולד ב": `אם חיים נולד ב.mp3`,
    "song2": `${basePath}anotherSong.mp3`,
    // Add more songs as needed
};

// Function to get an audio file
const getAudio = async (name) => {
    const nameEncoded = basePath + encodeURI(audioFiles[name])
    console.log(audioFiles[name])
    return new Audio(nameEncoded);
};

export { getAudio };
