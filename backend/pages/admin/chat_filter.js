module.exports.GET = async function(req, write, server, ctx, params) {
	var HTML = ctx.render;
	var user = ctx.user;
	var csrftoken = ctx.cookies.csrftoken;
	
	var dispage = server.callPage;
	var blocked_phrase_list = server.blockedPhraseList;
	var phrasePenaltyTime = server.phrasePenaltyTime;
	if(blocked_phrase_list.length === 1 && blocked_phrase_list[0] === "") blocked_phrase_list = [];
	
	if(!user.superuser) {
		return await dispage("404", null, req, serve, server, ctx);
	}
	
	write(HTML("administrator_chat_filter.html", {
		message: params.message,
		phrase_list: blocked_phrase_list.join("\n"),
		csrftoken: csrftoken,
		phrase_penalty: phrasePenaltyTime
	}));
}

module.exports.POST = async function(req, write, server, ctx) {
	var post_data = ctx.post_data;
	var user = ctx.user;
	var csrftoken = ctx.cookies.csrftoken;
	
	if(!user.superuser) return;
	
	var dispage = ctx.callPage;
	var blocked_phrase_list = server.blockedPhraseList;
	var setBlockedPhrases = server.setBlockedPhrases;
	var setPhraseTime = server.setPhraseTime;
	var phrasePenaltyTime = server.phrasePenaltyTime;

	var postedCSRFToken = post_data.csrfmiddlewaretoken;
	
	if(postedCSRFToken !== ctx.cookies.csrftoken) return;
	
	var subm_list = post_data.subm_list.replaceAll("\r", "");

	setPhraseTime(post_data.time*1);

	if(subm_list) {
		await setBlockedPhrases(subm_list.split("\n"));
		return await dispage("admin/chat_filter", {
			message: "Successfully set list",
			phrase_list: blocked_phrase_list.join("\n"),
			csrftoken,
			phrase_penalty: phrasePenaltyTime
		}, req, write, server, ctx);
	}

	await setBlockedPhrases([""]);
	return await dispage("admin/chat_filter", {
		message: "Unblocked all phrases",
		phrase_list: blocked_phrase_list.join("\n"),
		csrftoken,
		phrase_penalty: phrasePenaltyTime
	}, req, write, server, ctx);

}