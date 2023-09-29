// source: https://www.youtube.com/watch?v=z84uTk5zmak
require("dotenv").config()

const Koa = require('koa');
const KoaRouter = require('koa-router');
const json = require('koa-json');
const render = require('koa-ejs');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const session = require('koa-session');
//const stripe = require('./services/stripe.mjs');
const MainService = require('./services/service.js')
const mongodb = require('mongodb');
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
//const dao = new MainDAO(process.env.MONGO_URL);
//const MySQL_CONNECTIONS = JSON.parse(process.env.MySQL_JSON);
//const MAIL_OPTIONS = JSON.parse(process.env.MAIL_OPTIONS_2);
const service = new MainService(process.env.MONGO_URL);

let ssn;
const GC_STUDENTS = [];
const GC_LEVELS = ['None', 'White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Brown 3rd', 'Brown 2nd', 'Brown 1st', 'Shodan', 'Nidan', 'Sandan'];
const GC_MONGO_DB_NAME = "wkk";
const GC_SERVER_URL = "http://localhost:3000";
// 
render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'layout',
  viewExt: 'html',
  cache: false,
  debug: false
});
app.use(router.routes()).use(router.allowedMethods());

router.get("/", async (ctx) => {
  ssn = ctx.session;
  if (!ssn || !ssn['user']) {
    ctx.redirect("/login?msg=Please login");
    return;
  }
  const s = await service.getStudents(0);
  // console.log(s);
  s.sort((a, b) => {
    const diff = b.rank - a.rank;
    if (diff !== 0) {
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
  const videos = await service.getVideos(0);
  //ctx.body = videos;
  await ctx.render('videos',
    { videos: videos }
  );
});
router.post("/video", async (ctx) => {
  const video = ctx.request.body;
  console.log("post.video:", video);
  const result = await service.saveVideo(video);
  //ctx.body = videos;
  ctx.body = result;
});
router.get("/api/students", async (ctx) => {
    const students = await service.getStudents(0);
    ctx.body=students;
});
router.get("/students", async (ctx) => {
  ssn = ctx.session;
  if (!ssn || !ssn['user'])
  {
    ctx.redirect("/login?msg=Please login");
    return;
  }
  const s = await service.getStudents(0);
 // console.log("STUDENTS:", s);
  s.sort((a, b) => {
    const diff = b.rank - a.rank;
    if (diff !== 0)
    {
      return diff;
    }
    return b.name > a.name ? -1 : 1;
  })
 // console.log("STUDENTS:", s);
  await ctx.render('students',
    { students: s, levels: GC_LEVELS }
  );
});
router.get("/student/:id", async (ctx) => {
  const id = ctx.request.params.id;
  console.log("get student by id", id);
  const student = await service.getStudent(id);
  console.log("STUDENT:", student);
    ctx.body=student;
});
router.get("/products", async (ctx) => {

  const products = await service.getProducts();
  console.log("products:", products);
  await ctx.render('products', {
    products: products,
    serverURL:GC_SERVER_URL
    });
});
router.post("/api/checkout", async (ctx) => {
  console.log("checkout:", ctx.request.body);
  const resp = await service.purchase(ctx.request.body);
});
router.get("/api/products", async (ctx) => {
  const products = await service.getProducts();
  console.log("products:", products);
  ctx.body = products;
});
router.post("/student", async (ctx) => {
  const s = ctx.request.body;
  console.log("POST STUDENT:",s);
  const resp = await service.createStudent(s)
  console.log("RESP", resp);
  ctx.body = resp
});
router.post("/attendance", async (ctx) => {
  const s = ctx.request.body;
  console.log("attendance:", s);
  const resp = await service.updateStudent(s);
 //const resp = { status: 1, message: "done" };
  console.log("RESP", resp);
  ctx.body = resp
});
router.put("/student", async (ctx) => {
  const s = ctx.request.body;
  console.log("PUT", s);
  const resp = await service.updateStudent(s);
  ctx.body = resp
});
router.get("/stripe", async (ctx) => {
  await ctx.render('stripe');
});
router.get("/release", async (ctx) => {
  ctx.body = GC_RELEASE;
});
router.get("/key-value/:key", async (ctx) => {
  const key = ctx.params.key;
  console.log("KEY:", key)
  const val = await service.getKeyValue(key);
  console.log("VALUE:", val);
  //ctx.body = videos;
  ctx.body = val;
});
router.get("/amort", amort);
async function amort(ctx) {
  await ctx.render('amort');
}
router.get("/email/:to/:subject/:message", async (ctx) => {
  const mailOptions = {
    from: "",
    to: ctx.params.to,
    subject: ctx.params.subject,
    html: ctx.params.message
  };
  const resp = await service.sendMail(mailOptions);
  //service.sendMail(ctx.params.to, ctx.params.subject, ctx.params.message);
  ctx.body = resp;
});
router.get("/logger/:msg/:src/", async (ctx) => {
  const resp = await service.logger(ctx.params.msg, ctx.params.src);
  ctx.body = resp;
});
router.get("/dbtest", async (ctx) => {
  const results = await service.query('SELECT * FROM logger', null);

  ctx.body = results;
});
router.get("/user", async (ctx) => {
  ctx.body = ctx.session.user;
});
router.get("/seedStudents", (ctx) => {
  console.log("/seed");
  mongoInsertMany(GC_STUDENTS);
  const rows = GC_STUDENTS.length;
  ctx.body = { status: 1, message: `Inserted ${rows}` }
});
router.post("/add", addPost);
async function addPost(ctx) {
  const thing = { id: things.length + 1, thing: ctx.request.body.thing };
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

  ctx.body = form;

});

router.post('/login', async (ctx) => {
  const username = ctx.request.body.username;
  const password = ctx.request.body.password;
  console.log("/login:", username);

  const auth = await service.login(username, password);
  //const auth = await dao.dbAuth(username, password);
  console.log("Authenticated!", auth);
  if (auth && auth.status > 0) {
    console.log("Authenticated!", auth);
    const obj = { auth: true, userId: auth.id, userName: auth.username, roleId: auth.role_id };
    console.log("AUTH:", obj);
    ssn = ctx.session;

    //this.session.user = auth;
    ssn.user = auth;
    console.log("SESSION", ssn);
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
    const results = connection.query(query, [u, p]);
    console.log("LOGIN.RESULTS::", results);

    return results[0];
  } catch (e) {
    console.log("ERROR:", e);
    return null;
  }
}
router.get("/students", async (ctx) => {
  const students = await service.getStudents(0);
  ctx.body = students;
});
router.get("/student/:id", async (ctx) => {
  const id = ctx.request.params.id;
  console.log("get student by id", id);
  const student = await getStudent(id);
  console.log("STUDENT:", student);
  ctx.body = student;
});
router.post("/student", async (ctx) => {
  const s = ctx.request.body;
  console.log("POST STUDENT:", s);
  const resp = await service.createStudent(s);
  console.log("RESP", resp);
  ctx.body = resp
});

router.put("/student", async (ctx) => {
  const s = ctx.request.body;
  console.log("PUT", s);
  const resp = await service.updateStudent(s);
  ctx.body = resp
});
router.get("/seed", async (ctx) => {
  //mongoInsertMany(GC_STUDENTS);
  mongoInsert({ id: 1, username: "admin", password: "Karate#1" });
  const users = await mongoFind("users", {})
  ctx.body = { message: "done", users: users };
});
router.get("/users", async (ctx) => {
  //mongoInsertMany(GC_STUDENTS);

  const users = await service.getUsers(0);
  ctx.body = users;
});


app.listen(PORT, () => {
  console.log("listening on port:", PORT);
})

