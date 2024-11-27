// src/composables/useMathJax.js
import { onMounted, watch } from 'vue';

export function useMathJax(questions) {
  const loadMathJax = () => {
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']], 
      },
      svg: {
        fontCache: 'global', 
      },
    };

    if (!window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.onload = renderMathJax;
      document.head.appendChild(script);
    } else {
      renderMathJax();
    }
  };

  const renderMathJax = () => {
    if (window.MathJax) {
      const elements = document.querySelectorAll('.mathjax'); // Selecciona solo elementos LaTeX
      if (elements.length > 0) {
        window.MathJax.typesetPromise(elements)
          .then(() => console.log('MathJax renderizado correctamente.'))
          .catch((err) => console.error('Error al renderizar MathJax:', err));
      }
    }
  };

  // Cargar MathJax al montar el componente
  onMounted(() => {
    loadMathJax();
  });

  // Reactivar MathJax cuando cambien las preguntas
  watch(questions, renderMathJax);
}
