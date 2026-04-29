import axios from "axios";

const client = axios.create({
  baseURL: "http://192.168.1.32:5000", // غيّرها حسب IP عندك
});

export default client;