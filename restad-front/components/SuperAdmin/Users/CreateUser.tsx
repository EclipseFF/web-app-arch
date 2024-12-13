'use client'
import React, {useState} from "react";
import AddUser from "@/actions/users/add-user";
import {User} from "@/lib/models";
import {useRouter} from "next/navigation";

interface PopupProps {
    onClose: () => void;
}

export default function CreateUser(props: PopupProps){
    const router = useRouter()
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [patronymic, setPatronymic] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');

    const handleSubmit  = () => {
        const user: User = {
            id: 0,
            name: name,
            surname: surname,
            patronymic: patronymic,
            email: email,
            password: password,
            role: role,
            isVerified: false,
            isBlocked: false,
            isDeleted: false,
            updatedAt: new Date(),
            createdAt: new Date()
        }
        AddUser(user).then(() => window.location.reload())

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
                    <label className="block text-gray-700 text-sm font-bold mb-2">Имя:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Фамилия:</label>
                    <input
                        type="text"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Отчество:</label>
                    <textarea
                        value={patronymic}
                        onChange={(e) => setPatronymic(e.target.value)}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Электронная почта:</label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 p-2 rounded-md focus:outline-none"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Пароль:</label>
                    <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-10 p-2 rounded-md focus:outline-none"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Роль:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} name="roles" id="role-select">
                        <option value="user">Пользователь</option>
                        <option value="moderator">Модератор</option>
                        <option value="admin">Администратор</option>
                    </select>
                </div>

                <button
                    onClick={handleSubmit}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 w-full mt-4"
                >
                    Submit
                </button>
            </div>
        </div>
    );

}