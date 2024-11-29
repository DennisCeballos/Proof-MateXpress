// import type { MatrixState, ShareableState } from '../types/state';

const encodeState = (state) => {
    // Crear un objeto con el estado y agregar un timestamp
    const shareableState = {
      ...state,
      timestamp: Date.now(),
    };
    return btoa(JSON.stringify(shareableState));  // Codificar en base64
  };
  
  const decodeState = (hash) => {
    try {
      // Decodificar el hash y parsear el JSON
      const decoded = atob(hash.startsWith('#') ? hash.slice(1) : hash);
      const state = JSON.parse(decoded);
  
      // Validar la estructura del estado
      if (!state.matrixA || !state.operation || 
          typeof state.rowsA !== 'number' || 
          typeof state.colsA !== 'number' || 
          (state.matrixB && (typeof state.rowsB !== 'number' || typeof state.colsB !== 'number'))) {
        return null;  // Si la estructura no es válida, retornar null
      }
  
      return state;
    } catch (e) {
      console.error('Error decoding state:', e);
      return null;  // Si ocurre un error, retornar null
    }
  };
  
  const getShareableLink = (state) => {
    const encoded = encodeState(state);
    return `${window.location.origin}/calculadora#${encoded}`;  // Crear un enlace con el estado codificado
  };

export { encodeState, decodeState, getShareableLink };

