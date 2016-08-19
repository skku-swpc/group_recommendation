/////////////////////////////////////////////////////////////////////////
/////////							log							/////////
/////////////////////////////////////////////////////////////////////////
exports.loge = function(x) {
	return Math.log(x);
};

/////////////////////////////////////////////////////////////////////////
/////////							avg score					/////////
/////////////////////////////////////////////////////////////////////////
exports.avg_score = function(target_score) {
	var avg = 0;
	var avg_cnt = 0;
	
	for(var i=0; i<target_score.length; i++) {
		if(target_score[i]>0) {
			avg += target_score[i];
			avg_cnt++;
		}
	}
	
	avg /= avg_cnt;

	if(isNaN(avg) || !isFinite(avg)) {
		avg = 0;
	}
	return avg;
};


/////////////////////////////////////////////////////////////////////////
/////////							MAX							/////////
/////////////////////////////////////////////////////////////////////////
exports.find_max = function(arr_1) {
	if(!Array.isArray(arr_1)) {
		console.log("utility.js / find_max / It is not array.");
		return -1;
	}
	
	var result = arr_1[0];
	
	for(var i=0; i<arr_1.length; i++) {
		if(result < arr_1[i]) {
			result = arr_1[i];
		}
	}

	return result;
};

/////////////////////////////////////////////////////////////////////////
/////////							MIN							/////////
/////////////////////////////////////////////////////////////////////////
exports.find_min = function(arr_1) {
	if(!Array.isArray(arr_1)) {
		console.log("utility.js / find_min / It is not array.");
		return -1;
	}
	
	var result = arr_1[0];
	
	for(var i=0; i<arr_1.length; i++) {
		if(result > arr_1[i]) {
			result = arr_1[i];
		}
	}

	return result;
};

/////////////////////////////////////////////////////////////////////////
/////////							AVG							/////////
/////////////////////////////////////////////////////////////////////////
exports.find_avg = function(arr_1) {
	if(!Array.isArray(arr_1)) {
		console.log("utility.js / find_avg / It is not array.");
		return -1;
	}
	
	var result = 0;
	
	for(var i=0; i<arr_1.length; i++) {
		result += arr_1[i];
	}
	
	result /= arr_1.length;
	
	if(isNaN(result) || !isFinite(result)) {
		result = 0;
	}

	return result;
};