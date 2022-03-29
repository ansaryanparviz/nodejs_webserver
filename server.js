const http = require('http');
const fileSystem = require('fs');
const queryString = require('qs');
const path = require('path');
const mimeTypes = require('mime-types');
const configs = require('./configs.js').configs;
const controllers = require('./controllers/ControllerLoader.js').controllers;
const port = 8080;

const server = http.createServer((request, serverResponse) => {
    request.parsedURL = new URL(path.join(configs.hostname, request.url));
    let data = getRequestData(request);

    if (request.parsedURL.pathname.search('/api') !== -1) {
        const route = getControllerMethodName(request);
        if (controllers[route.controller] !== undefined) {
            let response = controllers[route.controller][route.method](data);

            serverResponse.writeHead(200, {"Content-Type" : "application/json"});
            serverResponse.write(JSON.stringify(response), 'binary');
            serverResponse.end();
        } else {
            serverResponse.writeHead(404);
            serverResponse.end(route.controller + "Controller NOT FOUND!")
        }
    } else {
        let filePath = path.join(__dirname, request.parsedURL.pathname);
        fileSystem.readFile(filePath, (err, data) => {
            if (err) {
                serverResponse.writeHead(404);
                serverResponse.end(JSON.stringify(err));
            } else {
                let fileMimeType = mimeTypes.lookup(filePath);
                if (fileMimeType === false) {
                    serverResponse.writeHead(400);
                    serverResponse.end('BAD REQUEST!');
                } else {
                    serverResponse.writeHead(200, {"Content-Type" : fileMimeType});
                    serverResponse.write(data, 'binary');
                    serverResponse.end();
                }
            }
        })
    }
});

server.listen(port, () => {
    console.log("listening on port: " + port);
});

function getRequestData(request) {
    let data;
    if (request.method === 'GET') {
        data = queryString.parse(request.parsedURL.search.replace(/\?/g,''));
    } else {
        let postData = '';
        request.on('data', dataPart => {
            postData += dataPart;
        });
        request.on('end', () => {
            data = Object.assign(data, JSON.parse(postData));
        });
    }

    return data;
}

function getControllerMethodName(request) {
    let requestParts = request.parsedURL.pathname.split('/');

    return {
        controller: requestParts[2] !== undefined ? requestParts[2] : 'Home',
        method: requestParts[3] !== undefined ? requestParts[3] : 'index',
    };
}