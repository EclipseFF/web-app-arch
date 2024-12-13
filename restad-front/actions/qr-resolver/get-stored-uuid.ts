'use server'

import {cookies} from "next/headers";

export default async function GetStoredUuid() {
    const cookieStore = await cookies()
    const uuid =  cookieStore.get('uuid')

    return uuid?.value
}