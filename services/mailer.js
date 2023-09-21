const nodemailer = require("nodemailer");
async function main() {
    // Async function enables allows handling of promises with await

    // First, define send settings by creating a new transporter: 
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "appjedi.net@gmail.com",
            pass: "dekxwtulmsryovls"
        }
    });

    // Define and send message inside transporter.sendEmail() and await info about send from promise:
    let info = await transporter.sendMail({
        from: '"App Jedi" <appjedi.net@gmail.com>',
        to: "timlinr@outlook.com",
        subject: "Testing, testing, 123",
        html: `
    <h1>Hello there</h1>
    <p>Isn't NodeMailer useful?</p>
    `,
    });

    console.log(info.messageId); // Random ID generated after successful send (optional)
}
const maillist = [
    '****.bram@****.com',
    '****.shah@****.com',
    '****.styles@****.com',
];
// Defines recipients

async function main2() {

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "***-example-person@gmail.com",
            pass: "your-password",
            // ⚠️ Use environment variables set on the server for these values when deploying
        },
    });

    let info = await transporter.sendMail({
        from: '"You" <***-example-person@gmail.com>',
        to: maillist, // Mails to array of recipients
        subject: "Testing, testing, 123",
        html: `
    <h1>Hello there</h1>
    <p>Isn't NodeMailer useful?</p>
    `,
    });

    console.log(info.messageId);
    console.log(info.accepted); // Array of emails that were successful
    console.log(info.rejected); // Array of unsuccessful emails
}
async function main3() {

    let transporter = nodemailer.createTransport({
        host: "spro3.fcomet.com",
        port: 465,
        secure: true,
        auth: {
            user: "bob@timlin.net",
            pass: "@Jedi2023",
            // ⚠️ Use environment variables set on the server for these values when deploying
        },
    });
    const attachments = [
        {
            filename: 'Bob2023.jpg',
            path: '/Users/roberttimlin/Documents/Bob2023.jpg',
            cid: 'bob@timlin.net' // Sets content ID
        }, {
            filename: 'hello.txt',
            path: './hello2.txt',
        }
    ];
    const maillist = ['timlinr@outlook.com', 'timlinr@yahoo.com', 'timlinator@gmail.com'];
    let info = await transporter.sendMail({
        from: '"Bob T" <bob@timlin.net>',
        to: maillist,
        subject: "Node Mail Test 2023-08-04 B",
        html: `
    <h1>Hello world from bob@timlin.snet</h1>
    <p>Here's an image for you</p>
    <img src="cid:appjedi.net@gmail.com>"/>'
    `, // Embedded image links to content ID
        attachments: attachments
    });

    console.log("messageId:", info.messageId);
    console.log("accepted:", info.accepted);
    console.log("rejected:", info.rejected);

}

main3()
    .catch(err => console.log(err));