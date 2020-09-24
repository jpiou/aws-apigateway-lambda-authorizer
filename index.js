const sha1 = require('./sha1.min.js');
const config = require('./config.json');

exports.handler = function (event, context, callback) {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // A simple request-based authorizer example to demonstrate how to use request 
    // parameters to allow or deny a request. In this example, a request is  
    // authorized if the client-supplied HeaderAuth1 header, QueryString1 
    // query parameter, and stage variable of StageVar1 all match
    // specified values of 'headerValue1', 'queryValue1', and 'stageValue1',
    // respectively.

    // Retrieve request parameters from the Lambda function input:
    var headers = event.headers;
    var queryStringParameters = event.queryStringParameters;
    var pathParameters = event.pathParameters;
    var stageVariables = event.stageVariables;

    // Parse the input for the parameter values
    var tmp = event.methodArn.split(':');
    var apiGatewayArnTmp = tmp[5].split('/');
    var awsAccountId = tmp[4];
    var region = tmp[3];
    var restApiId = apiGatewayArnTmp[0];
    var stage = apiGatewayArnTmp[1];
    var method = apiGatewayArnTmp[2];
    var resource = '/'; // root resource
    if (apiGatewayArnTmp[3]) {
        resource += apiGatewayArnTmp[3];
    }

    // Perform authorization to return the Allow policy for correct parameters and 
    // the 'Unauthorized' error, otherwise.
    var authResponse = {};
    var condition = {};
    condition.IpAddress = {};

    /*
     if (headers.jpiouauth === "jonathan"
     // && queryStringParameters.QueryString1 === "queryValue1"
     // && stageVariables.StageVar1 === "stageValue1"
     ) {
     callback(null, generateAllow('me', event.methodArn));
     }  else {
     callback("Unauthorized");
     }
     */

    if (headers.hasOwnProperty('token') && headers.hasOwnProperty('x-api-key')) {
        if (verifyToken(headers.token, headers['x-api-key'])) {
            //callback(null, generateAllow('me', event.methodArn));
            callback(null, generateAllow('me', '*'));
        } else {
            callback("Unauthorized");
        }
    } else {
        callback("Unauthorized");
    }
}

// Help function to generate an IAM policy
var generatePolicy = function (principalId, effect, resource) {
    // Required output:
    var authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        "stringKey": "stringval",
        "numberKey": 123,
        "booleanKey": true
    };
    return authResponse;
}

var generateAllow = function (principalId, resource) {
    return generatePolicy(principalId, 'Allow', resource);
}

var generateDeny = function (principalId, resource) {
    return generatePolicy(principalId, 'Deny', resource);
}

function verifyToken(token, apikey) {
    var salt;
    if (config.hasOwnProperty(apikey)) {
        salt = config[apikey];
    } else {
        return false;
    }

    var now = new Date(); // fuseau horaire local
    var day = now.getUTCDate();
    var month = now.getUTCMonth() + 1;
    var year = now.getUTCFullYear();
    var stringYmd = String(year) + ('0' + String(month)).slice(-2) + ('0' + String(day)).slice(-2);

    var yesterday = new Date(now);
    yesterday.setDate(yesterday.getUTCDate() - 1);
    var stringYmdYesterday = String(yesterday.getUTCFullYear()) + ('0' + String(yesterday.getUTCMonth() + 1)).slice(-2) + ('0' + String(yesterday.getUTCDate())).slice(-2);

    var tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getUTCDate() + 1);
    var stringYmdTomorrow = String(tomorrow.getUTCFullYear()) + ('0' + String(tomorrow.getUTCMonth() + 1)).slice(-2) + ('0' + String(tomorrow.getUTCDate())).slice(-2);

    var accepted = [
        generateToken(stringYmd, apikey, salt),
        generateToken(stringYmdYesterday, apikey, salt),
        generateToken(stringYmdTomorrow, apikey, salt)
    ];

    if (accepted.indexOf(token) !== -1) {
        return true;
    }

    return false;
}

function generateToken(stringYmd, apikey, salt) {
    /* TOKEN = sha1(concat(API_KEY, SALT, DATE(Ymd))) */
    var TOKEN = sha1(apikey + salt + String(stringYmd));
    return TOKEN;
}
