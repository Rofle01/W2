"use client";

import { useState, useEffect, useCallback } from "react";
import { parseSuffixValue } from "../../lib/math/formatters";

/**
 * SmartInput - Sayısal input sorunlarını çözen akıllı bileşen
 * 
 * Özellikler:
 * - Ara değerlere izin verir (örn: "2.", "", "-")
 * - Sadece blur veya Enter'da global state güncellenir
 * - Ondalık sayı girişine tam destek
 * - Boş değer için fallback (min veya 0)
 * - Suffix desteği: "40k" -> 40000, "1kk" -> 1000000, "1.5m" -> 1500000
 */
export default function SmartInput({
    value,
    onChange,
    min = 0,
    max,
    step = 1,
    className = "",
    placeholder = "",
    disabled = false,
    onFocus,
    onBlur: externalOnBlur,
}) {
    // Lokal state - kullanıcının yazdığı değeri tutar
    const [localValue, setLocalValue] = useState(String(value ?? ""));
    const [isFocused, setIsFocused] = useState(false);

    // Dışarıdan gelen value değişirse ve focus yoksa lokal değeri güncelle
    useEffect(() => {
        if (!isFocused) {
            setLocalValue(String(value ?? ""));
        }
    }, [value, isFocused]);

    // Kullanıcı yazarken - sadece lokal state güncellenir
    const handleChange = useCallback((e) => {
        const inputValue = e.target.value;

        // Boş değere izin ver
        if (inputValue === "") {
            setLocalValue("");
            return;
        }

        // Nokta veya virgülle biten ara değerlere izin ver (örn: "2.", "2,")
        // Negatif işaretine izin ver
        if (inputValue === "-" || inputValue === "." || inputValue === ",") {
            setLocalValue(inputValue);
            return;
        }

        // Virgülü noktaya çevir
        const sanitized = inputValue.replace(",", ".");

        // Geçerli bir format mı kontrol et:
        // Sayılar, nokta, ve k/m/b harflerine izin ver
        // Örnekler: "2", "2.", "2.5", "40k", "1.5kk", "2m", "1b"
        if (/^-?[\d.]*[kmb]*$/i.test(sanitized)) {
            setLocalValue(sanitized);
        }
    }, []);

    // Değeri commit et (blur veya Enter)
    const commitValue = useCallback(() => {
        // parseSuffixValue ile suffix'leri parse et (40k -> 40000, 1kk -> 1000000)
        let finalValue = parseSuffixValue(localValue);

        // Geçersiz değer ise min veya 0 kullan
        if (isNaN(finalValue)) {
            finalValue = min ?? 0;
        }

        // Min/Max sınırları uygula
        if (min !== undefined && finalValue < min) {
            finalValue = min;
        }
        if (max !== undefined && finalValue > max) {
            finalValue = max;
        }

        // Lokal değeri güncelle (formatlanmış hali - sayı olarak)
        setLocalValue(String(finalValue));

        // Global state'i güncelle
        if (onChange) {
            onChange(finalValue);
        }
    }, [localValue, min, max, onChange]);

    // Focus olduğunda
    const handleFocus = useCallback((e) => {
        setIsFocused(true);

        // Eğer değer 0 ise temizle (kolay düzenleme için)
        if (localValue === "0" || localValue === "") {
            setLocalValue("");
        }

        // Tüm metni seç
        e.target.select();

        if (onFocus) {
            onFocus(e);
        }
    }, [onFocus, localValue]);

    // Blur olduğunda - değeri commit et
    const handleBlur = useCallback((e) => {
        setIsFocused(false);
        commitValue();
        if (externalOnBlur) {
            externalOnBlur(e);
        }
    }, [commitValue, externalOnBlur]);

    // Enter tuşuna basıldığında - değeri commit et
    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter") {
            e.target.blur();
        }
        // Escape tuşuna basıldığında orijinal değere dön
        if (e.key === "Escape") {
            setLocalValue(String(value ?? ""));
            e.target.blur();
        }
    }, [value]);

    return (
        <input
            type="text"
            inputMode="decimal"
            value={localValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            autoComplete="off"
        />
    );
}
