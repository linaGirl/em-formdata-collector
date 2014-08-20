
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, assert 		= require('assert')
		, travis 		= require('ee-travis')
		, fs 			= require('fs');



	var   Collector 	= require('../')
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




	var checkMessage = function(message){
		var hash = '';

		Object.keys(message).forEach(function(key){
			if (Array.isArray(message[key])) {
				message[key].forEach(function(item){
					hash += md5(item);
				});
			}
			else hash += md5(message[key]);
		});

		//log(hash);

		return hash;
	}

	



	describe('The Collector', function(){
		var service = new Webservice(config);

		before(function(done){
			service.use(new Collector());
			service.listen(done);

			
		});



		it('Should be able to collect mutlipart form data', function(done){	
			service.use({request: function(request, response, next){
				if (request.pathname === '/test1') {
					request.getForm(function(data) {
						assert.equal('fb93818d01553e9fead6873b780580aefb93818d01553e9fead6873b780580aec239dddc9c7a19eef9af0052da451a8ac239dddc9c7a19eef9af0052da451a8a', checkMessage(data), 'extracted message is incorrect!');
						done();
						response.send(200);
					});
				}
				else next();
			}});				

			var   r = request.post('http://127.0.0.1:13015/test1')
				, form = r.form();

			form.append('email', 'michael@joinbox.com');
			form.append('email', 'michael@joinbox.com');
			form.append('password', 'securePassword');
			form.append('password', 'securePassword');
		});


		it('Should be able to collect simple form data', function(done){
			service.use({request: function(request, response, next){
				if (request.pathname === '/test2') {
					request.getForm(function(data){
						assert.equal('fb93818d01553e9fead6873b780580aec239dddc9c7a19eef9af0052da451a8a', checkMessage(data), 'extracted message is incorrect!');
						done();
						response.send(200);
					});
				}
				else next();
			}});				

			request.post('http://127.0.0.1:13015/test2', {form: {
				  email: 'michael@joinbox.com'
				, password: 'securePassword'
			}});
		});



		it('Should be able to collect simple form data with numbers as identifiers', function(done){
			service.use({request: function(request, response, next){
				if (request.pathname === '/test3') {
					request.getForm(function(data){
						assert.equal('3e4d891a5df3d6d0d7dd9432a1bc6470', checkMessage(data), 'extracted message is incorrect!');
						done();
						response.send(200);
					});
				}
				else next();
			}});				

			request.post('http://127.0.0.1:13015/test3', {form: {
				  '6': 'accepted'
			}});
		});


/*
		it('Should be able to receive files', function(done){
			service.use({request: function(request, response, next){
				if (request.pathname === '/test4') {
					request.getForm(function(data) { log(data);
						assert.equal('3e4d891a5df3d6d0d7dd9432a1bc6470', checkMessage(data), 'extracted message is incorrect!');
						done();
						response.send(200);
					});
				}
				else next();
			}});


			request.post('http://127.0.0.1:13015/test4', {
				  headers: {'Content-Type':'multipart/form-data; boundary=----WebKitFormBoundaryRllKRlFP5x7VqlPF'}
				, body: fs.readFileSync(__dirname+'/msg8.mime')
			});
		});
*/

		after(function(){
			//service.close();
		});
	});
	