import {useEffect, useState} from "react";
import {Dish} from "@/lib/models";
import DishCard from "@/components/SuperAdmin/Restaurants/DishCard";

export default function DishesList({dish}: {dish : Dish[]}) {
    const [dishes, setDishes] = useState<Dish[]>(dish);

    useEffect(() => {
        setDishes(dish)
    },[dish])

    return (
        <div className="p-6">
            <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-screen-xl mx-auto">

                {dishes.map((dish, index) => (
                        <DishCard key={index} title={dish.localizations && dish.localizations[0].title || ""} image_url={dish.imageUrl}
                                  description={dish.localizations && dish.localizations[0].description || ""} id={dish.id} price={dish.price}/>
                ))}

            </div>
        </div>
    )
}