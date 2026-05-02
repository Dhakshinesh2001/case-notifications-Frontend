import { Alert } from 'react-native';
import { AuthService } from '../features/auth/auth.service';
import { orgRepository } from '@/repositories/org.repository';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
// Alert.alert("API URL:", process.env.EXPO_PUBLIC_API_URL);

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request(
  endpoint: string,
  method: Method = 'GET',
  body?: any
) {
  // 🔐 Get fresh auth token
  // const token = await AuthService.getToken();
  const token = "TODO put the token here";

  // 🏢 Get current org from DB (single source of truth)
  const currentOrg = orgRepository.currentOrg();
  const orgId = currentOrg?.id;

  console.log("API → org ID:", orgId);
  const fullUrl = `${process.env.EXPO_PUBLIC_API_URL}${endpoint}`;

  console.log("🌐 API CALL");
  console.log("➡️ URL:", fullUrl);
  console.log("➡️ METHOD:", method);
  console.log("➡️ BODY:", body);


  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      'x-org-id': orgId || '',
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

// export const request = async (
//   method: string,
//   url: string,
//   body?: any
// ) => {
//   const fullUrl = `${process.env.EXPO_PUBLIC_API_URL}${url}`;

//   console.log("🌐 API CALL");
//   console.log("➡️ URL:", fullUrl);
//   console.log("➡️ METHOD:", method);
//   console.log("➡️ BODY:", body);

//   try {
//     const res = await fetch(fullUrl, {
//       method,
//       headers: {
//         'Content-Type': 'application/json',
//         // add auth later
//       },
//       body: body ? JSON.stringify(body) : undefined,
//     });

//     console.log("⬅️ STATUS:", res.status);

//     const text = await res.text();

//     console.log("⬅️ RAW RESPONSE:", text);

//     let data;
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = text;
//     }

//     if (!res.ok) {
//       console.log("❌ API ERROR:", data);
//       throw new Error(data?.message || "API Error");
//     }

//     console.log("✅ SUCCESS:", data);

//     return data;

//   } catch (err: any) {
//     console.log("🚨 NETWORK ERROR:", err.message);

//     throw err;
//   }
// };