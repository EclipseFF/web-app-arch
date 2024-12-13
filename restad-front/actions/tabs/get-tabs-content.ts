'use server'
import {apiUrl} from "@/lib/api";

export interface MenuTabsContent {
    menuTabName: string;
}

export default async function getTabsContent(restaurant_uuid: string) {
    const response = await fetch(apiUrl + "/dishes/categories?restaurant_uuid=" + restaurant_uuid);
    const json = await response.json();
    console.log(json)
    let menuTabs: MenuTabsContent[] = json.map((category: any) => ({
        menuTabName: category.menu,
    }));
    return menuTabs
}