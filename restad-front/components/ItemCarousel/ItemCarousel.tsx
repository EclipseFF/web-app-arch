'use client'
import { useEffect, useState } from 'react';
import ItemCard from '@/components/ItemCarousel/ItemCard';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import getDiscountedItems, {DiscountItem} from "@/actions/discountedItems/get-discount-items";

export default function ItemCarousel() {
    const [items, setItems] = useState<DiscountItem[]>([]);

    useEffect(() => {
        const data = getDiscountedItems();
        setItems(data)
    }, [])
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Позиции на скидках:</h2>
                <select className="border rounded-full px-2 py-2 cursor-pointer">
                    <option>Категория: первое</option>
                    <option>Категория: второе</option>
                    <option>Категория: десерт</option>
                </select>
            </div>
            <Carousel>
                <CarouselContent>
                    {items.map((item, index) => (
                        <CarouselItem key={index} className="basis-1/2">
                            <ItemCard
                                title={item.title}
                                price={item.price}
                                discount={item.discount}
                                imageUrl={item.imageUrl}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}