import Appbar from "@/components/Appbar";
import { Upload } from "@/components/Upload";
import { UploadImage } from "@/components/UploadImage";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Appbar />
      {/* <UploadImage /> */}
      <Upload />
    </div>
  );
}
