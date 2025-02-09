'use client'
import {useState} from "react";
import MenuItemDescription from "@/components/Menu/MenuItemDescription";
import Image from "next/image";
import {resUrl} from "@/lib/api";
import AddItemToCart from "@/actions/cart/add-item-cart";

export interface MenuItemProps {
    title: string;
    description: string;
    imageUrl: string;
    restUUID: string;
    id: number;
    price: number;
}


export default function MenuItem(props: MenuItemProps) {
    const [showComponent, setShowComponent] = useState(false);
    const handleClick = () => {
        setShowComponent(!showComponent);
    };
    function handleOrder() {
        AddItemToCart(props.id, 1, props.price, props.title, props.imageUrl)
    }
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-lg mb-4">
            <div className="flex-1 pr-4">
                <h3 className="text-lg sm:text-xl font-bold">{props.title}</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-2">{props.description}</p>
                <div className="flex space-x-2">
                    <button onClick={handleOrder}
                        className="border border-black rounded-full px-3 text-base md:text-[14px] sm:px-4 sm:py-2 hover:bg-gray-100">
                        Заказать
                    </button>
                    <button
                        className="bg-purple-500 text-white rounded-full px-3 text-base md:text-[14px] sm:px-4 sm:py-2 hover:bg-purple-800">
                        3D view
                    </button>
                </div>
            </div>
            <div className="flex-shrink-0 ml-4 relative w-32 h-32 sm:w-40 sm:h-40">
                <Image onClick={handleClick}
                       src={resUrl + "/" + props.restUUID + "/" + props.imageUrl}
                       alt={props.title}
                       width={128}
                       height={128}
                       className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg object-cover"
                />
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg pointer-events-none">
                    <span className="text-white text-sm sm:text-lg font-semibold animate-pulse">Tap to view</span>
                </div>
                <MenuItemDescription
                    isDescriptionVisible={showComponent}
                    toggleDescription={handleClick}
                    description={props.description}
                    imageUrl={props.imageUrl}
                    restUUID={props.restUUID}
                    title={props.title}
                />
            </div>
        </div>
    );
}