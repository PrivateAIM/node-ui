import axios from "axios";
import UserService from "./UserService";

const baseUrl = "/";
const localhost = process.env.API_URL;

const _axios = axios.create({
  baseURL: process.env.NODE_ENV === "production" ? baseUrl : localhost,
  timeout: 5000 * 60, // (5000 = 5 sec) * 60 = 5 mins
});

const configureAxios = () => {
  _axios.interceptors.request.use((config) => {
    if (UserService.isLoggedIn()) {
      const callback = () => {
        config.headers.Authorization = `Bearer ${UserService.getToken()}`;
        return Promise.resolve(config);
      };
      return UserService.updateToken(callback);
    }
  });
};

export { configureAxios };
export default _axios;
