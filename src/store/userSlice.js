import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    key: '',  // 너가 말한 "개인 key"
  },
  reducers: {
    setKey: (state, action) => {
      state.key = action.payload
    },
  },
})

export const { setKey } = userSlice.actions
export default userSlice.reducer
