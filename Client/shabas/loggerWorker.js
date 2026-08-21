import axiosInstance from "./src/constants/axios.config";


onmessage = async function(e) {
    const { url, data } = e.data;
    try {
        await axiosInstance.post(url, data);
        console.log("Webworker log")
    } catch (error) {
        console.log("Error inserting to log! Error: ", error);
    }
};