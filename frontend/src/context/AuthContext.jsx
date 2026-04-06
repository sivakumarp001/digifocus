/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verify token and load user on app startup
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    // Verify token is still valid by making an API call with timeout
                    const timeout = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Verification timeout')), 5000)
                    );
                    
                    const verification = authAPI.getMe();
                    
                    try {
                        const { data } = await Promise.race([verification, timeout]);
                        localStorage.setItem('user', JSON.stringify(data));
                        setToken(storedToken);
                        setUser(data);
                    } catch (verifyErr) {
                        // If verification fails, still allow user to stay logged in with stored data
                        console.warn('Auth verification failed, using cached user:', verifyErr.message);
                        setToken(storedToken);
                        setUser(JSON.parse(storedUser));
                    }
                } else {
                    // No stored auth, clear everything
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            } catch (err) {
                // Token is invalid or expired, clear auth
                console.error('Auth verification failed:', err.message);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const { data } = await authAPI.login(credentials);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setToken(data.token);
            setUser(data);
            return { success: true, role: data.role };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        setLoading(true);
        try {
            const { data } = await authAPI.register(formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            setToken(data.token);
            setUser(data);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Registration failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
    };

    const updateUser = (updatedData) => {
        const merged = { ...user, ...updatedData };
        localStorage.setItem('user', JSON.stringify(merged));
        setUser(merged);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
