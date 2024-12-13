import {useState} from "react";
import {Menu} from "@/lib/models";
import CategoryCard from "@/components/SuperAdmin/Restaurants/CategoryCard";
import {useEffect} from "react";

export default function CategoriesList({menu}: {menu : Menu[]}) {
    const [categories, setCategories] = useState<Menu[]>(menu);

    useEffect(() => {
        setCategories(menu)
    },[menu])

    return (
        <div className="p-6">
            <div
                className="grid grid-cols-1 gap-4 max-w-screen-xl mx-auto">

                {categories.map((category, index) => (
                    <CategoryCard key={index} name={category.nameEn || category.nameRu || category.nameKz || ""}/>
                ))}

            </div>
        </div>
    )
}