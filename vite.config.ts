import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  let supabaseUrl = env.VITE_SUPABASE_URL;
  let supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
  let imdbApiKey = env.VITE_IMDB_API_KEY || 'ab92397b';
  let tmdbApiKey = env.VITE_TMDB_API_KEY || 'dc05a7a16fbda5c670c70b8a988ba204';

  // Fallback to .env.example or env.template if .env is absent
  const fallbackFiles = ['.env.example', 'env.template'];
  for (const filename of fallbackFiles) {
    const fullPath = path.resolve(process.cwd(), filename);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
          supabaseUrl = trimmed.substring('VITE_SUPABASE_URL='.length).trim();
        } else if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
          supabaseAnonKey = trimmed.substring('VITE_SUPABASE_ANON_KEY='.length).trim();
        } else if (trimmed.startsWith('VITE_IMDB_API_KEY=')) {
          imdbApiKey = trimmed.substring('VITE_IMDB_API_KEY='.length).trim();
        } else if (trimmed.startsWith('VITE_TMDB_API_KEY=')) {
          tmdbApiKey = trimmed.substring('VITE_TMDB_API_KEY='.length).trim();
        }
      }
    }
  }

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey || ''),
      'import.meta.env.VITE_IMDB_API_KEY': JSON.stringify(imdbApiKey || 'ab92397b'),
      'import.meta.env.VITE_TMDB_API_KEY': JSON.stringify(tmdbApiKey || 'dc05a7a16fbda5c670c70b8a988ba204'),
    },
    server: {
      port: 3000,
      open: false
    }
  };
});
