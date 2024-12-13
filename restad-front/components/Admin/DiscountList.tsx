'use client'
import { useEffect, useState } from 'react';
import DiscountCard from '@/components/Admin/DiscountCard';
// import {applyDiscount, DiscountedDish} from "@/actions/item/get-dishes";
import GetMenuItems from "@/actions/item/get-menu-items";
import {Dish} from "@/lib/models";

export default function DiscountList() {
    const [availableDishes, setAvailableDishes] = useState<Dish[]>([]);
    // const [discountedDishes, setDiscountedDishes] = useState<DiscountedDish[]>([]);
    const [selectedDish, setSelectedDish] = useState<number | null>(null);
    const [discount, setDiscount] = useState<number>(0);
    const uuid = '123e4567-e89b-12d3-a456-426614174000'
    const page = 1
    const elements = 4

    useEffect(() => {
        const fetchDishes = async () => {
            const dishes = await GetMenuItems(uuid, page, elements);
            setAvailableDishes(dishes);
        };

        fetchDishes();
    }, []);

    // const handleAddDiscount = () => {
    //     if (selectedDish !== null) {
    //         const dish = availableDishes.find(d => d.id === selectedDish);
    //         if (dish) {
    //             const discountedDish = applyDiscount(dish, discount);
    //             setDiscountedDishes([...discountedDishes, discountedDish]);
    //             setSelectedDish(null);
    //             setDiscount(0);
    //         }
    //     }
    // };

    // const handleRemoveDiscount = (id: number) => {
    //     setDiscountedDishes(discountedDishes.filter(dish => dish.id !== id));
    // };

    return (
        <div className="p-6">
            <div className="flex gap-4 mb-4">
                <select
                    value={selectedDish ?? ''}
                    onChange={e => setSelectedDish(Number(e.target.value))}
                    className="border rounded px-2 py-2 cursor-pointer"
                >
                    <option value="">Выберите блюдо</option>
                    {availableDishes.map(dish => (
                        <option key={dish.id} value={dish.id}>
                            {dish.localizations && dish.localizations[0].title || ""} - {dish.price}₸
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="Скидка (%)"
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className="border rounded px-2 py-2"
                />
                <button className="bg-purple-600 text-white px-4 py-2 rounded">
                    Добавить скидку
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {/*{discountedDishes.map(dish => (*/}
                {/*    <DiscountCard*/}
                {/*        key={dish.id}*/}
                {/*        title={dish.title}*/}
                {/*        discount={`-${dish.discount}%`}*/}
                {/*        imageSrc={dish.imageUrl}*/}
                {/*        newPrice={`${dish.newPrice}₸`}*/}
                {/*        onRemove={() => handleRemoveDiscount(dish.id)}*/}
                {/*    />*/}
                {/*))}*/}
            </div>
        </div>
    );
}