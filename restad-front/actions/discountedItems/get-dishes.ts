// import getMenuItems, {Dish} from "@/actions/item/get-menu-items";
//
// export interface DiscountedDish extends Dish {
//     discount: number;
//     newPrice: number;
// }
//
// const dishes = getMenuItems('123e4567-e89b-12d3-a456-426614174000', 1, 2)
//
// export const getDishes = async (): Promise<Dish[]> => dishes;
//
// export const applyDiscount = (dish: Dish, discount: number): DiscountedDish => {
//     const newPrice = parseInt(dish.price, 10) - (parseInt(dish.price, 10) * discount) / 100;
//     return { ...dish, discount, newPrice };
// };