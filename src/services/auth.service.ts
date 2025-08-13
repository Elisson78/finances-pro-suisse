// Versão simplificada para evitar erros durante o desenvolvimento inicial

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  companyName: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  // Simulação de login para desenvolvimento
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Em um ambiente de produção, isto seria uma chamada API
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: "user-123",
          email: credentials.email,
          fullName: "Utilisateur Demo",
          companyName: "Entreprise Demo"
        };
        
        const response = {
          token: "jwt-token-example",
          user
        };
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        resolve(response);
      }, 500);
    });
  }

  // Simulação de registro para desenvolvimento
  async register(data: RegisterData): Promise<AuthResponse> {
    // Em um ambiente de produção, isto seria uma chamada API
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: "user-123",
          email: data.email,
          fullName: data.fullName,
          companyName: data.companyName
        };
        
        const response = {
          token: "jwt-token-example",
          user
        };
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        resolve(response);
      }, 500);
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();