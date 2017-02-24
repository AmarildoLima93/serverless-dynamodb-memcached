'use strict';

const dynamodb = require('../../lib/dynamodb');

// Função lambda para remover o item do dynamoDB
module.exports.main = (event, context, callback) => {
    if (!event.pathParameters.id) {
        callback(null, {statusCode: 500, body: "Couldn\'t delete the item"});
        return;
    }

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: event.pathParameters.id
        }
    };

    dynamodb.delete(params)
    .then(result => {
        callback(null, {statusCode: 200, body: JSON.stringify({status: result})});
    })
    .catch(err => {
        console.log(err);
        callback(null, {statusCode: 500, body: "Couldn\'t delete the item"});
    })
}
