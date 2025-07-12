import { useContext } from "react";
import { useState } from "react";
import { createContext } from "react";


export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [summaryLength, setSummaryLength] = useState('Medium (3-4 paragraphs)')
    const [quickQuizEnabled, setQuickQuizEnabled] = useState(true)

    return (
        <SettingsContext.Provider value={{
            summaryLength,
            setSummaryLength,
            quickQuizEnabled,
            setQuickQuizEnabled
        }}>
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettings = () => useContext(SettingsContext);