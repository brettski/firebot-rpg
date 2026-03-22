import { CommandDefinition } from '@crowbartools/firebot-custom-scripts-types/types/modules/command-manager';

/**
 * Represents the user command data passed to system command trigger events.
 * Matches the inline type of `userCommand` in SystemCommandTriggerEvent from
 * @crowbartools/firebot-custom-scripts-types, which was previously exported
 * as `UserCommand` but is no longer exported in the installed version.
 */
export type UserCommand = {
    trigger: string;
    args: string[];
    triggeredSubcmd?: CommandDefinition;
    isInvalidSubcommandTrigger: boolean;
    triggeredArg?: string;
    subcommandId?: string;
    commandSender: string;
    senderRoles: string[];
};
