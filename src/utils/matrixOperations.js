import { Matrix } from './matrix';

export const formatNumber = (num) => {
    return Number(num.toFixed(2)).toString();
};

export const generateAdditionSteps = (matrixA, matrixB, result) => {
    const steps = [];
    const rows = matrixA.length;
    const cols = matrixA[0].length;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      steps.push({
        position: `[${i + 1},${j + 1}]`,
        calculation: `${formatNumber(matrixA[i][j])} + ${formatNumber(matrixB[i][j])} = ${formatNumber(result[i][j])}`,
        highlightCells: [
          { matrix: 'A', row: i, col: j },
          { matrix: 'B', row: i, col: j },
          { matrix: 'result', row: i, col: j }
        ]
      });
    }
  }

  return steps;
};

export const generateSubtractionSteps = (matrixA, matrixB, result) => {
  const steps = [];
  const rows = matrixA.length;
  const cols = matrixA[0].length;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      steps.push({
        position: `[${i + 1},${j + 1}]`,
        calculation: `${formatNumber(matrixA[i][j])} - ${formatNumber(matrixB[i][j])} = ${formatNumber(result[i][j])}`,
        highlightCells: [
          { matrix: 'A', row: i, col: j },
          { matrix: 'B', row: i, col: j },
          { matrix: 'result', row: i, col: j }
        ]
      });
    }
  }

  return steps;
};

export const generateMultiplicationSteps = (matrixA, matrixB, result) => {
  const steps = [];
  const rowsA = matrixA.length;
  const colsB = matrixB[0].length;
  const colsA = matrixA[0].length;

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      const calculations = [];
      let sum = 0;

      for (let k = 0; k < colsA; k++) {
        const product = matrixA[i][k] * matrixB[k][j];
        sum += product;
        calculations.push(`(${formatNumber(matrixA[i][k])} × ${formatNumber(matrixB[k][j])})`);
      }

      steps.push({
        position: `[${i + 1},${j + 1}]`,
        calculation: `${calculations.join(' + ')} = ${formatNumber(sum)}`,
        highlightCells: [
          { matrix: 'A', row: i, cols: Array.from({ length: colsA }, (_, k) => k) },
          { matrix: 'B', rows: Array.from({ length: colsA }, (_, k) => k), col: j },
          { matrix: 'result', row: i, col: j }
        ]
      });
    }
  }

  return steps;
};

export const generateDeterminantSteps = (matrix) => {
  const steps = [];
  const n = matrix.length;

  if (n === 1) {
    return [{
      explanation: 'For a 1×1 matrix, the determinant is the value itself',
      calculation: `det = ${formatNumber(matrix[0][0])}`
    }];
  }

  if (n === 2) {
    const [[a, b], [c, d]] = matrix;
    const det = a * d - b * c;
    return [{
      explanation: 'For a 2×2 matrix, determinant = ad - bc',
      calculation: `det = (${formatNumber(a)} × ${formatNumber(d)}) - (${formatNumber(b)} × ${formatNumber(c)}) = ${formatNumber(det)}`
    }];
  }

  return steps;
};

export const generateTransposeSteps = (matrix, result) => {
  const steps = [];
  const rows = matrix.length;
  const cols = matrix[0].length;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      steps.push({
        explanation: `Transposing position [${i + 1},${j + 1}] to [${j + 1},${i + 1}]`,
        original: `[${i + 1},${j + 1}] = ${formatNumber(matrix[i][j])}`,
        transposed: `[${j + 1},${i + 1}] = ${formatNumber(result[j][i])}`,
        highlightCells: [
          { matrix: 'A', row: i, col: j },
          { matrix: 'result', row: j, col: i }
        ]
      });
    }
  }

  return steps;
};

export const generateInverseSteps = (matrix, result) => {
  const steps = [];
  const n = matrix.length;
  
  // Add step to show the determinant calculation first
  const detSteps = generateDeterminantSteps(matrix);
  steps.push({
    explanation: 'Step 1: Calculate the determinant',
    detSteps
  });

  steps.push({
    explanation: 'Step 2: Calculate the adjugate matrix (transpose of cofactor matrix)',
    subSteps: Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => ({
        position: `[${i + 1},${j + 1}]`,
        original: formatNumber(matrix[i][j]),
        result: formatNumber(result[i][j]),
        highlightCells: [
          { matrix: 'A', row: i, col: j },
          { matrix: 'result', row: i, col: j }
        ]
      }))
    ).flat()
  });

  return steps;
};
