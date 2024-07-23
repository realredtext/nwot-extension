module.exports.GET = async function(req, write, server, ctx, params) {
	var HTML = ctx.render;
	var user = ctx.user;

	var dispage = ctx.callPage;
	var db = server.db;

	if(!user.superuser) {
		return await dispage("404", null, req, write, server, ctx);
	};
	
	write(HTML("administrator_world_search.html", {
		message: params.message,
		worlds: params.worlds
	}));
};

module.exports.POST = async function(req, write, server, ctx) {
	var post_data = ctx.post_data;
	var user = ctx.user;
	
	var dispage = ctx.callPage;
	var db = server.db;
	
	if(!user.superuser) return;
	
	var searchQuery = post_data.search_query;
	var worldCount = 0;
	
	if(searchQuery.length < 1 || ! (/^([\w\/\.\-]*)$/g.test(searchQuery))) {
		return await dispage("admin/world_search", {
			message: "Invalid search query"
		}, req, write, server, ctx);
	};
	
	var worlds = await db.all("SELECT name, properties FROM world WHERE name LIKE ? || '%' ORDER BY name", searchQuery);
		
	for(var world of worlds) {
		world.properties = JSON.parse(world.properties);
		world.views = (world.properties.views ?? 0).toString();
		worldCount++;
	};
	
	if(worldCount === 0) {
		return await dispage("admin/world_search", {
			message: "No worlds with query \""+searchQuery+"\" were found."
		}, req, write, server, ctx)
	} else {
		return await dispage("admin/world_search", {
			message: worldCount+" worlds found",
			worlds: worlds
		}, req, write, server, ctx);
	};
};
