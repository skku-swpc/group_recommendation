var fs = require("fs");

/////////////////////////////////////////////////////////////////////////
/////////					load all user - program				/////////
/////////////////////////////////////////////////////////////////////////
exports.user_program_list = function() {
	var path = "./new_data/user_history.txt";

	var list = fs.readFileSync(path);
	
	var users_programs = JSON.parse(list);

	return users_programs;
};

exports.program_info = function() {
	var path = "./new_data/program_info.txt";

	var list = fs.readFileSync(path);
	
	return JSON.parse(list);
};

exports.category_list = function() {
	var path = "./new_data/unique_category_list.txt";

	var list = fs.readFileSync(path);

	var result = JSON.parse(list);
	
	return result;
};