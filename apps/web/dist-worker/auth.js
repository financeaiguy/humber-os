import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
const mockUsers = [
    {
        id: "1",
        email: "admin@humber.com",
        password: "admin123",
        name: "System Administrator",
        role: "PARTNER_ADMIN",
        partnerId: "humber-operations",
        partnerName: "Humber Operations",
        isActive: true,
    },
    {
        id: "2",
        email: "engineer@humber.com",
        password: "engineer123",
        name: "Engineering Manager",
        role: "PARTNER_ADMIN",
        partnerId: "humber-engineering",
        partnerName: "Humber Engineering",
        isActive: true,
    },
    {
        id: "3",
        email: "operator@humber.com",
        password: "operator123",
        name: "Operations Manager",
        role: "PARTNER_OPERATOR",
        partnerId: "humber-operations",
        partnerName: "Humber Operations",
        isActive: true,
    },
    {
        id: "4",
        email: "customer@gm.com",
        password: "customer123",
        name: "GM Client Manager",
        role: "PARTNER_OPERATOR",
        partnerId: "client-gm",
        partnerName: "General Motors",
        isActive: true,
    },
    {
        id: "5",
        email: "partner@ford.com",
        password: "partner123",
        name: "Ford Partnership Manager",
        role: "PARTNER_ADMIN",
        partnerId: "partner-ford",
        partnerName: "Ford Motor Company",
        isActive: true,
    },
    {
        id: "6",
        email: "employee@humber.com",
        password: "employee123",
        name: "Field Engineer",
        role: "ENGINEER_EMPLOYEE",
        partnerId: "humber-operations",
        partnerName: "Humber Operations",
        isActive: true,
    },
];
export const config = {
    theme: {
        logo: "/logo.png",
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/");
            const isAuthRoute = nextUrl.pathname.startsWith("/auth");
            if (isAuthRoute) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/", nextUrl));
                }
                return true;
            }
            if (isOnDashboard) {
                if (isLoggedIn)
                    return true;
                return false;
            }
            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
                token.partnerId = user.partnerId;
                token.partnerName = user.partnerName;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.role = token.role;
                session.user.partnerId = token.partnerId;
                session.user.partnerName = token.partnerName;
            }
            return session;
        },
    },
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                const user = mockUsers.find(u => u.email === credentials.email);
                if (!user || !user.isActive) {
                    return null;
                }
                const isValidPassword = credentials.password === user.password;
                if (!isValidPassword) {
                    return null;
                }
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    partnerId: user.partnerId,
                    partnerName: user.partnerName,
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.AUTH_SECRET,
    debug: false,
};
export const { handlers, auth, signIn, signOut } = NextAuth(config);
//# sourceMappingURL=auth.js.map