'use client'
import { BACKEND_URL } from '@/utils'
import API_CLIENT from '@/utils/apiCLient'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify' // Import toast
import { Loader2, AlertCircle, RefreshCcw, CheckCircle2, DollarSign } from 'lucide-react' // Optional icons (install lucide-react or replace with text)
import Image from 'next/image'

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
    const [submitting, setSubmitting] = useState(false); // New state for submission loading

    const fetchNextTask = async () => {
        setLoading(true);
        try {
            const response = await API_CLIENT.get(`${BACKEND_URL}/v1/worker/nextTask`);

            if (response.data.task) {
                setCurrentTask(response.data.task);
            } else {
                setCurrentTask(null);
            }
        } catch (e: any) {
            console.error("Error fetching task", e);
            toast.error("Failed to load tasks. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNextTask();
    }, []);

    const onTaskSelect = async (optionId: number) => {
        if (submitting) return; // Prevent double clicks

        setSubmitting(true);
        try {
            const response = await API_CLIENT.post(`${BACKEND_URL}/v1/worker/submission`, {
                taskId: currentTask?.id.toString(),
                selection: optionId.toString()
            });

            toast.success("Task submitted successfully!");

            const nextTask = response.data.nextTask;
            if (nextTask) {
                setCurrentTask(nextTask);
            } else {
                setCurrentTask(null);
                toast.info("No more tasks available at the moment.");
            }

        } catch (e: any) {
            console.error("Submission failed", e);
            const errorMessage = e.response?.data?.message || "Error submitting selection. Please try again.";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <TaskSkeleton />;
    }

    if (!currentTask) {
        return (
            <div className="flex flex-col items-center justify-center min-h-125 p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto mt-10">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <CheckCircle2 className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
                <p className="text-gray-500 mb-8 max-w-md">
                    There are no pending tasks right now. New tasks are added frequently, so please check back in a bit.
                </p>
                <button
                    onClick={fetchNextTask}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all hover:shadow-lg active:scale-95"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh Tasks
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 flex flex-col relative">

                {/* Header Section */}
                <div className="p-6 md:p-8 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-blue-200 shadow-md">
                                Task #{currentTask.id}
                            </span>
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>Select the most relevant image</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                            <div className="bg-green-500 rounded-full p-1 text-white">
                                <DollarSign className="w-4 h-4" />
                            </div>
                            <span className="text-green-700 font-mono font-bold text-lg">
                                {(currentTask.amount / 100).toFixed(2)}
                            </span>
                            <span className="text-green-600 text-xs font-medium uppercase ml-1">Reward</span>
                        </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                        {currentTask.title}
                    </h2>
                </div>

                {/* Options Grid */}
                <div className="p-6 md:p-10 bg-white relative">

                    {/* Loading Overlay during submission */}
                    {submitting && (
                        <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <p className="text-gray-600 font-medium animate-pulse">Submitting your choice...</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {currentTask.options.map((option) => (
                            <Option
                                key={option.id}
                                imageUrl={option.image_url}
                                onSelect={() => onTaskSelect(option.id)}
                                disabled={submitting}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const Option = ({ imageUrl, onSelect, disabled }: { imageUrl: string; onSelect: () => void, disabled: boolean }) => {
    const [imgLoaded, setImgLoaded] = useState(false);

    return (
        <button
            onClick={onSelect}
            disabled={disabled}
            className={`
                group relative flex flex-col w-full text-left
                rounded-2xl border-2 transition-all duration-300 overflow-hidden
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 border-transparent bg-gray-50'}
            `}
        >
            <div className="relative w-full aspect-4/3 bg-gray-200 overflow-hidden">
                {/* Image Placeholder Skeleton */}
                {!imgLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}

                <Image
                    src={imageUrl}
                    alt="Option"
                    fill // <--- Replaces width={4} height={4}
                    // Add sizes for performance optimization (100vw on mobile, 50vw on desktop)
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onLoad={() => setImgLoaded(true)}
                    className={`
                        object-cover transition-all duration-500
                        ${imgLoaded ? 'opacity-100 group-hover:scale-105' : 'opacity-0'}
                    `}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 px-6 py-2 rounded-full font-bold shadow-lg z-10">
                        Select Option
                    </div>
                </div>
            </div>
        </button>
    );
};
// Loading Skeleton Component
const TaskSkeleton = () => {
    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-8 border-b border-gray-100">
                    <div className="flex justify-between mb-4">
                        <div className="h-6 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="aspect-4/3 bg-gray-100 rounded-2xl animate-pulse"></div>
                    <div className="aspect-4/3 bg-gray-100 rounded-2xl animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

export default NextTask;