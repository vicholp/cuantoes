<template>
  <div class="px-2 max-w-xl mx-auto flex flex-col gap-0">
    <div class="flex justify-between px-2 w-full p-8">
      <div class="text-4xl font-light font-mono" @click="$router.push('/')">
        cuantoes
      </div>
      <div @click="copyLink()" v-if="!linkCopied"
        class="cursor-pointer h-10 flex items-center dark:text-white font-bold text-sm font-mono text-center">
        copiar link
      </div>
      <div @click="copyLink()" v-else
        class="cursor-pointer h-10 flex items-center dark:text-white  justify-center underline font-bold text-sm font-mono text-center">
        link copiado
      </div>
    </div>
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-1">
        <div class="flex items-center">
          <input type="text" v-model="claimantName" placeholder="Perico Los Palotes"
            class="dark:bg-neutral-800 bg-neutral-200 p-2 w-full h-10 outline-none border-none"
            @input="claimantNameEdited = true">
          <div v-if="!accountCreated || claimantNameEdited" @click="updateName()"
            :class="`cursor-pointer px-2 ${accountCreated ? 'bg-neutral-200 dark:bg-neutral-800 text-red-800' : 'bg-red-800 text-white'} h-10 flex items-center justify-center  font-bold text-sm`">
            {{ accountCreated ? "actualizar" : "iniciar" }}
          </div>
        </div>
        <div class="flex font-mono text-sm" v-if="accountCreated">
          <button v-for="f in ['todos', 'míos', 'pendientes']" :key="f" @click="filter = f"
            :class="`flex-1 py-2 font-bold transition-colors ${filter === f ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black' : 'text-neutral-500 dark:text-neutral-400'}`">
            {{ f }}
          </button>
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
      <div class="flex flex-col gap-5 border-t border-neutral-400 dark:border-neutral-600" v-if="accountCreated">
        <div class="flex flex-col ">
          <div v-for="item in filteredItems" :key="item._id"
            :class="`border-neutral-400 dark:border-neutral-600 border-b p-4 ${itemClaimedByMe(item) ? 'bg-neutral-200 dark:bg-neutral-800' : 'border-neutral-400 dark:border-neutral-600'}`">
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
                  <div v-for="claim in item.claims"
                    class="border border-neutral-800 dark:border-neutral-200 font-bold rounded-full px-2 py-1 dark:text-white text-sm w-min"
                    :key="claim._id">
                    {{ claim.claimant.name }}
                  </div>
                </div>
                <div v-if="!item.claims.length" class="flex gap-2 items-center">
                  <div class="size-2 animate-pulse rounded-full bg-red-500" v-if="shouldShowUnclaimed" />
                  <div class="size-2 rounded-full bg-neutral-300" v-else />

                  <div class="text-sm italic">
                    nadie ha reclamado esto
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="h-0.5 w-full dark:bg-neutral-500">
        </div>
        <div class="bg-neutral-200 dark:bg-neutral-800 p-4 flex gap-4 flex-col font-mono"
          v-if="shouldShowUnclaimed && unclaimedItems.length">
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
            <div class="size-2 rounded-full bg-green-600" v-if="shouldShowUnclaimed" />
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
              <div class="text-nowrap">
                <span v-if="item.claims.length > 1">
                  / {{ item.claims.length }}
                  =
                </span>
                {{ format(item.price / item.claims.length) }}
              </div>
            </div>
          </div>
        </div>
        <div class="bg-neutral-200 dark:bg-neutral-800 px-4" v-if="myItemsTotal">
          <div class=" min-h-[70vh] py-10 justify-evenly flex gap-4 flex-col font-mono">
            <div class="flex flex-col items-center gap-5 justify-between" v-if="!totalWithTip">
              <div>
                Total sin propina
              </div>
              <div class="text-6xl font-bold">
                {{ format(myItemsTotal) }}
              </div>
            </div>
            <div class="flex flex-col items-center gap-5 justify-between" v-if="totalWithTip">
              <div>
                Total con propina - 10%
              </div>
              <div class="text-6xl font-bold">
                {{ format(myItemsTotal * 1.1) }}
              </div>
            </div>
          </div>
          <div
            class="text-center flex items-center justify-evenly bg-neutral-200 dark:bg-neutral-800 py-1 gap-10 text-sm border-t border-neutral-500 ">
            <div @click="totalWithTip = false"
              :class="`${totalWithTip ? 'dark:text-white/60 text-black/60' : 'font-bold dark:text-white text-black'}`">
              sin propina
            </div>
            <div @click="totalWithTip = true"
              :class="`${totalWithTip ? 'font-bold dark:text-white text-black ' : 'dark:text-white/60 text-black/60'}`">
              con propina
            </div>
          </div>
        </div>
        <div class="text-4xl min-h-[5vh] font-bold text-center font-mono pt-2  text-neutral-400 dark:text-neutral-600">
          cuantoes
        </div>
        <div class="px-5 min-h-[5vh] py-4 gap-5 text-sm text-center text-neutral-800 dark:text-neutral-200">
          Hecho por personas 🍖, funciona con Anthropic 🤖.
          Revisa el codigo en <a href="https://github.com/vicholp/cuantoes" class="underline">github</a>.
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
      filter: 'todos',
      totalWithTip: false,
      linkCopied: false,
      linkCopiedTimeout: null,
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
      return this.myItems.reduce((total, item) => total + (item.price / item.claims.length), 0);
    },
    myItems() {
      if (!this.items) return [];
      return this.items.filter((item) => item.claims.some((claim) => claim.claimant.uuid === this.uuid));
    },
    itemClaimedByMe(item) {
      return (item) => item.claims.some((claim) => claim.claimant.uuid === this.uuid);
    },
    filteredItems() {
      if (!this.items) return [];
      if (this.filter === 'míos') return this.myItems;
      if (this.filter === 'pendientes') return this.unclaimedItems;
      return this.items;
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
      this.linkCopied = true
      this.linkCopiedTimeout = setTimeout(() => this.linkCopied = false, 3000);
    },
    updateName() {
      updateClaimant(this.uuid, { "name": this.claimantName }).then((response) => {
        localStorage.setItem("claimant_name", this.claimantName);
        this.accountCreated = true;
        this.claimantNameEdited = false;
        this.filter = 'todos';
        this.fetchItems();
      }).catch((error) => {
        console.error("Error updating name:", error);
      });
    },
    claim(item) {
      console.log("Claiming item:", item);

      claim(this.receiptId, item._id, { 'claimant_uuid': this.uuid, "claimant_name": "vicho" }).then((response) => {
        console.log("Claim response:", response);
        getReceiptItems(this.$route.params.id).then((response) => {
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
        this.items = response.data;
      }).catch((error) => {
        console.error("Error fetching receipt items:", error);
      });
    },
    generateUuid() {
      if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
      } else {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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
