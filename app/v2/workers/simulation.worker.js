/**
 * Simulation Web Worker
 * Handles heavy calculations off the main thread to keep UI responsive.
 */

self.onmessage = (e) => {
    const { action, loopCount } = e.data;

    if (action === 'start_simulation') {
        runSimulation(loopCount || 10000000);
    }
};

function runSimulation(maxLoops) {
    console.log('Worker: Starting simulation with', maxLoops, 'loops');
    let sum = 0;
    const updateInterval = Math.floor(maxLoops / 20); // Update every 5%

    const startTime = performance.now();

    for (let i = 0; i <= maxLoops; i++) {
        // Heavy calculation simulation (Math.sqrt is relatively expensive)
        sum += Math.sqrt(i) * Math.sin(i);

        // Send progress updates
        if (i % updateInterval === 0 || i === maxLoops) {
            const progress = Math.round((i / maxLoops) * 100);

            // Artificial delay to make it visible to the human eye for demo purposes
            // In production code you wouldn't slow it down intentionaly like this
            if (i % (updateInterval * 2) === 0) {
                const now = Date.now();
                while (Date.now() - now < 50) { /* Busy wait 50ms */ }
            }

            self.postMessage({
                type: 'progress',
                progress: progress,
                currentStep: i,
                totalSteps: maxLoops
            });
        }
    }

    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);

    self.postMessage({
        type: 'complete',
        result: sum,
        duration: duration,
        message: `Simülasyon tamamlandı! (${duration}ms)`
    });
}
