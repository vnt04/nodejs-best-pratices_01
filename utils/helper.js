import { supportedMimes } from "../config/system.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const imageValidator = (size, mine) => {
  if (bytesToMb(size) > 2) {
    return "Image size must be less than 2 MB";
  } else if (!supportedMimes.includes(mine)) {
    return "Image must be type of jpg,png,jpeg,svg,gif,webp,...";
  }

  return null;
};

export const bytesToMb = (bytes) => {
  return bytes / (1024 * 1024);
};

export const generateRandomNum = () => {
  return uuidv4();
};

export const getImageURL = (imageName) => {
  return `${process.env.APP_URL}/images/${imageName}`;
};

export const uploadImage = (image) => {
  const imageElements = image?.name.split(".");
  const imageName = generateRandomNum() + "." + imageElements[1];
  const uploadPath = process.cwd() + "/public/images/" + imageName;

  image.mv(uploadPath, (error) => {
    if (error) throw error;
  });

  return imageName;
};

export const deleteImage = (imageName) => {
  const path = process.cwd() + "/public/images/" + imageName;
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
};
