    import React, { createContext, useContext, useEffect, useState} from 'react';
    import { useNavigate } from 'react-router-dom';

    const AuthContext = createContext(null);

    // TODO: get the BACKEND_URL.
    const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    /*
    * This provider should export a `user` context state that is 
    * set (to non-null) when:
    *     1. a hard reload happens while a user is logged in.
    *     2. the user just logged in.
    * `user` should be set to null when:
    *     1. a hard reload happens when no users are logged in.
    *     2. the user just logged out.
    */
    export const AuthProvider = ({ children }) => {
        const navigate = useNavigate();
        const [user, setUser] = useState(null); // TODO: Modify me.

        useEffect(() => {
            const getUser = async () => {
                const token = localStorage.getItem("token");
                if (!token) {
                    setUser(null);
                    return;
            }

            try {
                const response = await fetch(`${VITE_BACKEND_URL}/user/me`,{
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();
                setUser(data.user);

            } catch (err) {
                setUser(null);
            }
        };

        getUser();
        // TODO: complete me, by retriving token from localStorage and make an api call to GET /user/me.
    }, [])

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        // TODO: complete me
        localStorage.removeItem("token");
        setUser(null);

        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (username, password) => {
        // TODO: complete me
        try {
            const response = await fetch(`${VITE_BACKEND_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            }) ;


            const token = await response.json();

            if (!response.ok) {
                return { message: token.message };
            }
            
            localStorage.setItem("token", token.token);

            const loggedInUser = await fetch(`${VITE_BACKEND_URL}/user/me`, {
                headers: { "Authorization": `Bearer ${token.token}` }
            });
            const data = await loggedInUser.json();
    
            setUser(data.user); 

            navigate("/profile");
            
            return token;
        } catch (err) {
            return {
                "message" : err.message
             };
        }
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
        const register = async (userData) => {
            try {
                const response = await fetch(`${VITE_BACKEND_URL}/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify( userData )
                });

                if (response.status === 409) {
                    const data = await response.json();
                    return { message: data.message };
                }

                navigate("/success");
               // const data = await response.json();
                
                return {
                    "message": "User registered successfully"
                }
        } catch (err) {
            return {
                "message" : err.message
             };
        }
        // TODO: complete me
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
