var casper = require('casper').create();
var $ = require('jquery');

function getLinks() {
	var links = document.querySelectorAll('#productList li[id] > a');
	return Array.prototype.map.call(links, function(e) {
		return e.getAttribute('href');
	});
}

casper.start('http://www.google.com', function (response) {
	this.echo('status code: ' + response.status);
	this.echo('coupang title: ' + this.getTitle());
	this.fill('form#headerSearchForm', {q: '시마노'}, true);
});

casper.then(function () {
	this.echo('search result title: ' + this.getTitle());
	this.echo(this.evaluate(getLinks).join('-'));
})

casper.run();
