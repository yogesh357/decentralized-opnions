"use client";

import { BACKEND_URL, USER_TOKEN } from '@/utils';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react'

// 1. Updated Interfaces based on your JSON
interface TaskDetails {
    id: number;
    title: string;
    amount: number;
}

interface TaskOption {
    count: number;
    option: {
        imageUrl: string;
    };
}

interface TaskData {
    task: TaskDetails;
    result: Record<string, TaskOption>; // Map of ID -> Option
}

function TaskPage() {
    const params = useParams();
    const taskId = params.taskId as string;

    const [data, setData] = useState<TaskData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getTaskDetails = async () => {
            if (!taskId) return;

            setLoading(true);
            setError("");

            try {
                // Secure token handling
                const token = localStorage.getItem("token") || USER_TOKEN;

                if (!token) {
                    throw new Error("No authentication token found. Please log in.");
                }

                const response = await axios.get(`${BACKEND_URL}/v1/user/task?taskId=${taskId}`, {
                    headers: {
                        "Authorization": token
                    }
                });

                console.log("Response from get task:", response.data);
                setData(response.data);

            } catch (e: any) {
                console.error("Error fetching task:", e);
                const errorMessage = e.response?.data?.message || e.message || "Failed to load task details.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        }

        getTaskDetails();
    }, [taskId]);

    // Calculate total votes for percentage display
    const totalVotes = useMemo(() => {
        if (!data?.result) return 0;
        return Object.values(data.result).reduce((acc, curr) => acc + curr.count, 0);
    }, [data]);

    // Loading State
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                    <div className="text-lg font-medium text-gray-600">Loading task...</div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="bg-white border-l-4 border-red-500 shadow-md rounded-r p-6 max-w-md">
                    <h3 className="text-red-600 font-bold mb-1">Error Loading Task</h3>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return <div className="text-center mt-20 text-gray-500">No data found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">

                {/* Header Section: Title & Metadata */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wide">
                                    Task #{data.task.id}
                                </span>
                                {totalVotes > 0 && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold uppercase tracking-wide">
                                        Active
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                {data.task.title}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                            <div className="text-right">
                                <div className="text-xs text-gray-500 font-medium uppercase">Bounty</div>
                                <div className="text-xl font-mono font-bold text-gray-900">
                                    {/* Formatting Amount (assuming lamports/atomic units, purely visual here) */}
                                    {(data.task.amount / 1000000000).toLocaleString()} SOL
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(data.result).map((key) => {
                        const item = data.result[key];
                        return (
                            <TaskResultCard
                                key={key}
                                optionId={key}
                                imageUrl={item.option.imageUrl}
                                count={item.count}
                                totalVotes={totalVotes}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

function TaskResultCard({
    imageUrl,
    count,
    optionId,
    totalVotes
}: {
    imageUrl: string,
    count: number,
    optionId: string,
    totalVotes: number
}) {
    // Calculate percentage, default to 0 to avoid NaN
    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

    return (
        <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={`Option ${optionId}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content Container */}
            <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-500">
                            Option {optionId}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-gray-900">{count}</span>
                            <span className="text-xs text-gray-400 font-medium uppercase">Votes</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
                        <div
                            className="bg-gray-900 h-2.5 rounded-full transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                    <div className="text-right text-xs text-gray-400 font-medium">
                        {percentage}% Share
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TaskPage