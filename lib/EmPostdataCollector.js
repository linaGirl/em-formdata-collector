!function(){

	var   Class 			= require('ee-class')
		, log 				= require('ee-log')
		, multiparty   	 	= require('multiparty')
		, queryString 		= require('querystring')
		, StreamCollector 	= require('ee-stream-collector');




	module.exports = new Class({



		/*
		 * the request method handles requests
		 *
		 * @param <Object> request object
		 * @param <Object> response object
		 * @param <Object> next callback
		 */
		request: function(request, response, next) {
			var   contentType = request.hasHeader('content-type') ? request.getHeader('content-type') : ''
				, parts;

		

			if (/multipart\/form-data/i.test(contentType)) {
				request._reader = new multiparty.Form();
				request._formData = {};

				request._reader.on('part', function(part) {
					var collector = new StreamCollector();

					collector.on('end', function(fileData) {
						var data;

						if (part.filename) {
							var data = {
								  filename 		: part.filename
								, headers 		: part.headers
								, data 			: fileData
							};
						}
						else data = fileData.toString();

						if (request._formData[part.name]) request._formData[part.name] = [request._formData[part.name]];
						if (Array.isArray(request._formData[part.name])) request._formData[part.name].push(data);
						else request._formData[part.name] = data;
					}.bind(this));					

					part.pipe(collector);
				}.bind(this));

				request._reader.on('close', function() {
					request._formDataLoaded = true;
					request.emit('formDataLoaded');
				}.bind(this));

				
				request._reader.on('error', function(err) {
					log.warn('multipart decoder failed to decode message:', err);
				}.bind(this));

				request._reader.parse(request.getRequest());

				request.getForm = this._getForm.bind(request);
			}
			else if (/application\/x-www-form-urlencoded/gi.test(contentType)) {
				parts = [];
				request.getRequest().on('data', function(chunk) {
					parts.push(chunk);
				}.bind(this));

				request.getRequest().on('end', function() {
					try {
						request._formData = queryString.parse(Buffer.concat(parts).toString());
					} catch (e) {
						request._formData = {};
					}

					this._formDataLoaded = true;
					this.emit('formDataLoaded');
				}.bind(request));

				request.getForm = this._getForm.bind(request);
			}

			next();
		}



		/*
		 * the _getPostData method waits until all data on the request was 
		 * received and calls then the callback
		 *
		 * @param <Object>
		 */
		, _getForm: function(callback) {
			if (this._formDataLoaded) {
				callback(this._formData);
			}
			else {
				// wait until the request has ended and all data was received
				this.on('formDataLoaded', function(){
					callback(this._formData);
				}.bind(this));
			}
		}
	});
}();
