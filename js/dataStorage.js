import { log } from "./coreUtilities.js";

const dataStorage = {
  setSession: (key, value) => {
    const saveObj = dataStorage.encode(value);
    sessionStorage.setItem(key, saveObj);
  },
  getSession: (key) => {
    let session = sessionStorage.getItem(key);
    session = dataStorage.decode(session);

    return session;
  },
  deleteSession: (key) => {
    sessionStorage.removeItem(key);
  },
  encode: (value) => {

    if (typeof value == "object" || typeof value == "array") {
      value = JSON.stringify(value);
    }

    return value;
  },
  decode: (value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      return false;
    }
  },
};
export { dataStorage };
