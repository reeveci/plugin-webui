import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Auth from "./Auth";
import Civet from "./Civet";
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
  </React.StrictMode>,
);
