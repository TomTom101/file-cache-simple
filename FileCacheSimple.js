"use strict";

const jetpack = require('fs-jetpack');
const extend = require('extend');

const path = require('path');
const util = require('util');

const DEFAULT_OPTIONS = {
	'cacheDir': process.cwd() + '/cache',
	'cacheExpire': 3600 * 1000, // 1hr
	'prefix': 'cs'
};

let FileCacheSimple = function(options) {
	this._options = (options) ? extend(true, DEFAULT_OPTIONS, options) : DEFAULT_OPTIONS;
	this._fs = jetpack.cwd(this._options.cacheDir);
};

FileCacheSimple.prototype.set = function(key, value) {
	let cacheFile = util.format('%s.%s.json', this._options.prefix, key);
	let cacheObj = {
		'cachedOn': (new Date()).toISOString(),
		'content': value
	};
	this._fs.writeAsync(cacheFile, cacheObj);
};

FileCacheSimple.prototype.get = function(key) {
	let self = this;
	return new Promise(function(resolve, reject) {
		let cacheFile = util.format('%s.%s.json', self._options.prefix, key);
		self._fs.readAsync(cacheFile, 'jsonWithDates')
			.then(function(cache) {
				if(!cache || cache === null) {
					return resolve(null);
				}

				let currentTime = (new Date()).getTime();
				if(currentTime - cache.cachedOn >= self._options.cacheExpire) {
					return resolve(null);
				}
				return resolve(cache.content);
			})
			.catch(reject);
	});
};

exports = module.exports = FileCacheSimple;