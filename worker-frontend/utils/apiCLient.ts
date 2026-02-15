import axios from "axios";
import { BACKEND_URL, WORKER_TOKEN } from ".";

const API_CLIENT = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Authorization": localStorage.getItem("token")
    },
    withCredentials: true,
})

export default API_CLIENT;
