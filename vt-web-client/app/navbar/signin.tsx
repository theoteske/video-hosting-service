"use client";

import { Fragment } from "react";

import { signInWithGoogle, signOut } from "../utilities/firebase/firebase";
import styles from "./signin.module.css"
import { User } from "firebase/auth";

interface SignInProps {
    user: User | null;
}

export default function SignIn({ user }: SignInProps) {
    return (
        <Fragment>
            {   user ? 
                (
                    <button className={styles.authbutton} onClick={signOut}>
                        Sign Out
                    </button>
                ) : (
                    <button className={styles.authbutton} onClick={signInWithGoogle}>
                        Sign In
                    </button>
                )
            }
        </Fragment>
    );
}