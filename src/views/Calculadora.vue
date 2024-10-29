<template>
    <div>
      <h1>Calculadora</h1>
      <form @submit.prevent="addNote">
        <div>
          <label for="title">Title:</label>
          <input type="text" v-model="title" id="title" required />
        </div>
        <div>
          <label for="description">Description:</label>
          <textarea v-model="description" id="description" required></textarea>
        </div>
        <button type="submit">Add Note</button>
      </form>
      <p v-if="message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  import { db } from "@/firebase/firebaseConfig";
  import { collection, addDoc } from "firebase/firestore";
  
  export default {
    name: "Calculadora",
    data() {
      return {
        title: "",
        description: "",
        message: "",
      };
    },
    methods: {
      async addNote() {
        try {
          await addDoc(collection(db, "notas"), {
            title: this.title,
            description: this.description,
            timestamp: new Date(),
          });
          this.message = "Note added successfully!";
          this.title = "";
          this.description = "";
          console.log("Agregado algo a la firebase");
        } catch (error) {
          console.error("Error adding note:", error);
          this.message = "Failed to add note.";
        }
      },
    },
  };
  </script>
  