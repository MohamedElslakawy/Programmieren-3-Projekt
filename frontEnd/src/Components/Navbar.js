/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * Die Navbar-Komponente ist die Hauptnavigationsleiste der EduNotizen-Anwendung.
 * Sie ist responsiv und passt sich an Desktop- und Mobile-Ansichten an.
 * Funktionen:
 * - Logo und Link zur Startseite
 * - Suchfeld (nur auf Desktop)
 * - Dunkel-/Hellmodus-Umschalter
 * - "Neue Notiz"-Button (Desktop und Mobile)
 * - Logout-Button (Desktop und Mobile)
 * - Avatar des eingeloggten Benutzers
 * - Mobile Drawer für Navigation auf kleinen Bildschirmen
 */

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Button,
    IconButton,
    Drawer,
    Box,
    Avatar,
    Divider,
    useMediaQuery,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useAuth } from "../context/AuthContext";
import nmicIcon from "../assets/edunotic.png";
import SearchBar from "./Notes/SearchBar";
import { logoutUser } from "../api";

const Navbar = ({ toggleDarkMode, darkMode, setSearchTerm, searchTerm }) => {
    // Auth-Kontext: Benutzerinfo und Setter
    const { user, setUser } = useAuth();

    // State für Mobile Drawer
    const [mobileOpen, setMobileOpen] = React.useState(false);

    // React Router navigate
    const navigate = useNavigate();

    // Drawer öffnen/schließen
    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    // Logout-Funktion
    const handleLogout = () => {
        logoutUser();
        setUser(null);
        navigate("/login");
    };

    // Media Query: Mobile erkennen
    const isMobile = useMediaQuery("(max-width:600px)");

    return (
        <>
            {/* AppBar (Haupt-Navigationsleiste) */}
            <AppBar 
                position="static" 
                color="primary" 
                enableColorOnDark 
                sx={{ 
                    width: "100%", 
                    boxShadow: "none", 
                    borderBottom: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.12)",
                    backdropFilter: "blur(10px)",
                    backgroundColor: darkMode ? "rgba(18, 18, 18, 0.8)" : "rgba(255, 255, 255, 0.8)",
                }}
            >
                <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: 3, width: "100%" }}>
                    {/* Mobile Menu Icon */}
                    <IconButton 
                        edge="start" 
                        color="inherit" 
                        onClick={handleDrawerToggle} 
                        sx={{ display: { xs: "flex", sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Logo */}
                    <Box 
                        component={Link} 
                        to="/" 
                        sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            textDecoration: "none", 
                            color: "inherit",
                            "&:hover": { opacity: 0.7 },
                        }}
                    >
                        <img 
                            src={nmicIcon} 
                            alt="Logo" 
                            style={{ height: 80, width: 120, marginRight: 8, borderRadius: 8 }} 
                        />
                    </Box>

                    {/* Suchleiste (nur Desktop) */}
                    {!isMobile && user && (
                        <Box sx={{ flexGrow: 1, maxWidth: 600, mx: "auto", marginTop: ".3cm" }}>
                            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                        </Box>
                    )}

                    {/* Rechts: Darkmode, Neue Notiz, Logout, Avatar */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <IconButton 
                            color="inherit" 
                            onClick={toggleDarkMode} 
                            sx={{ 
                                borderRadius: 2, 
                                backgroundColor: "#003366", 
                                color: "#ffffff",
                                "&:hover": { 
                                    backgroundColor: "#002244",
                                },
                            }}
                        >
                            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                                            
                        {user && (
                            <>
                                {/* Neue Notiz Button (Desktop) */}
                                {!isMobile && (
                                    <Button 
                                        variant="contained"
                                        component={Link} 
                                        to="/add-note" 
                                        sx={{ 
                                            textTransform: "none", 
                                            fontWeight: 500, 
                                            borderRadius: 2, 
                                            px: 3, 
                                            py: 1, 
                                            backgroundColor: "#003366", 
                                            color: "#ffffff", 
                                            "&:hover": { 
                                                backgroundColor: "#002244", 
                                            },
                                        }}
                                    >
                                        Neue Notiz
                                    </Button>
                                )}

                                {/* Logout Button (Desktop) */}
                                <Button 
                                    variant="contained"
                                    onClick={handleLogout} 
                                    sx={{ 
                                        textTransform: "none", 
                                        fontWeight: 500, 
                                        display: { xs: "none", sm: "flex" },
                                        borderRadius: 2, 
                                        px: 3, 
                                        py: 1, 
                                        backgroundColor: "#003366", 
                                        color: "#ffffff", 
                                        "&:hover": { 
                                            backgroundColor: "#002244", 
                                        },
                                    }}
                                >
                                    Logout
                                </Button>

                                {/* Avatar (Desktop) */}
                                <Avatar 
                                    sx={{ 
                                        bgcolor: "secondary.main", 
                                        width: 40, 
                                        height: 40, 
                                        ml: 2, 
                                        cursor: "pointer", 
                                        display: { xs: "none", sm: "flex" },
                                        "&:hover": { 
                                            transform: "scale(1.1)", 
                                            transition: "transform 0.2s ease-in-out",
                                        },
                                    }} 
                                >
                                    {user?.username?.charAt(0).toUpperCase()}
                                </Avatar>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer 
                variant="temporary" 
                open={mobileOpen} 
                onClose={handleDrawerToggle}
                sx={{
                    "& .MuiDrawer-paper": {
                        width: 250,
                        backgroundColor: darkMode ? "#121212" : "#ffffff",
                        color: darkMode ? "#ffffff" : "#000000",
                    },
                }}
            >
                <Box sx={{ width: 250, height: "100%", display: "flex", flexDirection: "column" }}>
                    <Box sx={{ p: 2, textAlign: "center" }}>
                        <Avatar src={nmicIcon} sx={{ width: 200, height: 120, mx: "auto" }} />
                        {user && <Typography variant="subtitle1" sx={{ mt: 1 }}>{user.email}</Typography>}
                    </Box>
                    <Divider />
                    {user && (
                        <Box sx={{ p: 2 }}>
                            {/* Neue Notiz (Mobile) */}
                            <Button 
                                fullWidth 
                                variant="contained" 
                                color="primary" 
                                component={Link} 
                                to="/add-note" 
                                onClick={handleDrawerToggle}
                                sx={{ mb: 2, borderRadius: 2 }}
                            >
                                Neue Notiz
                            </Button>

                            {/* Logout (Mobile) */}
                            <Button 
                                fullWidth 
                                variant="contained" 
                                color="secondary" 
                                onClick={() => { handleLogout(); handleDrawerToggle(); }} 
                                sx={{ borderRadius: 2 }}
                            >
                                Abmelden
                            </Button>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </>
    );
};

export default Navbar;
