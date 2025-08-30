import { useState, useCallback, useRef } from 'react';

const useFocusManager = () => {
    const [focusedInputId, setFocusedInputId] = useState(null);
    const focusTimeRef = useRef(null);

    const handleFocus = useCallback((inputId) => {

        // If another input is focused, blur it first
        if (focusedInputId && focusedInputId !== inputId) {
            setFocusedInputId(null);
        }

        // Set the new focused input
        setFocusedInputId(inputId);
        focusTimeRef.current = Date.now();
    }, [focusedInputId]);

    const handleBlur = useCallback((inputId) => {

        // Only blur if this input is currently focused
        if (focusedInputId === inputId) {
            setFocusedInputId(null);
            return true; // Allow the blur
        }

        return false; // Ignore the blur
    }, [focusedInputId]);

    const isFocused = useCallback((inputId) => {
        return focusedInputId === inputId;
    }, [focusedInputId]);

    const getFocusTime = useCallback(() => {
        return focusTimeRef.current;
    }, []);

    return {
        focusedInputId,
        handleFocus,
        handleBlur,
        isFocused,
        getFocusTime
    };
};

export default useFocusManager; 