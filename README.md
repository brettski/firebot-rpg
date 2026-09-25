# Firebot RPG Custom Script

Firebot RPG is an RPG played entirely through live stream chat. It's built to be as simple as possible to control via chat commands, while keeping the complex mechanics hidden in the backend. For the most part, it plays like D&D, you'll recognize weapon damage rolls and similar mechanics, though some rules have been simplified (yes, even more than 5th edition).

## What is this?

[Firebot](https://firebot.app/) is a Twitch bot created by [Team Crowbar](https://github.com/crowbartools), and this script only runs inside it, not with other bots, and not standalone.

This version (v1.1.0+) is maintained by **[brettski](https://github.com/brettski)**, who picked up development after the original project ([itsjesski/firebot-rpg](https://github.com/itsjesski/firebot-rpg), possibly formerly Firebottle) had gone without updates for over four years.

## Grab the latest release

You can download brettski's latest version (v1.1.0+) from [releases](https://github.com/brettski/firebot-rpg/releases).

You can download itsjesski's last version (v1.0.2) from [release](https://github.com/Firebottle/firebot-rpg/releases/latest).

## Support

Questions about Firebot RPG? Check the [wiki](https://github.com/brettski/firebot-rpg/wiki) for setup instructions and answers.

Can't find what you need, or found a bug? Open an [issue](https://github.com/brettski/firebot-rpg/issues/new/choose).

## Development

The script is written in TypeScript and the packages are compatible with Node v26 (the next LTS).

- `npm run build` — build the script
- `npm test` — run the test suite
- `npx eslint .` — lint

See the [Developer Handbook](https://github.com/brettski/firebot-rpg/wiki/Developer-Handbook) for architecture, conventions, and contribution guidelines.

## License

[GPL-3.0](LICENSE)
