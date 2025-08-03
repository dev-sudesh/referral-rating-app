import { useState, useCallback, useRef } from 'react';

const useFocusManager = () => {
    const [focusedInputId, setFocusedInputId] = useState(null);
    const focusTimeRef = useRef(null);

    const handleFocus = useCallback((inputId) => {
        console.log(`[FocusManager] Focus requested for: ${inputId}`);

        // If another input is focused, blur it first
        if (focusedInputId && focusedInputId !== inputId) {
            console.log(`[FocusManager] Blurring previous input: ${focusedInputId}`);
            setFocusedInputId(null);
        }

        // Set the new focused input
        setFocusedInputId(inputId);
        focusTimeRef.current = Date.now();
        console.log(`[FocusManager] Focus set for: ${inputId}`);
    }, [focusedInputId]);

    const handleBlur = useCallback((inputId) => {
        console.log(`[FocusManager] Blur requested for: ${inputId}`);

        // Only blur if this input is currently focused
        if (focusedInputId === inputId) {
            setFocusedInputId(null);
            console.log(`[FocusManager] Blur confirmed for: ${inputId}`);
            return true; // Allow the blur
        }

        console.log(`[FocusManager] Blur ignored for: ${inputId} (not currently focused)`);
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