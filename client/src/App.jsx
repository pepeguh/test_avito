import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, useTheme } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import ListPage from "./pages/ListPage";
import ItemPage from "./pages/ItemPage";
import StatsPage from "./pages/StatsPage";

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/list" />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/item/:id" element={<ItemPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const theme = useTheme();

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box display="flex" height="100vh">
            <Sidebar />
            <Box flex={1} display="flex" flexDirection="column">
              <Header />
              <Box flex={1} p={2}>
                  <AnimatedRoutes />
              </Box>
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
  );
};

export default App;
