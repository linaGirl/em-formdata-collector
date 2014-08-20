!function(){

	var   Class 			= require('ee-class')
		, log 				= require('ee-log')
		, multiparty   	 	= require('multiparty')
		, queryString 		= require('querystring');




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

				request._reader.parse(request.getRequest(), function(err, fields, files) {
					// merge data into single object
					request._formData = {};

					this._applyToObject(request._formData, fields);
					this._applyToObject(request._formData, files);

					request._formDataLoaded = true;
					request.emit('formDataLoaded');
				}.bind(this));

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
		 * apply data to object
		 */
		, _applyToObject: function(target, source) {
			if (source) {
				Object.keys(source).forEach(function(key) {
					if (target[key]) target[key] = [target[key]];

					if (Array.isArray(target[key])) {
						target[key] = target[key].concat(source[key]);
					}
					else if (source[key].length === 1) target[key] = source[key][0];
					else target[key] = source[key];
				});
			}
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
