const jwt = require('jsonwebtoken');

module.exports = async(req, res, next) => {
    const {authorization} = req.headers;

    try {
        console.log(authorization);
        
        if (!authorization) {
            return res.status(401).json({
                status: "Failed",
                message: "You aren\'t Authorized Here!"
            });
        }

        const token = authorization.split(' ')[1]
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) {
                return res.status(401).json({
                    status: "Failed",
                    message: "You aren\'t Authorized Here!"
                });
            }

            console.log(decode);
            next()
        });
    } catch (error) {
        next(error);
    }
}