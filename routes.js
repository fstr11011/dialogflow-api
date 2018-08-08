'use strict';

var express = require("express");
var router = express.Router();
var UserInfo = require("./models").UserInfo;
var request = require("request");
var bodyParser = require("body-parser").json;
var config = require("./config");

router.use(bodyParser());

var postData = {
    tenancyName: config.tenancyName,
    usernameOrEmailAddress: config.usernameOrEmailAddress,
    password: config.password
};

var auth = "https://platform.uipath.com/api/account/authenticate";

var authOptions = {
    method: "post",
    body: postData,
    json: true,
    url: auth
};

router.get("/", function(req, res, next){

    UserInfo.find({})
            .sort({accountNumber: 1})
            .exec(function(err, info){
                if(err) return next(err);
                res.json(info);
            });
});

router.post("/", function(req, res, next){

    if(req.body.queryResult.action === "input.welcome"){
        res.json({
            "fulfillmentText": "This is a text response",
            "followupEventInput": {
              "name": "test_event",
              "languageCode": "en-US",
            }
          });
    }

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

    if(req.body.queryResult.action === "suspend.date"){
    
        var start = req.body.queryResult.parameters["date-period"].startDate;
        var end = req.body.queryResult.parameters["date-period"].endDate;
        var name = req.body.queryResult.outputContexts[1].parameters.name;
        var email = req.body.queryResult.outputContexts[1].parameters.email;
        var accountNumber = req.body.queryResult.outputContexts[1].parameters.accountNumber;
        var book = req.body.queryResult.outputContexts[1].parameters.books;

        request(authOptions, function(err, response, body){
            if(err){
                console.error('error posting json: ', err);
                throw err;
            }

            var queueURL = "https://platform.uipath.com/odata/Queues/UiPathODataSvc.AddQueueItem";
            
            var postDataQueue = {
                itemData: {
                    Priority: "Normal",
                    Reference: name,
                    Name: "ApiQueue",
                    SpecificContent: {
                        startDate: start,
                        endDate: end,
                        name: name,
                        email: email,
                        accountNumber: accountNumber,
                        book: book
                    }
                }
            };

            var queueOptions = {
                method: "post",
                body: postDataQueue,
                auth: { bearer: body.result},
                json: true,
                url: queueURL
            };

            request(queueOptions, function(err, response, body){
                if(err){
                    console.error('error parsing json: ', err);
                    res.sendStatus(500);
                    throw err;
                } else{
                    console.log("Operation succesfully completed");
                    res.json({
                        fulfillmentText: "Your suspension is being processed. You will recieve an email shortly."
                    });
                    res.sendStatus(201);
                }
            });
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