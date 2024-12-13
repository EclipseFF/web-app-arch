'use client'
import Image from "next/image";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {langs} from "@/lib/utils";
import {Command, CommandItem, CommandList} from "@/components/ui/command";
import SetLangCookie from "@/actions/lang/set-lang-cookie";
import {useEffect, useState} from "react";
import GetLangCookie from "@/actions/lang/get-lang-cookie";
import logout from "@/actions/auth/logout";

export default function AdminHeader() {
    const [open, setOpen] = useState(false)
    const [lang, setLang] = useState('');
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
    return (
        <header className="p-4 sm:p-6 ">
            <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center mb-4 sm:mb-0">
                    <Image src={'/restad.png'} alt={'Restad'} width={100} height={100}/>
                </div>
                <div className="flex-grow flex justify-center gap-4 mb-4 sm:mb-0">
                    <button className="bg-gray-800 text-white py-2 px-4 rounded-lg">Мои меню</button>
                    <button className="bg-gray-800 text-white py-2 px-4 rounded-lg">Настройки</button>
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
                                            }}
                                        >
                                            {lang.label}
                                        </CommandItem>
                                    ))}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <button className="text-black flex items-center gap-2" onClick={logout}>
                    <p>Выход</p>
                    <Image src={'/icons/logout.svg'} alt={'Logout'} width={22} height={22}/>
                </button>
            </div>

            <h2 className="text-lg font-bold mb-4 text-center pt-2">Личный кабинет:</h2>
        </header>
    )
}