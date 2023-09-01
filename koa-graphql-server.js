const Koa = require('koa');
const KoaRouter = require('koa-router');
const mount = require('koa-mount');
const render = require('koa-ejs');
const { graphqlHTTP } = require('koa-graphql');
const path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test');
var Schema = mongoose.Schema;
const { graphqlHTTP } = require("express-graphql") // CommonJS

var userDataSchema = new Schema({
	email: { type: String, required: true },
	password: String,
	fullname: String,
	favorites: [String]
}, { collection: 'users' });

var UserData = mongoose.model('UserData', userDataSchema);
const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLInt,
	GraphQLNonNull
} = require('graphql')
const app = new Koa();
const GC_RELEASE = "2023-06-21";
//app.use(app.static('public'));
require("dotenv").config()

const router = new KoaRouter();
app.use(router.routes()).use(router.allowedMethods());
const GC_CONN_IDX = 1;
let GC_CONNECTIONS = JSON.parse(process.env.MySQL_JSON);
//console.log(GC_CONNECTIONS);
const connection = new MySql(GC_CONNECTIONS[GC_CONN_IDX]);

render(app, {
	root: path.join(__dirname, 'views'),
	layout: 'layout',
	viewExt: 'html',
	cache: false,
	debug: false
});
router.get("/home", async (ctx) => {
	console.log("index");
	await ctx.render("index");
});
router.get("/release", async (ctx) => {
	console.log("release");
	ctx.body = GC_RELEASE
});
router.get("/mongo", async (ctx) => {
	console.log("release");
	const users = await mongo(1);
	ctx.body = users
});
router.get("/reg", async (ctx) => {
	console.log("register");
	const users = getUsers(0);
	await ctx.render("register", { users: users });
});
router.get("/users", async (ctx) => {
	console.log("users");
	const users = getUsers(0);
	ctx.body = users;
});
router.get("/user/:id", async (ctx) => {
	const id = ctx.params.id;
	console.log("user", id);
	const users = getUsers(id);
	ctx.body = users;
});
const UserType = new GraphQLObjectType({
	name: 'User',
	description: 'This represents users from MySQL database',
	fields: () => ({
		userId: { type: GraphQLNonNull(GraphQLInt) },
		username: { type: GraphQLNonNull(GraphQLString) },
		lastName: { type: GraphQLNonNull(GraphQLString) },
		firstName: { type: GraphQLNonNull(GraphQLString) },
		email: { type: GraphQLNonNull(GraphQLString) },
		password: { type: GraphQLNonNull(GraphQLString) },
		roleId: { type: GraphQLNonNull(GraphQLInt) },
		status: { type: GraphQLNonNull(GraphQLInt) }
	})
});

const MessageType = new GraphQLObjectType({
	name: 'Message',
	description: 'Generic Message',
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		status: { type: GraphQLNonNull(GraphQLInt) },
		level: { type: GraphQLNonNull(GraphQLInt) },
		message: { type: GraphQLNonNull(GraphQLString) }
	})
});
const RootQueryType = new GraphQLObjectType({
	name: 'Query',
	description: 'Root Query',
	fields: () => ({
		users: {
			type: new GraphQLList(UserType),
			description: 'List of All Users',

			resolve: () => getUsers(0)
		},
		user: {
			type: new GraphQLList(UserType),
			description: 'List of User by id',
			args: {
				id: { type: GraphQLInt }
			},
			resolve: (parent, args) => getUsers(args.id)
		},
		mongo: {
			type: new GraphQLList(UserType),
			description: 'List of User by id',
			args: {
				id: { type: GraphQLInt }
			},
			resolve: (async (parent, args) => mongo(args.id))
		}
	})
})
const mongo = async (id) => {
	console.log("mongo: " + id);
	const data = await UserData.find();
	console.log("found", data);
	const users = [];
	for (let u of data) {
		console.log("U:", u);
		const user = { userId: 0, username: u.email, lastName: u.fullname, firstName: u.fullname, email: u.email, password: "******", roleId: 1, status: 1 }
		users.push(user);
	}

	console.log("USERS", users);
	return users;
}
const RootMutationType = new GraphQLObjectType({
	name: 'Mutation',
	description: 'Root Mutation',
	fields: () => ({
		updateUser: {
			/*
			mutation {
			  updateUser(userId: 2, username: "testerb", password:"Test1234",lastName:"Tester", firstName:"Bob", email:"tester.test@test.com", roleId:1,status:1) {
					username
				}
			}
			*/
			type: MessageType,
			description: 'Add/Update User',
			args: {
				userId: { type: GraphQLNonNull(GraphQLInt) },
				username: { type: GraphQLNonNull(GraphQLString) },
				password1: { type: GraphQLNonNull(GraphQLString) },
				password2: { type: GraphQLNonNull(GraphQLString) },
				lastName: { type: GraphQLNonNull(GraphQLString) },
				firstName: { type: GraphQLNonNull(GraphQLString) },
				email: { type: GraphQLNonNull(GraphQLString) },
				roleId: { type: GraphQLNonNull(GraphQLInt) },
				status: { type: GraphQLNonNull(GraphQLInt) }
			},
			resolve: (parent, args) => {
				const resp = updateUser(args.userId, args.username, args.password1, args.password2, args.lastName, args.firstName, args.email, args.roleId, args.status)
				console.log("RESP", resp);
				// const ret={userId:args.userId, username:args.username, status:1, message:"Updated"}
				return resp;
			}
		}
	}
	)
});
function getUsers(id) {
	let query = 'SELECT * FROM view_users' + (id > 0 ? " WHERE userId = " + id : "");
	const results = connection.query(query);
	return results;
}
function updateUser(userId, username, password1, password2, lastName, firstName, email, roleId, status) {
	try {
		if (userId === 0 && (password1 !== password2 || password1.length < 8)) {
			console.log("PWD:", password1, password2, password2.length);
			return { status: -1, message: "Invalid password or passwords don't match", id: 0, level: 2 }
		}
		const sp = "call usp_user_save (?,?,?,?,?,?,?,?)";
		const data = [userId, username, password1, lastName, firstName, email, roleId, status];
		console.log("updateUser.DATA:", data);
		const results = connection.query(sp, data);
		console.log("updateUser.result:", results[0][0]);
		return results[0][0];
	} catch (err) {
		console.log("ERR:", err);
	}
}
const schema = new GraphQLSchema({
	query: RootQueryType,
	mutation: RootMutationType
});
app.use(
	mount(
		'/graphql',
		graphqlHTTP({
			schema: schema,
			graphiql: true,
		}),
	),
);

const PORT = 4000;
app.listen(PORT, () => {
	console.log("running on port: " + PORT);
});