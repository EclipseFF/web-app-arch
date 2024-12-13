'use server'

import {cookies} from "next/headers";

export default async function SetLangCookie(lang: string) {
    const cookieStore = await cookies()
    cookieStore.set('lang', lang)
}