'use client'
import React, {useState} from "react";
import AddSeries from "@/actions/series/add-series";
import {useRouter} from "next/navigation";

interface PopupProps {
    onClose: () => void;
}

export default function CreateSeries(props: PopupProps){
    const router = useRouter()
    const [name, setName] = useState('');

    const handleSubmit = () => {
        AddSeries(name).then(() => router.refresh())
    }
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto no-scrollbar max-h-[90vh] relative">
                <button
                    onClick={props.onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
                >
                    &times;
                </button>


                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 w-full mt-4"
                >
                    Создать франшизу
                </button>
            </div>
        </div>
    );

}