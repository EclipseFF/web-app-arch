'use client'
import Image from "next/image";
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import adminLogin from "@/actions/auth/login";


export default function Login(){
    const router = useRouter();
    const [loginData, setLoginData] = useState({email: '', password: ''})
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setLoginData({...loginData, [name]: value})
    }

    const isEmailValid = (emailaddress: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailaddress);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const {email, password} = loginData
        if (email === '' || password === '') {
            setError('Пожалуйста, заполните все поля')
            return
        }

        if (!isEmailValid(email)){
            setError('Неверный формат электронной почты')
            return
        }

        try{
            const {token} = await adminLogin(email, password);
            document.cookie = `token=${token}; path=/`;
            router.push('/admin');
        } catch (err) {
            setError('Неверный логин или пароль');
        }
    }
    return (
        <div className="flex h-screen items-center justify-center bg-white">
            <div className="w-full max-w-md p-8 space-y-6">
                <h1 className="text-center text-xl font-semibold text-purple-500">
                    Добро пожаловать!
                </h1>
                <div className="flex justify-center space-x-4 my-4">
                    <Image
                        src="/restad.png"
                        alt="Restad Logo"
                        height={59}
                        width={120}
                    />
                    <Image
                        src="/temp/lamaro.png"
                        alt="La Maro Logo"
                        width={120}
                        height={81}
                    />
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Логин:
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={loginData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Пароль:
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={loginData.password}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        Войти
                    </button>
                </form>
            </div>
        </div>
    )
}