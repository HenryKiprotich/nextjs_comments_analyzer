import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    overrides: [
      {
        // your existing page overrides
        files: ["app/dashboard/page.tsx", "app/page.tsx"],
        rules: {
          "react/no-unescaped-entities": "off",
          "@typescript-eslint/no-unused-vars": "off",
          "react-hooks/exhaustive-deps": "off",
          "@typescript-eslint/no-explicit-any": "off",
        },
      },
      {
        // new override for your api/auth files
        files: [
          "app/api/signin/route.ts",
          "app/api/signup/route.ts",
          "app/auth/page.tsx",
          "app/authuser/page.tsx",
        ],
        rules: {
          "@typescript-eslint/no-unused-vars": "off",
          "@typescript-eslint/no-explicit-any": "off",
          "react-hooks/exhaustive-deps": "off",
          "react/no-unescaped-entities": "off",
        },
      },
    ],
  },
];

export default eslintConfig;