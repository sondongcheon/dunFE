import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import settingsReducer from "./settingsSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    settings: settingsReducer,
  },
})

export default store
