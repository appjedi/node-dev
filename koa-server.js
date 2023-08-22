// source: https://www.youtube.com/watch?v=z84uTk5zmak
require("dotenv").config()

const Koa = require('koa');
const KoaRouter = require('koa-router');
const json = require('koa-json');
const render = require('koa-ejs');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const session = require('koa-session');
const MainDAO = require("./dao/MainDAO.js");
//const stripe = require('./services/stripe.mjs');
const MainService = require('./services/service.js')

//import serve from "koa-static"; // CJS: require('koa-static')

// 
const app = new Koa();
const router = new KoaRouter();
const PORT = 3000;
//app.use(session());
app.keys = ['Shh, its a secret!'];
app.use(session(app)); 
app.use(json());
app.use(bodyParser());
const GC_RELEASE = "2023-07-16";
// 
const dao = new MainDAO(process.env.MONGO_URL);
const MySQL_CONNECTIONS = JSON.parse(process.env.MySQL_JSON);
const service = new MainService(MySQL_CONNECTIONS[0]);

let ssn;
const GC_STUDENTS = [];
const GC_LEVELS = ['None', 'White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Brown 3rd', 'Brown 2nd', 'Brown 1st', 'Shodan', 'Nidan', 'Sandan'];
const GC_MONGO_DB_NAME = "wkk";
// 
render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'layout',
    viewExt: 'html',
    cache: false,
    debug:false
});
app.use(router.routes()).use(router.allowedMethods());

router.get("/", async (ctx) => {
  ssn = ctx.session;
  if (!ssn || !ssn['user'])
  {
    ctx.redirect("/login?msg=Please login");
    return;
  }
  const s = await dao.getStudents(0);
  s.sort((a, b) => {
    const diff = b.rank - a.rank;
    if (diff !== 0)
    {
      return diff;
    }
    return b.name > a.name ? -1 : 1;
  })
 // console.log("STUDENTS:", s);
  await ctx.render('index',
    { students: s, levels: GC_LEVELS }
  );
});
//  
router.get("/videos", async (ctx) => {
  const videos = await service.getVideos();
  //ctx.body = videos;
  await ctx.render('videos',
    { videos: videos}
  );
});
router.post("/video", async (ctx) => {
  const video = ctx.request.body;
  console.log("post.video:", video);
  const result = await service.saveVideo(video);
  //ctx.body = videos;
   ctx.body=result;
});
router.get("/stripe", async (ctx) => {
  await ctx.render('stripe');
});
router.get("/release", async (ctx) => {
   ctx.body=GC_RELEASE;
});
router.get("/amort", amort);
async function amort(ctx) {
    await ctx.render('amort');
}
router.get("/hello/:name", async (ctx) => {
    ctx.body = "Hello " + ctx.params.name;
});
router.get("/dbtest", (ctx) => {
  const results = connection.query('SELECT * FROM users');

  ctx.body=results;
});
router.get("/user", async (ctx) => {
    ctx.body = ctx.session.user;
});
router.get("/seedStudents", (ctx) => {
  console.log("/seed");
  mongoInsertMany(GC_STUDENTS);
  const rows = GC_STUDENTS.length;
  ctx.body = {status:1, message: `Inserted ${rows}`}
});
router.post("/add", addPost);
async function addPost(ctx) {
    const thing = { id: things.length +1, thing: ctx.request.body.thing };
    things.push(thing);
    console.log("add thing: ", thing);
    ctx.redirect("/");
}
router.get('/login', (ctx) => {
  const msg = ctx.query.msg;
  const form =
    `
    <html><head><title>login</title></head><body>
   <h1>Login Page: </h1><p>${msg}</p>
   <form method="POST" action="login">
    Username:<br><input type="text" name="username">
    <br>Password:<br><input type="password" name="password">
    <br><br><input type="submit" value="Submit"></form></body></html>
    `;

  ctx.body=form;

});

router.post('/login', async (ctx) => {
  const username = ctx.request.body.username;
  const password = ctx.request.body.password;
  console.log("/login:", username);
  const auth = await loginMongo(username, password);
   console.log("Authenticated!",auth);
  if (auth && auth.id>0)
  {
    console.log("Authenticated!",auth);
          const obj = { auth: true, userId: auth.id, userName: auth.username, roleId: auth.role_id };
      console.log("AUTH:", obj);
     ssn = ctx.session;
      
      //this.session.user = auth;
      ssn.user = auth;  
     // console.log("SESSION", ssn);
      ctx.redirect("/");
  } else {
       // ctx.body={auth:false};
    ctx.redirect("/login?msg=Invalid Login")
  }
});
function login(u, p) {
    try {
        //const query = `SELECT * FROM users WHERE username='${u}' AND password= '${p}'`;
        const query = `SELECT * FROM users WHERE username=? AND password= PASSWORD(?)`;
        const results = connection.query(query, [u,p]);
        console.log("LOGIN.RESULTS::",results);

        return results[0];
  } catch (e) {
    console.log("ERROR:", e);
    return null;
  }
}
router.get("/students", async (ctx) => {
    const students = await getStudents(0);
    ctx.body=students;
});
router.get("/student/:id", async (ctx) => {
  const id = ctx.request.params.id;
  console.log("get student by id", id);
  const student = await getStudent(id);
  console.log("STUDENT:", student);
    ctx.body=student;
});
router.post("/student", async (ctx) => {
  const s = ctx.request.body;
  console.log("POST STUDENT:",s);
  const resp = await mongoInsert(s,"students");
  console.log("RESP", resp);
  ctx.body = resp
});
router.post("/attendance", async (ctx) => {
  const s = ctx.request.body;
  console.log("attendance:", s);
  const resp = await postAttendance(s);
 //const resp = { status: 1, message: "done" };
  console.log("RESP", resp);
  ctx.body = resp
});
router.put("/student", async (ctx) => {
  const s = ctx.request.body;
  console.log("PUT", s);
  const resp = await mongoUpate(s, "students");
  ctx.body = resp
});
router.get("/seed", async (ctx) => {
  //mongoInsertMany(GC_STUDENTS);
  mongoInsert({ id: 1, username: "admin", password: "Karate#1" });
  const users = await mongoFind("users", {})
  ctx.body = {message:"done", users:users};
});
router.get("/users", async (ctx) => {
  //mongoInsertMany(GC_STUDENTS);
 
  const users = await mongoFind("users", {})
  ctx.body = users;
});
const mongoInsert = async (obj, doc="users") => {
    const db = await MongoClient.connect(GC_MONGO_URL, { useUnifiedTopology: true });
    const dbo = db.db(GC_MONGO_DB_NAME);
 
    console.log("mongoInsert:", obj);
    const resp = await dbo.collection(doc).insertOne(obj);
    console.log("INSERTED");
  db.close();
    // 
  return resp;
}
const mongoInsertMany = async (list, doc) => {
    console.log("mongoInsertMany", list);
    const db = await MongoClient.connect(GC_MONGO_URL, { useUnifiedTopology: true });
    var dbo = db.db(GC_MONGO_DB_NAME);
// await dbo.collection(doc).deleteMany();
 // console.log("delete many");
  await dbo.collection(doc).insertMany(list);
      db.close();
    console.log("insert many");

}
const mongoUpate = async (obj, doc) => {
    const db = await MongoClient.connect(GC_MONGO_URL, { useUnifiedTopology: true });
    const dbo = db.db("wkk");
  const resp = await dbo.collection(doc).updateOne({ '_id': new ObjectId(obj.id) },
    {
      $set: {
        'email': obj.email, phoneNumber: obj.phoneNumber, name: obj.name, rank: obj.rank, startDate: obj.startDate,
        status: obj.status, parentGuardian: obj.parentGuardian, age: obj.age
      }
    });
    db.close();
  return { status: 1, message: "updated" };
}
const postAttendance = async (list) => {
  /*
    const db = await MongoClient.connect(GC_MONGO_URL, { useUnifiedTopology: true });
    const dbo = db.db(GC_MONGO_DB_NAME);
    const doc = await dbo.collection("students");
 */
  const doc = await getDocument("students");
  for (row of list)
  {
    console.log("ROW:", row);
    const s =await getStudent(row.id);
    if (s)
    {
      console.log("STUDENT:", s)
      const posted = new Date();
      const rec = {classDate: row.classDate, dojoId:row.dojoId, posted: posted}
      if (!s["attendance"]) {
        s["attendance"] = [];
      }
      console.log("POSTING: ", rec);
      s.attendance.push(rec);
      doc.updateOne({ '_id': new ObjectId(row.id) }, {
        $set: { "attendance": s.attendance }
      });
    }
  }
  const resp = await mongoInsertMany(list, "attendance");

  return { status: 1, message: "updated " + list.length };
}
const getStudent = async (id) => {
  try {
    const query = id === 0 ? {} : { _id: new ObjectId(id) };
    const db = await MongoClient.connect(GC_MONGO_URL, { useUnifiedTopology: true });
    var dbo = db.db(GC_MONGO_DB_NAME);
    const row = await dbo.collection("students").find(query).toArray();
  //  console.log(id, "ROWS:", rows);
        db.close();
    if (row)
      return row[0];
    else
      return null;

  } catch (e) {
    console.log(e);
    return null;
  }
};
const getStudents = async (id) => {
  try {
    const query = id === 0 ? {} : { _id: id };
    const db = await MongoClient.connect(GC_MONGO_URL, { useUnifiedTopology: true });
    var dbo = db.db(GC_MONGO_DB_NAME);
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
const mongoFind = async (docName, query) => {
  try {
   // const query = id === 0 ? {} : { _id: id };
    const db = await MongoClient.connect(GC_MONGO_URL, { useUnifiedTopology: true });
    var dbo = db.db(GC_MONGO_DB_NAME);
    const doc =  dbo.collection(docName);

    const rows = await doc.find(query).toArray();
        db.close();
  //  console.log(id, "ROWS:", rows);
    if (rows)
      return rows;
    else
      return null;
  } catch (e) {
    console.log(e);
    return null;
  }
};
const getDocument = async (docName) => {
  try {
   // const query = id === 0 ? {} : { _id: id };
    const db = await MongoClient.connect(GC_MONGO_URL, { useUnifiedTopology: true });
    var dbo = db.db(GC_MONGO_DB_NAME);
    const doc =  dbo.collection(docName);
    db.close();
    return doc;
  } catch (e) {
    console.log(e);
    return null;
  }
};
const loginMongo = async (un, pw) => {
  try {
    const query = { username: un }
    const db = await MongoClient.connect(GC_MONGO_URL, { useUnifiedTopology: true });
    var dbo = db.db(GC_MONGO_DB_NAME);
    const rows = await dbo.collection("users").find(query).toArray();
    console.log("ROWS:", rows);
        db.close();
    if (rows.length>0 && rows[0].password === pw) {
      return rows[0];
    }
    else
      return {id:-1, username:un, password:"invalid"};
  } catch (e) {
    console.log(e);
    return  {id:-2, username:un, password:"not found"};;
  }
};

app.listen(PORT, () => {
    console.log("listening on port:", PORT);
})

let GC_CONNECTIONS_old = [{
  host: 'localhost',
  user: 'root',
  database: 'test',
  password: ''
},
{
  host: 'appdojo.net',
  user: 'appjedin_sensei',
  database: 'appjedin_training',
  password: 'Sensei2022!'
}, {
  host: "192.168.64.2", // Mac
  user: "training",
  password: "Test1234",
  database: "test",
  port: 3306
}
];
