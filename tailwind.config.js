/** Configuração do Tailwind (CSS compilado em css/tailwind.css). Gere de novo com: npm run css */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        navy: '#092B55',
        'brand-blue': '#087DE1',
        'brand-cyan': '#16C6EA',
        'brand-turquoise': '#18D4C3',
        'bg-light': '#F7F9FC',
        'muted-rp': '#5F6B7A'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
