const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
};

export async function loginWithUserNameAndPassword(
    email: string,
    password: string,
): Promise<AuthResponse> {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    return response.json() as Promise<AuthResponse>;
}

export async function registerWithEmailAndPassword(name: string, email: string, password: string) : Promise<AuthResponse> {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: name,
            email,
            password,
        }),
    });

    return response.json() as Promise<AuthResponse>;
}
