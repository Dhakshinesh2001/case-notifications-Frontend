export interface AuthProvider {
  getToken(): Promise<string | null>;

  signIn(): Promise<void>;
  signOut(): Promise<void>;

  getUser(): Promise<{
    id: string;
    email?: string;
  } | null>;
}