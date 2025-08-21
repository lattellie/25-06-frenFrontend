import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";
import theme from "./theme.ts";
import { VocabProvider } from "./contexts/VocabContext.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { Auth0Provider } from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <VocabProvider>
        <Auth0Provider
          domain={import.meta.env.VITE_AUTH0_DOMAIN}
          clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
          authorizationParams={{
            redirect_uri: window.location.origin + "/",
          }}
        >
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles
              styles={{
                "html, body, #root": {
                  width: "100%",
                  height: "100%",
                  margin: 0,
                  padding: 0,
                },
                "*": {
                  boxSizing: "border-box",
                  scrollbarWidth: "none", // Firefox
                  "&::-webkit-scrollbar": {
                    display: "none", // Chrome, Safari
                  },
                },
              }}
            />
            <App />
          </ThemeProvider>
        </Auth0Provider>
      </VocabProvider>
    </Provider>
  </React.StrictMode>
);
