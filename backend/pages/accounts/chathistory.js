var utils = require("../../utils/utils.js");
var checkURLParam = utils.checkURLParam; //why

var world_mgr = require("../../subsystems/world_mgr.js");
var world_get_or_create = world_mgr.getOrCreateWorld;

function filename_sanitize(input) {
	var rSlash = /\//g;
	var rIllegal = /[\/\?<>\\:\*\|":]/g;
	var rControl = /[\x00-\x1f\x80-\x9f]/g;
	return input.replace(rSlash, "$").replace(rIllegal, "_").replace(rControl, "_");
}

module.exports.GET = async function(req, write, server, ctx) {
	var dispage = ctx.callPage;
	var db = server.db;
	var db_ch = server.db_chat;
	
	var user = ctx.user;
	var superuser = user.superuser;
	var path = ctx.path;
	
	var worldName = checkURLParam("/accounts/chathistory/*world", path).world;
	var world = await world_get_or_create(worldName);
	
	var isOwner = user.id === world.owner_id;
	
	var allowed = superuser || isOwner;
	
	if(!allowed || !world) {
		return await dispage("404", null, req, write, server, ctx);
	};
		
	var worldChannel = await db_ch.get("SELECT channel_id FROM default_channels WHERE world_id=?", world.id);
	if(!worldChannel) {
		return await dispage("404", null, req, write, server, ctx);
	};
	
	worldChannel = worldChannel.channel_id;
	var entries = await db_ch.all("SELECT data FROM entries WHERE channel=?", worldChannel);
	
	entries = entries.map(function(entry) {
		return JSON.parse(entry.data);
	});
	
	entries.sort(function(a, b) {
		return a.date - b.date;
	});
	
	write(JSON.stringify(entries), null, {
		mime: "application/json; charset=utf8",
		download_file: filename_sanitize("Chathistory_" + worldName + ".json")
	});
}