"use client";
import { useState, useEffect } from "react";
import style from '@/app/styles/protectedPage.module.css';

export default function ProtectedPage({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const saved = localStorage.getItem("authorized");
        if (saved === "true") setIsAuthorized(true);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === process.env.NEXT_PUBLIC_APP_PASSWORD) {
            localStorage.setItem("authorized", "true");
            setIsAuthorized(true);
        } else {
            setError("Contraseña incorrecta");
        }
    };

    if (!isAuthorized) {
        return (
            <div className={style.protectedContainer}>
                <div className={style.protectedBox}>
                    <h2 className={style.protectedTitle}>🔒 Acceso privado</h2>
                    <form onSubmit={handleSubmit} className={style.protectedForm}>
                        <input
                            type="password"
                            placeholder="Ingresá la contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="submit">Entrar</button>
                    </form>
                    {error && <p className={style.protectedError}>{error}</p>}
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

