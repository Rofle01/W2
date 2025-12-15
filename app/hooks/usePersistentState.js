"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * usePersistentState - SSR-uyumlu localStorage hook
 * 
 * Özellikler:
 * - Server-side rendering'de hata vermez (window check)
 * - İlk mount'ta localStorage'dan okur
 * - Her değişiklikte otomatik kaydeder
 * - JSON serialize/deserialize desteği
 * 
 * @param {string} key - localStorage key
 * @param {any} defaultValue - Varsayılan değer
 * @returns {[any, Function]} - [state, setState]
 */
export function usePersistentState(key, defaultValue) {
    // İlk değer olarak defaultValue kullan (SSR için güvenli)
    const [state, setState] = useState(defaultValue);
    const [isHydrated, setIsHydrated] = useState(false);

    // Client tarafında localStorage'dan oku (hydration sonrası)
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const stored = localStorage.getItem(key);
            if (stored !== null) {
                const parsed = JSON.parse(stored);
                setState(parsed);
            }
        } catch (error) {
            console.warn(`[usePersistentState] Error reading key "${key}":`, error);
        }

        setIsHydrated(true);
    }, [key]);

    // Değer değişince localStorage'a yaz
    useEffect(() => {
        if (!isHydrated) return;
        if (typeof window === "undefined") return;

        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.warn(`[usePersistentState] Error saving key "${key}":`, error);
        }
    }, [key, state, isHydrated]);

    // Setter wrapper - fonksiyon veya değer kabul eder
    const setPersistentState = useCallback((valueOrUpdater) => {
        setState((prev) => {
            if (typeof valueOrUpdater === "function") {
                return valueOrUpdater(prev);
            }
            return valueOrUpdater;
        });
    }, []);

    return [state, setPersistentState];
}

export default usePersistentState;
