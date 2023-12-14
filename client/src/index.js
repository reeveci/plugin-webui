import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Auth from "./Auth";
import Civet from "./Civet";
import reportWebVitals from "./reportWebVitals";
import Router from "./Router";
import Styles from "./styles";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Styles />

    <Auth>
      <Civet>
        <Router>
          <App />
        </Router>
      </Civet>
    </Auth>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
