export interface Dish {
    id: number;
    imageUrl: string;
    link3d: string;
    price: number;
    available: boolean;
    categories?: Menu[];
    createdAt?: Date;
    updatedAt?: Date;
    localizations?: Localization[]
}

export interface Localization {
    id: number;
    title?: string;
    description?: string;
    lang?: string
    dishId: number
}

export interface Menu {
    id: number;
    restaurantId: string;
    nameRu?: string;
    nameKz?: string;
    nameEn?: string;
}

export interface Restaurant {
    uuid: string
    name: string
    translation: string
    description: string
    logo_image: string
    primary_color: string
    secondary_color: string
    address: string

}

export interface Series {
    id: number
    name: string
    createdAt?: Date
    updatedAt?: Date
}


export interface User {
    id: number;
    surname?: string;
    name: string;
    patronymic?: string;
    email: string;
    password: string;
    role: string;
    isVerified: boolean;
    isBlocked: boolean;
    isDeleted: boolean;
    updatedAt: Date;
    createdAt: Date;
}