'use server'
import {apiUrl} from "@/lib/api";

export default async function adminLogin(email:string, password:string){
    try {
        const response = await fetch(apiUrl + "/users/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        console.log(response.statusText)

        if (response.ok) {
            const data = await response.json();
            return { token: data.token };
        } else {
            console.log(email, password)
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        throw new Error('Login failed');
    }
    }
