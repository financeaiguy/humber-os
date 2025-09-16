export async function getSession(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return {
        userId: 'user_dev_123',
        tenantId: 'tenant_dev_123',
        userRole: 'ADMIN',
        email: 'dev@humberops.com'
    };
}
//# sourceMappingURL=auth.js.map