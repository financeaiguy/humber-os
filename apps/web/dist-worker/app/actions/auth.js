"use server";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
export async function authenticate(_prevState, formData) {
    try {
        await signIn("credentials", formData);
        return undefined;
    }
    catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}
export async function logout() {
    await signOut();
}
//# sourceMappingURL=auth.js.map