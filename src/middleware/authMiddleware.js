import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        token = req.headers['x-auth-token'];
    }

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || "secret_key_123");
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access Denied: Requires one of ${allowedRoles.join(', ')} role` });
        }
        next();
    };
};

export { verifyToken, authorizeRole };
