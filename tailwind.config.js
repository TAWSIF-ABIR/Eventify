module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js",
    "./styles/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563eb',
          primaryDark: '#1e40af',
          accent: '#06b6d4',
          surface: '#0b1020',
          card: '#0f172a',
          muted: '#64748b',
          success: '#16a34a',
          warning: '#f59e0b',
          danger: '#dc2626',
          bgLight: '#0b1220',
          bgDark: '#0b0f1a',
          text: '#e2e8f0'
        }
      },
      fontFamily: {
        heading: ['Inter', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      boxShadow: {
        'brand': '0 8px 30px rgba(0,0,0,0.25)',
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.8)'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 20s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(100px, -100px) rotate(90deg)' },
          '50%': { transform: 'translate(0, -200px) rotate(180deg)' },
          '75%': { transform: 'translate(-100px, -100px) rotate(270deg)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  darkMode: 'class',
  plugins: []
}
