export interface DiscountItem {
    title: string;
    price: string;
    discount: string;
    imageUrl: string;
}

export default function getDiscountedItems(): DiscountItem[]{
    return [
        { title: 'Позиция1', price: '2000₸', discount: '-17%', imageUrl: '/temp/dishone.svg' },
        { title: 'Позиция2', price: '10000₸', discount: '-17%', imageUrl: '/temp/dishtwo.svg' },
        { title: 'Позиция3', price: '3500₸', discount: '-17%', imageUrl: '/temp/dishone.svg' },
        { title: 'Позиция4', price: '4000₸', discount: '-10%', imageUrl: '/temp/dishone.svg' },
        { title: 'Позиция5', price: '5000₸', discount: '-20%', imageUrl: '/temp/dishtwo.svg' },
    ];
};