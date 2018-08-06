'use strict';

var express = require("express");
var router = express.Router();
var UserInfo = require("./models").UserInfo;

router.get("/", function(req, res, next){
    UserInfo.find({})
            .sort({accountNumber: 1})
            .exec(function(err, info){
                if(err) return next(err);
                res.json(info);
            });
});

router.post("/", function(req, res, next){
    if(req.body.queryResult.action === "userinfopls"){
            UserInfo.findOne({accountNumber: req.body.queryResult.parameters.accountNumber, email: req.body.queryResult.parameters.email})
                .exec(function(err, info){
                    if(err) return next(err);
                    res.json(
                        {
                            "fulfillmentText": "Hello " + info.name + " these are your books: " + info.books,
                        }
                    );
            });
    }
});

router.post("/newuser", function(req, res, next){
    var user = new UserInfo(req.body);
    user.save(function(err, user){
        if(err) return next(err);
        res.status(201);
        res.json(user);
    });
});

module.exports = router;