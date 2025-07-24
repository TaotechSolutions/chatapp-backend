const nodemailer = require('nodemailer');
const fs = require('fs');
const cheerio = require('cheerio');
const { TAOTECH_EMAIL, TAOTECH_EMAIL_PASS } = process.env



//receives data to be sent to user
let SendEmail = function (data) {
    const emailDesign = fs.readFileSync('views/email-design.html', 'utf-8');  //the HTML design of our Email
    const $ = cheerio.load(emailDesign);                                //Load the HTML content into Cheerio
    const emailBody = $(data.messageLocation);              // Finding the element containing the email body to replace
    emailBody.html(data.emailToBeSent)                      // Replacing the html within the element
    const emailHeader = $(data.emailHeaderLocation)        //finding the element containing the email header to replace
    emailHeader.html(data.emailHeader)                     //replacing the text within the element
    const modifiedEmailDesign = $.html();                   // Get the modified HTML content

    this.data = {
        userEmail: data.userEmail,
        allUsersEmail: data.allUsersEmail,
        emailToBeSent: data.emailToBeSent,
        subjectOfEmail: data.subjectOfEmail,
        ourEmailHTML: modifiedEmailDesign,
    }

    this.errors = []
}


//sends users email
SendEmail.prototype.sendEmailToUser = function () {
    return new Promise(async (resolve, reject) => {
        // Create a transporter object using SMTP transport using gmail to send
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: TAOTECH_EMAIL,
                pass: TAOTECH_EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"TaoChat" <${TAOTECH_EMAIL}>`,
            to: this.data.userEmail,
            subject: this.data.subjectOfEmail,
            html: this.data.ourEmailHTML
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                transporter.close()
                console.error({ message: "Email Failed To Send!", status: error });
                reject({ status: 500, error: { message: "Email Failed To Send!", nodeMailerStatus: error } })
            } else {
                console.log('success')
                resolve({ status: 200, result: { sendResult: "Email Sent Successfully.", nodeMailerStatus: info.response } })
            }
        });
    })
}


module.exports = SendEmail