'use strict';

const dynamodb = require('../../lib/dynamodb');

// Função lambda para obter o item do dynamoDB
module.exports.main = (event, context, callback) => {
    if (!event.pathParameters.id) {
        callback(null, {statusCode: 500, body: "Couldn\'t get the item"});
        return;
    }

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: event.pathParameters.id
        }
    };

    dynamodb.get(params)
    .then(result => {
        callback(null, {statusCode: 200, body: JSON.stringify(result)});
    })
    .catch(err => {
        console.log(err);
        callback(null, {statusCode: 500, body: "Coundn\'t fetch the todos"});
    })
}
