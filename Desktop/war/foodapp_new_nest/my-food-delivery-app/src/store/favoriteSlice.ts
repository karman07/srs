import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FavoriteState {
  favoriteItems: string[];
}

const initialState: FavoriteState = {
  favoriteItems: JSON.parse(localStorage.getItem('favorites') || '[]'),
};

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    addToFavorite: (state, action: PayloadAction<string>) => {
      if (!state.favoriteItems.includes(action.payload)) {
        state.favoriteItems.push(action.payload);
        localStorage.setItem('favorites', JSON.stringify(state.favoriteItems));
      }
    },
    removeFromFavorite: (state, action: PayloadAction<string>) => {
      state.favoriteItems = state.favoriteItems.filter(
        (id) => id !== action.payload
      );
      localStorage.setItem('favorites', JSON.stringify(state.favoriteItems));
    },
  },
});

export const { addToFavorite, removeFromFavorite } = favoriteSlice.actions;
export default favoriteSlice.reducer;
