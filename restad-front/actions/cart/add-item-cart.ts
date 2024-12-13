'use server'

import {cookies} from "next/headers";

export default async function AddItemToCart(id: number, quantity: number, price: number, title: string, image_url: string) {
    const cookieStore = await cookies()
    const prevCartCookie = cookieStore.get('cart')
    let cart = prevCartCookie ? JSON.parse(prevCartCookie?.value) : [];
    const existingItem = cart.find((item: any) => item.id === id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id, quantity, price, title, image_url });
    }

    cookieStore.set('cart', JSON.stringify(cart));
}