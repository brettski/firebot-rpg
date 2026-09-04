import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import { importX } from "eslint-plugin-import-x";
import unusedImports from "eslint-plugin-unused-imports";

export default [
    {
        ignores: ["node_modules/**", "out/**"],
    },
    {
        plugins: {
            "@typescript-eslint": tsPlugin,
            "import-x": importX,
            "unused-imports": unusedImports,
        },
        languageOptions: {
            parser: tsParser,
        },
    },
    prettierRecommended,
    {
        rules: {
            "prettier/prettier": ["error", { singleQuote: true, semi: true }],
        },
    },
    {
        files: ["**/src/*.ts", "**/src/*.tsx"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
            },
        },
        rules: {
            "import-x/order": [
                "error",
                {
                    groups: ["builtin", "external", "internal"],
                    "newlines-between": "always",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true,
                    },
                },
            ],
            "@typescript-eslint/comma-dangle": "off",
            "class-methods-use-this": "off",
            "react/jsx-filename-extension": "off",
            "no-restricted-syntax": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    },
];
