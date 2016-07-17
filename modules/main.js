var $ = require('jquery');
var SELECTORS = {
  departure               : '#txtDepStn1',
  destination             : '',
  destinationPopupLayer   : '.layerWrap',
  kimpoAirportBtn         : '[aircode="GMP"]',
  jejuAirportBtn          : '[aircode="CJU"]',
  reservationCalendar     : '#DoubleCalendar',
  calendarToSelectDate    : {
    departure  : {
      notHighlighted: '#doubleCal1 a.ui-state-default:not(.ui-state-highlight)',
      availableDate : '#availableDepartueDate',
    },
    destination: {
      notHighlighted: '#doubleCal2 a.ui-state-default:not(.ui-state-highlight)',
      availableDate : '#availableArrivalDate',
    }
  },
  selectDateBtn           : '#btnDoubleOk',
  reservationBtn          : '#reservation',
  departurePrice          : '[name="strDep"]',
  destinationPrice        : '[name="strRet"]',
  departureInfoTableBody  : '#tbodyDep',
  destinationInfoTableBody: '#tbodyRet',
  roundTripTab            : '#tripTypeRT'
};

casper.test.begin('제주항공에서 김포 -> 제주 가장 낮은 가격 티켓 알아보기 테스트', function (test) {
  casper.start('http://www.jejuair.net/', function (response) {
    test.assertEqual(response.status, 200, '사이트 접속 성공');
  });

  casper.then(function () {
    this.click(SELECTORS.departure);
  });

  casper.waitUntilVisible(SELECTORS.destinationPopupLayer, function () {
      this.click(SELECTORS.kimpoAirportBtn);
    },
    function () {
      this.die('목적지 팝업 레이어가 확인되지 않습니다.');
    }, 1000);

  casper.waitUntilVisible(SELECTORS.destinationPopupLayer, function () {
    var title = this.evaluate(function (layerSelector) {
      return $(layerSelector).find('#hRoute').text();
    }, SELECTORS.destinationPopupLayer);

    test.assertEqual(title, '도착지 선택', '도착지 선택 레이어 팝업 타이틀 일치');
  });

  casper.then(function () {
    this.click(SELECTORS.jejuAirportBtn);
  });

  function setSelectorToAvailableDate(availableSelector, dateSelector, nthDate) {
    if (!nthDate) nthDate = 0;
    var AVAILABLE_ID_NAME = availableSelector.replace(/\W+/, '');
    casper.evaluate(function (departureCalendarDateNotHighlightedSelector, availableIdName, nthDate) {
      return $(departureCalendarDateNotHighlightedSelector).eq(nthDate).attr('id', availableIdName).text();
    }, dateSelector, AVAILABLE_ID_NAME, nthDate);
  }

  function extractAvaliableDate(availableSelector) {
    return casper.evaluate(function (availableSelector) {
      return $(availableSelector).text();
    }, availableSelector);
  }

  casper.waitUntilVisible(SELECTORS.reservationCalendar, function () {
    setSelectorToAvailableDate(SELECTORS.calendarToSelectDate.departure.availableDate, SELECTORS.calendarToSelectDate.departure.notHighlighted, 1);
    this.echo(extractAvaliableDate(SELECTORS.calendarToSelectDate.departure.availableDate) + '로 출발 날짜 선택');
    test.assertExist(SELECTORS.calendarToSelectDate.departure.availableDate, '출발 선택 가능한 날짜 지정');
  });

  casper.then(function () {
    this.click(SELECTORS.calendarToSelectDate.departure.availableDate);
  });

  casper.then(function () {
    setSelectorToAvailableDate(SELECTORS.calendarToSelectDate.destination.availableDate, SELECTORS.calendarToSelectDate.destination.notHighlighted, 2);
    this.echo(extractAvaliableDate(SELECTORS.calendarToSelectDate.destination.availableDate) + '로 도착 날짜 선택');
    test.assertExist(SELECTORS.calendarToSelectDate.destination.availableDate, '도착 선택 가능한 날짜 지정');
  });

  casper.then(function () {
    this.click(SELECTORS.calendarToSelectDate.destination.availableDate);
  });

  casper.then(function () {
    test.assertExist(SELECTORS.selectDateBtn, '날짜 선택 버튼 존재');
  });

  casper.then(function () {
    this.click(SELECTORS.selectDateBtn);
  });

  casper.waitWhileVisible(SELECTORS.reservationCalendar, function () {
    this.click(SELECTORS.reservationBtn);
  }, function () {
    this.die('날짜 선택 레이어 팝업이 닫혀지지 않았습니다');
  }, 1000);

  casper.waitForUrl('jejuair\/com\/jeju\/ibe\/goAvail.do',
    function (response) {
      test.assertEqual(response.status, 200, '검색 결과 페이지 요청 성공');
    }, function () {
      this.echo(this.getCurrentUrl());
      this.die('검색 결과 페이지 요청 실패');
    },
    10000);

  casper.waitForSelector(SELECTORS.roundTripTab, function () {
    test.assertExist(SELECTORS.roundTripTab + '.active', '왕복탭 활성화');
  });

  casper.waitForSelector(SELECTORS.departureInfoTableBody
    , function () {
      test.assertExists(SELECTORS.departureInfoTableBody, '출발지 가격 정보 테이블 존재');
    }, function () {
      this.die('출발지 가격 정보 리스트 정보 조회 실패');
    }, 5000);

  casper.waitForSelector(SELECTORS.destinationInfoTableBody
    , function () {
      test.assertExists(SELECTORS.destinationInfoTableBody, '도착지 가격 정보 테이블 존재');
    }, function () {
      this.die('도착지 가격 정보 리스트 정보 조회 실패');
    }, 5000);

  function extractFilghtInfo(tableBodySelector, priceSelector) {
    return casper.evaluate(function (tableBodySelector, priceSelector) {
      var arr = [];

      $(tableBodySelector).find(priceSelector).each(function () {
        var $elem = $(this);
        arr.push({
          departureTime: $elem.closest('tr').find('td:nth-child(2)').text(),
          arrivalTime  : $elem.closest('tr').find('td:nth-child(3)').text(),
          price        : $elem.text().replace(/\D+/g, '')
        });
      });

      return arr;
    }, tableBodySelector, priceSelector);
  }

  casper.then(function () {
    var records = extractFilghtInfo(SELECTORS.departureInfoTableBody, SELECTORS.departurePrice);

    if (records.length) {
      records.sort(function (v1, v2) {
        return v1.price < v2.price;
      });

      this.echo('출발지 가장 낮은 가격: ' + records[0].price + ', 출발시간: ' + records[0].departureTime + ', 도착시간: ' + records[0].arrivalTime);
    } else {
      this.echo('출발지 가격이 존재하지 않음');
    }
  });

  casper.then(function () {
    var records = extractFilghtInfo(SELECTORS.destinationInfoTableBody, SELECTORS.destinationPrice);

    if (records.length) {
      records.sort(function (v1, v2) {
        return v1.price < v2.price;
      });

      this.echo('도착지 가장 낮은 가격: ' + records[0].price + ', 출발시간: ' + records[0].departureTime + ', 도착시간: ' + records[0].arrivalTime);
    } else {
      this.echo('도착지 가격이 존재하지 않음');
    }
  });

  casper.run(function () {
    this.echo('all test is done.');
    test.done();
  });
});
