// FormComponent.js
import { ref } from 'vue';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function useForm() {
  const options = ref(['Opción A', 'Opción B', 'Opción C', 'Opción D']);
  const selectedOptions = ref([]);
  const textAnswer = ref('');
  const submitted = ref(false);
  const message = ref(''); 

  const submitForm = async () => {
    const formData = {
      selectedOptions: selectedOptions.value,
      textAnswer: textAnswer.value,
      timestamp: new Date()
    };

    try {
      await addDoc(collection(db, 'formResponses'), formData);
      console.log('Datos enviados a Firestore:', formData);
      submitted.value = true;
      message.value = "Datos enviados a Firebase!"; 

      // Limpia las respuestas después de enviarlas
      selectedOptions.value = [];
      textAnswer.value = '';
    } catch (error) {
      console.error('Error al enviar los datos a Firestore:', error);
      message.value = "Error al enviar datos a Firebase"; 
    }
  };

  return {
    options,
    selectedOptions,
    textAnswer,
    submitted,
    message, // Devuelve el mensaje para el componente
    submitForm,
  };
}