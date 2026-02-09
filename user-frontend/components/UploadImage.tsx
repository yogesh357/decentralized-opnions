"use client";
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useState } from "react"

export function UploadImage({ onImageAdded, image }: {
    onImageAdded: (image: string) => void;
    image?: string;
}) {
    const [uploading, setUploading] = useState(false);

    async function onFileSelect(e: any) {
        setUploading(true);
        try {
            const file = e.target.files[0];
            if (!file) return;
            console.log("file on frontend to send to the backend :: ", file);


            // 1. Create FormData (Essential for Multer)
            const formData = new FormData();

            // 2. Append the file using the key "images" 
            // This MUST match upload.array("images", 5) on your backend
            formData.append("images", file);

            const response = await axios.post(`${BACKEND_URL}/v1/user/upload`,
                formData, // Send the formData object, not the raw file
                {
                    headers: {
                        "Authorization": localStorage.getItem("token") || ""
                    }
                }
            );

            console.log("Response from image upload:", response.data);

            // 3. Extract the URL from your Cloudinary response
            // Based on your controller, it returns: images: [{ url: "...", publicId: "..." }]
            const imageUrl = response.data.images[0].url;

            onImageAdded(imageUrl);

        } catch (e) {
            console.error("Upload error:", e);
        } finally {
            setUploading(false);
        }
    }

    if (image) {
        return (
            <div className="relative group w-full h-40 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <img className="w-full h-full object-cover" src={image} alt="Uploaded preview" />
            </div>
        )
    }

    return (
        <div className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer bg-gray-50">
            <div className="h-full flex flex-col justify-center items-center relative w-full">
                {uploading ? (
                    <div className="text-sm font-medium text-gray-500 flex flex-col items-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        Loading...
                    </div>
                ) : (
                    <>
                        <div className="text-gray-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Click to Upload</span>
                        <input
                            className="w-full h-full absolute inset-0 cursor-pointer z-10 opacity-0"
                            type="file"
                            onChange={onFileSelect}
                        />
                    </>
                )}
            </div>
        </div>
    )
}