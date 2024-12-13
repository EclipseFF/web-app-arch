'use client'
import Image from "next/image";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useEffect, useState} from "react";
import { useSwipeable, SwipeableHandlers } from 'react-swipeable';
import GetItemsCart from "@/actions/cart/get-items-cart";

interface CartProps {
    isCartVisible: boolean;
    toggleCart: () => void;
}

export default function CartComponent(props: CartProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [isFullHeight, setIsFullHeight] = useState(false);
    const [items, setItems] = useState<{ id: number, title: string, price: number, quantity: number, imageUrl: string }[]>([]);
    const SWIPE_THRESHOLD = 300;

    useEffect(() => {
        if (props.isCartVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [props.isCartVisible]);

    useEffect(() => {
        GetItemsCart().then((items) => {
            if (items && items.length > 0) {
                setItems(items);
            }
        })
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            props.toggleCart();
            setIsFullHeight(false);
        }, 300);
    };

    const handlers: SwipeableHandlers = useSwipeable({
        onSwipedUp: () => setIsFullHeight(true),
        onSwipedDown: (eventData) => {
            if (eventData.deltaY > (SWIPE_THRESHOLD / 2)) {
                setIsFullHeight(false);
            }
        },
        trackMouse: true,
        trackTouch: true,
    });

    if (!props.isCartVisible && !isClosing) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center md:justify-end">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
            <div
                {...handlers}
                className={`fixed bottom-0 left-0 right-0 w-full bg-white p-4 shadow-lg rounded-t-lg md:hidden flex flex-col transform  
                transition-all ease-in-out duration-300
                ${
                    isFullHeight ? "h-full" : "h-3/4"
                } transition-all ease-in-out duration-500 ${
                    isClosing ? "translate-y-full" : "translate-y-0"
                }`}
             >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer"></div>

                <div className="flex justify-between mb-4">
                    <h2 className="text-bold text-2xl">Корзина</h2>
                    <Image onClick={handleClose} src={'/icons/close.svg'} alt={'Закрыть'} width={32} height={32}/>
                </div>
                    <ScrollArea className="flex flex-col space-y-5 p-2">
                        <div className="mb-4 grid grid-cols-1 gap-4 h-[200px]">
                            <div className="border-2 border-[#F3F3F3] rounded-[20px] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src={"/temp/dishone.svg"} alt={'Dish 1'} width={80} height={80}/>
                                    <span>Стейк Рибай</span>
                                    <span>x1</span>
                                </div>
                            </div><div className="border-2 border-[#F3F3F3] rounded-[20px] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src={"/temp/dishone.svg"} alt={'Dish 1'} width={80} height={80}/>
                                    <span>Стейк Рибай</span>
                                    <span>x1</span>
                                </div>
                            </div><div className="border-2 border-[#F3F3F3] rounded-[20px] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src={"/temp/dishone.svg"} alt={'Dish 1'} width={80} height={80}/>
                                    <span>Стейк Рибай</span>
                                    <span>x1</span>
                                </div>
                            </div><div className="border-2 border-[#F3F3F3] rounded-[20px] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src={"/temp/dishone.svg"} alt={'Dish 1'} width={80} height={80}/>
                                    <span>Стейк Рибай</span>
                                    <span>x1</span>
                                </div>
                            </div><div className="border-2 border-[#F3F3F3] rounded-[20px] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src={"/temp/dishone.svg"} alt={'Dish 1'} width={80} height={80}/>
                                    <span>Стейк Рибай</span>
                                    <span>x1</span>
                                </div>
                            </div><div className="border-2 border-[#F3F3F3] rounded-[20px] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src={"/temp/dishone.svg"} alt={'Dish 1'} width={80} height={80}/>
                                    <span>Стейк Рибай</span>
                                    <span>x1</span>
                                </div>
                            </div><div className="border-2 border-[#F3F3F3] rounded-[20px] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src={"/temp/dishone.svg"} alt={'Dish 1'} width={80} height={80}/>
                                    <span>Стейк Рибай</span>
                                    <span>x1</span>
                                </div>
                            </div><div className="border-2 border-[#F3F3F3] rounded-[20px] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src={"/temp/dishone.svg"} alt={'Dish 1'} width={80} height={80}/>
                                    <span>Стейк Рибай</span>
                                    <span>x1</span>
                                </div>
                            </div>
                            <div className="border-2 border-[#F3F3F3] rounded-[20px] p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src={"/temp/dishtwo.svg"} alt={'Dish 2'} width={80} height={80}/>
                                    <span>Бургер Restad</span>
                                    <span>x2</span>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <button className="w-full py-2 bg-purple-500 text-white font-semibold rounded-lg">
                        Покажите заказ официанту
                    </button>
            </div>

            <div
                className={`hidden md:flex fixed right-0 top-0 w-80 h-full bg-white p-4 shadow-lg z-10 flex-col transform transition-transform duration-300 ${
                    isClosing ? "translate-x-full" : "translate-x-0"
                }`}
            >
                <div className="flex justify-between mb-4">
                    <h2 className="text-bold text-2xl">Корзина</h2>
                    <Image onClick={handleClose} src={'/icons/close.svg'} alt={'Закрыть'} width={32} height={32}/>
                </div>
                <ScrollArea className="flex flex-col space-y-5 p-2">
                    <div className="mb-4 grid grid-cols-1 gap-4">
                        <div className="border-2 border-[#F3F3F3] rounded-[20px] p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Image src={"/temp/dishone.svg"} alt={'Dish 1'} width={80} height={80} />
                                <span>Стейк Рибай</span>
                                <span>x1</span>
                            </div>
                        </div>
                        <div className="border-2 border-[#F3F3F3] rounded-[20px] p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Image src={"/temp/dishtwo.svg"} alt={'Dish 2'} width={80} height={80} />
                                <span>Бургер Restad</span>
                                <span>x2</span>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <button className="w-full py-2 bg-purple-500 text-white font-semibold rounded-lg">
                    Покажите заказ официанту
                </button>
            </div>
        </div>
    );
}