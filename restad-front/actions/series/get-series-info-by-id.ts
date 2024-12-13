'use server'

import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";
import {Restaurant, Series, User} from "@/lib/models";

export default async function GetSeriesInfoById(id: number){
    try {
        const token = (await cookies()).get('token')?.value

        if (!token) {
            throw new Error('Unauthorized: No token found');
        }

        const response = await fetch (apiUrl + "/series/" + id , {
            headers: {
                'Authentication-Token': token
            }
        });
        if (!response.ok) {

            return {};
        }

        const json = await response.json();
        let series: Series;
        if (json.series) {
            series = {
                id: json.series.id,
                name: json.series.name,
                createdAt: json.series.createdAt,
                updatedAt: json.series.updatedAt,
            };
        }  else {
            return {};
        }
        let restaurants: Restaurant[] = [];
        if (json.restaurants) {
            json.restaurants.forEach((restaurant: any) => {
                restaurants.push({
                    uuid: restaurant.uuid,
                    name: restaurant.name,
                    translation: restaurant.translation,
                    description: restaurant.description,
                    logo_image: restaurant.logo_image,
                    primary_color: restaurant.primary_color,
                    secondary_color: restaurant.secondary_color,
                    address: restaurant.address
                });
            });
        }
            let users: User[] = [];
            if (json.users) {
                json.users.forEach((user: any) => {
                    users.push({
                        id: user.id,
                        name: user.name,
                        surname: user.surname,
                        patronymic: user.patronymic,
                        email: user.email,
                        role: user.role,
                        password: user.password,
                        isVerified: false,
                        isBlocked: false,
                        isDeleted: false,
                        updatedAt: new Date(),
                        createdAt: new Date()
                    });
                });
            }
            return {series, restaurants, users};
    } catch (error) {
        console.error(error);
        return {};
    }
}