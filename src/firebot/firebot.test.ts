import { setFirebot, registerGame } from './firebot';

const gameDefinition = { id: 'fbrpg' } as any;

describe('registerGame', () => {
    // Firebot 5.67 loads legacy scripts after the Games UI has fetched its list, and
    // registerGame() no longer notifies the UI. The refresh must come *after* the
    // game is registered, otherwise the pushed list would not contain it.
    it('refreshes the Games UI after registering the game', async () => {
        const gameManager = {
            registerGame: jest.fn(),
            triggerUiRefresh: jest.fn(),
        };
        await setFirebot({ modules: { gameManager } } as any);

        registerGame(gameDefinition);

        expect(gameManager.registerGame).toHaveBeenCalledWith(gameDefinition);
        expect(gameManager.triggerUiRefresh).toHaveBeenCalledTimes(1);
        expect(
            gameManager.registerGame.mock.invocationCallOrder[0]
        ).toBeLessThan(
            gameManager.triggerUiRefresh.mock.invocationCallOrder[0]
        );
    });

    // Firebot versions before 5.67 have no triggerUiRefresh (the UI pulls the list).
    it('still registers on Firebot versions without triggerUiRefresh', async () => {
        const gameManager = { registerGame: jest.fn() };
        await setFirebot({ modules: { gameManager } } as any);

        expect(() => registerGame(gameDefinition)).not.toThrow();
        expect(gameManager.registerGame).toHaveBeenCalledWith(gameDefinition);
    });
});
