import bluebird from 'bluebird';


function getAdHocGtmLauchUrl(access) {
	return new bluebird.Promise((resolve, reject) => {
		var meetingId;
		const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
	        'User-Agent': 'Meeting-Remote',
	        'Authorization': `OAuth oauth_token=${access.access_token}`
	    };

		createMeetingApiCall(access)
		.then((createResp) => {
			if(createResp.length < 1) {
				reject("Error creating meeting");
				return;
			}

			meetingId = createResp[0].meetingid;
			return startMeetingApiCall(access, meetingId);
	    })
	    .then((startResp) => {
			if(!startResp.hostURL) {
				reject("Error creating start url");
				return;
			}

			resolve({hostUrl: startResp.hostURL, meetingId: meetingId});
	        
	    });	
	});
}

function startMeetingApiCall(access, meetingId) {
  return new bluebird.Promise(function(resolve, reject) {
		const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'User-Agent': 'Meeting-Remote',
			'Authorization': `OAuth oauth_token=${access.access_token}`
		};

		fetch(`https://api.getgo.com/G2M/rest/meetings/${meetingId}/start`, {
		  method: 'GET',
		  headers,
		})
		.then((response) => {
			console.log(response);
			return response.json()
		})
		.then((startResp) => {
	      return resolve(startResp);
	    })
	    .catch((err) => {
	    	reject(err);
	    });
  });
};

function createMeetingApiCall(access) {
  return new bluebird.Promise(function(resolve, reject) {
  	    const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'User-Agent': 'Meeting-Remote',
			'Authorization': `OAuth oauth_token=${access.access_token}`
		};

  		fetch('https://api.getgo.com/G2M/rest/meetings', {
		  method: 'POST',
		  headers,
		  body: JSON.stringify({
			    subject: "ad-hoc meeting",
			    starttime: "2018-06-21T05:00:00Z",
			    endtime: "2018-06-21T06:00:00Z",
			    passwordrequired: false,
			    conferencecallinfo: "Hybrid",
			    timezonekey: "",
			    meetingtype: "immediate"
		  }),
		})
		.then((response) => {
			console.log(response);
			return response.json()
		})
		.then((createResp) => {
	      return resolve(createResp);
	    })
	    .catch((err) => {
	    	reject(err);
	    });
  });
};

export default {
	getAdHocGtmLauchUrl
}