const MyDAO = require("../dao/MyDAO.js");
const MainDAO = require("../dao/MainDAO.js");
const nodeMailer = require("nodemailer");
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
            this.keyValues = await this.getKeyValue("all");
            const myConn = await this.getKeyValueLocal("MySQL_JSON");
            console.log("myConn", myConn);
            this.dao = new MyDAO(myConn);
            this.mailAuth = await this.getKeyValueLocal("MAIL_OPTIONS");
            console.log("mailAuth", this.mailAuth);
        }
        getKeyValueLocal = (key) => {
            for (let kv of this.keyValues)
            {
                if (kv.key === key)
                {
                    return kv.value;
                }    
            }
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
                const transporter = nodeMailer.createTransport({
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