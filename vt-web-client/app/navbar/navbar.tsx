"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";

import styles from "./navbar.module.css"
import SignIn from "./signin";
import { onAuthStateChangedHelper } from "../utils/firebase/firebase";

export default function Navbar() {
    // Initialize user state
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user: User | null) => {
            setUser(user);
        });

        return () => unsubscribe();
    });

    return (
        <nav className={styles.nav}>
            <Link href="/">
                <span className={styles.logoContainer}>
                    <Image width={90} height={20} 
                    src="/youtube-logo.svg" alt="Youtube Logo"/>
                </span>
            </Link>
            <SignIn user={user} />
        </nav>
    );
}