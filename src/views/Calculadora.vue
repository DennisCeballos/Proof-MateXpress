<!-- <template>
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
  </script> -->


<template>
  <div class="calculator">
    <div class="display">{{current || '0'}}</div> 
    <div @click="clear" class="btn">AC</div> 
    <div @click="sign" class="btn">+/-</div> 
    <div @click="percent" class="btn">%</div>
    <div @click="div" class="btn operator">÷</div> 
    <div @click="append(7)" class="btn">7</div> 
    <div @click="append(8)" class="btn">8</div>
    <div @click="append(9)" class="btn">9</div> 
    <div @click="mult" class="btn operator">x</div> 
    <div @click="append(4)" class="btn">4</div>
    <div @click="append(5)" class="btn">5</div> 
    <div @click="append(6)" class="btn">6</div> 
    <div @click="menos" class="btn operator">-</div>
    <div @click="append(1)" class="btn">1</div>
    <div @click="append(2)" class="btn">2</div> 
    <div @click="append(3)" class="btn">3</div> 
    <div @click="mas" class="btn operator">+</div>
    <div @click="append(0)" class="btn zero">0</div>
    <div @click="dot" class="btn">.</div>
    <div @click="equal" class="btn operator">=</div>
  </div>
</template>

<script>
  export default{
    data(){
      return {
        previous : null,
        current : '',
        operator : null,
        operatorClicked : false,
      }
    },
    methods: {
      clear() {
        this.current = ''
      },
      sign(){
        this.current = this.current.charAt(0) === '-' ? 
          this.current.slice(1) : `-${this.current}`;
      },
      percent(){
        this.current = `${parseFloat(this.current)/100}`;
      },
      append(number){
        if(this.operatorClicked){
          this.current = '';
          this.operatorClicked = false;
        }
        this.current = `${this.current}${number}`;
      },
      dot(){
        if (this.current.indexOf('.') === -1){ //if current  == 0 -> 0.
          this.append('.');
        } 
      },
      setPrevious(){
        this.previous = this.current,
        this.operatorClicked = true;
      },
      div(){
        this.operator = (a, b) => a / b;
        this.setPrevious();
      },
      mult(){
        this.operator = (a, b) => a * b;
        this.setPrevious();
      },
      menos(){
        this.operator = (a, b) => a - b;
        this.setPrevious();
      },
      mas(){
        this.operator = (a, b) => a + b;
        this.setPrevious();
      },
      equal(){
        this.current = `${this.operator(
          parseFloat(this.current),
          parseFloat(this.previous)
        )}`;
        this.previous = null;
      }
    }
  }
</script>

<style scoped>
.calculator{
  margin: 0 auto;
  width: 400px;
  font-size: 40px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(50px, auto);
  text-align: center;
}

.display{
  grid-column: 1 / 5;
  background-color: #333;
  color : white;
}

.btn{
  background-color: #eeee;
  border: 1px solid #999;
}

.zero{
  grid-column: 1 / 3;
}

.operator{
  background-color: orange;
}
</style>