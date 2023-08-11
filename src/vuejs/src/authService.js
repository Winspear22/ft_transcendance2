import axios from 'axios';

export async function authenticate() {
    const response = await axios.get('http://localhost:3000/auth/check-auth', { withCredentials: true });

    if (response.data.cookie) {
        return JSON.parse(response.data.cookie);
    }
}