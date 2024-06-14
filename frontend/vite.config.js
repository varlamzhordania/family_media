import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@src": "/src",
            "@components": "/src/components",
            "@public": "/public",
            "@lib": "/src/lib",
            "@pages": "/src/pages",
            "@layout": "/src/layout",
        },
    },
})
