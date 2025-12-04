"use client";

import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
    const canvasRef = useRef(null);
    const animationFrameIdRef = useRef(null);
    const particlesArrayRef = useRef([]);
    const mouseRef = useRef({ x: null, y: null, radius: 300 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let isActive = true; // Flag to control animation loop

        // Mouse event handlers
        const handleMouseMove = (e) => {
            mouseRef.current.x = e.x;
            mouseRef.current.y = e.y;
        };

        const handleMouseOut = () => {
            mouseRef.current.x = undefined;
            mouseRef.current.y = undefined;
        };

        // Resize handler
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        // Particle class with Force Field physics
        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
                this.baseX = x;
                this.baseY = y;
                this.density = (Math.random() * 20) + 1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                const mouse = mouseRef.current;
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // 1. FORCE FIELD - Inner Shield (Repulsion Zone)
                const shieldRadius = 10;
                if (distance < shieldRadius && distance > 0) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (shieldRadius - distance) / shieldRadius;

                    // Strong repulsion - push particles AWAY from cursor
                    const repulsionStrength = 5;
                    const directionX = forceDirectionX * force * this.density * repulsionStrength;
                    const directionY = forceDirectionY * force * this.density * repulsionStrength;

                    this.x -= directionX; // Negative = push away
                    this.y -= directionY;
                }
                // 2. ATTRACTION ZONE - Outer Ring (Gentle Pull)
                else if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;

                    // Gentle attraction
                    this.x += directionX * 0.05;
                    this.y += directionY * 0.05;
                }
                else {
                    // 3. RETURN TO BASE - Elastic return to original position
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 20;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 20;
                    }
                }
                this.draw();
            }
        }

        // Initialize particles
        function init() {
            particlesArrayRef.current = [];
            const numberOfParticles = (canvas.width * canvas.height) / 25000;

            for (let i = 0; i < numberOfParticles; i++) {
                const size = (Math.random() * 2) + 0.5;
                const x = (Math.random() * (canvas.width - size * 2)) + size;
                const y = (Math.random() * (canvas.height - size * 2)) + size;
                const directionX = (Math.random() * 0.2) - 0.1;
                const directionY = (Math.random() * 0.2) - 0.1;
                const color = 'rgba(255, 255, 255, 0.8)'; // Bright white

                particlesArrayRef.current.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        // Animation loop
        function animate() {
            if (!isActive || !canvasRef.current) return; // Safety check

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particlesArrayRef.current.length; i++) {
                particlesArrayRef.current[i].update();
            }

            animationFrameIdRef.current = requestAnimationFrame(animate);
        }

        // Setup
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('resize', handleResize);

        handleResize(); // Initialize
        animate(); // Start animation

        // Cleanup function - Prevent memory leaks
        return () => {
            isActive = false; // Stop animation loop

            // Remove all event listeners
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('resize', handleResize);

            // Cancel animation frame
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }

            // Clear particles array to free memory
            particlesArrayRef.current = [];

            // Reset mouse reference
            mouseRef.current = { x: null, y: null, radius: 300 };
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-50 pointer-events-none"
            style={{ background: 'transparent' }}
        />
    );
}
