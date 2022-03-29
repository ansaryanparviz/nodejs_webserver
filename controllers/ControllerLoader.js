const UserController = require('./UserController.js');
const AttachmentController = require("./AttachmentController");

exports.controllers = {
    users: new UserController,
    attachment: new AttachmentController(),

};