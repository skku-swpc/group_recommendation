var model = require("./grecommender.js");

model.load_data();
console.log(model.get_prediction_result(10, 12, 130404, 205200));			// Group user
console.log(model.get_prediction_result(501, 23, 130404, 205200));		    // Similar group user
console.log(model.get_prediction_result(700, 1, 130404, 205200));			// Single user
//  home_id, user_id, date, time


// file format
//user_history.txt
//0	home id
//1	user id
//2	program idx array
//3	unique progrom idx array
//
//Program_info
//0	unique program idx
//1	category no
//2	date
//3	channel
//4	title
//5	s_time
//6	e_time
//
//
//unique_category_list
//0 category no
//1 category name
