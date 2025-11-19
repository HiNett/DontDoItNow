import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    const style = { display: "block", margin: "10px" };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        axios.post("http://127.0.0.1:8000/api/login", {
            email, password
        })
            .then((response) => {
                if (response.status === 200) {
                    console.log("Login successful");
                    navigate("/tasks");
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
        <div style={{ display: "block", marginLeft: "auto", marginRight: "auto", width: "500px" }}>
            <h1>Login</h1>
            <input
                type="text"
                value={email}
                style={style}
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                value={password}
                style={style}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" onClick={handleLogin}>
                Envoyer
            </button>
        </div>
    );
};

export default LoginPage;
