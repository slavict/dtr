import { Box, Typography, Divider, Button } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ textAlign: "center", py: 2 }}>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
        <Typography variant="h4" component="h1">
          Dental Tech Register
        </Typography>
        {user && (
          <>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Button variant="outlined" size="small" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Header;
