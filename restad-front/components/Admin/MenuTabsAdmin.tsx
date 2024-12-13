'use client'
import {useEffect, useState} from "react";
import AddCategoryButton from "@/components/Admin/AddCategoryButton";
import AddCategoryForm from "@/components/Admin/AddCategoryForm";
import getTabsContent, {MenuTabsContent} from "@/actions/tabs/get-tabs-content";

export default function MenuTabsAdmin() {
    const [showAddCategoryForm, setShowAddCategoryForm] = useState<boolean>(false);
    const [menuTabs, setMenuTabs] = useState<MenuTabsContent[]>([])
    const uuid = '123e4567-e89b-12d3-a456-426614174000'

    useEffect(() => {
        getTabsContent(uuid).then((menuTabs) => setMenuTabs(menuTabs));
    }, [])

    const handleAddCategory = (newCategory: string) => {
        setMenuTabs((prevTabs) => [...prevTabs, { menuTabName: newCategory }]);
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 py-4 pb-10">
            <div className="flex md:flex-wrap overflow-x-auto md:overflow-x-visible gap-2 basis-full max-w-[350px] md:max-w-full bg-white no-scrollbar">
                <AddCategoryButton onClick={() => setShowAddCategoryForm(true)} />

                {menuTabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`px-4 md:py-2 rounded-full border`}
                    >
                        {tab.menuTabName}
                    </button>
                ))}
            </div>

            {showAddCategoryForm && (
                <AddCategoryForm
                    onClose={() => setShowAddCategoryForm(false)}
                    onAddCategory={handleAddCategory}
                />
            )}
        </div>
    );
}