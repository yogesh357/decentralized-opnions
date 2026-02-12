

"use client";
// import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { UploadImage } from "@/components/UploadImage";
import { BACKEND_URL } from "@/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
// import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export const Upload = () => {
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState("");
    const [txSignature, setTxSignature] = useState("");
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const router = useRouter();

    async function onSubmit() {
        const response = await axios.post(`${BACKEND_URL}/v1/user/task`, {
            options: images.map(image => ({
                imageUrl: image,
            })),
            title,
            signature: txSignature
        }, {
            headers: {
                "Authorization": localStorage.getItem("token") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3MDY2MDc0OH0.qkIdBixyur2xj9oHAHxLXDh-8GZ9QheoWs2mm2xcuOQ"
            }
        })

        console.log("response form the add task ::", response);
        if (response.data.success) {
            toast.success("Task created successfully!");
            router.push(`/task/${response.data.id}`)
        }
    }

    async function makePayment() {

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey!,
                toPubkey: new PublicKey("Bo7Vsz4EFpDCWUeC9FfpnvRNF6jApmneoTLoMF1TFd3c"), //->yogesh-local
                lamports: 100000000,
            })
        );

        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight }
        } = await connection.getLatestBlockhashAndContext();

        const signature = await sendTransaction(transaction, connection, { minContextSlot });

        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
        setTxSignature(signature);
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-8 py-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
                        Create a Task
                    </h2>

                    <div className="mb-6">
                        <label htmlFor="title" className="block mb-2 text-sm font-semibold text-gray-900">
                            Task Details
                        </label>
                        <input
                            onChange={(e) => {
                                setTitle(e.target.value);
                            }}
                            type="text"
                            id="title"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 transition-all outline-none"
                            placeholder="What is your task?"
                            required
                        />
                    </div>

                    <label className="block mb-4 text-sm font-semibold text-gray-900">
                        Add Images
                    </label>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {images.map((image, idx) => (
                            <UploadImage
                                key={idx}
                                image={image}
                                onImageAdded={(imageUrl) => {
                                    setImages(i => [...i, imageUrl]);
                                }}
                            />
                        ))}

                        {/* Always show one empty uploader at the end of the grid or alone */}
                        <UploadImage onImageAdded={(imageUrl) => {
                            setImages(i => [...i, imageUrl]);
                        }} />
                    </div>

                    <div className="flex justify-center pt-6 border-t mt-8">
                        {/* <button
                            onClick={onSubmit}
                            type="button"
                            className="text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-base px-8 py-3 transition-all shadow-md hover:shadow-lg w-full md:w-auto"
                        >
                            Submit Task
                        </button> */}
                        <button onClick={txSignature ? onSubmit : makePayment} type="button" className="mt-4 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
                            {txSignature ? "Submit Task" : "Pay 0.1 SOL"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}