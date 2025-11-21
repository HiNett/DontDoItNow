import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { removeAuthToken } from "../utils/auth";

const LogoutBoutton: React.FC = () => {
    const navigate = useNavigate();
    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Nettoyer le token localement
        removeAuthToken();
        
        // Appeler l'API de logout (optionnel)
        axios.post("http://127.0.0.1:8000/api/logout")
            .then((response) => {
                if (response.status === 200) {
                    console.log("Logout successful");
                }
            })
            .catch((error) => {
                console.log("Erreur lors de la déconnexion:", error.message);
            })
            .finally(() => {
                // Rediriger vers login dans tous les cas
                navigate("/login");
            });
    };

    return (
        <button type="button" onClick={handleLogout}>
            déconnexion
        </button>
    );
};

export default LogoutBoutton;
