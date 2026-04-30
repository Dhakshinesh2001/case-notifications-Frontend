import { getAuthToken } from './auth';
import { setAuthTokenProvider } from './auth';
// import { getOrgId } from './org';
import { AuthService } from '../features/auth/auth.service';
import { getOrgId } from './org';

setAuthTokenProvider(async () => {
  return "your_test_token";
});

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// 🔒 TEMP (later replace with Clerk)
const TOKEN = "your_test_token";
const ORG_ID = getOrgId() as string;
// const ORG_ID = '86c9be4f-50cd-4616-b49d-91120b112f38'; //TODO remove this line


type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request(
  endpoint: string,
  method: Method = 'GET',
  body?: any
) {

  const token = await AuthService.getToken();
  console.log("org ID:",getOrgId() );
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: TOKEN ? `Bearer ${TOKEN}` : "",
      'x-org-id': getOrgId() || "",//TODO replace with getOrgId()
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { message: 'API Error' };
    }
    throw new Error(error.message || 'API Error');
  }

  // ✅ ALWAYS return parsed JSON
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