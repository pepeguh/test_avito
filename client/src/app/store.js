import { configureStore } from "@reduxjs/toolkit";
import adsReducer from "./slices/adsSlice";

export const store = configureStore({
  reducer: {
    ads: adsReducer,
  },
});