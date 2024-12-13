'use server'

import {apiUrl} from "@/lib/api";
import {Dish, Menu} from "@/lib/models";

export default async function GetDishesByCategories(restaurant_uuid: string, page: number, elements: number) {
    try {
        const response = await fetch(apiUrl + "/dishes/categories?restaurant_uuid=" + restaurant_uuid + "&page=" + page + "&elements=" + elements);

        if (!response.ok) {
            return [];
        }

        const json = await response.json();
        let resp: { menu: Menu, dishes: Dish[] }[] = [];

        json.forEach((item: any) => {
            resp.push({
                menu: item.menu,
                dishes: item.dishes
            });
        });
    console.log(resp)
        return resp;

    } catch (error) {
        return [];
    }
}