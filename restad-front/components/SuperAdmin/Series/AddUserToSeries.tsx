import React, {useEffect, useState} from "react";
import {Restaurant, User} from "@/lib/models";
import GetUsersPagination from "@/actions/users/get-users-pagination";
import ChangeUserAtSeries from "@/actions/series/change-user-at-series";
import SetUserSeriesAccess from "@/actions/access/set-user-series-access";

interface SelectUsersPopupProps {
    seriesId: number;
    onClose: () => void;
    onSubmit: (users: User[]) => void;
    users: User[];
}

export default function AddUserToSeries(props: SelectUsersPopupProps){
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>(props.users || []);

    useEffect(() => {
        const page = 1;
        const elements = 50;
        GetUsersPagination(page, elements).then(setUsers);
    }, []);

    const handleCheckboxChange = (user: User) => {
        setSelectedUsers((prevSelected) => {
            if (prevSelected.some((u) => u.id === user.id)) {
                return prevSelected.filter((u) => u.id !== user.id);
            } else {
                return [...prevSelected, user];
            }
        });
    };

    const handleSubmit = () => {
        SetUserSeriesAccess(selectedUsers.map(u => u.id), props.seriesId)
        props.onSubmit(selectedUsers);
        props.onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-semibold mb-4 text-center">Выберите пользователей</h2>

                <div className="max-h-60 overflow-y-auto mb-4">
                    {users.length > 0 ? (
                        <ul>
                            {users.map((user) => (
                                <li key={user.id} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        id={user.id.toString()}
                                        checked={selectedUsers.some(u => u.id === user.id)}
                                        onChange={() => handleCheckboxChange(user)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={user.id.toString()} className="text-sm">{user.name}</label>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Загрузка...</p>
                    )}
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={props.onClose}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Добавить выбранных
                    </button>
                </div>
            </div>
        </div>
    );
}