var utils = require("../../utils/utils.js");
var create_date = utils.create_date;

module.exports.GET = async function(req, write, server, ctx, params) {
	var HTML = ctx.render;
	var user = ctx.user;
	
	var dispage = ctx.callPage;
	var db = server.db;
	var accountSystem = server.accountSystem;
	
	if(!user.superuser) {
		return await dispage("404", null, req, write, server, ctx);
	};
		
	write(HTML("administrator_user_search.html", {
		message: params.message,
		users: params.users
	}));
};

module.exports.POST = async function(req, write, server, ctx) {
	var post_data = ctx.post_data;
	var user = ctx.user;
	
	var dispage = ctx.callPage;
	var db = server.db;
	
	if(!user.superuser) return;
	
	var searchQuery = post_data.search_query;
	var userCount = 0;
	
	if(searchQuery.length < 1 || ! (/^([\w\/\.\-]*)$/g.test(searchQuery))) {
		return await dispage("admin/user_search", {
			message: "Invalid search query"
		}, req, write, server, ctx);
	};
	
	var users = await db.all("SELECT * FROM auth_user WHERE username LIKE ? || '%' ORDER BY username LIMIT 10000", searchQuery);
	
	for(var user of users) {
		userCount++;
			
		user.last_login = create_date(user.last_login);
		user.date_joined = create_date(user.date_joined);
		
		var worlds_owned = await db.get("SELECT count(*) AS cnt FROM world WHERE owner_id=?", user.id);
		user.worlds_owned = worlds_owned.cnt;
	};
		
	if(userCount === 0) {
		return await dispage("admin/user_search", {
			message: "No users with query \""+searchQuery+"\" were found."
		}, req, write, server, ctx)
	} else {
		return await dispage("admin/user_search", {
			message: userCount+" users found",
			users: users
		}, req, write, server, ctx);
	};
}