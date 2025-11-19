import React, { useState } from "react";
import axios from "axios";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const style = {display: "block", margin: "10px"};
    const handleLogin = (e: React.FormEvent) => {
            e.preventDefault();
            axios.post("http://127.0.0.1:8000/api/login/", {
                email, password })
            .then((response) => {
                console.log(response.data)
            })
            .catch((error) => {
                console.log(error.message);
            }
        )
    }
   return (
        <div>
            <h1>Login</h1>
            <input type="text"  value={email} style={style} placeholder="email"  onChange={(e) => setEmail(e.target.value)} />
            <input type="password" value={password} style={style} placeholder="Password"  onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" onClick={handleLogin}> Envoyer </button>
        </div>
    )
};

export default LoginPage;
