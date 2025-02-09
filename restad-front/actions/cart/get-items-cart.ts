'use server'

import {cookies} from "next/headers";

export default async function GetItemsCart() {
    const cookieStore = await cookies(); // Получаем доступ к cookie
    const cartCookie = cookieStore.get('cart'); // Извлекаем cookie с ключом 'cart'

    if (!cartCookie) {
        return [];
    }

    try {
        const cart = JSON.parse(cartCookie.value); // Парсим JSON
        return cart; // Возвращаем массив товаров
    } catch (error) {
        return []; // В случае ошибки возвращаем пустой массив
    }
}