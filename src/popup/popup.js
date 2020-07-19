import Vue from 'vue';
import Antd from 'ant-design-vue';
import App from './App';
import 'ant-design-vue/dist/antd.css';
import axios from "axios";

Vue.prototype.$axios = axios;
Vue.config.productionTip = false;

Vue.use(Antd);


/* eslint-disable no-new */
new Vue({
  el: '#app',

  render: h => h(App),
});
