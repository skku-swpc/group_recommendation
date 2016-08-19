1. explain about software
	This software is for group recommendation using similar group user.
2. how to build
	1) Upload API
		var model = require("./grecommender.js");
	2) Recommend API
		model.load_data();
		console.log(model.get_prediction_result(10,12,130404,205200)); // group user
		console.log(model.get_prediction_result(501,23,130404,205200)); // similar group user
		console.log(model.get_prediction_result(700,1,130404,205200)); // single user
3. instruction
	1) Upload API
		file format
		-usr_history data input
		home_id	user_id	prgram_idx_array	unique_program_idx_array
		-program infomation data input
		unique_program_idx	category_no	date	channel	title	start_time	end_time
		-unique category list data input
		category_no	category_name
	2) Recommend API
		In grecommender.js
		console.log(model.get_prediction_result(home_id, user_id, date, time));
		user_id = family_id + personal_id (12 = 1 + 2)
