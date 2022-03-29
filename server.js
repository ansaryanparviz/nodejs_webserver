require('./globals');
const http = require('http');
const path = require('path');
const queryString = require('qs');
const controllers = require('./controllers/ControllerLoader.js').controllers;
const formidable = require('formidable');
const staticServer = require('node-static');
const port = 8080;

const staticFileServer = new staticServer.Server(
    configs().publicDir,
    {
        cache: 3600,
        gzip: true
    }
);

const viewServer = new staticServer.Server(
    configs().viewFile,
);

const server = http.createServer((request, serverResponse) => {
    request.parsedURL = new URL(path.join(configs().hostname, request.url));
    const route = getControllerMethodName(request);
    requests(request);

    getRequestData(request).then((data) => {
        if (request.parsedURL.pathname.search('/api') !== -1) {

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
            if (controllers[route.controller] !== undefined) {
                let viewFile = controllers[route.controller][route.method](data);
                viewServer.serveFile(path.join(configs().viewsDir, viewFile), 200, {}, request, serverResponse);
            } else {
                staticFileServer.serve(request, serverResponse, function (e, response) {
                    if (e && (e.status === 404)) {
                        viewServer.serveFile(
                            path.join(configs().viewsDir, configs.templates.notFound),
                            404,
                            {},
                            request,
                            serverResponse
                        );
                    }
                })
            }
        }
    });
});

server.listen(port, () => {
    console.log("listening on port: " + port);
});

async function getRequestData(request) {
    let promise = new Promise((resolve, reject) => {
        let data = queryString.parse(request.parsedURL.search.replace(/\?/g,''));

        if (request.method === 'GET') {
            resolve(data);
        } else {
            let postData = {
                fields: {},
                files: {}
            };

            let incomingForm = new formidable.IncomingForm();
            incomingForm.parse(request, (err, fields, files) => {
                postData.fields = Object.assign(postData.fields, fields);
                postData.files = Object.assign(postData.files, files);
            });
            incomingForm.on('end', (fields, files) => {
                data = Object.assign(data, postData);
                resolve(data);
            });
        }
    })

    return await promise;
}

function getControllerMethodName(request) {
    let requestParts = request.parsedURL.pathname.split('/');

    let controllerIndex = 1;
    let methodIndex = 2;
    if (request.parsedURL.pathname.search('/api') !== -1) {
        controllerIndex++;
        methodIndex++;
    }

    return {
        controller: requestParts[controllerIndex] !== undefined ? requestParts[controllerIndex] : 'Home',
        method: requestParts[methodIndex] !== undefined ? requestParts[methodIndex] : 'index',
    };
}