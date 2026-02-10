'use client'
import { BACKEND_URL, WORKER_TOKEN } from '@/utils';
import API_CLIENT from '@/utils/apiCLient';
import axios from 'axios';
import React, { useEffect, useState } from 'react'

function TaskList() {
    const [tasks, setTasks] = useState([]);



    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await API_CLIENT.get("/v1/worker/nextTask")
                console.log("response", response.data);
                setTasks(response.data.tasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        }
        fetchTasks()
    }, [])
    return (
        <div>
            hi
        </div>
    )
}

export default TaskList
