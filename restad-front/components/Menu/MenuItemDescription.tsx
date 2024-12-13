'use client'
import Image from "next/image";
import {useEffect, useState} from "react";
import {resUrl} from "@/lib/api";

interface MenuItemDescriptionProps {
    isDescriptionVisible: boolean;
    toggleDescription: () => void;
    title: string;
    description: string;
    imageUrl: string;
    restUUID: string
}

export default function MenuItemDescription(props: MenuItemDescriptionProps) {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (props.isDescriptionVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [props.isDescriptionVisible]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            props.toggleDescription();
        }, 300);
    };

    if (!props.isDescriptionVisible && !isClosing) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center md:justify-end">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />

            <div
                className={`fixed bottom-0 left-0 right-0 w-full bg-white p-4 shadow-lg rounded-t-lg md:hidden flex flex-col 
                transform transition-transform ease-in-out duration-300 max-h-full overflow-y-auto 
                ${isClosing ? "translate-y-full" : "translate-y-0"}`}
            >
                <div className="flex justify-between mb-4">
                    <h2 className="font-bold text-2xl">Описание</h2>
                    <Image onClick={handleClose} src={'/icons/close.svg'} alt={'Закрыть'} width={32} height={32}/>
                </div>

                <div className="relative w-full h-64 mb-4">
                    <Image src={resUrl + "/" + props.restUUID + "/" + props.imageUrl} alt={props.title} layout="fill" objectFit="cover" className="rounded-lg"/>
                </div>

                <div className="mb-4">
                    <p className="text-gray-700 text-base">
                        {props.description}
                    </p>
                </div>

                <button className="w-full py-2 bg-purple-500 text-white font-semibold rounded-lg mb-2">
                    Добавить в корзину
                </button>
                <button className="w-full py-2 bg-purple-500 text-white font-semibold rounded-lg">
                    Посмотреть 3д модель
                </button>
            </div>

            <div
                className={`hidden md:flex fixed right-0 top-0 w-80 h-full bg-white p-4 shadow-lg z-10 flex-col 
                transform transition-transform ease-in-out duration-300 max-h-full overflow-y-auto
                ${isClosing ? "translate-x-full" : "translate-x-0"}`}
            >
                <div className="flex justify-between mb-4">
                    <h2 className="font-bold text-2xl">Описание</h2>
                    <Image onClick={handleClose} src={'/icons/close.svg'} alt={'Закрыть'} width={32} height={32}/>
                </div>

                <div className="relative w-full h-64 mb-4">
                    <Image src={resUrl + "/" + props.restUUID + "/" + props.imageUrl} alt={props.title} layout="fill" objectFit="cover" className="rounded-lg"/>
                </div>

                <div className="mb-4">
                    <p className="text-gray-700 text-base">
                        {props.description}
                    </p>
                </div>

                <button className="w-full py-2 bg-purple-500 text-white font-semibold rounded-lg mb-2">
                    Добавить в корзину
                </button>
                <button className="w-full py-2 bg-purple-500 text-white font-semibold rounded-lg">
                    Посмотреть 3д модель
                </button>
            </div>
        </div>
    );
}