'use strict';

const dynamodb = require('../../lib/dynamodb');

// Função lambda para listar os items do dynamoDB
module.exports.main = (event, context, callback) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE
    };

    dynamodb.list(params)
    .then(result => {
        callback(null, {statusCode: 200, body: JSON.stringify(result)});
    })
    .catch(err => {
        console.log(err);
        callback(null, {statusCode: 500, body: "Coundn\'t fetch the items"});
    });
}
