const MyDAO = require("../dao/MyDAO.js");
const MainDAO = require("../dao/MainDAO.js");
const nodeMailer = require("nodemailer");
const stripe = require("./stripe_v1.mjs");
const GC_PRODUCTS = [
    { id: 1, name:"Patch",description: "Patch", price: 15 },
    { id: 2, name:"Gi with Patch",description: "Gi with Patch", price: 30 },
    { id: 3, name:"Promotion Fee",description: "Promotion Fee", price: 25 },
    { id: 4, name:"Donation",description: "Donation", price: 0 },
]
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
            //this.stripe = new Stripe();
        }
        getProducts = async() => {
            return GC_PRODUCTS;
        }
        getKeyValueLocal = (key) => {
            for (let kv of this.keyValues) {
                if (kv.key === key) {
                    return kv.value;
                }
            }
        }
        getKeyValue = async (key) => {
            try {
                const val = await this.mainDAO.getKeyValue(key);
                return val;
            } catch (e) {
                return { status: -1, message: "error" }
            }
        }
        getVideos = async () => {
            try {
                const results = await this.dao.query("SELECT * FROM view_videos ");
                //   console.log("getVideos", results);
                return results;
            } catch (e) {
                return { status: -1, message: "error" }
            }
        }
        getVideosFromMongo = async (id) => {
            try {
                const videos = await this.mainDAO.getVideos(id);
                return videos;
            } catch (e) {
                return { status: -1, message: "error" }
            }
        }
        saveVideo = async (data) => {
            try {
                console.log("console", data);
                //  usp_video_save (0,'test.com', '2023-08-01','TITLE','source',1,1,1,1,1,1,1)
                const sp = "call usp_video_save (?,?,?,?,?,?,?,?,?,?,?,?)";
                const values = [data['id'], data['url'], data['videoDate'], data['title'], "src",
                data['hostedBy'], data['categoryId'], data['sectionId'], data['eventId'], data['status'], data['sortOrder'],data['reorder']];
                console.log("values", values);
                const result = this.dao.execute(sp, values);
                console.log("result", result);
                return result;
            } catch (e) {
                return { status: -1, message: "error" }
            }
        }
        getUsers = async (id) => {
            const users = await this.mainDAO.getUsers();
            //const suers = await this.dao.query("SELECT * FROM view_users");
            return users;
        }
        getStudents = async (id) => {
            try {
                const rows = await this.mainDAO.getStudents(id);
            //  console.log(id, "ROWS:", rows);
                if (rows)
                    return id === 0 ? rows : rows[0];
                else
                    return null;

            } catch (e) {
                console.log(e);
                return null;
            }
        };
        purchase = async (cart) => {
            const resp = await this.mainDAO.addPurchase(cart);
            const resp2 = await stripe.charge(mainDAO, resp.id, resp.amount, "purchase");//dao, id, amount, name
            return resp2;
        }
        postAttendance = async (list) => {
            const msg = await this.mainDAO.postAttendance(list);

            return msg
        }
        createStudent = async (student) => {
            return this.mainDAO.createStudent(student);
        }
        updateStudent = async (student) => {
            return this.mainDAO.updateStudent(student);
        }
        query = async (query, values) => {
            try {
                const result = await this.dao.query(query, values);
                console.log("result", result)
                return result;
            } catch (e) {
                return { status: -1, message: "error" }
            }
        }
        logger = async (msg, src) => {
            try {
                const sp = "ups_logger(?,?)";
                const values = [msg, src];
                const resp = await this.query(sp, values);
                return resp;
            }catch (e) {
                return { status: -1, message: "error" }
            }
        }
        login = async (user, pass) => {
            try {
                console.log("service.login:", user);
                const resp = await this.mainDAO.dbAuth(user, pass);
                return resp;
            } catch (e) {
                console.log("login error:", e);
                return { status: -1, message: "error loggin in" }
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
                console.log("sendMail:", mailOptions, this.mailAuth)

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