import { logger } from '../firebot/firebot';

import { getWorldCycleTimeSettings } from './settings';
import { worldCycle } from './world/world-cycle';

let cycleTimer: ReturnType<typeof setInterval> | null = null;

export function startGameCycle() {
    logger('debug', `Starting game cycle.`);
    stopGameCycle();
    const gameCycle = getWorldCycleTimeSettings();
    cycleTimer = setInterval(async () => {
        await worldCycle();
    }, gameCycle * 1000);
}

export function stopGameCycle() {
    if (cycleTimer != null) {
        clearInterval(cycleTimer);
        cycleTimer = null;
    }
}
