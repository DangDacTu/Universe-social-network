import axiosClient from './axiosClient';

export const createPost = (data) => {
  return axiosClient.post("/posts", data);
};

export const getPosts = () => {
  return axiosClient.get("/posts");
};