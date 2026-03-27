import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

export default [
    {
        ignores: ["node_modules/**", "out/**"],
    },
    {
        plugins: {
            "@typescript-eslint": tsPlugin,
            import: importPlugin,
            "unused-imports": unusedImports,
        },
        languageOptions: {
            parser: tsParser,
        },
        rules: {
            "import/no-unresolved": "off",
            "import/extensions": "off",
            "import/prefer-default-export": "off",
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
            "import/order": [
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
            "import/prefer-default-export": "off",
            "class-methods-use-this": "off",
            "react/jsx-filename-extension": "off",
            "no-restricted-syntax": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    },
];
