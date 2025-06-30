const SendEmail = require("../middlewares/SendEmail")

class EmailServices {
    static async sendingEmailToUser(data) {
        try {
            const { email, emailToBeSent, emailHead, emailSubject } = data;
            const details = {
                userEmail: email,
                subjectOfEmail: emailSubject,
                messageLocation: '.message_sent',
                emailHeaderLocation: '.email-header',
                emailHeader: `<h6 style="display: flex;justify-content: center;
                 font-size: 25px;font-weight: lighter;color: whitesmoke;text-transform: capitalize;">${emailHead}</h6>`,
                emailToBeSent: emailToBeSent
            }

            let sendToUser = new SendEmail(details)
            const sendResult = await sendToUser.sendEmailToUser()
            return ({ status: 200, result: sendResult.result })
        } catch (error) {
            return ({ status: 500, error })
        }
    }
}


module.exports = EmailServices;