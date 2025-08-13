import { useState, useEffect } from "react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (unit: string, className: string, file: File) => void;
    defaultclass?: string;
};

export default function Uploadcsv({ isOpen, onClose, onSubmit, defaultclass }: Props) {
    console.log("Uploadcsv rendering. isOpen =", isOpen);
    const [unit, setUnit] = useState("");
    const [className, setClassName] = useState(defaultclass ?? "");
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            setClassName(defaultclass ?? "");
        }
    }, [isOpen, defaultclass]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!unit || !className || !file) {
            setStatus("Please fill in all fields and select a file.");
            return;
        }

        setStatus("Uploading...");

        try {
            const formData = new FormData();
            formData.append("unit", unit);
            formData.append("className", className);
            formData.append("csv", file);

            const response = await fetch(`${import.meta.env.VITE_BACKEND}/upload-csv`, {
                method: "POST",
                body: formData,
            });
            const uploadJson = await response.json();
            if (!response.ok) {
                const errordata = await response.json();
                setStatus(`Upload failed: ${errordata.message || "Unknown error"}`);
                alert(`Upload failed: ${uploadJson.message || "Unknown error"}`);

                return;
            }
            alert(`✅ Upload successful!\nInserted: ${uploadJson.insertedCount}\nSkipped (duplicates): ${uploadJson.skippedCount}`);
            if (uploadJson.success) {
                setStatus("✅ Upload successful!");
                // You can also call onSubmit here if needed
                onSubmit(unit, className, file);
                setUnit("");
                setClassName("");
                setFile(null);
                onClose();
            } else {
                setStatus(`❌ Upload failed: ${uploadJson.message || "Unknown error"}`);
            }
        } catch (error) {
            setStatus("❌ Error connecting to server");
            console.error("Upload error:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
                <h2 className="text-xl font-semibold mb-4">Add Unit + Upload CSV</h2>

                <label className="block mb-2">Unit Name</label>
                <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded mb-4"
                />

                <label className="block mb-2">Class Name</label>
                <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded mb-4"
                />

                <div className="mb-4">

                    <div className="flex items-center gap-4">
                        {/* Custom button */}
                        <label className="bg-amber-900 text-white px-4 py-2 rounded cursor-pointer hover:bg-amber-700">
                            Choose File
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                        </label>

                        {/* Display file name or placeholder */}
                        <span className="text-amber-900 text-sm">
                            {file ? file.name : "No file chosen"}
                        </span>
                    </div>
                </div>

                {status && <p className="mb-4 text-sm">{status}</p>}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => {
                            setUnit("");
                            setClassName("");
                            setFile(null);
                            setStatus("");
                            onClose();
                        }}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-sky-900 text-white rounded hover:bg-sky-700"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
