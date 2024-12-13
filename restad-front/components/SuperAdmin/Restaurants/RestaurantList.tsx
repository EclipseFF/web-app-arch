'use client'
import RestaurantCard from "@/components/SuperAdmin/Restaurants/RestaurantCard";
import getRestaurants from "@/actions/restaurants/get-restaurants";
import {useEffect, useState} from "react";
import CreateRestaurant from "@/components/SuperAdmin/Restaurants/CreateRestaurant";
import AddRestaurant from "@/actions/restaurants/add-restaurant";
import {Restaurant} from "@/lib/models";
import AddSeriesCard from "@/components/SuperAdmin/Series/AddSeriesCard";
import Link from "next/link";

export default function RestaurantList() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const page = 1
    const elements = 50

    useEffect(() => {
        getRestaurants(page, elements).then((restaurants) => setRestaurants(restaurants))
    }, [])

    return (
        <div className="p-6">
            <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-screen-xl mx-auto">
                <AddSeriesCard onClick={() => setShowPopup(true)} name={"Добавить ресторан"}/>

                {restaurants.map((restaurant, index) => (
                    <Link href={"/superadmin/restaurants/" + restaurant.uuid} key={index}>
                        <RestaurantCard title={restaurant.name} image_url={restaurant.logo_image} uuid={restaurant.uuid}/>
                    </Link>
                ))}

                {showPopup && (
                    <CreateRestaurant
                        onClose={() => setShowPopup(false)}
                        onSubmit={AddRestaurant}
                    />
                )}
            </div>
        </div>
    )
}