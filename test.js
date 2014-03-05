
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log');



	var   Collector 	= require('./')
		, Webservice 	= require('ee-webservice')
		, request 		= require('request')	
		, crypto 			= require('crypto');


	var md5 = function(buf){
		return crypto.createHash('md5').update(buf).digest('hex');
	}


	var config = {
		  port: 13015
		, interface: 0
	};






	var service = new Webservice(config);

	service.use(new Collector());

	service.use({request: function(request, response, next){
		request.getForm(function(data){
			log(data);
			//assert.equal('fb93818d01553e9fead6873b780580aefb93818d01553e9fead6873b780580aec239dddc9c7a19eef9af0052da451a8ac239dddc9c7a19eef9af0052da451a8a', checkMessage(data), 'extracted message is incorrect!');
			
		});
	}});	

	service.listen(function(){
		request.post('http://127.0.0.1:13015/test1', {form: {
			  email: 'michael@joinbox.com'
			, password: 'securePassword'
		}});
	});

