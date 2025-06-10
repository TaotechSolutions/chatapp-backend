const UserServices = require('../services/UserServices');

class UserController {
    static async getUserData(req, res, next) {
        try {

        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}


module.exports = UserController;