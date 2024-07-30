import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'; 
import { store } from './redux/store';
import App from './App';
import './style/mainStyle.css';
import './index.css';
import './satoshi.css';
import "./index.css";

import YearProvider from './context/YearProvider/YearProvider';

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <YearProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </YearProvider>
    </Provider>
  </React.StrictMode>,
);


