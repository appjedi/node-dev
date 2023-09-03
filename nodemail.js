

const pw ="dekxwtulmsryovls";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
      user: "appjedi.net@gmail.com",
      pass: "dekxwtulmsryovls"
   }
});

const mailOptions = {
   from: "appjedi.net@gmail.com",
   to: "timlinr@outlook.com",
   subject: "Nodemailer Test",
   html: "Test <button>sending</button> Gmail using Node JS"
};

transporter.sendMail(mailOptions, function(error, info){
   if(error){
      console.log(error);
   }else{
      console.log("Email sent: " + info.response);
   }
});
