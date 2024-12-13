/*
import {NextApiRequest, NextApiResponse} from "next";

export default function QrResolver(req: NextApiRequest, res: NextApiResponse) {
    const { rest, uuid } = req.query;

    if (!rest || !uuid) {
        return res.status(400).json({ error: "Missing parameters" });
    }


    res.setHeader('Set-Cookie', `uuid=${uuid}; Path=/; SameSite=Lax; Max-Age=86400;`);

    res.status(200).json({ redirectUrl: `https://${rest}.restad.kz` });
}*/


'use server'

import {cookies} from "next/headers";

export default async function HandleUUIDFromQr(name: string, uuid: string) {
    const cookieStore = await cookies()
    cookieStore.delete('uuid');
    cookieStore.set('uuid', uuid);

}