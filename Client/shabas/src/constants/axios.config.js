import axios from 'axios';


// const baseURL = 'https://shabas-server1-cqcgd2a0gvecfjgt.israelcentral-01.azurewebsites.net/';
const baseURL = 'http://localhost:3000';
const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
        // Add any other headers you need here
    }
});

export default axiosInstance;