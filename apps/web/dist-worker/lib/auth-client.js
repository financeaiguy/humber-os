'use client';
import { signIn as nextAuthSignIn } from 'next-auth/react';
export async function signIn(email, password) {
    try {
        const result = await nextAuthSignIn('credentials', {
            email,
            password,
            redirect: false,
        });
        if (result?.error) {
            return { success: false, error: result.error };
        }
        return { success: true };
    }
    catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: 'Something went wrong' };
    }
}
//# sourceMappingURL=auth-client.js.map