import { createSlice } from "@reduxjs/toolkit";

const adsSlice = createSlice({
  name: "ads",
  initialState: {
    ads: [],
    currentAd: null,
  },
  reducers: {
    setAds(state, action) {
      state.ads = action.payload;
    },
    setCurrentAd(state, action) {
      state.currentAd = action.payload;
    },
    updateAd(state, action) {
      const updated = action.payload;
      state.ads = state.ads.map((ad) =>
        ad.id === updated.id ? updated : ad
      );
      if (state.currentAd?.id === updated.id) {
        state.currentAd = updated;
      }
    },
  },
});

export const { setAds, setCurrentAd, updateAd } = adsSlice.actions;
export default adsSlice.reducer;
