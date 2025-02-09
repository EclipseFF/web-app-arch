'use client'
import {useEffect, useState} from "react";
import CartComponent from "@/components/Cart/CartComponent";
import GetLangCookie from "@/actions/lang/get-lang-cookie";
import SetLangCookie from "@/actions/lang/set-lang-cookie";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {ChevronsUpDown} from "lucide-react";
import {Command, CommandItem, CommandList} from "@/components/ui/command";
import {langs} from "@/lib/utils";
import GetRestInfoById from "@/actions/restaurants/get-rest-info-by-id";
import {useSearchParams} from "next/navigation";
import Image from "next/image";
import {resUrl} from "@/lib/api";
import {Restaurant} from "@/lib/models";



export default function Header() {
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [open, setOpen] = useState(false)
    const [lang, setLang] = useState('');
    const [restaurant, setRestaurant] = useState<Restaurant>();
    const searchParams = useSearchParams()
    const cookie_uuid = searchParams?.get('rst') ?? '';
    const toggleCart = () => {
        setIsCartVisible(!isCartVisible);
    };
    useEffect(() => {
        GetLangCookie().then(
            (lang) => {
                if (lang) {
                    setLang(lang);
                } else {
                    setLang('ru');
                    SetLangCookie('ru');
                }
            }
        )
    }, []);
    useEffect(() => {
        GetRestInfoById(cookie_uuid).then((info) => {
            if (info && info.restaurant) {
                setRestaurant(info.restaurant)
            }
        })
    }, [])



    return (
        <header className="flex flex-row sm:flex-row justify-between items-center p-4 border-b">
            <div className="text-lg font-semibold mb-2 sm:mb-0">
                <Image src={resUrl+ "/" + restaurant?.uuid + "/" + restaurant?.logo_image} alt={"Logo"} width={120} height={60} />
            </div>
            <div className="flex space-x-2 sm:space-x-4">
                {/*<button className="border rounded-full px-4 py-2 text-sm sm:text-base hover:bg-gray-100">
                    3D
                </button>*/}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className=" justify-between rounded-full"
                        >
                            {
                                langs.find((l) => l.value === lang)?.label || 'Language'
                            }

                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Command>
                            <CommandList>
                                {langs.map((lang) => (
                                    <CommandItem
                                        key={lang.value}
                                        onSelect={() => {
                                            setLang(lang.value);
                                            SetLangCookie(lang.value);
                                            setOpen(false)
                                            window.location.reload()
                                        }}
                                    >
                                        {lang.label}
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                <button onClick={toggleCart} className="border rounded-full px-4 py-2 text-sm sm:text-base hover:bg-gray-100">
                    Корзина
                </button>
                    <CartComponent isCartVisible={isCartVisible} toggleCart={toggleCart} />
                </div>
        </header>
    )

}