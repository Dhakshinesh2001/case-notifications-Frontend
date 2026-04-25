const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// 🔒 TEMP (later replace with Clerk)
const TOKEN = "your_test_token";
const ORG_ID = "86c9be4f-50cd-4616-b49d-91120b112f38";

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request(
  endpoint: string,
  method: Method = 'GET',
  body?: any
) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      'x-org-id': ORG_ID,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'API Error');
  }

  return res.json();
}

export const apiClient = {
  get: (endpoint: string) => request(endpoint, 'GET'),
  post: (endpoint: string, body: any) =>
    request(endpoint, 'POST', body),
  patch: (endpoint: string, body: any) =>
    request(endpoint, 'PATCH', body),
  delete: (endpoint: string) =>
    request(endpoint, 'DELETE'),
};