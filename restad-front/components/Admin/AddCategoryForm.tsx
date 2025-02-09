'use client'
import {useState} from "react";

interface AddCategoryFormProps {
    onClose: () => void;
    onAddCategory: (newCategory: string) => void;
}

export default function AddCategoryForm(props: AddCategoryFormProps) {
    const [newCategory, setNewCategory] = useState('');

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            props.onAddCategory(newCategory);
            setNewCategory('');
            props.onClose();
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-md mx-auto mt-6">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Название новой категории:
                </label>
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter category name..."
                />
            </div>
            <div className="flex justify-end gap-4">
                <button
                    onClick={props.onClose}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                    Отмена
                </button>
                <button
                    onClick={handleAddCategory}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                    Добавить категорию
                </button>
            </div>
        </div>
    );
}