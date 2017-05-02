# em-formdata-collector

[![Greenkeeper badge](https://badges.greenkeeper.io/eventEmitter/em-formdata-collector.svg)](https://greenkeeper.io/)

Formdata collector middleware for ee-webservice

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