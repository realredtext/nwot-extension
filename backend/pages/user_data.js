var utils = require("../utils/utils.js");
var checkURLParam = utils.checkURLParam;

module.exports.GET = async function(req, write, server, ctx) {
	var db = server.db;
	var create_date = server.create_date;
	var create_boolean = server.create_boolean;
	var accountSystem = server.accountSystem;
	var dispage = ctx.callPage;
	
    var user = ctx.user;
	var HTML = ctx.render;
	var path = ctx.path;
	
	var query_user = checkURLParam("/user_data/:username", path).username;
		
	if(!user.superuser && (query_user !== user.username)) {
		console.log(1);
		return await dispage("404", null, req, write, server, ctx);
	};
	
	var validUser = !!(await db.get("SELECT id FROM auth_user WHERE username=?", query_user));
		
	if(!validUser) {
		return write("Invalid query, either there is no user of name "+query_user+" or your query should be \"user_data/userHere\"");
	};
	
	var res = await db.get("SELECT id, username, email, level, is_active, date_joined FROM auth_user WHERE username=?", query_user);
	var worldsOwned = await db.get("SELECT count(*) AS cnt FROM world WHERE owner_id=?", res.id);
	
	res.worlds_owned = worldsOwned.cnt;
	res.op = res.level > 2;
	res.superuser = res.level > 1;
	res.staff = res.level > 0;
	
	write(JSON.stringify(res), null, {
		mime: "application/json"
	});
}