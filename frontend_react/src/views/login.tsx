import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../template.css";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    const style = { display: "block", margin: "10px" };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        axios.post("http://127.0.0.1:8000/api/login", {
            email, password
        }, {
            withCredentials: true
        })
            .then((response) => {
                if (response.status === 200) {
                    console.log("Login successful");
                    console.log("Response data:", response.data);
                    // Stocker le token dans localStorage
                    if (response.data.token) {
                        localStorage.setItem('authToken', response.data.token);
                        console.log("Token stored:", response.data.token.substring(0, 50) + "...");
                    } else {
                        console.error("No token in response!");
                    }
                    if (response.data.user.roles[1] === 'ROLE_ADMIN'){
                        navigate("/admin/dashboard");
                    }else{
                        navigate("/tasks");
                    }
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
        <div className="container login-center">
            <div className="login-card">
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
        </div>
    );
};

export default LoginPage;
