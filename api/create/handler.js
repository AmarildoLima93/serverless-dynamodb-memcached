'use strict';

const uuid = require('uuid');
const dynamodb = require('../../lib/dynamodb');

// Função lambda para criar o item no dynamodDB
module.exports.main = (event, context, callback) => {
    const timestamp = new Date().getTime();
    let data = false;
    try {
        data = JSON.parse(event.body);
        if (typeof data.text !== "string") {
            callback(null, {statusCode: 500, body: "Couldn\'t create the item"});
            return;
        }
    } catch(e) {
        callback(null, {statusCode: 500, body: "Couldn\'t create the item"});
        return;
    };

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            id: uuid.v1(),
            text: data.text,
            checked: false,
            createdAt: timestamp,
            updatedAt: timestamp
        }
    };

    dynamodb.create(params)
    .then(res => {
        callback(null, {statusCode: 200, body: "Saved"});
    })
    .catch(err => {
        console.log(err);
        callback(null, {statusCode: 500, body: "Couldn\'t create the item"});
    })
};
