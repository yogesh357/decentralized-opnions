'use client'
import { BACKEND_URL } from '@/utils'
import API_CLIENT from '@/utils/apiCLient'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

interface Task {
    id: number;
    amount: number;
    title: string;
    options: {
        id: number;
        image_url: string;
        task_id: number;
    }[];
}

function NextTask() {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchNextTask = async () => {
        setLoading(true);
        try {
            const response = await API_CLIENT.get(`${BACKEND_URL}/v1/worker/nextTask`);
            console.log("response form nexttask ::", response.data.task);

            setCurrentTask(response.data.task);
        } catch (e) {
            console.error("Error fetching task", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNextTask();
    }, []);

    const onTaskSelect = async (optionId: number) => {
        try {
            const response = await API_CLIENT.post(`${BACKEND_URL}/v1/worker/submission`, {
                taskId: currentTask?.id.toString(),
                selection: optionId.toString()
            });
            console.log("response form submission ::", response);

            // Assuming your API returns the next task in the same format
            const nextTask = response.data.nextTask;
            // setCurrentTask(nextTask || null);
            if (nextTask) {

                setCurrentTask(nextTask)

            } else {

                setCurrentTask(null)

            }
        } catch (e) {
            console.error("Submission failed", e);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 italic">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                Loading the next task...
            </div>
        );
    }

    if (!currentTask) {
        // FIXED: Added missing 'return' here
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-xl font-medium text-gray-600">No pending tasks!</p>
                <p className="text-gray-400 mt-2">Please check back later for more opportunities.</p>
                <button
                    onClick={fetchNextTask}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col h-full">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
                            Task #{currentTask.id}
                        </span>
                        <span className="text-green-600 font-mono font-bold">
                            ${(currentTask.amount / 100).toFixed(2)}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {currentTask.title}
                    </h2>
                </div>

                <div className="p-8">
                    <p className="text-center text-gray-500 mb-6 font-medium">Select the best option below:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentTask.options.map((option) => (
                            <Option
                                key={option.id}
                                // FIXED: Wrapped in arrow function to prevent immediate execution
                                onSelect={() => onTaskSelect(option.id)}
                                imageUrl={option.image_url}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const Option = ({ imageUrl, onSelect }: { imageUrl: string; onSelect: () => void }) => {
    return (
        <div
            onClick={onSelect}
            className="group cursor-pointer relative overflow-hidden rounded-xl border-2 border-transparent hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl"
        >
            <img
                src={imageUrl}
                width={400} // Add this
                height={225}
                alt="Task Option"
                className="w-full aspect-video object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
    );
};

export default NextTask;