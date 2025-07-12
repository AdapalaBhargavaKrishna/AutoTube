import { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("autotube-user");
        return saved ? JSON.parse(saved) :  { _id: "", name: "", email: "",createdAt: "",updatedAt: "", history: [] };
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem("autotube-user", JSON.stringify(user));
        }
    }, [user]);

    return (
        <UserContext.Provider value={{user, setUser}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);