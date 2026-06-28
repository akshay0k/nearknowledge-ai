import { useRef } from "react";
import Button from "../ui/Button";
import { Upload } from "lucide-react";

const UploadModal = ({ onUpload, uploading = false }) => {
  const inputRef = useRef();

  const handleSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    onUpload(file);
    e.target.value = "";
  };

  return (
    <div className="mb-8">
      <input
        type="file"
        hidden
        ref={inputRef}
        accept=".pdf"
        onChange={handleSelect}
      />

      <Button
        disabled={uploading}
        onClick={() => inputRef.current.click()}
        className="flex w-full items-center justify-center gap-2 sm:w-auto"
      >
        <Upload size={18} />
        {uploading ? "Reading PDF..." : "Upload PDF"}
      </Button>
    </div>
  );
};

export default UploadModal;
