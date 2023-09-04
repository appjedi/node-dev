const MyDAO = require("../dao/MyDAO.js");
const MainDAO = require("../dao/MainDAO.js");
const nodemailer = require("nodemailer");

module.exports =
    class MainService {
        constructor(mongoLink) {
            //this.dao = new MyDAO(connObj);
            //this.mailAuth = mailAuth;
            console.log("mongoLink:", mongoLink);
            this.mainDAO = new MainDAO(mongoLink);
            this.init();
        }
        init = async () => {
            const myConn = await this.getKeyValue("MySQL_JSON");
            console.log("myConn", myConn);
            this.dao = new MyDAO(myConn);
            this.mailAuth = await this.getKeyValue("MAIL_OPTIONS");
            console.log("mailAuth", this.mailAuth);
        }
        getKeyValue = async (key) => {
            try{
                const val = await this.mainDAO.getKeyValue(key);
                return val;
            } catch (e) {
                return {status:-1, message:"error"}
            }
        }
        getVideosSQL = async () => {
            try{
            const results = await this.dao.query("SELECT * FROM view_videos ");
            //   console.log("getVideos", results);
                return results;
            } catch (e) {
                return {status:-1, message:"error"}
            } 
        }
        getVideos = async (id) => {
            try{
                const videos = await this.mainDAO.getVideos(id);
                return videos;
            } catch (e) {
                return {status:-1, message:"error"}
            }
        }
        saveVideo = async (data) => {
            try {
                console.log("console", data);
                //  usp_video_save (0,'test.com', '2023-08-01','TITLE','source',1,1,1,1,1,1)
                const sp = "call usp_video_save (?,?,?,?,?,?,?,?,?,?,?)";
                const values = [data['id'], data['url'], data['videoDate'], data['title'], "src",
                data['hostedBy'], data['categoryId'], data['sectionId'], data['eventId'], data['status'], data['sortOrder']];
                console.log("values", values);
                const result = this.dao.execute(sp, values);
                console.log("result", result);
                return result;
            } catch (e) {
                return {status:-1, message:"error"}
            }
        }
        query = async (query, values) => {
            try{
                const result = await this.dao.query(query, values);
                console.log("result", result)
                return result;
            } catch (e) {
                return {status:-1, message:"error"}
            }
        }
        sendMail = async (mailOptions) => {
            try {
                const transporter = nodemailer.createTransport({
                    host: this.mailAuth.host,
                    port: this.mailAuth.port,
                    auth: {
                        user: this.mailAuth.user,
                        pass: this.mailAuth.pass
                    }
                });
                mailOptions.from = this.mailAuth.from;
                console.log ("sendMail:", mailOptions,this.mailAuth)

                const info = await transporter.sendMail(mailOptions);
                const resp =
                {
                    status: 1, message: "Email sent successfully.",
                    messageId: info.messageId, accepted: info.accepted, rejected: info.rejected
                };
                console.log("sendMail.response:", resp);
                return resp;
                
            } catch (e) {
                return { status: -1, message: "error sending email" };
            }
        }
    }