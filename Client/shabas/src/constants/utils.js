import axiosInstance from "./axios.config";

const getNumberFromString = (str) => {
    const match = str.match(/\d+/);  // Extract digits from the string
    return match ? parseInt(match[0], 10) : null;  // Convert extracted digits to an integer
};

function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


const importImage = async (imageName) => {
    console.log("imageName ", imageName)
    const extention = imageName.split('.');
    console.log("extention", extention)
    const image = await import(`../assets/${extention[0]}.${extention[1]}`);
    return image.default;
};

const sendToLog = async ({userId, categoryId, questionId, isQuestion, isCorrect, answer})=>{
    const data = {userId, categoryId, questionId, isQuestion, isCorrect, answer} 
    try{
        await axiosInstance.post('/log/insert_to_log', data);
    }catch(e){
        console.log("Error inserting to log! Error: ", e)
    }
}

export {getNumberFromString, debounce, importImage, sendToLog}