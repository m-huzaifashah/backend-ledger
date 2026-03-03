require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"backend ledger" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendRegistrationEmail=async(userEmail,name)=>{
const subject='welcome to backend ledger!'
const text=`hello ${name},\n\n Thank you for registering at backend ledger`
const html=`<p>Hello ${name}</p><p>Thank you for registering at backend ledger</p>`
await sendEmail(userEmail,subject,text,html)
}

const sendTranscationEmail=async(userEmail,name,amount,toAccount)=>{
  const subject='Transcation!'
const text=`Hey ${name} \n\nthis amount ${amount},has been transfered to ${toAccount}`
const html=`<p>Hello ${name}</p><p>Thank you for doing a transcation at backend ledger</p>`

await sendEmail(userEmail,subject,text,html)
}

const sendTranscationFaliureEmail=async(userEmail,name,amount,toAccount)=>{
  const subject='Transcation Failed !!!'
const text=`Hey ${name} \n\n a transcation of this amount ${amount},to this account ${toAccount} has been failed`
const html=`<p>Hello ${name}</p><p>Thank you for doing a transcation at backend ledger</p>`

await sendEmail(userEmail,subject,text,html)

}

module.exports = {sendRegistrationEmail,sendTranscationEmail,sendTranscationFaliureEmail};

