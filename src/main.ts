import { Firebot } from '@crowbartools/firebot-custom-scripts-types';

import { setFirebot } from './firebot/firebot';
import { registerRPG } from './firebot/games/register-game';

const script: Firebot.CustomScript<{}> = {
    getScriptManifest: () => {
        return {
            name: 'Firebot RPG',
            description: 'A chat based RPG.',
            author: 'Firebottle (v1), brettski (v1.1+)',
            version: __SCRIPT_VERSION__,
            firebotVersion: '5',
        };
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
