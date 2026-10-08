import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "react-quill/dist/quill.snow.css";
import App from "./App";
import { SharedContextProvider } from "./store/SharedStore";
import { ToggleContextProvider } from "./components/store/LayoutHook";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store/store";
import { Loader, LoaderProvider } from "./components/loader/index";
import { ThemeProvider } from "./ThemeContext";
import SocketProvider from "./SocketProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <ThemeProvider>
          <SharedContextProvider>
            <SocketProvider>
              <LoaderProvider>
                <Loader />
                <ToggleContextProvider>
                  <App />
                </ToggleContextProvider>
              </LoaderProvider>
            </SocketProvider>
          </SharedContextProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </PersistGate>
  </Provider>
);
