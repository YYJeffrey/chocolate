import axios from 'axios';

// 默认超时时间
axios.defaults.timeout = 15000;

// 路由请求拦截
axios.interceptors.request.use(
  config => {
    config.headers['Content-Type'] = 'application/json;charset=UTF-8';
    return config;
  },
  error => {
    return Promise.reject(error.response);
  }
);

export default axios;
