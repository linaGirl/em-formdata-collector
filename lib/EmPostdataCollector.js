!function(){

	var   Class 			= require('ee-class')
		, log 				= require('ee-log')
		, Busboy   	 		= require('busboy');




	module.exports = new Class({



		/*
		 * the request method handles requests
		 *
		 * @param <Object> request object
		 * @param <Object> response object
		 * @param <Object> next callback
		 */
		request: function(request, response, next) {
			var reader;

			if (request.method === 'post' || request.method === 'put' || request.method === 'patch' || request.method === 'delete') {

				request._reader = new Busboy({headers: request.getRequest().headers});
				request._formData = {};

				// files
				request._reader.on('file', function(fieldName, data, fileName, encoding, mimetype) {
					var file = {
						  data: data
						, fileName: fileName
						, encoding: encoding
						, mimetype: mimetype
					};

					if (request._formData[fieldName]) request._formData[fieldName] = [request._formData[fieldName]];
					if (Array.isArray(request._formData[fieldName])) request._formData[fieldName].push(file);
					else request._formData[fieldName] = file;
				}.bind(this));

				// normal formdata
				request._reader.on('field', function(fieldName, value) {
					if (request._formData[fieldName]) request._formData[fieldName] = [request._formData[fieldName]];
					if (Array.isArray(request._formData[fieldName])) request._formData[fieldName].push(value);
					else request._formData[fieldName] = value;
				}.bind(this));

				// we're done
				request._reader.on('finish', function() {
					request._formDataLoaded = true;
					request.emit('formDataLoaded');
				}.bind(this));

				// pipe data  to the decoder
				request.getRequest().pipe(request._reader);

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
