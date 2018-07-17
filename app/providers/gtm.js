import bluebird from 'bluebird';
import url from 'url';


function getAdHocGtmLauchUrl(access) {
	return new bluebird.Promise((resolve, reject) => {
		var meetingId;

		createMeetingApiCall(access)
		.then((createResp) => {
			if(createResp.err) {
				return reject(createResp.message);
			}

			if(createResp.length < 1) {
				reject("Error creating meeting");
				return;
			}

			meetingId = createResp[0].meetingid;
			return startMeetingApiCall(access, meetingId);
	    })
	    .then((startResp) => {
			if(!startResp.hostUrl) {
				reject("Error creating start url");
				return;
			}

			resolve({hostUrl: startResp.hostUrl, meetingId: meetingId});
	        
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
			response.json().then((respJson) => {
				return resolve({hostUrl: respJson.hostURL});
			});
		})
	    .catch((err) => {
	    	console.log(err);
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

		var startTime = new Date();
		var endTime = new Date();
		endTime.setTime(startTime.getTime() + (1*60*60*1000));

  		fetch('https://api.getgo.com/G2M/rest/meetings', {
		  method: 'POST',
		  headers,
		  body: JSON.stringify({
			    subject: "ad-hoc meeting",
			    starttime: startTime.toISOString(),
			    endtime: endTime.toISOString(),
			    passwordrequired: false,
			    conferencecallinfo: "Hybrid",
			    timezonekey: "",
			    meetingtype: "immediate"
		  })
		})
		.then((response) => {
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

function checkMeetingId(meetingId) {
  return new bluebird.Promise(function(resolve, reject) {
		const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'User-Agent': 'Meeting-Remote',
		};

		fetch(`https://global.gotomeeting.com/rest/2/meetings/${meetingId}`, {
		  method: 'GET',
		  headers
		})	
		.then((response) => {
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

function checkProfileId(profileId) {
  return new bluebird.Promise(function(resolve, reject) {
		const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'User-Agent': 'Meeting-Remote',
		};

		fetch(`https://global.gotomeeting.com/rest/2/profiles/${profileId}`, {
		  method: 'GET',
		  headers
		})	
		.then((response) => {
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

function deleteMeeting(access, meetingId) {
  return new bluebird.Promise(function(resolve, reject) {
  	    const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'User-Agent': 'Meeting-Remote',
			'Authorization': `OAuth oauth_token=${access.access_token}`
		};

  		fetch(`https://api.getgo.com/G2M/rest/meetings/${meetingId}`, {
		  method: 'DELETE',
		  headers
		})
		.then(() => {
	      return resolve();
	    })
	    .catch((err) => {
	    	reject(err);
	    });
  });
}

function loadUpcomingMeetings(access) {
	return new bluebird.Promise(function(resolve, reject) {
		const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'User-Agent': 'Meeting-Remote',
			'Authorization': `OAuth oauth_token=${access.access_token}`
		};

		fetch("https://api.getgo.com/G2M/rest/upcomingMeetings", {
		  method: 'GET',
		  headers,
		})
		.then((response) => {
			if(response.status === 403) {
				return reject(403)
			}
			return response.json();
		})
		.then((upcomingResp) => {
	      return resolve(upcomingResp);
	    });
  });
}

function getAccessJwt(access, profileMeetingId) {
	// this function is a cheat
	// since the public goto api api.getgo.com does not have a profile method
	// we get a start url, which give us a temporary access token
	// and we use that token against the private profile api
	return new bluebird.Promise(function(resolve, reject) {
		var meetingId;
		getAdHocGtmLauchUrl(access)
		.then((resp) => {
			meetingId = resp.meetingId;
			const queryData = url.parse(resp.hostUrl, true).query;
	        const jwt = queryData.authenticationToken;

	        return deleteMeeting(access, meetingId)
	        .then(() => {
	        	return resolve(jwt);
	        }).catch(() => {
	        	return resolve(jwt);
	        });
		})
		.catch((err) => {
	    	reject(err);
	    });;
	});	
}

function getScreensharingData(jwt, meetingId) {
	return new bluebird.Promise(function(resolve, reject) {
		const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization': `Bearer ${jwt}`
		};
  		fetch(`https://apiglobal.gotomeeting.com/rest/2/meetings/${meetingId}/session/screensharing`, {
		  method: 'GET',
		  headers
		})
		.then((response) => {
			return response.json()
		})
		.then((sessionScreensharingResp) => {
	      return resolve(sessionScreensharingResp);
	    })
	    .catch((err) => {
	    	reject(err);
	    });
	});
}

function killSession(access, meetingId) {
	return new bluebird.Promise(function(resolve, reject) {
		var jwt;
		getAccessJwt(access)
		.then((jwtResp) => {
			jwt = jwtResp;
			return getScreensharingData(jwt, meetingId);
		})
		.then((screenshareResp) => {
	        const headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Delegation ${screenshareResp.delegationToken}`
			};

	  		fetch(`https://apiglobal.gotomeeting.com/rest/2/meetings/${meetingId}/session`, {
			  method: 'DELETE',
			  headers
			})
			.then((response) => {
				return resolve();
			})
		    .catch((err) => {
		    	reject(err);
		    });
		});
	});
}


function getProfileInformation(access) {
	return new bluebird.Promise(function(resolve, reject) {
		getAccessJwt(access)
		.then((jwt) => {
	        const headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${jwt}`
			};

	  		fetch('https://apiglobal.gotomeeting.com/rest/2/profile', {
			  method: 'GET',
			  headers
			})
			.then((response) => {
				return response.json()
			})
			.then((profileResp) => {
		      return resolve(profileResp);
		    })
		    .catch((err) => {
		    	reject(err);
		    });
		});
	});
}

function checkStaleAccess(access) {
	// check to see if access is still valid and refresh it if not
	return new bluebird.Promise(function(resolve, reject) {
		// check expiration
		if(access.expiresAt > new Date().getTime()) {
			return resolve({refreshed: false, access});
    	}

		const headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		};

  		fetch('https://mtg-remote.herokuapp.com/oauth/gtm/refresh', {
		  method: 'POST',
		  headers,
		  body: JSON.stringify(access)
		})
		.then((response) => {
			return response.json();
		})
		.then((refreshResp) => {
	      return resolve({refreshed: true, access: refreshResp});
	    })
	    .catch((err) => {
	    	reject(err);
	    });
	});
}

export default {
	getAdHocGtmLauchUrl,
	startMeetingApiCall,
	getProfileInformation,
	loadUpcomingMeetings,
	killSession,
	checkProfileId,
	checkMeetingId,
	checkStaleAccess
}