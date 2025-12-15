"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useWorker - Web Worker yönetim hook'u
 * 
 * Özellikler:
 * - Worker instance yaşam döngüsü yönetimi
 * - postMessage ile veri gönderme
 * - onmessage ile sonuç dinleme
 * - Progress tracking desteği
 * - Component unmount'ta otomatik terminate (memory leak önlemi)
 * 
 * @param {string} workerPath - Worker dosyasının public path'i (örn: "/workers/sash.worker.js")
 * @returns {{ run: Function, status: string, result: any, progress: number, error: string|null }}
 */
export function useWorker(workerPath) {
    const workerRef = useRef(null);
    const [status, setStatus] = useState("idle"); // idle | running | complete | error
    const [result, setResult] = useState(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    // Worker'ı başlat ve cleanup yap
    useEffect(() => {
        // SSR kontrolü
        if (typeof window === "undefined") return;

        try {
            workerRef.current = new Worker(workerPath);

            // Message handler
            workerRef.current.onmessage = (e) => {
                const { type, ...data } = e.data;

                switch (type) {
                    case "progress":
                        setProgress(data.progress || 0);
                        break;
                    case "complete":
                        setResult(data);
                        setStatus("complete");
                        setProgress(100);
                        break;
                    case "error":
                        setError(data.message || "Unknown error");
                        setStatus("error");
                        break;
                    default:
                        // Bilinmeyen mesaj tipi, result olarak kaydet
                        setResult(data);
                }
            };

            // Error handler
            workerRef.current.onerror = (e) => {
                console.error("[useWorker] Worker error:", e);
                setError(e.message || "Worker error occurred");
                setStatus("error");
            };
        } catch (err) {
            console.error("[useWorker] Failed to create worker:", err);
            setError("Failed to initialize worker");
            setStatus("error");
        }

        // Cleanup: Component unmount olunca worker'ı kapat
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, [workerPath]);

    // Worker'a mesaj gönder ve simülasyonu başlat
    const run = useCallback((payload) => {
        if (!workerRef.current) {
            setError("Worker not initialized");
            setStatus("error");
            return;
        }

        // State'leri sıfırla
        setStatus("running");
        setProgress(0);
        setResult(null);
        setError(null);

        // Worker'a veri gönder
        workerRef.current.postMessage(payload);
    }, []);

    // State'leri sıfırla
    const reset = useCallback(() => {
        setStatus("idle");
        setProgress(0);
        setResult(null);
        setError(null);
    }, []);

    return {
        run,
        reset,
        status,
        result,
        progress,
        error,
        isRunning: status === "running",
        isComplete: status === "complete",
        isError: status === "error"
    };
}

export default useWorker;
