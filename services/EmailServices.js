const SendEmail =  require("../middlewares/SendEmail")

class EmailServices {
    static sendingEmailToUser(userEmail, emailToBeSent, emailHead, emailSubject) {
        return new Promise(async (resolve, reject) => {
            try {
                const details = {
                    userEmail: userEmail,
                    subjectOfEmail: emailSubject,
                    messageLocation: '.message_sent',
                    emailHeaderLocation: '.email-header',
                    emailHeader: `<h6 style="display: flex;justify-content: center;
                 font-size: 25px;font-weight: lighter;color: whitesmoke;text-transform: capitalize;">${emailHead}</h6>`,
                    emailToBeSent: emailToBeSent
                }

                let sendToUser = new SendEmail(details)
                const sendResult = await sendToUser.sendEmailToUser()
                resolve({ status: 200, result: sendResult.result })
            } catch (error) {
                resolve({ status: 500, error: error })
            }
        })
    }
}


module.exports = EmailServices;