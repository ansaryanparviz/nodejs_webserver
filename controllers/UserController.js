class UserController {
    index(data) {
        return {
            "name": 'parviz',
            "data": data
        }
    }
    store(data) {
        return {
            "data": data
        }
    }
};

module.exports = UserController;