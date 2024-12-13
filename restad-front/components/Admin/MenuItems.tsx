'use client'
import MenuItem from "@/components/Admin/MenuItem";
import {useEffect, useState} from "react";
import CreatePopup from "@/components/Admin/CreatePopup";
import AddMenuItemCard from "@/components/Admin/AddMenuItemCard";
import GetMenuItems from "@/actions/item/get-menu-items";
import {Dish} from "@/lib/models";

export default function MenuItems(){
    const [menuItems, setMenuItems] = useState<Dish[]>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const uuid = '123e4567-e89b-12d3-a456-426614174000'
    const page = 1
    const elements = 4

    useEffect(() => {
        GetMenuItems(uuid, page, elements).then((menuItems) => setMenuItems(menuItems))
    }, [])

    const handlePopupSubmit = (id:number, title: string, description: string, link: string, image: File | null, price: string) => {
        const newItem: Dish = {id, imageUrl: image ? URL.createObjectURL(image) : "", link3d: link, price: Number(price), available: true };
        // addMenuItem(newItem);
        setMenuItems([...menuItems, newItem]);
        setShowPopup(false);
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
            <AddMenuItemCard onClick={() => setShowPopup(true)}/>

            {menuItems.map((item, index) => (
                <MenuItem key={index} title={item.localizations && item.localizations[0].title || ""} imageSrc={item.imageUrl}/>
            ))}

            {showPopup && (
                <CreatePopup
                    onClose={() => setShowPopup(false)}
                    onSubmit={handlePopupSubmit}
                />
            )}
        </div>
    );
}