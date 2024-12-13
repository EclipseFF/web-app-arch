import { Restaurant, Series, User } from "@/lib/models";
import { useState } from "react";
import AddRestToSeries from "@/components/SuperAdmin/Series/AddRestToSeries";
import AddUserToSeries from "@/components/SuperAdmin/Series/AddUserToSeries";
import { resUrl } from "@/lib/api";
import Image from "next/image";

export interface SeriesInfo {
    restaurants: Restaurant[];
    users: User[];
    series?: Series;
    link: string;
}

export default function SeriesInfo(props: SeriesInfo) {
    const [showPopupRest, setShowPopupRest] = useState<boolean>(false);
    const [showPopupUser, setShowPopupUser] = useState<boolean>(false);

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            {/* Header Section */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-800">Данные франшизы</h2>
                    {props.link == "superadmin" && (
                        <div className="flex flex-row gap-4">
                            <button
                                onClick={() => setShowPopupRest(true)}
                                className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition"
                            >
                                Добавить ресторан в франшизу
                            </button>
                            <button
                                onClick={() => setShowPopupUser(true)}
                                className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition"
                            >
                                Добавить пользователя в франшизу
                            </button>
                        </div>
                    )}
                </div>
                {props.series && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-700">Название:</h3>
                        <p className="text-gray-800">{props.series.name}</p>
                    </div>
                )}
            </div>

            {/* Restaurants Section */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Рестораны</h3>
                {props.restaurants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {props.restaurants.map((restaurant, index) => (
                            <div
                                key={index}
                                className="bg-gray-100 p-4 border rounded-lg shadow hover:shadow-lg transition"
                            >
                                <Image
                                    src={`${resUrl}/${restaurant.uuid}/${restaurant.logo_image}`}
                                    alt={restaurant.name}
                                    width={200}
                                    height={200}
                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                />
                                <h4 className="text-center font-semibold text-gray-800">{restaurant.name}</h4>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">Нет доступных ресторанов</p>
                )}
            </div>

            {/* Users Section */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Пользователи</h3>
                {props.users.length > 0 ? (
                    <ul className="list-disc pl-6">
                        {props.users.map((user, index) => (
                            <li key={index} className="text-gray-800 mb-2">
                                {user.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">Нет доступных ресторанов</p>
                )}
            </div>

            {/* Popups */}
            {showPopupRest && (
                <AddRestToSeries
                    restaurants={props.restaurants}
                    seriesId={props.series?.id || 0}
                    onClose={() => setShowPopupRest(false)}
                    onSubmit={(restaurants) => console.log(restaurants)}
                />
            )}
            {showPopupUser && (
                <AddUserToSeries
                    onClose={() => setShowPopupUser(false)}
                    onSubmit={(users) => console.log(users)}
                    seriesId={props.series?.id || 0}
                    users={props.users}
                />
            )}
        </div>
    );
}