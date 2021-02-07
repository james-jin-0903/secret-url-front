import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import './assets/styles/App.css';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/dist/vuetify.css';

Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
