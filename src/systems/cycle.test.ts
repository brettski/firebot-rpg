import { startGameCycle, stopGameCycle } from './cycle';
import { worldCycle } from './world/world-cycle';

jest.mock('../firebot/firebot', () => ({
    logger: jest.fn(),
}));

jest.mock('./settings', () => ({
    getWorldCycleTimeSettings: jest.fn(() => 60),
}));

jest.mock('./world/world-cycle', () => ({
    worldCycle: jest.fn(),
}));

describe('game cycle', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        (worldCycle as jest.Mock).mockClear();
    });

    afterEach(() => {
        // The timer handle lives in module state; clear it between tests.
        stopGameCycle();
        jest.useRealTimers();
    });

    // Firebot calls onLoad (which calls startGameCycle) every time the game is
    // toggled from inactive to active. Without clearing the previous timer, each
    // disable/enable would stack another interval and the world would tick faster.
    it('does not stack intervals when the cycle is restarted', () => {
        startGameCycle();
        startGameCycle();

        jest.advanceTimersByTime(60 * 1000);

        expect(worldCycle).toHaveBeenCalledTimes(1);
    });

    it('stops ticking after stopGameCycle', () => {
        startGameCycle();
        jest.advanceTimersByTime(60 * 1000);
        expect(worldCycle).toHaveBeenCalledTimes(1);

        stopGameCycle();
        jest.advanceTimersByTime(120 * 1000);

        expect(worldCycle).toHaveBeenCalledTimes(1);
    });
});
