import { defineConfig } from 'vitest/config';
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import path from "path";

export default defineConfig({
    plugins: [react(),
        tailwindcss(),
        sentryVitePlugin({
            org: "kdu",
            project: "hufflepuff_ibe",
            authToken: process.env.SENTRY_AUTH_TOKEN,
        })
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
});
