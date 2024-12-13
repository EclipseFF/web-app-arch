'use server'
import {apiUrl} from "@/lib/api";
import {Dish, Localization} from "@/lib/models";

export default async function GetMenuItems(restaurant_uuid: string, page: number, elements: number): Promise<Dish[]> {
    try {
        const response = await fetch(apiUrl + "/dishes/pagination?restaurant_uuid=" + restaurant_uuid + "&page=" + page + "&elements=" + elements);
        if (!response.ok) {
            return [];
        }

        const json = await response.json();
        let dishes: Dish[] = [];

        if(typeof json.dishes !== 'undefined' && json.dishes.length > 0) {
            json.dishes.forEach((dish: any) => {
                let localizations: Localization[] = [];
                if (typeof dish.localizations !== 'undefined' && dish.localizations.length > 0) {
                    dish.localizations.forEach((loc: any) => {
                        localizations.push({
                            id: loc.id,
                            title: loc.title,
                            description: loc.description,
                            lang: loc.lang,
                            dishId: loc.dishId,
                        });
                    });
                }


                dishes.push({
                    id: dish.id,
                    imageUrl: dish.imageUrl,
                    link3d: dish.link3d,
                    price: dish.price,
                    categories: dish.categories,
                    available: dish.available,
                    localizations: localizations,
                    createdAt: dish.createdAt,
                    updatedAt: dish.updatedAt
                });
            });
        }
        return dishes;
    } catch (error) {
        return [];
    }
}
