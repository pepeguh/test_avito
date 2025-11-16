import App from './App.jsx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { CustomThemeProvider } from "./theme/ThemeContext.jsx";


ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <CustomThemeProvider>
    <App />
  </CustomThemeProvider>
  </Provider>

)