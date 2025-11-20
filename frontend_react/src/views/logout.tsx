import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LogoutBoutton: React.FC = () => {
    const navigate = useNavigate();
    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        axios.post("http://127.0.0.1:8000/api/logout")
            .then((response) => {
                if (response.status === 200) {
                    console.log("Logout successful");
                    navigate("/login");
                }
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    const errorMessage = error.response.data.message || error.response.data.error || 'Mauvais identifiant';
                    console.log("Erreur:", errorMessage);
                    alert(errorMessage);
                } else {
                    console.log("Erreur:", error.message);
                    alert("Erreur de connexion");
                }
            });
    };

    return (
        <button type="button" onClick={handleLogout}>
            déconnexion
        </button>
    );
};

export default LogoutBoutton;
