import {
    createContext,
    useState,
} from "react";

import api from "../services/api";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) {
            return null;
        }

        try {
            return JSON.parse(savedUser);
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("token");
    });

    const login = async (email, password) => {
        try {
            const response = await api.post(
                "/auth/login",
                {
                    email,
                    password,
                }
            );

            const data = response.data;

            const receivedToken = data.token;

            const receivedUser =
                data.user || {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                };

            localStorage.setItem(
                "token",
                receivedToken
            );

            localStorage.setItem(
                "user",
                JSON.stringify(receivedUser)
            );

            setToken(receivedToken);
            setUser(receivedUser);

            return {
                success: true,
                data,
            };
        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Invalid email or password.",
            };
        }
    };

    const register = async (
        name,
        email,
        password
    ) => {
        try {
            const response = await api.post(
                "/auth/register",
                {
                    name,
                    email,
                    password,
                }
            );

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Registration failed. Please try again.",
            };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);

        window.location.href = "/login";
    };

    const isAuthenticated = Boolean(token);

    const isAdmin =
        user?.role === "ADMIN";

    const value = {
        user,
        token,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;