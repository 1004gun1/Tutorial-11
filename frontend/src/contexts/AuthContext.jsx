import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setUser(null);
                return;
            }

            try {
                const response = await fetch(`${VITE_BACKEND_URL}/user/me`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setUser(data.user || null);
            } catch (err) {
                setUser(null);
            }
        };

        getUser();
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    const login = async (username, password) => {
        try {
            const response = await fetch(`${VITE_BACKEND_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const token = await response.json();
            if (!response.ok) return token.message || "Login failed";

            localStorage.setItem("token", token.token);

            const loggedInUser = await fetch(`${VITE_BACKEND_URL}/user/me`, {
                headers: { "Authorization": `Bearer ${token.token}` }
            });
            const data = await loggedInUser.json();
            setUser(data.user || null);

            navigate("/profile");
            return null;
        } catch (err) {
            return err.message;
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch(`${VITE_BACKEND_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            if (response.status === 409) {
                const data = await response.json();
                return { message: data.message };
            }

            navigate("/success");
            return null;
        } catch (err) {
            return err.message;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
