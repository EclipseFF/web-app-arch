'use client'
import RestaurantCard from "@/components/SuperAdmin/Restaurants/RestaurantCard";
import {useEffect, useState} from "react";
import {Restaurant} from "@/lib/models";
import Link from "next/link";
import GetRestByUser from "@/actions/admin/get-rest-by-user";

export default function RestList({id}: {id: number}) {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const page = 1
    const elements = 50

    useEffect(() => {
        GetRestByUser(page, elements, id).then((restaurants) => setRestaurants(restaurants))
    }, [])

    return (
        <div className="p-6 bg-gray-50">
            <h2 className="text-lg font-bold mb-4 text-center">Список ресторанов:</h2>
            <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-screen-xl mx-auto">
                {restaurants.map((restaurant, index) => (
                    <Link href={"/admin/restaurant/" + restaurant.uuid} key={index}>
                        <RestaurantCard title={restaurant.name} image_url={restaurant.logo_image} uuid={restaurant.uuid}/>
                    </Link>
                ))}
            </div>
        </div>
    )
}