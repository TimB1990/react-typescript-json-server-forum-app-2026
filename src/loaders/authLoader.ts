import { redirect } from 'react-router-dom'

export const requireAuthLoader = async () => {
    try {
        const res = await fetch('http://localhost:5001/me', {
            credentials: 'include'
        })

        if (!res.ok) {
            throw new Error("Unauthenticated")
        }

        const data = await res.json();
        return data.user
    } catch(err){
        throw redirect("/login")
    }
}