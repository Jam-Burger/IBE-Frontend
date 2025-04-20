import {defineConfig} from 'vitest/config';
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import dotenv from "dotenv";

dotenv.config();
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        sentryVitePlugin({
            org: process.env.VITE_SENTRY_ORG,
            project: process.env.VITE_SENTRY_PROJECT,
            authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
        include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
        exclude: ['node_modules', 'build'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            exclude: [
                'node_modules/**',
                'src/setupTests.ts',
            ],
        },
        css: true,
        reporters: ['verbose'],
        watch: false,
        passWithNoTests: false,
        deps: {
            inline: ['vitest-canvas-mock'],
        },
        // threads: false,
        environmentOptions: {
            jsdom: {
                resources: 'usable',
            },
        },
    },
    build: {
        sourcemap: true,
    },
});
