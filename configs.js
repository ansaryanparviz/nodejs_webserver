exports.configs = {
    hostname: 'http://localhost:8080',
    root: __dirname,
    controllerDirectory: 'controllers',
    publicDir: './public',
    viewsDir: './views',
    uploadDir: __dirname + '/public/uploads',
    templates: {
        notFound: 'errors/404.html'
    }
};