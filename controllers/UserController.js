class UserController {
    index(data) {
        return {
            "name": 'parviz',
            "data": data
        }
    }
    register() {
        return 'user/register.html';
    }
    store(data) {
        return data;
    }
};

module.exports = UserController;