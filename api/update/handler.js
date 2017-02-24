'use strict';

const dynamodb = require('../../lib/dynamodb');

// Função lambda para atualizar o item do dynamoDB
module.exports.main = (event, context, callback) => {
    const timestamp = new Date().getTime();
    let data = false;
    try {
        data = JSON.parse(event.body);
        if (typeof data.text !== "string" || typeof data.checked !== 'boolean') {
            callback(null, {statusCode: 500, body: "Couldn\'t update the item"});
            return;
        }
    } catch(e) {
        callback(null, {statusCode: 500, body: "Couldn\'t update the item"});
        return;
    };

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: event.pathParameters.id,
        },
        ExpressionAttributeNames: {
            '#todo_text': 'text',
        },
        ExpressionAttributeValues: {
            ':text': data.text,
            ':checked': data.checked,
            ':updatedAt': timestamp,
        },
        UpdateExpression: 'SET #todo_text = :text, checked = :checked, updatedAt = :updatedAt',
        ReturnValues: 'ALL_NEW',
    };

    dynamodb.update(params)
    .then(result => {
        callback(null, {statusCode: 200, body: JSON.stringify(result)});
    })
    .catch(err => {
        console.log(err);
        callback(null, {statusCode: 500, body: "Couldn\'t update the item"});
    })
}
