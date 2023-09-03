const MyDAO = require("../dao/MyDAO.js");
const MainDAO = require("../dao/MainDAO.js");
const nodemailer = require("nodemailer");

module.exports =
    class MainService {
        constructor(connObj) {
            console.log("connObj", connObj);
            this.dao = new MyDAO(connObj);
            
            this.mainDAO = new MainDAO();
        }

        getVideosSQL = async () => {
            const results = await this.dao.query("SELECT * FROM view_videos ");
            //   console.log("getVideos", results);
            return results;
        }
        getVideos = async (id) => {
            /*
            console.log("service.getVideos")
            const videos=await this.getVideosSQL();
            for (let v of videos)
            {
                await this.mainDAO.addVideo(v);
            }
            */
            const videos = await this.mainDAO.getVideos(id);
            return videos;
        }
        saveVideo = async (data) => {
            console.log("console", data);
            //  usp_video_save (0,'test.com', '2023-08-01','TITLE','source',1,1,1,1,1,1)
            const sp = "call usp_video_save (?,?,?,?,?,?,?,?,?,?,?)";
            const values = [data['id'], data['url'], data['videoDate'], data['title'], "src",
            data['hostedBy'], data['categoryId'], data['sectionId'], data['eventId'], data['status'], data['sortOrder']];
            console.log("values", values);
            const result = this.dao.execute(sp, values);
            console.log("result", result);
            return result;
        }
        query = async (query, values) => {
            const result = await this.dao.query(query, values);
            console.log("result", result)
            return result;
        }
        sendmail = async (to, subject, message) => {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "appjedi.net@gmail.com",
                    pass: "dekxwtulmsryovls"
                }
            });
            const mailOptions = {
                from: "appjedi.net@gmail.com",
                to: to,
                subject: subject,
                html: message
            };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                    return { status: -1, message: "error sending email" };
                }else{
                    return {
                        status: 1, message: "Email sent: " + info.response
                    };
                }
            });
        }
    }