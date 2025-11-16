import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext } from "../../theme/ThemeContext";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const Header = () => {
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">Avito Moderation Panel</Typography>
      

        <IconButton
          onClick={toggleColorMode}
          color="inherit"
          sx={{
            transition: "transform 0.2s ease",
            "&:active": { transform: "scale(0.8)" },
          }}
        >
          {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
