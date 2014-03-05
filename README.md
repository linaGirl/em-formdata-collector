# em-formdata-collector

description

## installation

npm install em-formdata-collector


## build status

[![Build Status](https://travis-ci.org/eventEmitter/em-formdata-collector.png?branch=master)](https://travis-ci.org/eventEmitter/em-formdata-collector)


## usage


	webservice.use(new formDataCollector());


	webservice.use({
		request: function(request, response, next){
			request.getForm(function(data){
				log(data);
			});
		}
	});