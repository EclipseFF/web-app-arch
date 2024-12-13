'use server'

import {cookies} from "next/headers";

export default async function GetToken() {
    const cookieStore = await cookies()
    const theme = cookieStore.get('token')?.value

    return theme
}