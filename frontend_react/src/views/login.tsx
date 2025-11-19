import React, { useState } from "react";
import axios from "axios";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const style = {display: "block", margin: "10px"};
    const handleLogin = (e: React.FormEvent) => {
            e.preventDefault();
            axios.post("http://127.0.0.1:8000/api/login", {
                email, password })
            .then((response) => {
                if(response.data.message === "Authentification réussie") {
                    console.log("Login successful");
                }else{
                    console.log("Login failed");
                }
            })
            .catch((error) => {
                console.log(error.message);
            }
        )
    }
   return (
        <div style={{ display: "block", marginLeft: "auto", marginRight: "auto", width: "500px"}}>
            <h1>Login</h1>
            <input type="text"  value={email} style={style} placeholder="email"  onChange={(e) => setEmail(e.target.value)} />
            <input type="password" value={password} style={style} placeholder="Password"  onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" onClick={handleLogin}> Envoyer </button>
        </div>
    )
};

export default LoginPage;
