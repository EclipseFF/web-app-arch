'use client';
import React, { useEffect, useState } from "react";
import {Menu, Dish, Localization} from "@/lib/models";
import {apiUrl, resUrl} from "@/lib/api";
import GetToken from "@/actions/users/get-token";
import Image from "next/image";
import GetLangCookie from "@/actions/lang/get-lang-cookie";
import { Button } from "@/components/ui/button";
import { langs } from "@/lib/utils";

interface PopupProps {
    onClose: () => void;
    onSubmit: (formdata: FormData) => void;
    menus: Menu[];
    dish: Dish;
    uuid: string
}

export default function EditDishForm(props: PopupProps) {
    const [menuId, setMenuId] = useState<number>(-1);
    const [localizations, setLocalizations] = useState<Localization[]>([]);
    const [price, setPrice] = useState<number>(props.dish.price || 0);
    const [image, setImage] = useState<File | null>(null);
    const [available, setAvailable] = useState<boolean>(props.dish.available || false);
    const [token, setToken] = useState("");
    const [pageLangs, setPageLangs] = useState<string[]>([]);

    useEffect(() => {
        GetToken().then((token) => {
            if (token) {
                setToken(token);
            }
        });
        GetLangCookie().then((lang) => {
            if (lang) {
                setPageLangs([lang]);
            } else {
                setPageLangs(["ru"]);
            }
        });

        if (props.dish.localizations) {
            setLocalizations(props.dish.localizations);
        }
        if (props.dish.categories) {
            setMenuId(props.dish.categories[0].id);
        }
    }, [props.dish.localizations]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setImage(event.target.files[0]);
        }
    };

    const handleSubmit = () => {
        let formdata: FormData = new FormData();
        formdata.append("uuid", props.uuid);
        formdata.append("menu", menuId === -1 ? "" : menuId.toString());
        formdata.append("price", price.toString());
        formdata.append("available", available.toString());
        if (image) {
            formdata.append("image", image);
        }
        localizations.forEach((localization) => {
            formdata.append(localization.lang || "", JSON.stringify({ title: localization.title, description: localization.description, lang: localization.lang }));
        });

        console.log(formdata)
        /*fetch(`${apiUrl}/dishes/rest/${props.uuid}`, {
            headers: {
                "Authentication-Token": token,
            },
            method: "PATCH",
            body: formdata,
        }).then(r => console.log(r));*/
        props.onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto no-scrollbar max-h-[90vh] relative"
            >
                <button
                    onClick={props.onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
                >
                    &times;
                </button>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Изображение:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {image ? (
                        <Image src={URL.createObjectURL(image)} alt="Selected" width={100} height={100} />
                    ) : (
                        props.dish.imageUrl && (
                            <Image src={resUrl + "/" + props.uuid + "/"+ props.dish.imageUrl} alt="Selected" width={100} height={100} />
                        )
                    )}
                </div>

                {
                    localizations && localizations.length > 0 &&
                    localizations.map((localization, index) => (
                        <div key={index} className="mb-4 p-1 border rounded-md">
                            <h2>
                                Локализация на {langs.find(lang => lang.value === localization.lang)?.label}
                            </h2>
                            <Button variant="destructive"
                                onClick={() => {
                                    setLocalizations(localizations.filter((l) => l !== localization));
                                }}
                            >
                                Убрать локализацию на {langs.find(lang => lang.value === localization.lang)?.label}
                            </Button>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Название:</label>
                            <input
                                type="text"
                                value={localization.title || ''}
                                onChange={(e) => {
                                    const updatedLocalizations = [...localizations];
                                    updatedLocalizations[index] = {
                                        ...updatedLocalizations[index],
                                        title: e.target.value
                                    };
                                    setLocalizations(updatedLocalizations);
                                }}
                                className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <label className="block text-gray-700 text-sm font-bold mb-2">Название:</label>
                            <input
                                type="text"
                                value={localization.description || ''}
                                onChange={(e) => {
                                    const updatedLocalizations = [...localizations];
                                    updatedLocalizations[index] = {
                                        ...updatedLocalizations[index],
                                        description: e.target.value
                                    };
                                    setLocalizations(updatedLocalizations);
                                }}
                                className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    ))
                }
                {
                    langs.map((lang) => (
                        localizations.find((l) => l.lang === lang.value) === undefined &&
                        <div key={lang.value} className="mb-4">
                            <Button onClick={() => setLocalizations([...localizations, {
                                id: 0,
                                title: '',
                                description: '',
                                lang: lang.value,
                                dishId: props.dish.id
                            }])}>
                                Добавить локализацию на {langs.find((l) => l.value === lang.value)?.label}
                            </Button>
                        </div>
                    ))
                }
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Цена:</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Доступно ли?</label>
                    <input
                        type="checkbox"
                        checked={available}
                        onChange={() => setAvailable(!available)}
                        className="mr-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Категория:</label>
                    <select
                        value={menuId}
                        onChange={(e) => setMenuId(Number(e.target.value))}
                        name="menuId"
                        id="menuId-select"
                        className="w-full p-2 border rounded-md"
                    >
                        <option value={-1}>Без категории</option>
                        {props.menus.map((menu) => (
                            <option key={menu.id} value={menu.id}>
                                {menu.nameRu || menu.nameKz || menu.nameEn}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSubmit}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 w-full mt-4"
                >
                    Сохранить изменения
                </button>
            </div>
        </div>
    );
}