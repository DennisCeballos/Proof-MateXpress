// Simplemente exporta constantes u objetos si necesitas las estructuras
const Matrix = []; // Usa un array bidimensional si es necesario

const HighlightCell = {
    matrix: '', // Valores posibles: 'A', 'B' o 'result'
    row: null,
    col: null,
    rows: [],
    cols: [],
};

const CalculationStep = {
    position: '',
    explanation: '',
    calculation: '',
    original: '',
    transposed: '',
    result: '',
    highlightCells: [], // Array de HighlightCell
    detSteps: [], // Cualquier paso determinante
    subSteps: [], // Sub-pasos de cálculo
};

export { Matrix, HighlightCell, CalculationStep };
