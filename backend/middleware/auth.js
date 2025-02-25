const jwt = require('jsonwebtoken');
require("dotenv").config({ path: ".env" });

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];  
        const decodedToken = jwt.verify(token, process.env.RDM_TOKEN);
        const userId = decodedToken.userId;
        req.auth = {userId : userId};
        next();
    } catch (error) {
        return res.status(401).json({ error});
    }
}