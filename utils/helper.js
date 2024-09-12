import { supportedMimes } from "../config/system.js";
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
