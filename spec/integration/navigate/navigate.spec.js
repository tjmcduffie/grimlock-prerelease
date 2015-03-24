'use strict';

describe('The navigation element', function () {

  var locateAndClickLink = function (linkText, destId) {
    var links = element(by.tagName('nav')).all(by.tagName('a'));
    var dest = element(by.id(destId));

    dest.isDisplayed(function (isDisplayed) {
      expect(isDisplayed).toBe(false);

      links.filter(function (elem, index) {
        return elem.getText().then(function (text) {
          return text === linkText.toUpperCase();
        });
      }).then(function (filteredLinks) {
        expect(filteredLinks.length).toBe(1);
        filteredLinks.first().click();
        browser.driver.wait(dest.isDisplayed, 1255, 'The #' + destId + ' element did no come into view');
      });
    });
  };

  var showNav = function (then) {
    var nav = element(by.tagName('nav'));
    element(by.css('.hamburger')).click();
    browser.driver
        .wait(nav.isDisplayed, 500, 'The nav element did no come into view')
        .then(function (navIsDisplayed) {
          expect(navIsDisplayed).toBe(true);
          if (then && typeof then === 'function') {
            then();
          }
        });
  };

  describe('Allows the user to navigate to different locations on the page', function() {
    beforeEach(function () {
      browser.driver.manage().window().setSize(1000, 600);
      browser.get('/index.html');
    });

    it('should have three visible options', function() {
      var links = element(by.tagName('nav')).all(by.tagName('a'));
      expect( links.count() ).toBe(4);

      links.filter(function (elem, index) {
        return elem.isDisplayed().then(function (isDisplayed) {
          return isDisplayed;
        });
      }).then(function (filteredLinks) {
        expect(filteredLinks.length).toBe(3);
      });
    });

    it('should have an "about" options', function() {
      locateAndClickLink('about', 'about');
    });

    it('should have an "work" options', function() {
      locateAndClickLink('work', 'work');
    });

    it('should have an "contact" options', function() {
      locateAndClickLink('contact', 'contact');
    });
  });

  describe('At small and medium breakpoints', function () {
    beforeEach(function () {
      browser.driver.manage().window().setSize(500, 600);
      browser.get('/index.html');
    });

    it('nav elements should be hidden behind the hamburger', function () {
      element(by.tagName('nav')).isDisplayed().then(function (isDisplayed) {
        expect(isDisplayed).toBe(false);
        showNav();
      });
    });

    it('"home" should be the new first option in the nav', function() {
      showNav(function () {
        var links = element(by.tagName('nav')).all(by.tagName('a'));

        expect(links.count()).toBe(4);
        links.first().getText().then(function (text) {
          expect(text).toBe('HOME');
        });
      });
    });

    it('the home link should allow the user to scroll back to the "title card"', function() {
      showNav(function () {
        var links = element(by.tagName('nav')).all(by.tagName('a'));

        // click on the last nav element and make sure it has been scrolled into view.
        links.get(-1).getAttribute('href').then(function (href) {
          var destId = href.substr(href.indexOf('#') + 1);
          var dest = element(by.id(destId));

          links.get(-1).click();
          browser.driver
              .wait(dest.isDisplayed, 1255, 'The #' + destId + ' element did no come into view')
              .then(function (destIsDisplayed) {
                // check that the last link destination is now in view
                expect(destIsDisplayed).toBe(true);

                // now navigate back to the title screen
                locateAndClickLink('home', 'title');
              });
        });
      });
    });
  });
});