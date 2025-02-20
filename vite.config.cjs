import { defineConfig } from 'vite';
import adastra from 'adastra-plugin';
import path from 'path';
import ViteCSSExportPlugin from 'vite-plugin-css-export';
import fs from 'fs/promises';
import { glob } from 'glob';
import ViteSvgSpriteWrapper from "vite-svg-sprite-wrapper";

const cleanOldAssets = () => ({
  name: 'clean-old-assets',
  buildStart: async (code, id) => {
    try {
      // Load the JSON data directly
      const data = JSON.parse(await fs.readFile('assets/adastra.manifest.json', 'utf-8'));
      const allowed_files = Object.values(data).map((item) => item.file);
      // find all files from previous builds
      console.log(glob);
      const files = glob.sync('assets/**/sf-*.{css,js}');

      // loop through each file
      for (const file of files) {
        // check if the file is in the allowed list
        if (!allowed_files.includes(path.basename(file))) {
          // if not, delete the file
          await fs.unlink(file);
          console.log(`Deleted ${file}`);
        }
      }

      console.log('Cleaned up assets folder');
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  },
});

export default defineConfig({
  server: {
    watch: {
      ignored: [
        path.resolve(__dirname, 'assets/**'),
        path.resolve(__dirname, 'config/**'),
        path.resolve(__dirname, 'layout/**'),
        path.resolve(__dirname, 'locales/**'),
        path.resolve(__dirname, 'sections/**'),
        path.resolve(__dirname, 'snippets/**'),
        path.resolve(__dirname, 'templates/**'),
      ],
    },
  },
  build: {
    cssCodeSplit: true,
    emptyOutDir: false,
    rollupOptions: {
      output: {
        assetFileNames: 'sf-[name]-[hash][extname]',
        entryFileNames: 'sf-[name]-[hash].js',
        chunkFileNames: 'sf-chunk-[name]-[hash].js',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },

  app: 'mpa',
  plugins: [
    ViteSvgSpriteWrapper({
      icons: 'icons/*.svg',
      outputDir: 'snippets',
      log: 'error',
      generateType: false,
      typeFileName: 'sf-icons',
      sprite: {
          mode: {
              symbol: {
                  dest: '',
                  prefix: '',
                  inline: true,
                  sprite: `sprite.liquid`,
                  render: {
                      css: true,
                      scss: true,
                  },
              },
          },
          shape: {
              dimension: {
                  attributes: true,
              },
              transform: [],
              spacing: {
                  padding: 0,
                  box: 'content',
              },
          },
          svg: {
              xmlDeclaration: false,
              rootAttributes: {
                'aria-hidden': 'true',
                'aria-label': 'Sprite',
                'style': 'position: absolute;',
              },
          },
      },
    }),
    adastra(),  
    ViteCSSExportPlugin(), 
    cleanOldAssets()
  ],
});
