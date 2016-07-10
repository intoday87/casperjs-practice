var $ = require('jquery');
var DOM = {
  mainQueryInput: 'input[name=q]'
}

casper.test.begin('order to coupang', function (test) {
  casper.start('http://www.coupang.com', function (response) {
    test.assertEqual(response.status, 200, '메인 페이지 요청 성공');
  });

  casper.waitForSelector(DOM.mainQueryInput, function () {
    this.fill('form#headerSearchForm', {q: '시마노'}, true);
  });

  casper.waitForUrl(/coupang\.com\/np\/search\?q\=/, function (response) {
    test.assertEqual(response.status, 200, '검색 결과 페이지 요청 성공');
  });

  casper.waitForSelector(DOM.mainQueryInput, function () {
    var query = this.evaluate(function () {
      this.echo('document selector length : ' + document.querySelectorAll(DOM.mainQueryInput).length);
      return $(DOM.mainQueryInput).val();
    });
    
    test.assertEqual(query, '시마노', '검색어 일치');
  });
  casper.run(function () {
    this.echo('test 완료'); 
    test.done();
  });
});

