var utils = require("../../utils/utils.js");
var checkURLParam = utils.checkURLParam; //why

function filename_sanitize(input) {
	var rSlash = /\//g;
	var rIllegal = /[\/\?<>\\:\*\|":]/g;
	var rControl = /[\x00-\x1f\x80-\x9f]/g;
	return input.replace(rSlash, "$").replace(rIllegal, "_").replace(rControl, "_");
}

module.exports.GET = async function(req, write, server, ctx) {
	var path = ctx.path;
	var user = ctx.user;
	
	var dispage = ctx.callPage;
	var db_ch = server.db_chat;
	var db = server.db;
	
	var username = checkURLParam("/accounts/user_messages/:username", path).username;
	
	var specifiedUser = await db.get("SELECT * FROM auth_user WHERE username=?", username);
	
	if(!specifiedUser) {
		return await dispage("404", null, req, write, server, ctx);
	};
	
	//perms
	var allowed = user.superuser || username===evars.username;
	if(!allowed) {
		return await dispage("404", null, req, write, server, ctx);
	};
	
	var userID = specifiedUser.id;
	
	var sentMessages = await db_ch.all("SELECT data FROM entries"); //auuugh JSON
	sentMessages = sentMessages.map(object => JSON.parse(object.data)).filter(message => message.realUsername === username);
	
	write(JSON.stringify(sentMessages), null, {
		mime: "application/json; charset=utf8",
		download_file: filename_sanitize("User_" + username + ".json")
	});
}