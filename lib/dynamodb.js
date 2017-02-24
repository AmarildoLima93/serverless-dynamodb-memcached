'use strict';

const memjs = require('memjs');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Método de criação do item no dynamoDB
exports.create = (params) => {
    return new Promise((resolve, reject) => {
        dynamodb.put(params, (err, result) => {
            if(err) reject(err);
            else resolve(true);
        });
    });
};

// Método para listar os items do dynamodB
// Verificar primeiro no memcached, caso não tenha, busca no dynamoDB
// Expire do memcached de 300s/5m
exports.list = (params) => {
    return new Promise((resolve, reject) => {
        const mc = memjs.Client.create(process.env.MEMCACHED_HOST);
        mc.get('api:list', (err, value, key) => {
            if (value != null) {
                resolve(JSON.parse(value.toString()));
            } else {
                dynamodb.scan(params, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (result.Items) {
                        mc.set('api:list', JSON.stringify(result.Items), false, 300);
                    }
                    resolve(result.Items);
                });
            }
        });
    });
}

// Método para obter o item do dynamodB
// Verificar primeiro no memcached, caso não tenha, busca no dynamoDB
// Expire do memcached de 3600s/1h
exports.get = (params) => {
    return new Promise((resolve, reject) => {
        const mc = memjs.Client.create(process.env.MEMCACHED_HOST);
        mc.get('api:get:'+params.Key.id, (err, value, key) => {
            if (value != null) {
                resolve(JSON.parse(value.toString()));
            } else {
                dynamodb.get(params, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (result.Item) {
                        mc.set('api:get:'+params.Key.id, JSON.stringify(result.Item), false, 3600);
                    }
                    resolve(result.Item);
                });
            }
        })
    })
};

// Método para atualizar o item no dynamoDB
// Logo depois de atualizar, atualiza no memcached
exports.update = (params) => {
    return new Promise((resolve, reject) => {
        dynamodb.update(params, (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            const mc = memjs.Client.create(process.env.MEMCACHED_HOST);
            mc.set('api:get:'+params.Key.id, JSON.stringify(result.Attributes), false, 3600);

            resolve(result.Attributes);
        });
    })
};

// Método para remover o item do dynamoDB
// Logo depois de remover do dynamoDB, remove do memcached
exports.delete = (params) => {
    return new Promise((resolve, reject) => {
        dynamodb.delete(params, (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            const mc = memjs.Client.create(process.env.MEMCACHED_HOST);
            mc.delete('api:get:'+params.Key.id);

            resolve(true);
        });
    });
}
