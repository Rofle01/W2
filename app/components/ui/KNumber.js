"use client";

import { useState } from "react";
import { formatCompactK, formatDetailedK } from "../../lib/math/formatters";

/**
 * KNumber - Akıllı Sayı Gösterimi
 * 
 * Normal durumda: 1.5kk
 * Hover/Click durumunda: 1kkk 350kk 240k 422
 * 
 * @param {number} value - Gösterilecek sayı
 * @param {string} className - Ek CSS sınıfları
 */
export default function KNumber({ value, className = "" }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const toggleClick = () => setIsClicked(!isClicked);

    // Hangi formatı göstereceğiz?
    // Hover veya Click durumunda detaylı, yoksa kompakt.
    const showDetailed = isHovered || isClicked;

    return (
        <span
            className={`
                cursor-pointer transition-all duration-200 
                ${className} 
                ${showDetailed ? 'text-violet-300 font-bold' : ''}
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={toggleClick}
            title="Tam değeri görmek için tıklayın"
        >
            {showDetailed ? formatDetailedK(value) : formatCompactK(value)}
        </span>
    );
}
