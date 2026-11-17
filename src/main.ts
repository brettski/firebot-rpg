import { Firebot } from '@crowbartools/firebot-custom-scripts-types';

import { setFirebot, unregisterGame } from './firebot/firebot';
import { registerRPG } from './firebot/games/register-game';
import { stopGameCycle } from './systems/cycle';

const script: Firebot.CustomScript<{}> = {
    getScriptManifest: () => {
        return {
            name: 'Firebot RPG',
            description: 'A chat based RPG.',
            author: __SCRIPT_AUTHOR__,
            version: __SCRIPT_VERSION__,
            firebotVersion: '5',
            // Required by Firebot 5.67+: its legacy startup-script executor only
            // loads scripts whose manifest sets startupOnly.
            startupOnly: true,
        };
    },
    stop: () => {
        // Called by Firebot 5.67+ when the script is disabled/removed.
        stopGameCycle();
        unregisterGame('fbrpg');
    },
    getDefaultParameters: () => {
        return {};
    },
    run: async (runRequest) => {
        // Set our run request variable for use throughout the app.
        await setFirebot(runRequest);

        // Register the game in Firebot.
        registerRPG();
    },
};

export default script;
