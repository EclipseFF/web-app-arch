'use client'
import {useState} from "react";

interface PopupProps {
    onClose: () => void;
    onSubmit: (id: number, title: string, description: string, link: string, image: File | null, price: string) => void;
}

export default function CreatePopup(props: PopupProps) {
    const [id, setId] = useState(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link3d, setLink3d] = useState('');
    const [imageSrc, setImageSrc] = useState<File | null>(null);
    const [price, setPrice] = useState('');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length >0) {
            setImageSrc(event.target.files[0]);
        }
    }

    const handleSubmit  = () => {
        props.onSubmit(id, title, description, link3d, imageSrc, price);
        props.onClose();
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                <button
                    onClick={props.onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-black"
                >
                    &times;
                </button>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Добавить изображение:
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {imageSrc && (
                        <p className="text-sm text-gray-500 mt-2">
                            Выбрано: {imageSrc.name}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Добавить название:
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Введите название..."
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Добавить описание:
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Введите описание..."
                        rows={3}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Add link for 3D view:
                    </label>
                    <input
                        type="text"
                        value={link3d}
                        onChange={(e) => setLink3d(e.target.value)}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Введите ссылку на 3D просмотр..."
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Price (KZT):
                    </label>
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Введите цену..."
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 w-full mt-4"
                >
                    Готово
                </button>
            </div>
        </div>
    )
}