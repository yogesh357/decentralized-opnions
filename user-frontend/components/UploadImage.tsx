"use client"
import { BACKEND_URL, CLOUDFRONT_URL } from "@/utils";
import axios from "axios";
import { useState } from "react"

export function UploadImage({ onImageAdded, image }: {
    onImageAdded: (image: string) => void;
    image?: string;
}) {
    const [uploading, setUploading] = useState(false);

    // async function onFileSelect(e: any) {
    //     setUploading(true);
    //     try {
    //         const file = e.target.files[0];
    //         const response = await axios.get(`${BACKEND_URL}/v1/user/presignedUrl`, {
    //             headers: {
    //                 "Authorization": localStorage.getItem("token")
    //             }
    //         });
    //         const presignedUrl = response.data.preSignedUrl;
    //         const formData = new FormData();
    //         formData.set("bucket", response.data.fields["bucket"])
    //         formData.set("X-Amz-Algorithm", response.data.fields["X-Amz-Algorithm"]);
    //         formData.set("X-Amz-Credential", response.data.fields["X-Amz-Credential"]);
    //         formData.set("X-Amz-Algorithm", response.data.fields["X-Amz-Algorithm"]);
    //         formData.set("X-Amz-Date", response.data.fields["X-Amz-Date"]);
    //         formData.set("key", response.data.fields["key"]);
    //         formData.set("Policy", response.data.fields["Policy"]);
    //         formData.set("X-Amz-Signature", response.data.fields["X-Amz-Signature"]);
    //         formData.set("X-Amz-Algorithm", response.data.fields["X-Amz-Algorithm"]);
    //         formData.append("file", file);
    //         const awsResponse = await axios.post(presignedUrl, formData);

    //         onImageAdded(`${CLOUDFRONT_URL}/${response.data.fields["key"]}`);
    //     } catch (e) {
    //         console.log(e)
    //     }
    //     setUploading(false);
    // }


    // async function onFileSelect(e: any) {
    //     setUploading(true);
    //     try {
    //         const file = e.target.files[0];
    //         console.log("files on forntend ::", file);

    //         const response = await axios.post(`${BACKEND_URL}/v1/user/upload`,
    //             file,
    //             {
    //                 headers: {
    //                     "Content-Type": "multipart/form-data", // Tell the server what's coming
    //                     "Authorization": localStorage.getItem("token")
    //                 }

    //             }
    //         );

    //         console.log("reponse form the image upload :", response);


    //         onImageAdded(`${CLOUDFRONT_URL}/${response.data.fields["key"]}`);
    //     } catch (e) {
    //         console.log(e)
    //     }
    //     setUploading(false);
    // }
    async function onFileSelect(e: any) {
        setUploading(true);
        try {
            const file = e.target.files[0];
            if (!file) return;

            // 1. Create FormData (Essential for Multer)
            const formData = new FormData();

            // 2. Append the file using the key "images" 
            // This MUST match upload.array("images", 5) on your backend
            formData.append("images", file);

            const response = await axios.post(`${BACKEND_URL}/v1/user/upload`,
                formData, // Send the formData object, not the raw file
                {
                    headers: {
                        // Note: Axios usually sets "Content-Type" automatically 
                        // when it sees FormData, but keeping it is fine.
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
        return <img className={"p-2 w-96 rounded"} src={image} />
    }

    return <div>
        <div className="w-40 h-40 rounded border text-2xl cursor-pointer">
            <div className="h-full flex justify-center flex-col relative w-full">
                <div className="h-full flex justify-center w-full pt-16 text-4xl">
                    {uploading ? <div className="text-sm">Loading...</div> : <>
                        +
                        <input className="w-full h-full bg-red-400 w-40 h-40" type="file" style={{ position: "absolute", opacity: 0, top: 0, left: 0, bottom: 0, right: 0, width: "100%", height: "100%" }} onChange={onFileSelect} />
                    </>}
                </div>
            </div>
        </div>
    </div>
}