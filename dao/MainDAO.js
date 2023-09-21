const mongoose = require('mongoose');
const { ObjectId } = require('mongodb'); // or ObjectID 
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
module.exports =
    class MainDAO {
        constructor(url) {
            if (url)
                this.url = url;
            else
                this.url = this.getConnURL();

            this.init(this.url);
        }
        init = async (url) => {
            console.log("MONGO URL", url);
            console.log("MainDAO.init.process.env.MONGO_URL", process.env.MONGO_URL);

            mongoose.connect(url ? url : "");

            const Schema = mongoose.Schema;

            this.userDataSchema = new Schema({
                email: { type: String, required: true },
                password: String,
                lastName: String,
                firstName: String,
                status: Number,
                roleid: Number,
                donations: Array
            }, { collection: 'users' });
            this.UserData = mongoose.model('UserData', this.userDataSchema);

            this.videoDataSchema = new Schema({
                id: Number,
                title: String,
                url: String,
                videoDate: String,
                categoryId: Number,
                eventId: String,
                firstName: String,
                status: Number,
                hostedBy: Number,
                inserted: String,
                sectionId: Number,
                sortOrder: Number,
                source: String,
                status: Number
            }, { collection: 'videos' });
            this.VideoData = mongoose.model('VideoData', this.videoDataSchema);

            this.studentDataSchema = new Schema({
                email: { type: String, required: true },
                id: Number,
                age: Number,
                attended: Number,
                email: String,
                parentGuardian: String,
                phoneNumber: String,
                startDate: String,
                status: Number,
                rank: Number,
                attendance: Array
            }, { collection: 'students' });

            this.StudentData = mongoose.model('StudentData', this.studentDataSchema);

            this.donationSchema = new Schema({
                id: String,
                userId: String,
                email: String,
                fullName: String,
                amount: Number,
                status: Number,
                paid: String,
                posted: String
            }, { collection: 'donations' });
            this.DonationData = mongoose.model('DonationData', this.donationSchema);

            this.keyValueSchema = new Schema({
                key: String,
                value: Object
            }, { collection: 'key_values' });
            this.KeyValueData = mongoose.model('KeyValueData', this.keyValueSchema);
        }
        getConnURL() {
            console.log("getConnURL.process.env.MONGO_URL", process.env.MONGO_URL);
            return process.env.MONGO_URL || "mongodb+srv://appuser:AppData2022@cluster0.aga82.mongodb.net/FauziaA"
            //return process.env.MONGO_URL || "mongodb://localhost:27017/FauziaA";
        }
        getStudents_v1 = async (id) => {
            try {
                const query = id === 0 ? {} : { _id: id };
                const url = this.getConnURL();
                const db = await MongoClient.connect(url, { useUnifiedTopology: true });
                var dbo = db.db("wkk");
                const rows = await dbo.collection("students").find(query).toArray();
                //  console.log(id, "ROWS:", rows);
                db.close();
                console.log("conn closed");
                if (rows)
                    return id === 0 ? rows : rows[0];
                else
                    return null;

            } catch (e) {
                console.log(e);
                return null;
            }
        };
        getKeyValue = async (key) => {
            const query = key === "all"? { }: { key: key };
            const doc = await this.KeyValueData.find(query)
          //  console.log("getKeyValue:", key, doc);
            if (key === "all") {
                return doc;
            } else {
                return doc[0].value;
            }
        }
        
        updateFromStripe = async (id, status) => {
            const paid = new Date().getTime()
            await this.DonationData.findOneAndUpdate({ id: id }, { status: status, paid: paid });

            console.log("updateFromStripe.ID:", id);
            return "updated";
        }
        createStudent = async (student) => {
            try {
                console.log("ManDAO.updateStudent pre:", student);
                const id = student.id;
                await this.StudentData.create(student);
                return {status:1, message:"updateStudent done"}
            } catch (e) {
                console.log("ManDAO.updateStudent ex", e);
                return { status: -1, message: "createStudent failed" };
            }
        }
        postAttendance = async (list) => {
            try {
                for (let row of list) {
                    console.log("ROW:", row);
                    let s = await this.getStudents(row.id);
                    if (s) {
                        s = s[0];
                        console.log("STUDENT:", s)
                        const posted = new Date();
                        const rec = { classDate: row.classDate, dojoId: row.dojoId, posted: posted }
                        if (!s["attendance"]) {
                            console.log("NO ATTENDANCE");
                            s["attendance"] = [];
                        }
                        //console.log("POSTING: ", s.attendance);
                        const id = s.id;
                        s.attendance.push(rec);
                        console.log("POSTING: ", s.attendance);

                        await this.StudentData.findOneAndUpdate({ id: id }, { attendance: s.attendance });
                    }
                }
                const msg =rows.length+" rows updated";
                return {status:1, message:msg}

            } catch (e) {
                console.log("MainDAO.postAttendance ex", e);
                return { status: -1, message: "postAttendance error" };
            }
        }
        updateStudent = async (student) => {
            try {
                const id = student.id;
                const data = {
                    name: student.name,
                    parentGuardian: student.parentGuardian,
                    age: student.age,
                    email: student.email,
                    phoneNumber: student.phone,
                    rank: student.rank,
                    startDate: student.startDate,
                    status: student.status
                }
                await this.StudentData.findByIdAndUpdate(id, { startDate: student.startDate,status: student.status, paid: student.paid });
                return { status: 1, message: "updated" };
            } catch (e) {
                console.log(e);
                return { status: -1, message:"error updating student" };
            }
        }
        updateVideo =async (v)=>{
            try {
                const id = v.id;
                const video={
                    title: v.title,
                    url: v.url,
                    videoDate: v.videoDate,
                    categoryId: v.categoryId,
                    eventId: v.eventId,
                    status: v.status,
                    hostedBy: v.hostedBy,
                    sectionId: v.sectionId,
                    sortOrder: v.sortOrder,
                    source: v.source,
                }
                await this.VideoData.findOneAndUpdate({ id: id }, video);

            }catch (e) {
                console.log(e);
                return { status: -1 };
            }
        }
        updateUser = async (userId, password1, password2, lastName, firstName, email, roleId, status) => {
            try {
                if (password1 !== password2 || (password1 + "").length < 8) {
                    return { status: -1, message: "passwords don't match or too short" };
                }
                const user = {
                    email: email,
                    password: password1,
                    lastName: lastName,
                    firstName: firstName,
                    roleId: roleId,
                    status: status
                }
                const resp = await this.UserData.create(user);
                return user;
            } catch (e) {
                console.log(e);
                return { status: -1 };
            }
            return { status: -1 };
        }
        addVideo=async(video)=>{
            const resp=await this.VideoData.create(video);
        }
        getDonations = async (email) => {
            const donations = await this.DonationData.find({ email: email })
            console.log("getDonations", donations);
            return donations;
        }
        addDonation = async (email, fullName, amount) => {
            try {
                const user = await this.getUserByEmail(email);
                console.log("addDonation.user:", email, user);
                const userId = (user ? user.userId : "");

                const id = new Date().getTime();
                const donation = {
                    id: id,
                    userId: userId,
                    email: email,
                    fullName: fullName,
                    amount: amount,
                    status: 0,
                    posted: new Date(),
                    paid: null
                }

                console.log("donation:", donation)
                // user.donations.push({ id: id, amount: amount, status: 0, paid: "" });
                const resp = await this.DonationData.create(donation);
                console.log("addDonation.RESP:", resp);
                const donations = await this.getDonations(email);
                await this.UserData.findOneAndUpdate({ email: email }, { donations: donations });
                return id;
            } catch (e) {
                console.log(e);
                return -1;
            }
            return 1;
        }
        getUsers = async (id) => {
            const data = await this.UserData.find({});
            //const donations = data ? data.donations : [];
            const users = [];
            for (let u of data) {
                console.log("U:", u);
                const user = { userId: u._id, username: u.email, lastName: u.lastName, firstName: u.firstName, email: u.email, password: "******", roleId: 1, status: 1, donations: u.donations }
                users.push(user);
            }
            return users;
        }
        getStudents = async (id) => {
            const query = id === 0 ? {} : { _id: id };
            console.log("getStudents v2:", query);
            const data = await this.StudentData.find(query);
            //const donations = data ? data.donations : [];
            return data;
        }
        getVideos = async (id) => {
            const query = id===0 ? {} : { id: id };
            console.log("getVideos:", query);
            const data = await this.VideoData.find(query);
            console.log ("getVideos",data)
            //const donations = data ? data.donations : [];
            return data;
        }
        getUserById = async (id) => {
            const user = await this.UserData.findById(id);
            if (user) {
                return user;
            } else {
                null;
            }
        }
        getUserByEmail = async (email) => {

            const data = await this.UserData.find({ email: email });
            if (data) {
                const u = data[0];
                const id = u._id.toString()
                const user = { userId: id, username: u.email, lastName: u.lastName, firstName: u.firstName, email: u.email, password: "******", roleId: 1, status: 1, donations: u.donations }
                return user;
            } else {
                const user = { userId: "NF", username: email, lastName: "", firstName: "", email: "", password: "", roleId: 0, status: 0, donations: [] }
            }
        }
        dbAuth = async (username, password) => {
            try {
                console.log("dbAuth:", username);
                const data = await this.UserData.find({ username: username });
                console.log("dbAuth", data);
                if (!data) {
                    return { status: -1, message: "Not Found", userId: -1 }
                }
                if (data[0].password !== password) {
                    return { status: -2, message: "Invalid password", userId: -1 }
                }
                const user = { name: data[0].username, status: 1, message: "Authenticated", userId: data[0].id };
                return user;
            } catch (e) {
                console.log("dbauth ex:", e);
                return { status: -2, message: "Error logging in", userId: -1 }
            }
        }
    }
// export {dbAuth, updateUser, getUsers,  addDonation, getUserByEmail, getDonations, updateFromStripe };ß