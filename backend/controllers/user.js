const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require("dotenv").config({ path: ".env" });

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
     .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save()
         .then(() => res.status(201).json({ message: 'Utilisateur créé avec succès.' }))
         .catch(error => res.status(400).json({ error }));
      }
     )
     .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Identifiant ou mot de passe incorrecte' });
            }

            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Identifiant ou mot de passe incorrecte' });
                    }

                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.RDM_TOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};