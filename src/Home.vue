<template>
  <div class="p-5 max-w-xl mx-auto flex flex-col gap-7">
    <div class="flex justify-center">
      <div
        class="text-center text-4xl font-light font-mono">
        cuantoes
      </div>
    </div>
    <div class="text-center">
      Escanea una boleta y que cada uno sepa cuanto es
    </div>
    <div >
      <img v-if="imageBase64" :src="imageBase64 ? `data:image/png;base64,${imageBase64}` : null" alt="Imagen seleccionada"  class="mt-4 w-full h-auto"/>
      <div>
        <p v-if="message" class="dark:bg-red-800 dark:border-b-white text-center dark:border-b-2 dark:text-white text-sm font-bold p-2">
          {{ message }}
        </p>
      </div>
      <div class="flex" v-if="!sending">
        <div class="w-full">
          <label for="imageInput" >
            <div :class="`cursor-pointer px-2 py-4 ${imageBase64 ? 'bg-neutral-800 dark:bg-neutral-800' :  'bg-red-800 dark:bg-red-800' } text-white dark:text-white font-bold w-full flex justify-center`">
              {{imageBase64 ? "Cambiar imagen" : "Escoger imagen"}}
            </div>
          </label>
          <input type="file" ref="imageRef" id="imageInput"  @change="imageLoaded" class="hidden"/>
        </div>  
        <div @click="newReceipt" v-if="imageBase64" class="cursor-pointer px-2 py-4 bg-red-800 text-white font-bold w-full flex justify-center">
          Crear boleta
        </div>
      </div>
      <div v-else>
        <div class="px-4 py-5 bg-neutral-900 text-neutral-100 justify-center flex items-center gap-1 sm:gap-3 border-t-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]" v-if="sending">
          <div class="flex gap-1 items-center">
            <span class="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
            <span class="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
            <span class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
          </div>
          <span class="text-xs tracking-[0.3em] uppercase text-neutral-400">Creando boleta con</span>
          <span class="font-black text-transparent bg-clip-text text-xl bg-linear-to-r from-cyan-400 via-blue-400 to-purple-500 animate-pulse drop-shadow-lg">IA ✦</span>
        </div>
      </div>
    </div>
  </div>  
</template>
<script>

import { createReceipt } from './api.js';

export default {
  data() {
    return {
      imageBase64: null,
      sending: false,
message: null,
    };
  },
  methods: {
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    async imageLoaded(e) {
      const file = this.$refs.imageRef.files[0];
      if (file) {
        this.imageBase64 = await this.getBase64(file);
      } 
    },
    async newReceipt() {
      try {
        if (this.imageBase64) {
          this.sending = true;
this.message = null;
          const response = await createReceipt({"image_base64": this.imageBase64});
          this.$router.push(`/${response.data.receipt_id}`); 
        }

      } catch (error) {
        this.message = "Ocurrio un error al cargar la imagen, intenta nuevamente";
        this.sending = false;
      }
    }
  }
};

</script>
