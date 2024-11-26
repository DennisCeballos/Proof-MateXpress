export default {
    mounted() {
      if (!window.MathJax) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        script.onload = () => {
          console.log('MathJax cargado.');
          this.configureMathJax(); // Configurar MathJax con opciones
          this.renderMathJax();
        };
        document.head.appendChild(script);
      } else {
        console.log('MathJax ya estaba cargado.');
        this.configureMathJax(); // Configurar MathJax con opciones
        this.renderMathJax();
      }
    },
    methods: {
      renderMathJax() {
        if (window.MathJax) {
          window.MathJax.typesetPromise()
            .then(() => console.log('MathJax renderizado correctamente.'))
            .catch((err) => console.error('Error al renderizar MathJax:', err));
        }
      },
    },
  };
  