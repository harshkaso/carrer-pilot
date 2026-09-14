export async function apiFetch(
    url: string,
    token: string,
    options: RequestInit = {},
) {
    return fetch(url, {
        ...options,
        headers: {
            Authorization: `Token ${token}`,
        },
    });
}