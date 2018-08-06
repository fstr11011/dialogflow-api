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
            UserInfo.findOne({accountNumber: req.body.queryResult.parameters.accountNumber})
                .exec(function(err, info){
                    if(err) return next(err);
                    if(info){
                        res.json(
                            {
                                "fulfillmentText": "Hello " + info.name + ". Which of your the following books would you like to suspend?\n" + info.books,
                                "outputContexts": [
                                    {
                                      "name": "projects/api-test-a47a7/agent/sessions/dialogflow-jeiobw@api-test-a47a7.iam.gserviceaccount.com/contexts/suspend-followup",
                                      "lifespanCount": 5,
                                      "parameters": {
                                        "name": info.name,
                                        "email": info.email,
                                        "accountNumber": info.accountNumber
                                      }
                                    }
                                  ]
                            }
                        );
                    } else {
                        res.json({
                            "fulfillmentText": "No account was found for the number " + req.body.queryResult.parameters.accountNumber + ". Please enter a valid account number."
                        });
                    }
                    
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