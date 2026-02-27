import { createApp } from 'vue'
import App from './App.vue'
import './main.css'

import { createWebHistory, createRouter } from 'vue-router'

import Receipt from './Receipt.vue'
import Home from './Home.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/:id', component: Receipt },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App).use(router).mount('#app')
