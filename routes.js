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
                    res.json(
                        {
                            "fulfillmentText": "Hello " + info.name + " these are your books: " + info.books,
                            "fulfillmentMessages": [
                              {
                                "card": {
                                  "title": "Account Info",
                                  "subtitle": "User's name",
                                  "imageUri": "https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png",
                                  "buttons": [
                                    {
                                      "text": "button text",
                                      "postback": "https://assistant.google.com/"
                                    }
                                  ]
                                }
                              }
                            ],
                            "source": "example.com",
                            "payload": {
                              "google": {
                                "expectUserResponse": true,
                                "richResponse": {
                                  "items": [
                                    {
                                      "simpleResponse": {
                                        "textToSpeech": "this is a simple response"
                                      }
                                    }
                                  ]
                                }
                              },
                              "facebook": {
                                "text": "Hello, Facebook! " + info.name
                              },
                              "slack": {
                                "text": "This is a text response for Slack. " + info.name
                              }
                            },
                            "outputContexts": [
                              {
                                "name": "projects/api-test-a47a7/agent/sessions/dialogflow-jeiobw@api-test-a47a7.iam.gserviceaccount.com/contexts/context name",
                                "lifespanCount": 5,
                                "parameters": {
                                  "name": info.name,
                                  "accountNumber": info.accountNumber,
                                  "email": info.accountNumber,
                                  "books": info.books
                                }
                              }
                            ],
                            "followupEventInput": {
                              "name": "userinfo",
                              "languageCode": "en-US",
                              "parameters": {
                                "param": "param value"
                              }
                            }
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