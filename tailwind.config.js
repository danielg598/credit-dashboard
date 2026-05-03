/** @type {import('tailwindcss').Config} */
module.exports = {
  // Le decimos a Tailwind qué archivos escanear para detectar clases usadas
  // y solo compilar esas (tree-shaking automático).
  content: [
    "./src/**/*.{html,ts}"
  ],

  // "corePlugins.preflight: false" evita que Tailwind resetee los estilos
  // globales (margins, paddings), lo cual ROMPERÍA los componentes de
  // NG Zorro que dependen de los resets de Ant Design.
  // Esta es la línea más importante cuando combinas Tailwind + NG Zorro.
  corePlugins: {
    preflight: false,
  },

  theme: {
    extend: {
      // Paleta alineada con el branding "Lumen" (azul + acentos).
      // Úsalos como bg-lumen-primary, text-lumen-accent, etc.
      colors: {
        lumen: {
          primary: '#1e3a8a',   // azul profundo (confianza banking)
          accent:  '#0ea5e9',   // azul brillante (tech)
          success: '#059669',   // verde aprobación
          danger:  '#dc2626',   // rojo rechazo
          warning: '#d97706',   // ámbar revisión manual
        }
      },
      fontFamily: {
        // NG Zorro usa -apple-system por defecto; dejamos consistente
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },

  plugins: [],
};

