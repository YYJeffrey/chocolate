import axios from 'axios';

// 默认超时时间
axios.defaults.timeout = 15000;
axios.defaults.baseURL = 'https://api.doctorxiong.club/v1';

// 路由请求拦截
axios.interceptors.request.use(
  config => {
    config.headers['Content-Type'] = 'application/json;charset=UTF-8';
    axios.defaults.crossDomain = true;
    axios.defaults.withCredentials = true;
    return config;
  },
  error => {
    return Promise.reject(error.response);
  }
);

export default axios;
