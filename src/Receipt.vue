<template>
  <div class="px-2 max-w-xl mx-auto flex flex-col gap-0">
    <div class="flex justify-between px-2 w-full p-8">
      <div
        class="text-4xl font-light font-mono"
        @click="$router.push('/')"
      >
        cuantoes
      </div>
      <div @click="copyLink()" class="cursor-pointer h-10 flex items-center dark:text-white font-bold text-sm font-mono text-center">
        copiar link
      </div>
    </div>
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-1">
        <div class="flex items-center">
          <input type="text" v-model="claimantName" placeholder="Perico Los Palones" class="dark:bg-neutral-800 bg-neutral-200 p-2 w-full h-10 outline-none border-none" @input="claimantNameEdited = true" >
          <div v-if="!accountCreated || claimantNameEdited"
          
          @click="updateName()" :class="`cursor-pointer px-2 ${accountCreated ? 'bg-neutral-200 dark:bg-neutral-800 text-red-800' : 'bg-red-800 text-white'} h-10 flex items-center justify-center  font-bold text-sm`">
            {{ accountCreated ? "actualizar" : "iniciar" }}
          </div>
        </div>
      </div>
      <div class="px-4 flex flex-col justify-center pt-4">
        <div class="flex justify-between font-mono font-bold text-black/60 dark:text-white/60 text-sm">
          <div>
            Total boleta
          </div>
          <div>
            {{ format(total) }}
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-5 border-t border-neutral-400 dark:border-neutral-600"  v-if="accountCreated">
        <div class="flex flex-col ">
          <div v-for="item in items" :key="item._id" :class="`border-neutral-400 dark:border-neutral-600 border-b p-4 ${itemClaimedByMe(item) ? 'bg-neutral-200 dark:bg-neutral-800' : 'border-neutral-400 dark:border-neutral-600'}`">
            <div class="flex flex-col justify-center" @click="claim(item)">
              <div class="flex justify-between">
                <div>
                  {{ item.name }}
                </div>
                <div>
                  {{ format(item.price) }}
                </div>
              </div>
              <div class="min-h-10 flex items-center">
                <div class="flex gap-1 pt-2 flex-wrap" v-if="item.claims.length">
                  <div v-for="claim in item.claims" class="border border-neutral-800 dark:border-neutral-200 font-bold rounded-full px-2 py-1 dark:text-white text-sm w-min" :key="claim._id">
                    {{ claim.claimant.name }}
                  </div>
                </div>
                <div v-if="!item.claims.length" class="flex gap-2 items-center">
                  <div class="size-2 animate-pulse rounded-full bg-red-500" v-if="shouldShowUnclaimed"/>
                  <div class="size-2 rounded-full bg-neutral-300" v-else />
            
                  <div class="text-sm italic">
                    nadie ha reclamado esto
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-neutral-200 dark:bg-neutral-800 p-4 flex gap-4 flex-col font-mono" v-if="shouldShowUnclaimed && unclaimedItems.length">
          <div class="font-bold">
            pendientes
          </div>
          <div>
            <div v-for="item in unclaimedItems" class="flex justify-between" :key="item._id">
              <div>
                {{ item.name }}
              </div>
            </div>
            <div class="flex justify-between font-bold pt-2">
              <div>
                Total pendiente:
              </div>
              <div>
                {{ format(totalUnclaimed) }}
              </div>
            </div>
          </div>  
        </div>
        <div class="bg-neutral-200 dark:bg-neutral-800 p-4 flex gap-4 flex-col" v-if="!(unclaimedItems.length)">
          <div class="flex items-center gap-2">
            <div class="size-2 rounded-full bg-green-600" v-if="shouldShowUnclaimed"/>
            <div class="font-bold">
              no hay items pendientes
            </div> 
          </div>
        </div>
        <div class="bg-neutral-200 dark:bg-neutral-800 p-4 flex gap-4 flex-col font-mono">
          <div class="font-bold">
            resumen
          </div>
          <div class="">
            <div v-for="item in myItems" class="flex justify-between gap-4" :key="item._id">
              <div class="text-ellipsis overflow-hidden text-nowrap">
                {{ item.name }}
              </div>
              <div  class="text-nowrap">
                <span v-if="item.claims.length > 1">
                  / {{ item.claims.length }}
                  = 
                </span>
                {{ format(item.price / item.claims.length) }}
              </div>
            </div>
            <div class="flex justify-between font-bold pt-2 " >
              <div>
                Total:
              </div>
              <div>
                {{ format(myItemsTotal) }}
              </div>
            </div>  
          </div>
        </div>
        <div class="flex justify-between font-bold sticky bottom-0 py-5 dark:bg-neutral-900 bg-neutral-100 border-t-2 font-mono" v-if="myItemsTotal > 0">
          <div>
            Total con propina
          </div>
          <div class="flex justify-between font-bold">
            {{ format(myItemsTotal * 1.1) }}
          </div>
        </div>
      </div>
      <div v-else class="flex justify-center">
        Ingresa tu nombre para empezar
      </div>
    </div>
  </div>
</template>
<script>

import { claim, getReceiptItems, updateClaimant } from './api.js';

export default {
  name: "App",
  data() {
    return {
      items: null,
      uuid: null,
      receiptId: this.$route.params.id,
      claimantName: null,
      accountCreated: false,
      refreshInterval: null,
      claimantNameEdited: false,
    };
  },
  computed: {
    total() {
      if (!this.items) return 0;
      return this.items.reduce((total, item) => total + item.price, 0);
    },
    shouldShowUnclaimed() {
      return this.unclaimedItems.length / this.items.length < 0.3;
    },
    totalUnclaimed() {
      if (!this.items) return 0;
      return this.unclaimedItems.reduce((total, item) => total + item.price, 0);
    },
    unclaimedItems() {
      if (!this.items) return [];
      return this.items.filter((item) => item.claims.length === 0);
    },
    myItemsTotal() {
      return this.myItems.reduce((total, item) => total + (item.price / item.claims.length ), 0);
    },
    myItems() {
      if (!this.items) return [];
      return this.items.filter((item) => item.claims.some((claim) => claim.claimant.uuid === this.uuid));
    },
    itemClaimedByMe(item) {
      return (item) => item.claims.some((claim) => claim.claimant.uuid === this.uuid);
    },
  },
  methods: {
    truncate(text, length = 20) {
      if (text.length <= length) return text;
      return text.slice(0, length) + '...';
    },
    format(amount) {
      return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(Math.round(amount));
    },
    copyLink() {
      const url = `${window.location.origin}/${this.receiptId}`;
      navigator.clipboard.writeText(url)
    },
    updateName() {
      updateClaimant(this.uuid, {"name": this.claimantName}).then((response) => {
        localStorage.setItem("claimant_name", this.claimantName);
        this.accountCreated = true;
        this.claimantNameEdited = false;
        this.fetchItems();
      }).catch((error) => {
        console.error("Error updating name:", error);
      });
    },
    claim(item) {
      console.log("Claiming item:", item);

      claim(this.receiptId, item._id, {'claimant_uuid': this.uuid, "claimant_name": "vicho"}).then((response) => {
        console.log("Claim response:", response);
          getReceiptItems(this.$route.params.id).then((response) => {
            console.log(response.data);
            this.items = response.data;
          }).catch((error) => {
            console.error("Error fetching receipt items:", error);
          });
      }).catch((error) => {
        console.error("Error claiming item:", error);
      });
    },
    fetchItems() {
      getReceiptItems(this.$route.params.id).then((response) => {
        console.log(response.data);
        this.items = response.data;
      }).catch((error) => {
        console.error("Error fetching receipt items:", error);
      });
    },
    generateUuid(){
      if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      } else {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    }

  },
  mounted() {
    this.uuid = localStorage.getItem("uuid");

    if (!this.uuid) {
      this.uuid = this.generateUuid();
      localStorage.setItem("uuid", this.uuid);
    } 

    this.claimantName = localStorage.getItem("claimant_name") || null;
    if (this.claimantName) {
      this.accountCreated = true;
    }

    this.fetchItems();

    this.refreshInterval = setInterval(this.fetchItems, 2000);
  },
  beforeUnmount() {
    clearInterval(this.refreshInterval);
  },
};

</script>
