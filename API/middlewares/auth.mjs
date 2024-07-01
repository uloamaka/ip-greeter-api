import jwt from '../services/jwt.mjs'; // Ensure the path is correct

const userAuth = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        try {
            const data = await jwt.verifyAccessToken(token);
            if (data !== undefined && data !== null) {
                req.user = {
                    id: data.decodedToken.id,
                };
                next();
            } else {
                next(new Error('Not authorized, invalid token'));
            }
        } catch (error) {
            next(error); // Pass any caught errors to the next middleware/error handler
        }
    } else {
        next(new Error('Not authorized, token not available'));
    }
};

export default userAuth;
