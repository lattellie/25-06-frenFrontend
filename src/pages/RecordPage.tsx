export default function RecordPage() {
    return (
        <div className="flex min-h-screen">
            {/* 30% width column */}
            <div className="w-[30%] flex flex-col items-center border-2 border-black">
                <h1 className="bg-cyan-300 p-4 rounded mt-4">Left Panel</h1>
                <p className="mt-4">Item A</p>
                <p className="mt-2">Item B</p>
            </div>

            {/* 70% width column */}
            <div className="w-[70%] flex flex-col items-center">
                <h1 className="bg-cyan-500 p-4 rounded mt-4">Right Panel</h1>
                <p className="mt-4">Item 1</p>
                <p className="mt-2">Item 2</p>
            </div>
        </div>
    );
}
