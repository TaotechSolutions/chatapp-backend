const UserServices = require('../services/UserServices');

class UserController {
    static async getUserData() {
        try {

        } catch (error) {
            console.log(error)
            return errorResponse(res, 500, "An error has occurred. Please try again later", null, error);
        }
    }
}


module.exports = UserController;