const MatrixState = {
    matrixA: [], // Matriz inicial
    matrixB: [], // Opcional
    operation: '', // Operación actual
    rowsA: 0,
    colsA: 0,
    rowsB: 0,
    colsB: 0,
};

const ShareableState = {
    ...MatrixState, // Herencia simple mediante spread operator
    timestamp: Date.now(),
};

export { MatrixState, ShareableState };