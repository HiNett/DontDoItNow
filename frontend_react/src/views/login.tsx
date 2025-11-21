import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../utils/auth";
import "../template.css";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const navigate = useNavigate();
  const style = { display: "block", margin: "10px" };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .post(
        "http://127.0.0.1:8000/api/login",
        {
          email,
          password,
          rememberMe,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        if (response.status === 200) {
          console.log("Login successful");
          console.log("Response data:", response.data);
          
          // Stocker le token selon le choix rememberMe
          if (response.data.token) {
            setAuthToken(response.data.token, rememberMe);
            if (rememberMe) {
              console.log("Token stored in localStorage (24h)");
            } else {
              console.log("Token stored in sessionStorage (session uniquement)");
            }
            console.log(
              "Token:",
              response.data.token.substring(0, 50) + "..."
            );
          } else {
            console.error("No token in response!");
          }
          if (response.data.user.roles[1] === "ROLE_ADMIN") {
            navigate("/admin/dashboard");
          } else {
            navigate("/tasks");
          }
        }
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const errorMessage =
            error.response.data.message ||
            error.response.data.error ||
            "Mauvais identifiant";
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
        <TextField
          required
          label="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={style}
        />
        <TextField
          id="outlined-password-input"
          label="Password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={style}
        />
        <div>
          <FormControlLabel
            control={<Checkbox />}
            label="Se souvenir de moi"
            checked={rememberMe}
            onChange={(e) => setRememberMe((e.target as HTMLInputElement).checked)}
          />
        </div>
        <Button variant="contained" onClick={handleLogin}>
          Envoyer
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
