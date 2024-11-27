<template>
    <div v-html="renderedContent"></div>
  </template>
  
  <script>
  import { tex2chtml } from 'mathjax-full/js/output/chtml';
  import { TeX } from 'mathjax-full/js/input/tex';
  import { mathjax } from 'mathjax-full/js/mathjax';
  import { CHTML } from 'mathjax-full/js/output/chtml';
  import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';
  
  const chtml = new CHTML();
  RegisterHTMLHandler(chtml);
  
  export default {
    props: {
      content: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        renderedContent: "",
      };
    },
    watch: {
      content: {
        immediate: true,
        handler(newValue) {
          this.renderMath(newValue);
        },
      },
    },
    methods: {
      renderMath(math) {
        try {
          const htmlDoc = mathjax.document('', {
            InputJax: new TeX(),
            OutputJax: chtml,
          });
          const node = htmlDoc.convert(math, {
            display: true,
          });
          this.renderedContent = node.outerHTML;
        } catch (error) {
          console.error('Error rendering MathJax content:', error);
        }
      },
    },
  };
  </script>
  
  <style>
  /* Estilo para MathJax */
  .mathjax .mjx-math {
    font-size: 1em;
  }
  </style>
  