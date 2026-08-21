import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import store from './state/store'
import { Provider } from 'react-redux'
import { AudioProvider } from "./context/AudioContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
        <Provider store={store}>
            <AudioProvider>
                <App />
            </AudioProvider>
        </Provider>
  </React.StrictMode>,
)
