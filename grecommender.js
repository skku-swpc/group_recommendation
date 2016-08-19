var loader = require("./loader.js");
var similarity = require("./similarity.js");
var utility = require("./utility.js");

var user_program_list;
var program_info;
var unique_category_list;

var score_for_similar_group = [];
var similar_group = [];

var _score_length = 0;
var _neighborhood_size = 50;

var _rich_user_threshold = 600;
var _poor_user_threshold = 25;

exports.get_prediction_result = function(home_id, user_id, date, time, type="avg") {
	var recommendation_result;
	similar_group = [];
	
	if (type != "max" && type != "min" && type != "avg") {
		console.log("It needs a type (max, min or avg)");
		return -1;
	}
	
	var target_idx = -1;
	
	for(var i=0; i<user_program_list.length; i++) {
		if (user_program_list[i][0] == home_id && user_program_list[i][1] == user_id ) {
			target_idx = i;
			break;
		}
	}
	
	if (target_idx == -1) {
		console.log("There is no users.");
		return -1;
	}
	
	if (user_id<10) {
		console.log("Single user recommendation result: ");
		
		recommendation_result = recommendation_for_single(target_idx, date, time, type);
		
		return recommendation_result;
	}
	else {
		console.log("Group user recommendation result: ");
		similar_group=find_similar_group(target_idx);

		recommendation_result = recommendation_for_group(target_idx, date, time, type);
	
		return recommendation_result;
	}
}

function recommendation_for_single(target_user, target_date, target_time) {
	var i, j;
		
	var target_score = [];
	for(i=0; i<user_program_list[target_user][4].length; i++) {
		target_score.push(user_program_list[target_user][4][i]);
	}
	
	var neighbor_list = find_neighbor(target_user, target_score);
	
	var candidate_list = find_test_program(target_date, target_time);
	var recommendation_score = [];

	for(i=0; i<candidate_list.length; i++) {
		recommendation_score.push(predict_score(target_user, user_program_list[target_user][4], candidate_list[i], neighbor_list));
	}

	var recommendation_list = [];
	for(i=0; i<candidate_list.length; i++) {
		recommendation_list.push(candidate_list[i]);
	}
	
	for(i=0; i<recommendation_list.length; i++) {
		for(j=i+1; j<recommendation_list.length; j++) {
			if(recommendation_score[i]<recommendation_score[j]) {
				var temp_score = recommendation_score[j];
				recommendation_score[j] = recommendation_score[i];
				recommendation_score[i] = temp_score;
				
				var temp_idx = recommendation_list[j];
				recommendation_list[j] = recommendation_list[i];
				recommendation_list[i] = temp_idx;
			}
		}
	}

	
	var result = {};
	result.candidates = [];
	result.recommendations = [];
	
	for(i=0; i<candidate_list.length; i++) {
		result.candidates.push(get_program_info(candidate_list[i]));
		result.recommendations.push(get_program_info(recommendation_list[i]));
		result.recommendations[i].score = recommendation_score[i];
	}
	
	return result;
}

function recommendation_for_group(target_user, target_date, target_time, type) {
	var i, j;
	
	var similar_target_user = -1;
	var similar_target_score = [];
	var similar_neighbor_list;
	if (user_program_list[target_user][1]>=10 && (user_program_list[target_user][2].length) < _poor_user_threshold) {
		// really similar?
		if (similar_group[0][1]>=0.7) {
			console.log("The system uses a slimilar target group user.");
			similar_target_user = similar_group[0][0];
		}
		else {
			console.log("The system uses a target group user.");
			similar_target_user = target_user;
		}
		
		for(var rt_i=0; rt_i<user_program_list[similar_target_user][4].length; rt_i++) {
			similar_target_score.push(user_program_list[similar_target_user][4][rt_i]);
		}
		
		similar_neighbor_list = find_neighbor(similar_target_user, similar_target_score);
	}
	else {
		console.log("The system uses a target group user.");
	}
	
	var target_score = [];
	for(i=0; i<user_program_list[target_user][4].length; i++) {
		target_score.push(user_program_list[target_user][4][i]);
	}
	
	var neighbor_list = find_neighbor(target_user, target_score);


	var group_str = user_program_list[target_user][1].toString();
	var group_int = [];
	var group_target_user = [];
	var group_neighbor_list = [];

	for(i=0; i<group_str.length; i++) {
		var each_user_id = parseInt(group_str[i]);
		group_int.push(each_user_id);
		
		var temp_group_target_user = 0;
		
		for(j=0; j<user_program_list.length; j++) {
			if( user_program_list[j][0] == user_program_list[target_user][0]&&
				user_program_list[j][1] == each_user_id ) {
				
				temp_group_target_user = j;
				break;
				
			}
		}

		group_target_user.push(temp_group_target_user);
		group_neighbor_list.push(find_neighbor(temp_group_target_user, user_program_list[temp_group_target_user][4]));
	}
	
	var candidate_list = find_test_program(target_date, target_time);
	var recommendation_score = [];

	for(i=0; i<candidate_list.length; i++) {
		var each_predicted = [];
		for(j=0; j<group_int.length; j++) {
			each_predicted.push(predict_score(group_target_user[j], user_program_list[group_target_user[j]][4], candidate_list[i], group_neighbor_list[j]));
		}

		if (user_program_list[target_user][1]>=10 && (user_program_list[target_user][2].length) < _poor_user_threshold) {
			
			each_predicted.push(predict_score(similar_target_user, similar_target_score, candidate_list[i], similar_neighbor_list));
		}
		else {
			
			each_predicted.push(predict_score(target_user, target_score, candidate_list[i], neighbor_list));
		}
	
		if(type=="max")			recommendation_score.push(utility.find_max(each_predicted));
		else if(type=="avg")	recommendation_score.push(utility.find_avg(each_predicted));
		else if(type=="min")	recommendation_score.push(utility.find_min(each_predicted));
	}

	var recommendation_list = [];
	for(i=0; i<candidate_list.length; i++) {
		recommendation_list.push(candidate_list[i]);
	}
	
	for(i=0; i<recommendation_list.length; i++) {
		for(j=i+1; j<recommendation_list.length; j++) {
			if(recommendation_score[i]<recommendation_score[j]) {
				var temp_score = recommendation_score[j];
				recommendation_score[j] = recommendation_score[i];
				recommendation_score[i] = temp_score;
				
				var temp_idx = recommendation_list[j];
				recommendation_list[j] = recommendation_list[i];
				recommendation_list[i] = temp_idx;
			}
		}
	}
	
	var result = {};
	result.candidates = [];
	result.recommendations = [];
	
	for(i=0; i<candidate_list.length; i++) {
		result.candidates.push(get_program_info(candidate_list[i]));
		result.recommendations.push(get_program_info(recommendation_list[i]));
		result.recommendations[i].score = recommendation_score[i];
	}
	
	return result;
}

function predict_score(target_user, target_score, candidate_item, neighbor_list) {
	var result_predict = 0;

	var unique_id_of_candidate_item = program_info[candidate_item][0];

	if(target_score[unique_id_of_candidate_item] > 0) {
		result_predict = target_score[unique_id_of_candidate_item];
	}
	else {
		var target_user_avg_score = utility.avg_score(target_score);
	
		var result_top = 0;
		var result_bottom = 0;
		
		for(var ps_i=0; ps_i<neighbor_list.length; ps_i++) {
			if(user_program_list[neighbor_list[ps_i][0]][4][candidate_item]>0) {
				result_top += (neighbor_list[ps_i][1] * (user_program_list[neighbor_list[ps_i][0]][4][candidate_item]-utility.avg_score(user_program_list[neighbor_list[ps_i][0]][4])));
				result_bottom += (neighbor_list[ps_i][1]);		
			}
		}
	
	
		result_predict = result_top / result_bottom;	
			
		if(result_predict===0 || isNaN(result_predict) || !isFinite(result_predict)) {
			result_predict = 0;
		}

		result_predict += target_user_avg_score;
	}
	
	return result_predict;
}

function get_program_info(program_idx) {
	var result = {};
	result.channel = program_info[program_idx][3];
	result.title = program_info[program_idx][4];
	result.category = get_category_name(program_info[program_idx][1]);
	result.date = program_info[program_idx][2];
	result.s_time = program_info[program_idx][5];
	result.e_time = program_info[program_idx][6];
	
	return result;
}

function get_category_name(category_no) {
	var result = -1;
	for(var i=0; i<unique_category_list.length; i++) {
		if(unique_category_list[i][0]==category_no) {
			result = unique_category_list[i][1];
			break;
		}
	}
	
	return result;
}

function find_test_program(test_item_date, test_item_time) {
	var ftp_result = [];

	for(var ftp_i=0; ftp_i<program_info.length; ftp_i++) {
		if(	program_info[ftp_i][2] == test_item_date &&
			program_info[ftp_i][5] <= test_item_time &&
			program_info[ftp_i][6] >= test_item_time) {
			ftp_result.push(ftp_i);
		}
	}

	return ftp_result;
}


function find_neighbor(target_user, target_score) {
	var fn_list = [];
	var fn_temp_list = [];
	var fn_temp_score = [];
	var fn_i, fn_j;
	
	for(fn_i=0; fn_i<user_program_list.length; fn_i++) {

		fn_temp_list.push(fn_i);
		if(fn_i==target_user) {
			fn_temp_score.push(-999);
		}
		else {
			fn_temp_score.push(similarity.pearson(target_score , user_program_list[fn_i][4]));
		}
	}

	for(fn_i=0; fn_i<fn_temp_list.length; fn_i++) {
		for(fn_j=(fn_i+1); fn_j<fn_temp_list.length; fn_j++) {
			if(fn_temp_score[fn_i]<fn_temp_score[fn_j]) {
				var fn_temp = fn_temp_score[fn_i];
				fn_temp_score[fn_i] = fn_temp_score[fn_j];
				fn_temp_score[fn_j] = fn_temp;
				
				fn_temp = fn_temp_list[fn_i];
				fn_temp_list[fn_i] = fn_temp_list[fn_j];
				fn_temp_list[fn_j] = fn_temp;
			}
		}
	}
	
	for(fn_i=0; fn_i<_neighborhood_size; fn_i++) {
		fn_list.push([fn_temp_list[fn_i], fn_temp_score[fn_i]]);
	}

	return fn_list;
}


//////////////////////////////////////////////////////////////////////////
//																		//
//							1. Load Data								//
//																		//
//////////////////////////////////////////////////////////////////////////
exports.load_data = function() {
	user_program_list = loader.user_program_list();
	program_info = loader.program_info();
	unique_category_list = loader.category_list();
	
	for(var i=0; i<program_info.length; i++) {
		if(_score_length < program_info[i][0])	_score_length = program_info[i][0];
	}
	
		
	history_score();
	history_score_for_similar_group();
};

//////////////////////////////////////////////////////////////////////////
//																		//
//						1-1. history score								//
//																		//
//////////////////////////////////////////////////////////////////////////
function history_score() {
	var hs_i, hs_j;
	
	for(hs_i=0; hs_i<user_program_list.length; hs_i++) {
		var score_list = [];
		for(hs_j=0; hs_j<_score_length; hs_j++) {
			score_list.push(1);
		}
		
		for(hs_j=0; hs_j<user_program_list[hs_i][3].length; hs_j++) {
			score_list[user_program_list[hs_i][3][hs_j]]++;
		}
		
		for(hs_j=0; hs_j<score_list.length; hs_j++) {
			score_list[hs_j] = utility.loge(score_list[hs_j]);
		}
		
		user_program_list[hs_i].push(score_list);
	}
}

//////////////////////////////////////////////////////////////////////////
//																		//
//						1-1. history_score_for_similar_group score		//
//																		//
//////////////////////////////////////////////////////////////////////////
function history_score_for_similar_group() {
	var hs_i, hs_j, rt_i, hs_ii;
	for(hs_i=0; hs_i<user_program_list.length; hs_i++) {
		
		var score_list = [];

		if (user_program_list[hs_i][1]<10) {
			for(hs_j=0; hs_j<_score_length; hs_j++) {
				score_list.push(-1);
			}
		}
		else {
			
			
			var group_str = user_program_list[hs_i][1].toString();
			var group_int = [];
			var group_target_user = [];
		
			for(rt_i=0; rt_i<group_str.length; rt_i++) {
				var each_user_id = parseInt(group_str[rt_i]);
				group_int.push(each_user_id);
				
				var temp_group_target_user = 0;
				
				for(var rt_j=0; rt_j<user_program_list.length; rt_j++) {
					if( user_program_list[rt_j][0] == user_program_list[hs_i][0]&&
						user_program_list[rt_j][1] == each_user_id ) {
						
						temp_group_target_user = rt_j;
						break;
						
					}
				}
		
				group_target_user.push(temp_group_target_user);
			}

			for(hs_j=0; hs_j<_score_length; hs_j++) {
				score_list.push(0);
			}
			
			for(hs_j=0; hs_j<_score_length; hs_j++) {
				var is_zero = 0;
				for(hs_ii=0; hs_ii<group_target_user.length; hs_ii++) {
					if(user_program_list[group_target_user[hs_ii]][4][hs_j]===0) {
						is_zero=1;
						break;
					}
				}

				var temp_each_score = 0;
				if(!is_zero) {
					for(hs_ii=0; hs_ii<group_target_user.length; hs_ii++) {
							temp_each_score += user_program_list[group_target_user[hs_ii]][4][hs_j];
					}
					temp_each_score /= group_target_user.length;
				}

				score_list[hs_j] = temp_each_score;
			}
			
		}

		score_for_similar_group.push(score_list);
	}
}


//////////////////////////////////////////////////////////////////////////
//																		//
//						1-1. find similar one group								//
//																		//
//////////////////////////////////////////////////////////////////////////
function find_similar_group(target_user) {
	var fn_list = [];
	var fn_temp_list = [];
	var fn_temp_score = [];
	var fn_i;
	
	for(fn_i=0; fn_i<user_program_list.length; fn_i++) {

		fn_temp_list.push(fn_i);
		if(fn_i==target_user) {
			fn_temp_score.push(-999);
		}
		else {
			if (user_program_list[fn_i][1]<10 || (user_program_list[fn_i][2].length) < _rich_user_threshold) {
				fn_temp_score.push(-999);
			}
			else {
				fn_temp_score.push(similarity.pearson(score_for_similar_group[target_user] , score_for_similar_group[fn_i]));
			}
		}
	}

	for(fn_i=0; fn_i<fn_temp_list.length; fn_i++) {
		for(var fn_j=(fn_i+1); fn_j<fn_temp_list.length; fn_j++) {
			if(fn_temp_score[fn_i]<fn_temp_score[fn_j]) {
				var fn_temp = fn_temp_score[fn_i];
				fn_temp_score[fn_i] = fn_temp_score[fn_j];
				fn_temp_score[fn_j] = fn_temp;
				
				fn_temp = fn_temp_list[fn_i];
				fn_temp_list[fn_i] = fn_temp_list[fn_j];
				fn_temp_list[fn_j] = fn_temp;
			}
		}
	}
	
	for(fn_i=0; fn_i<1; fn_i++) {
		fn_list.push([fn_temp_list[fn_i], fn_temp_score[fn_i]]);
	}

	return fn_list;
}