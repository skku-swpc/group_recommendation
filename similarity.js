/////////////////////////////////////////////////////////////////////////
/////////							pearson						/////////
/////////////////////////////////////////////////////////////////////////
exports.pearson = function(arr_1, arr_2) {
	var i=0;

	if(!Array.isArray(arr_1) || !Array.isArray(arr_2)) {
		console.log("similarity.js / Pearson / They are not array.");
		return -1;
	}
		
	var avg_arr_1 = 0;
	var avg_arr_2 = 0;
	
	var temp_count=0;
	
	for(i=0; i<arr_1.length; i++) {
		if(arr_1[i]!==0 && arr_2[i]!==0) {
			avg_arr_1 += arr_1[i];
			avg_arr_2 += arr_2[i];
			temp_count++;
		}
	}

	avg_arr_1 /= temp_count;
	avg_arr_2 /= temp_count;
	
	if(isNaN(avg_arr_1) || !isFinite(avg_arr_1)) {
		avg_arr_1 = 0;
	}
	if(isNaN(avg_arr_2) || !isFinite(avg_arr_2)) {
		avg_arr_2 = 0;
	}
	
	var top = 0;
	var bottom = 0;
	var bottom1 = 0;
	var bottom2 = 0;
	
	for(i=0; i<arr_1.length; i++) {
		if(arr_1[i]!==0 && arr_2[i]!==0) {
			top += ((arr_1[i]-avg_arr_1)*(arr_2[i]-avg_arr_2));
			bottom1 += ((arr_1[i]-avg_arr_1)*(arr_1[i]-avg_arr_1));
			bottom2 += ((arr_2[i]-avg_arr_2)*(arr_2[i]-avg_arr_2));
		}
	}

	bottom = Math.sqrt(bottom1*bottom2);



	
	var result = top/bottom;
	
	if(isNaN(result) || !isFinite(result)) {
		result = 0;
	}
	
	if(result>1) {
		result = 1;
	}
	if(result<-1) {
		result = -1;
	}

	return result;
};