import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {sentryVitePlugin} from "@sentry/vite-plugin";

export default defineConfig({
    plugins: [react(),
        tailwindcss(),
        sentryVitePlugin({
            org: "kdu",
            project: "hufflepuff_ibe",
            authToken: process.env.SENTRY_AUTH_TOKEN,
        })
    ],
});


