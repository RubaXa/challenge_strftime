#!/usr/bin/node --harmony-generators
var assert = require('assert');

var users = ['original', 'original2', 'siranthony', 'ibnrubaxa', 'rzcoder',
	'newbiecraft', 'mapostol', 'smitterz', 'lordblackfox', 'an12345',
	'lexich121', 'sergii.shpak', 'kuchumovn', 'sairi.na.tenshi', 'juliasoft',
	'karol_wegrzycki', 'azazel', 'dm.ashurov', 'nikitin.alexandr',
	'trialforlife', 'autarc']
;

var functions = users.map(function (variant) {
	return require('./submissions/' + variant + '_strftime').strftime;
});

var filter = process.env.npm_config_filter;
var formats = ['%A, %B %d, %Y', '%F %T', '%a, %d %b %Y %H:%M:%S'];
var times = [];
var dates = [];
var count = 1000;
var testCases = [];
var testsCount = 0;
var completed = 0;
var statistics = {};
var bar;


// Testing data
function resetData() {
	for (var i = 0; i < count; i++) {
		times.push((Math.random() + 0.5) * 1e13);
		dates.push(new Date(times[i]));
	}
}


function spaces(str, len) {
	return str + new Array(len - str.length).join(' ');
}


function printWinners() {
	for (var desc in statistics) {
		var winners = statistics[desc], results = [];

		for (var name in winners) {
			var wins = winners[name];
			results.push({
				name: name,
				x: wins.reduce(function (a, b) { return a + b.x }, 0) / wins.length,
				wins: wins.reduce(function (a, b) { return a + b.win }, 0)
			});
		}

		console.log('\nWinners: ' + desc);
		console.log(new Array(60).join('-'));

		results
			.sort(function (a, b) { return b.x - a.x; })
			.forEach(function (a, i) {
				console.log(spaces('#' + (i + 1) + '. ' + a.name, 30) + ' x' + a.x.toFixed(3) + ', wins: ' + a.wins);
			})
		;
	}
}


function test(desc, callback) {
	if (filter && desc.indexOf(filter) === -1) {
		return;
	}

	statistics[desc] = {};

	testCases = testCases.concat(formats.map(function (format) {
		return function () {
			var suite = new (require('benchmark').Suite);

			// Check
			functions.forEach(function (fn, i) {
				assert.strictEqual(
					functions[0](format, dates[0]),
					fn(format, dates[0]),
					users[i]
				);

				testsCount++;
				suite.add(users[i], function () {
					callback(fn, format);
				});
			});


			suite
				.on('cycle', function (evt) {
					bar.tick();
//					console.log(evt.target.toString());
				})
				.on('complete', function () {
					resetData();

					var hz = this[0].hz;
					var results = this.sort(function (a, b) {
						a = a.stats;
						b = b.stats;
						return (a.mean + a.moe > b.mean + b.moe) ? 1 : -1;
					});


					results.forEach(function (result, i) {
						(statistics[desc][result.name] = statistics[desc][result.name] || []).push({
							x: result.hz / hz,
							win: i == 0,
							place: i + 1
						});
					});


					if (testCases.length === ++completed) {
						printWinners();
						process.exit(0);
					}
				})
			;

			suite.run({ async: true });
		};
	}));
}


//
// Tests
//
test('date', function (fn, format) {
	for (var i = 0; i < count; i++) {
		fn(format, dates[i]);
	}
});


test('timestamp', function (fn, format) {
	for (var i = 0; i < count; i++) {
		fn(format, new Date(times[i]));
	}
});


test('random', function (fn, format) {
	fn(format, new Date((Math.random() + 0.5) * 1e13));
});


test('without second argument', function (fn, format) {
	fn(format);
});


// Run
resetData();
testCases.forEach(function (run) {
	run();
});
console.log('Running:', testsCount);
bar = new (require('progress'))('Progress [:bar] :percent (:current/:total) :etas', { total: testsCount });
