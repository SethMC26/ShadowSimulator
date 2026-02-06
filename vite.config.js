import { defineConfig } from 'vite';

const PORT = 49165;
const HOSTNAME = 'cs.merrimack.edu';

const lifecycle = process.env.npm_lifecycle_event || '';

export default defineConfig(() => {
  // Local development (localhost, any free port)
  const localServer = {
    host: 'localhost',
    strictPort: false,
    allowedHosts: ['localhost', '127.0.0.1']
  };

  // Campus-hosted dev server (fixed port + strict)
  const campusServer = {
    host: '0.0.0.0',
    port: PORT,
    strictPort: true,
    allowedHosts: [HOSTNAME]
  };

  // Preview of production build (optional)
  const previewServer = {
    host: '0.0.0.0',
    port: PORT,
    strictPort: true,
    allowedHosts: [HOSTNAME, 'localhost']
  };

  if (lifecycle === 'dev:host') {
    return { server: campusServer };
  }

  if (lifecycle === 'preview') {
    return { server: previewServer };
  }

  // default: dev / dev:local
  return { server: localServer };
});
