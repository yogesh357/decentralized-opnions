import axios from "axios";
import { BACKEND_URL, WORKER_TOKEN } from ".";

const API_CLIENT = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Authorization": WORKER_TOKEN
    },
    withCredentials: true,
})

export default API_CLIENT;
