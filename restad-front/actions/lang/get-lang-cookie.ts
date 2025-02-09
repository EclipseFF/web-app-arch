'use server'

import {cookies} from "next/headers";

export default async function GetLangCookie() {
    const cookieStore = await cookies()
    const lang =  cookieStore.get('lang')

    return lang?.value
}