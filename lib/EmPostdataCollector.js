!function(){

	var   Class 			= require('ee-class')
		, log 				= require('ee-log')
		, FormdataReader   	= require('ee-formdata-reader');



	module.exports = new Class({



		/*
		 * class constructor
		 *
		 * @param <Object> options -> limits
		 */
		init: function(options) {
			this.maxLength 			= options.maxLength;
			this.maxFormdataLength 	= options.maxFormdataLength
			this.maxFileLength 		= options.maxFileLength
			this.cachePath 			= options.cachePath;
			this.cacheId 			= options.cacheId;
		}



		/*
		 * the request method handles requests
		 *
		 * @param <Object> request object
		 * @param <Object> response object
		 * @param <Object> next callback
		 */
		, request: function(request, response, next) {
			var reader;

			if (request.method === 'post' || request.method === 'put' || request.method === 'patch' || request.method === 'delete') {
				request._reader = reader = new FormdataReader({
					  request: 				request
					, maxLength: 			this.maxLength
				    , maxFormdataLength: 	this.maxFormdataLength
				    , maxFileLength: 		this.maxFileLength
				    , cachePath: 			this.cachePath
				    , cacheId: 				this.cacheId
				});

				reader.on('end', this._handleReaderEnd.bind(request));

				request.getForm = this._getForm.bind(request);
			}

			next();
		}



		/*
		 * the _hanldeDecoderEnd method gets called when all data was received
		 *
		 */
		, _handleReaderEnd: function() {
			this._dataReceived = true;
			this.emit('dataReceived');
		}

		
		

		/*
		 * the _getPostData method waits until all data on the request was 
		 * received and calls then the callback
		 *
		 * @param <Object>
		 */
		, _getForm: function(callback) {
			if (this._dataReceived) {
				callback(request._reader.getForm());
			}
			else {
				// wait until the request has ended and all data was received
				this.on('dataReceived', function(){
					callback(this._reader.getForm());
				}.bind(this));
			}
		}
	});
}();
