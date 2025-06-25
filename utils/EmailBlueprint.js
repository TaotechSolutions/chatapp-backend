const textDesign = "font-weight:lighter; letter-spacing: 0.5px; line-height: 1.7;"

class EmailBluePrint {
  static returnResetPasswordHTML(user, resetLink, type) {
    const requestTemplate = `
          <b style="text-transform: capitalize;">Dear ${user?.username},</b>

          <p style=${textDesign}> 
              We acknowledge the receipt of your password reset request, your request has been duly noted. 
          </p>

          <a href="${resetLink}" style="display: flex; justify-content: center;margin-bottom: 10px;text-decoration: none;">
              <button style="background-color: black;
              color: white; font-size: 19px; padding: 10px 20px; width: 80%;">
              Reset Password
              </button>
          </a><hr>
          <p style=${textDesign}>Valid for 15 mins.</p>
      `

    const successTemplate = `
          <b style="text-transform: capitalize;">Dear ${user?.username},</b>

          <p style=${textDesign}> 
              Your account password has been successfully reset as per your request.
          </p>

          <p style=${textDesign}> 
              If this action was not initiated by you, we kindly advise that you promptly get in touch 
              with our customer care department to address any potential concerns.
          </p><br>
      `

    // returning template based on the type
    return type === 'request' ? requestTemplate : successTemplate
  }

  static returnEmailVerificationHTML(user, verifyLink) {
    return `
      <b style="text-transform: capitalize;">Dear ${user?.username},</b>
          <h2> Verify it's you </h2>

          <p style=${textDesign}>
              There's one quick step you need to complete to verify your identity.
          </p><br>

          <b style="font-size: 30px;">Verification Link: ${verifyLink}</b>
          <p>Verification link expires in 30 Mins.</p>
    `
  }
}


module.exports = EmailBluePrint