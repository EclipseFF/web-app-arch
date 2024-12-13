import React, {useEffect, useState} from "react";
import getRestaurants from "@/actions/restaurants/get-restaurants";
import {Restaurant} from "@/lib/models";
import ChangeRestAtSeries from "@/actions/series/change-rest-at-series";
import SetSeriesRestaurantAccess from "@/actions/access/set-series-restaurant-access";

interface SelectRestaurantsPopupProps {
    seriesId: number;
    onClose: () => void;
    onSubmit: (restaurants: Restaurant[]) => void;
    restaurants: Restaurant[];
}

export default function AddRestToSeries(props: SelectRestaurantsPopupProps) {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>(props.restaurants || []);

    useEffect(() => {
        const page = 1;
        const elements = 50;
        getRestaurants(page, elements).then(setRestaurants);
    }, []);

    const handleCheckboxChange = (restaurant: Restaurant) => {
        setSelectedRestaurants((prevSelected) => {
            if (prevSelected.some((r) => r.uuid === restaurant.uuid)) {
                return prevSelected.filter((r) => r.uuid !== restaurant.uuid);
            } else {
                return [...prevSelected, restaurant];
            }
        });
    };

    // Handle form submission
    const handleSubmit = () => {
        SetSeriesRestaurantAccess(props.seriesId, selectedRestaurants.map(r => r.uuid))
        props.onSubmit(selectedRestaurants);
        props.onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-semibold mb-4 text-center">
                    Выберите рестораны
                </h2>

                <div className="max-h-60 overflow-y-auto mb-4">
                    {restaurants.length > 0 ? (
                        <ul>
                            {restaurants.map((restaurant) => (
                                <li key={restaurant.uuid} className="flex items-center mb-2">
                                    <input
                                        type="checkbox"
                                        id={restaurant.uuid}
                                        checked={selectedRestaurants.some(r => r.uuid === restaurant.uuid)}
                                        onChange={() => handleCheckboxChange(restaurant)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={restaurant.uuid} className="text-sm">{restaurant.name}</label>
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
                        Добавить выбранные
                    </button>
                </div>
            </div>
        </div>
    );
}