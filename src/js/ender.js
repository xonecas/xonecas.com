/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://ender.no.de)
  * Build: ender build moment domready hogan.js-template qwery bonzo
  * =============================================================
  */

/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011-2012 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
(function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context['$']
    , oldRequire = context['require']
    , oldProvide = context['provide']

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules['$' + identifier] || window[identifier]
    if (!module) throw new Error("Ender Error: Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules['$' + name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  /**
   * main Ender return object
   * @constructor
   * @param {Array|Node|string} s a CSS selector or DOM node(s)
   * @param {Array.|Node} r a root node(s)
   */
  function Ender(s, r) {
    var elements
      , i

    this.selector = s
    // string || node || nodelist || window
    if (typeof s == 'undefined') {
      elements = []
      this.selector = ''
    } else if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      elements = ender._select(s, r)
    } else {
      elements = isFinite(s.length) ? s : [s]
    }
    this.length = elements.length
    for (i = this.length; i--;) this[i] = elements[i]
  }

  /**
   * @param {function(el, i, inst)} fn
   * @param {Object} opt_scope
   * @returns {Ender}
   */
  Ender.prototype['forEach'] = function (fn, opt_scope) {
    var i, l
    // opt out of native forEach so we can intentionally call our own scope
    // defaulting to the current item and be able to return self
    for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(opt_scope || this[i], this[i], i, this)
    // return self for chaining
    return this
  }

  Ender.prototype.$ = ender // handy reference to self


  function ender(s, r) {
    return new Ender(s, r)
  }

  ender['_VERSION'] = '0.4.3-dev'

  ender.fn = Ender.prototype // for easy compat to jQuery plugins

  ender.ender = function (o, chain) {
    aug(chain ? Ender.prototype : ender, o)
  }

  ender._select = function (s, r) {
    if (typeof s == 'string') return (r || document).querySelectorAll(s)
    if (s.nodeName) return [s]
    return s
  }


  // use callback to receive Ender's require & provide
  ender.noConflict = function (callback) {
    context['$'] = old
    if (callback) {
      context['provide'] = oldProvide
      context['require'] = oldRequire
      callback(require, provide, this)
    }
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this));


(function () {

  var module = { exports: {} }, exports = module.exports;

  // moment.js
  // version : 1.6.2
  // author : Tim Wood
  // license : MIT
  // momentjs.com
  
  (function (Date, undefined) {
  
      var moment,
          VERSION = "1.6.2",
          round = Math.round, i,
          // internal storage for language config files
          languages = {},
          currentLanguage = 'en',
  
          // check for nodeJS
          hasModule = (typeof module !== 'undefined'),
  
          // parameters to check for on the lang config
          langConfigProperties = 'months|monthsShort|monthsParse|weekdays|weekdaysShort|longDateFormat|calendar|relativeTime|ordinal|meridiem'.split('|'),
  
          // ASP.NET json date format regex
          aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
  
          // format tokens
          formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|dddd?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|zz?|ZZ?|LT|LL?L?L?)/g,
  
          // parsing tokens
          parseMultipleFormatChunker = /([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi,
  
          // parsing token regexes
          parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
          parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
          parseTokenThreeDigits = /\d{3}/, // 000 - 999
          parseTokenFourDigits = /\d{4}/, // 0000 - 9999
          parseTokenWord = /[0-9a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+/i, // any word characters or numbers
          parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, // +00:00 -00:00 +0000 -0000 or Z
          parseTokenT = /T/i, // T (ISO seperator)
  
          // preliminary iso regex 
          // 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000
          isoRegex = /^\s*\d{4}-\d\d-\d\d(T(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
          isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',
  
          // iso time formats and regexes
          isoTimes = [
              ['HH:mm:ss.S', /T\d\d:\d\d:\d\d\.\d{1,3}/],
              ['HH:mm:ss', /T\d\d:\d\d:\d\d/],
              ['HH:mm', /T\d\d:\d\d/],
              ['HH', /T\d\d/]
          ],
  
          // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
          parseTimezoneChunker = /([\+\-]|\d\d)/gi,
  
          // getter and setter names
          proxyGettersAndSetters = 'Month|Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
          unitMillisecondFactors = {
              'Milliseconds' : 1,
              'Seconds' : 1e3,
              'Minutes' : 6e4,
              'Hours' : 36e5,
              'Days' : 864e5,
              'Months' : 2592e6,
              'Years' : 31536e6
          };
  
      // Moment prototype object
      function Moment(date, isUTC) {
          this._d = date;
          this._isUTC = !!isUTC;
      }
  
      function absRound(number) {
          if (number < 0) {
              return Math.ceil(number);
          } else {
              return Math.floor(number);
          }
      }
  
      // Duration Constructor
      function Duration(duration) {
          var data = this._data = {},
              years = duration.years || duration.y || 0,
              months = duration.months || duration.M || 0, 
              weeks = duration.weeks || duration.w || 0,
              days = duration.days || duration.d || 0,
              hours = duration.hours || duration.h || 0,
              minutes = duration.minutes || duration.m || 0,
              seconds = duration.seconds || duration.s || 0,
              milliseconds = duration.milliseconds || duration.ms || 0;
  
          // representation for dateAddRemove
          this._milliseconds = milliseconds +
              seconds * 1e3 + // 1000
              minutes * 6e4 + // 1000 * 60
              hours * 36e5; // 1000 * 60 * 60
          // Because of dateAddRemove treats 24 hours as different from a
          // day when working around DST, we need to store them separately
          this._days = days +
              weeks * 7;
          // It is impossible translate months into days without knowing
          // which months you are are talking about, so we have to store
          // it separately.
          this._months = months +
              years * 12;
              
          // The following code bubbles up values, see the tests for
          // examples of what that means.
          data.milliseconds = milliseconds % 1000;
          seconds += absRound(milliseconds / 1000);
  
          data.seconds = seconds % 60;
          minutes += absRound(seconds / 60);
  
          data.minutes = minutes % 60;
          hours += absRound(minutes / 60);
  
          data.hours = hours % 24;
          days += absRound(hours / 24);
  
          days += weeks * 7;
          data.days = days % 30;
          
          months += absRound(days / 30);
  
          data.months = months % 12;
          years += absRound(months / 12);
  
          data.years = years;
      }
  
      // left zero fill a number
      // see http://jsperf.com/left-zero-filling for performance comparison
      function leftZeroFill(number, targetLength) {
          var output = number + '';
          while (output.length < targetLength) {
              output = '0' + output;
          }
          return output;
      }
  
      // helper function for _.addTime and _.subtractTime
      function addOrSubtractDurationFromMoment(mom, duration, isAdding) {
          var ms = duration._milliseconds,
              d = duration._days,
              M = duration._months,
              currentDate;
  
          if (ms) {
              mom._d.setTime(+mom + ms * isAdding);
          }
          if (d) {
              mom.date(mom.date() + d * isAdding);
          }
          if (M) {
              currentDate = mom.date();
              mom.date(1)
                  .month(mom.month() + M * isAdding)
                  .date(Math.min(currentDate, mom.daysInMonth()));
          }
      }
  
      // check if is an array
      function isArray(input) {
          return Object.prototype.toString.call(input) === '[object Array]';
      }
  
      // convert an array to a date.
      // the array should mirror the parameters below
      // note: all values past the year are optional and will default to the lowest possible value.
      // [year, month, day , hour, minute, second, millisecond]
      function dateFromArray(input) {
          return new Date(input[0], input[1] || 0, input[2] || 1, input[3] || 0, input[4] || 0, input[5] || 0, input[6] || 0);
      }
  
      // format date using native date object
      function formatMoment(m, inputString) {
          var currentMonth = m.month(),
              currentDate = m.date(),
              currentYear = m.year(),
              currentDay = m.day(),
              currentHours = m.hours(),
              currentMinutes = m.minutes(),
              currentSeconds = m.seconds(),
              currentMilliseconds = m.milliseconds(),
              currentZone = -m.zone(),
              ordinal = moment.ordinal,
              meridiem = moment.meridiem;
          // check if the character is a format
          // return formatted string or non string.
          //
          // uses switch/case instead of an object of named functions (like http://phpjs.org/functions/date:380)
          // for minification and performance
          // see http://jsperf.com/object-of-functions-vs-switch for performance comparison
          function replaceFunction(input) {
              // create a couple variables to be used later inside one of the cases.
              var a, b;
              switch (input) {
                  // MONTH
              case 'M' :
                  return currentMonth + 1;
              case 'Mo' :
                  return (currentMonth + 1) + ordinal(currentMonth + 1);
              case 'MM' :
                  return leftZeroFill(currentMonth + 1, 2);
              case 'MMM' :
                  return moment.monthsShort[currentMonth];
              case 'MMMM' :
                  return moment.months[currentMonth];
              // DAY OF MONTH
              case 'D' :
                  return currentDate;
              case 'Do' :
                  return currentDate + ordinal(currentDate);
              case 'DD' :
                  return leftZeroFill(currentDate, 2);
              // DAY OF YEAR
              case 'DDD' :
                  a = new Date(currentYear, currentMonth, currentDate);
                  b = new Date(currentYear, 0, 1);
                  return ~~ (((a - b) / 864e5) + 1.5);
              case 'DDDo' :
                  a = replaceFunction('DDD');
                  return a + ordinal(a);
              case 'DDDD' :
                  return leftZeroFill(replaceFunction('DDD'), 3);
              // WEEKDAY
              case 'd' :
                  return currentDay;
              case 'do' :
                  return currentDay + ordinal(currentDay);
              case 'ddd' :
                  return moment.weekdaysShort[currentDay];
              case 'dddd' :
                  return moment.weekdays[currentDay];
              // WEEK OF YEAR
              case 'w' :
                  a = new Date(currentYear, currentMonth, currentDate - currentDay + 5);
                  b = new Date(a.getFullYear(), 0, 4);
                  return ~~ ((a - b) / 864e5 / 7 + 1.5);
              case 'wo' :
                  a = replaceFunction('w');
                  return a + ordinal(a);
              case 'ww' :
                  return leftZeroFill(replaceFunction('w'), 2);
              // YEAR
              case 'YY' :
                  return leftZeroFill(currentYear % 100, 2);
              case 'YYYY' :
                  return currentYear;
              // AM / PM
              case 'a' :
                  return meridiem ? meridiem(currentHours, currentMinutes, false) : (currentHours > 11 ? 'pm' : 'am');
              case 'A' :
                  return meridiem ? meridiem(currentHours, currentMinutes, true) : (currentHours > 11 ? 'PM' : 'AM');
              // 24 HOUR
              case 'H' :
                  return currentHours;
              case 'HH' :
                  return leftZeroFill(currentHours, 2);
              // 12 HOUR
              case 'h' :
                  return currentHours % 12 || 12;
              case 'hh' :
                  return leftZeroFill(currentHours % 12 || 12, 2);
              // MINUTE
              case 'm' :
                  return currentMinutes;
              case 'mm' :
                  return leftZeroFill(currentMinutes, 2);
              // SECOND
              case 's' :
                  return currentSeconds;
              case 'ss' :
                  return leftZeroFill(currentSeconds, 2);
              // MILLISECONDS
              case 'S' :
                  return ~~ (currentMilliseconds / 100);
              case 'SS' :
                  return leftZeroFill(~~(currentMilliseconds / 10), 2);
              case 'SSS' :
                  return leftZeroFill(currentMilliseconds, 3);
              // TIMEZONE
              case 'Z' :
                  return (currentZone < 0 ? '-' : '+') + leftZeroFill(~~(Math.abs(currentZone) / 60), 2) + ':' + leftZeroFill(~~(Math.abs(currentZone) % 60), 2);
              case 'ZZ' :
                  return (currentZone < 0 ? '-' : '+') + leftZeroFill(~~(10 * Math.abs(currentZone) / 6), 4);
              // LONG DATES
              case 'L' :
              case 'LL' :
              case 'LLL' :
              case 'LLLL' :
              case 'LT' :
                  return formatMoment(m, moment.longDateFormat[input]);
              // DEFAULT
              default :
                  return input.replace(/(^\[)|(\\)|\]$/g, "");
              }
          }
          return inputString.replace(formattingTokens, replaceFunction);
      }
  
      // get the regex to find the next token
      function getParseRegexForToken(token) {
          switch (token) {
          case 'DDDD':
              return parseTokenThreeDigits;
          case 'YYYY':
              return parseTokenFourDigits;
          case 'S':
          case 'SS':
          case 'SSS':
          case 'DDD':
              return parseTokenOneToThreeDigits;
          case 'MMM':
          case 'MMMM':
          case 'ddd':
          case 'dddd':
          case 'a':
          case 'A':
              return parseTokenWord;
          case 'Z':
          case 'ZZ':
              return parseTokenTimezone;
          case 'T':
              return parseTokenT;
          case 'MM':
          case 'DD':
          case 'dd':
          case 'YY':
          case 'HH':
          case 'hh':
          case 'mm':
          case 'ss':
          case 'M':
          case 'D':
          case 'd':
          case 'H':
          case 'h':
          case 'm':
          case 's':
              return parseTokenOneOrTwoDigits;
          default :
              return new RegExp(token.replace('\\', ''));
          }
      }
  
      // function to convert string input to date
      function addTimeToArrayFromToken(token, input, datePartArray, config) {
          var a;
          //console.log('addTime', format, input);
          switch (token) {
          // MONTH
          case 'M' : // fall through to MM
          case 'MM' :
              datePartArray[1] = (input == null) ? 0 : ~~input - 1;
              break;
          case 'MMM' : // fall through to MMMM
          case 'MMMM' :
              for (a = 0; a < 12; a++) {
                  if (moment.monthsParse[a].test(input)) {
                      datePartArray[1] = a;
                      break;
                  }
              }
              break;
          // DAY OF MONTH
          case 'D' : // fall through to DDDD
          case 'DD' : // fall through to DDDD
          case 'DDD' : // fall through to DDDD
          case 'DDDD' :
              datePartArray[2] = ~~input;
              break;
          // YEAR
          case 'YY' :
              input = ~~input;
              datePartArray[0] = input + (input > 70 ? 1900 : 2000);
              break;
          case 'YYYY' :
              datePartArray[0] = ~~Math.abs(input);
              break;
          // AM / PM
          case 'a' : // fall through to A
          case 'A' :
              config.isPm = ((input + '').toLowerCase() === 'pm');
              break;
          // 24 HOUR
          case 'H' : // fall through to hh
          case 'HH' : // fall through to hh
          case 'h' : // fall through to hh
          case 'hh' :
              datePartArray[3] = ~~input;
              break;
          // MINUTE
          case 'm' : // fall through to mm
          case 'mm' :
              datePartArray[4] = ~~input;
              break;
          // SECOND
          case 's' : // fall through to ss
          case 'ss' :
              datePartArray[5] = ~~input;
              break;
          // MILLISECOND
          case 'S' :
          case 'SS' :
          case 'SSS' :
              datePartArray[6] = ~~ (('0.' + input) * 1000);
              break;
          // TIMEZONE
          case 'Z' : // fall through to ZZ
          case 'ZZ' :
              config.isUTC = true;
              a = (input + '').match(parseTimezoneChunker);
              if (a && a[1]) {
                  config.tzh = ~~a[1];
              }
              if (a && a[2]) {
                  config.tzm = ~~a[2];
              }
              // reverse offsets
              if (a && a[0] === '+') {
                  config.tzh = -config.tzh;
                  config.tzm = -config.tzm;
              }
              break;
          }
      }
  
      // date from string and format string
      function makeDateFromStringAndFormat(string, format) {
          var datePartArray = [0, 0, 1, 0, 0, 0, 0],
              config = {
                  tzh : 0, // timezone hour offset
                  tzm : 0  // timezone minute offset
              },
              tokens = format.match(formattingTokens),
              i, parsedInput;
  
          for (i = 0; i < tokens.length; i++) {
              parsedInput = (getParseRegexForToken(tokens[i]).exec(string) || [])[0];
              string = string.replace(getParseRegexForToken(tokens[i]), '');
              addTimeToArrayFromToken(tokens[i], parsedInput, datePartArray, config);
          }
          // handle am pm
          if (config.isPm && datePartArray[3] < 12) {
              datePartArray[3] += 12;
          }
          // if is 12 am, change hours to 0
          if (config.isPm === false && datePartArray[3] === 12) {
              datePartArray[3] = 0;
          }
          // handle timezone
          datePartArray[3] += config.tzh;
          datePartArray[4] += config.tzm;
          // return
          return config.isUTC ? new Date(Date.UTC.apply({}, datePartArray)) : dateFromArray(datePartArray);
      }
  
      // compare two arrays, return the number of differences
      function compareArrays(array1, array2) {
          var len = Math.min(array1.length, array2.length),
              lengthDiff = Math.abs(array1.length - array2.length),
              diffs = 0,
              i;
          for (i = 0; i < len; i++) {
              if (~~array1[i] !== ~~array2[i]) {
                  diffs++;
              }
          }
          return diffs + lengthDiff;
      }
  
      // date from string and array of format strings
      function makeDateFromStringAndArray(string, formats) {
          var output,
              inputParts = string.match(parseMultipleFormatChunker) || [],
              formattedInputParts,
              scoreToBeat = 99,
              i,
              currentDate,
              currentScore;
          for (i = 0; i < formats.length; i++) {
              currentDate = makeDateFromStringAndFormat(string, formats[i]);
              formattedInputParts = formatMoment(new Moment(currentDate), formats[i]).match(parseMultipleFormatChunker) || [];
              currentScore = compareArrays(inputParts, formattedInputParts);
              if (currentScore < scoreToBeat) {
                  scoreToBeat = currentScore;
                  output = currentDate;
              }
          }
          return output;
      }
  
      // date from iso format
      function makeDateFromString(string) {
          var format = 'YYYY-MM-DDT',
              i;
          if (isoRegex.exec(string)) {
              for (i = 0; i < 4; i++) {
                  if (isoTimes[i][1].exec(string)) {
                      format += isoTimes[i][0];
                      break;
                  }
              }
              return parseTokenTimezone.exec(string) ? 
                  makeDateFromStringAndFormat(string, format + ' Z') :
                  makeDateFromStringAndFormat(string, format);
          }
          return new Date(string);
      }
  
      // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
      function substituteTimeAgo(string, number, withoutSuffix, isFuture) {
          var rt = moment.relativeTime[string];
          return (typeof rt === 'function') ?
              rt(number || 1, !!withoutSuffix, string, isFuture) :
              rt.replace(/%d/i, number || 1);
      }
  
      function relativeTime(milliseconds, withoutSuffix) {
          var seconds = round(Math.abs(milliseconds) / 1000),
              minutes = round(seconds / 60),
              hours = round(minutes / 60),
              days = round(hours / 24),
              years = round(days / 365),
              args = seconds < 45 && ['s', seconds] ||
                  minutes === 1 && ['m'] ||
                  minutes < 45 && ['mm', minutes] ||
                  hours === 1 && ['h'] ||
                  hours < 22 && ['hh', hours] ||
                  days === 1 && ['d'] ||
                  days <= 25 && ['dd', days] ||
                  days <= 45 && ['M'] ||
                  days < 345 && ['MM', round(days / 30)] ||
                  years === 1 && ['y'] || ['yy', years];
          args[2] = withoutSuffix;
          args[3] = milliseconds > 0;
          return substituteTimeAgo.apply({}, args);
      }
  
      moment = function (input, format) {
          if (input === null || input === '') {
              return null;
          }
          var date,
              matched,
              isUTC;
          // parse Moment object
          if (moment.isMoment(input)) {
              date = new Date(+input._d);
              isUTC = input._isUTC;
          // parse string and format
          } else if (format) {
              if (isArray(format)) {
                  date = makeDateFromStringAndArray(input, format);
              } else {
                  date = makeDateFromStringAndFormat(input, format);
              }
          // evaluate it as a JSON-encoded date
          } else {
              matched = aspNetJsonRegex.exec(input);
              date = input === undefined ? new Date() :
                  matched ? new Date(+matched[1]) :
                  input instanceof Date ? input :
                  isArray(input) ? dateFromArray(input) :
                  typeof input === 'string' ? makeDateFromString(input) :
                  new Date(input);
          }
          return new Moment(date, isUTC);
      };
  
      // creating with utc
      moment.utc = function (input, format) {
          if (isArray(input)) {
              return new Moment(new Date(Date.UTC.apply({}, input)), true);
          }
          return (format && input) ?
              moment(input + ' +0000', format + ' Z').utc() :
              moment(input && !parseTokenTimezone.exec(input) ? input + '+0000' : input).utc();
      };
  
      // creating with unix timestamp (in seconds)
      moment.unix = function (input) {
          return moment(input * 1000);
      };
  
      // duration
      moment.duration = function (input, key) {
          var isDuration = moment.isDuration(input),
              isNumber = (typeof input === 'number'),
              duration = (isDuration ? input._data : (isNumber ? {} : input));
  
          if (isNumber) {
              if (key) {
                  duration[key] = input;
              } else {
                  duration.milliseconds = input;
              }
          }
  
          return new Duration(duration);
      };
  
      // humanizeDuration
      // This method is deprecated in favor of the new Duration object.  Please
      // see the moment.duration method.
      moment.humanizeDuration = function (num, type, withSuffix) {
          return moment.duration(num, type === true ? null : type).humanize(type === true ? true : withSuffix);
      };
  
      // version number
      moment.version = VERSION;
  
      // default format
      moment.defaultFormat = isoFormat;
  
      // language switching and caching
      moment.lang = function (key, values) {
          var i, req,
              parse = [];
          if (!key) {
              return currentLanguage;
          }
          if (values) {
              for (i = 0; i < 12; i++) {
                  parse[i] = new RegExp('^' + values.months[i] + '|^' + values.monthsShort[i].replace('.', ''), 'i');
              }
              values.monthsParse = values.monthsParse || parse;
              languages[key] = values;
          }
          if (languages[key]) {
              for (i = 0; i < langConfigProperties.length; i++) {
                  moment[langConfigProperties[i]] = languages[key][langConfigProperties[i]] || 
                      languages.en[langConfigProperties[i]];
              }
              currentLanguage = key;
          } else {
              if (hasModule) {
                  req = require('./lang/' + key);
                  moment.lang(key, req);
              }
          }
      };
  
      // set default language
      moment.lang('en', {
          months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
          monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
          weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
          weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
          longDateFormat : {
              LT : "h:mm A",
              L : "MM/DD/YYYY",
              LL : "MMMM D YYYY",
              LLL : "MMMM D YYYY LT",
              LLLL : "dddd, MMMM D YYYY LT"
          },
          meridiem : false,
          calendar : {
              sameDay : '[Today at] LT',
              nextDay : '[Tomorrow at] LT',
              nextWeek : 'dddd [at] LT',
              lastDay : '[Yesterday at] LT',
              lastWeek : '[last] dddd [at] LT',
              sameElse : 'L'
          },
          relativeTime : {
              future : "in %s",
              past : "%s ago",
              s : "a few seconds",
              m : "a minute",
              mm : "%d minutes",
              h : "an hour",
              hh : "%d hours",
              d : "a day",
              dd : "%d days",
              M : "a month",
              MM : "%d months",
              y : "a year",
              yy : "%d years"
          },
          ordinal : function (number) {
              var b = number % 10;
              return (~~ (number % 100 / 10) === 1) ? 'th' :
                  (b === 1) ? 'st' :
                  (b === 2) ? 'nd' :
                  (b === 3) ? 'rd' : 'th';
          }
      });
  
      // compare moment object
      moment.isMoment = function (obj) {
          return obj instanceof Moment;
      };
  
      // for typechecking Duration objects
      moment.isDuration = function (obj) {
          return obj instanceof Duration;
      };
  
      // shortcut for prototype
      moment.fn = Moment.prototype = {
  
          clone : function () {
              return moment(this);
          },
  
          valueOf : function () {
              return +this._d;
          },
  
          unix : function () {
              return Math.floor(+this._d / 1000);
          },
  
          toString : function () {
              return this._d.toString();
          },
  
          toDate : function () {
              return this._d;
          },
  
          utc : function () {
              this._isUTC = true;
              return this;
          },
  
          local : function () {
              this._isUTC = false;
              return this;
          },
  
          format : function (inputString) {
              return formatMoment(this, inputString ? inputString : moment.defaultFormat);
          },
  
          add : function (input, val) {
              var dur = val ? moment.duration(+val, input) : moment.duration(input);
              addOrSubtractDurationFromMoment(this, dur, 1);
              return this;
          },
  
          subtract : function (input, val) {
              var dur = val ? moment.duration(+val, input) : moment.duration(input);
              addOrSubtractDurationFromMoment(this, dur, -1);
              return this;
          },
  
          diff : function (input, val, asFloat) {
              var inputMoment = this._isUTC ? moment(input).utc() : moment(input).local(),
                  zoneDiff = (this.zone() - inputMoment.zone()) * 6e4,
                  diff = this._d - inputMoment._d - zoneDiff,
                  year = this.year() - inputMoment.year(),
                  month = this.month() - inputMoment.month(),
                  date = this.date() - inputMoment.date(),
                  output;
              if (val === 'months') {
                  output = year * 12 + month + date / 30;
              } else if (val === 'years') {
                  output = year + (month + date / 30) / 12;
              } else {
                  output = val === 'seconds' ? diff / 1e3 : // 1000
                      val === 'minutes' ? diff / 6e4 : // 1000 * 60
                      val === 'hours' ? diff / 36e5 : // 1000 * 60 * 60
                      val === 'days' ? diff / 864e5 : // 1000 * 60 * 60 * 24
                      val === 'weeks' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
                      diff;
              }
              return asFloat ? output : round(output);
          },
  
          from : function (time, withoutSuffix) {
              return moment.duration(this.diff(time)).humanize(!withoutSuffix);
          },
  
          fromNow : function (withoutSuffix) {
              return this.from(moment(), withoutSuffix);
          },
  
          calendar : function () {
              var diff = this.diff(moment().sod(), 'days', true),
                  calendar = moment.calendar,
                  allElse = calendar.sameElse,
                  format = diff < -6 ? allElse :
                  diff < -1 ? calendar.lastWeek :
                  diff < 0 ? calendar.lastDay :
                  diff < 1 ? calendar.sameDay :
                  diff < 2 ? calendar.nextDay :
                  diff < 7 ? calendar.nextWeek : allElse;
              return this.format(typeof format === 'function' ? format.apply(this) : format);
          },
  
          isLeapYear : function () {
              var year = this.year();
              return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
          },
  
          isDST : function () {
              return (this.zone() < moment([this.year()]).zone() || 
                  this.zone() < moment([this.year(), 5]).zone());
          },
  
          day : function (input) {
              var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
              return input == null ? day :
                  this.add({ d : input - day });
          },
  
          sod: function () {
              return moment(this)
                  .hours(0)
                  .minutes(0)
                  .seconds(0)
                  .milliseconds(0);
          },
  
          eod: function () {
              // end of day = start of day plus 1 day, minus 1 millisecond
              return this.sod().add({
                  d : 1,
                  ms : -1
              });
          },
  
          zone : function () {
              return this._isUTC ? 0 : this._d.getTimezoneOffset();
          },
  
          daysInMonth : function () {
              return moment(this).month(this.month() + 1).date(0).date();
          }
      };
  
      // helper for adding shortcuts
      function makeGetterAndSetter(name, key) {
          moment.fn[name] = function (input) {
              var utc = this._isUTC ? 'UTC' : '';
              if (input != null) {
                  this._d['set' + utc + key](input);
                  return this;
              } else {
                  return this._d['get' + utc + key]();
              }
          };
      }
  
      // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
      for (i = 0; i < proxyGettersAndSetters.length; i ++) {
          makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase(), proxyGettersAndSetters[i]);
      }
  
      // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
      makeGetterAndSetter('year', 'FullYear');
  
      moment.duration.fn = Duration.prototype = {
          weeks : function () {
              return absRound(this.days() / 7);
          },
  
          valueOf : function () {
              return this._milliseconds +
                this._days * 864e5 +
                this._months * 2592e6;
          },
  
          humanize : function (withSuffix) {
              var difference = +this,
                  rel = moment.relativeTime,
                  output = relativeTime(difference, !withSuffix);
  
              if (withSuffix) {
                  output = (difference <= 0 ? rel.past : rel.future).replace(/%s/i, output);
              }
  
              return output;
          }
      };
  
      function makeDurationGetter(name) {
          moment.duration.fn[name] = function () {
              return this._data[name];
          };
      }
  
      function makeDurationAsGetter(name, factor) {
          moment.duration.fn['as' + name] = function () {
              return +this / factor;
          };
      }
  
      for (i in unitMillisecondFactors) {
          if (unitMillisecondFactors.hasOwnProperty(i)) {
              makeDurationAsGetter(i, unitMillisecondFactors[i]);
              makeDurationGetter(i.toLowerCase());
          }
      }
  
      makeDurationAsGetter('Weeks', 6048e5);
  
      // CommonJS module is defined
      if (hasModule) {
          module.exports = moment;
      }
      /*global ender:false */
      if (typeof window !== 'undefined' && typeof ender === 'undefined') {
          window.moment = moment;
      }
      /*global define:false */
      if (typeof define === "function" && define.amd) {
          define("moment", [], function () {
              return moment;
          });
      }
  })(Date);
  

  provide("moment", module.exports);

  $.ender({ moment: require('moment') })
  

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * domready (c) Dustin Diaz 2012 - License MIT
    */
  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()
  }('domready', function (ready) {
  
    var fns = [], fn, f = false
      , doc = document
      , testEl = doc.documentElement
      , hack = testEl.doScroll
      , domContentLoaded = 'DOMContentLoaded'
      , addEventListener = 'addEventListener'
      , onreadystatechange = 'onreadystatechange'
      , readyState = 'readyState'
      , loaded = /^loade|c/.test(doc[readyState])
  
    function flush(f) {
      loaded = 1
      while (f = fns.shift()) f()
    }
  
    doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
      doc.removeEventListener(domContentLoaded, fn, f)
      flush()
    }, f)
  
  
    hack && doc.attachEvent(onreadystatechange, fn = function () {
      if (/^c/.test(doc[readyState])) {
        doc.detachEvent(onreadystatechange, fn)
        flush()
      }
    })
  
    return (ready = hack ?
      function (fn) {
        self != top ?
          loaded ? fn() : fns.push(fn) :
          function () {
            try {
              testEl.doScroll('left')
            } catch (e) {
              return setTimeout(function() { ready(fn) }, 50)
            }
            fn()
          }()
      } :
      function (fn) {
        loaded ? fn() : fns.push(fn)
      })
  })

  provide("domready", module.exports);

  !function ($) {
    var ready = require('domready')
    $.ender({domReady: ready})
    $.ender({
      ready: function (f) {
        ready(f)
        return this
      }
    }, true)
  }(ender);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Qwery - A Blazing Fast query selector engine
    * https://github.com/ded/qwery
    * copyright Dustin Diaz & Jacob Thornton 2011
    * MIT License
    */
  
  (function (name, definition, context) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof context['define'] != 'undefined' && context['define'] == 'function' && context['define']['amd']) define(name, definition)
    else context[name] = definition()
  })('qwery', function () {
    var doc = document
      , html = doc.documentElement
      , byClass = 'getElementsByClassName'
      , byTag = 'getElementsByTagName'
      , qSA = 'querySelectorAll'
      , useNativeQSA = 'useNativeQSA'
      , tagName = 'tagName'
      , nodeType = 'nodeType'
      , select // main select() method, assign later
  
      // OOOOOOOOOOOOH HERE COME THE ESSSXXSSPRESSSIONSSSSSSSS!!!!!
      , id = /#([\w\-]+)/
      , clas = /\.[\w\-]+/g
      , idOnly = /^#([\w\-]+)$/
      , classOnly = /^\.([\w\-]+)$/
      , tagOnly = /^([\w\-]+)$/
      , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
      , splittable = /(^|,)\s*[>~+]/
      , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
      , splitters = /[\s\>\+\~]/
      , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
      , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
      , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
      , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
      , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
      , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
      , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
      , tokenizr = new RegExp(splitters.source + splittersMore.source)
      , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')
      , walker = {
          ' ': function (node) {
            return node && node !== html && node.parentNode
          }
        , '>': function (node, contestant) {
            return node && node.parentNode == contestant.parentNode && node.parentNode
          }
        , '~': function (node) {
            return node && node.previousSibling
          }
        , '+': function (node, contestant, p1, p2) {
            if (!node) return false
            return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
          }
        }
  
    function cache() {
      this.c = {}
    }
    cache.prototype = {
      g: function (k) {
        return this.c[k] || undefined
      }
    , s: function (k, v, r) {
        v = r ? new RegExp(v) : v
        return (this.c[k] = v)
      }
    }
  
    var classCache = new cache()
      , cleanCache = new cache()
      , attrCache = new cache()
      , tokenCache = new cache()
  
    function classRegex(c) {
      return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
    }
  
    // not quite as fast as inline loops in older browsers so don't use liberally
    function each(a, fn) {
      var i = 0, l = a.length
      for (; i < l; i++) fn(a[i])
    }
  
    function flatten(ar) {
      for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
      return r
    }
  
    function arrayify(ar) {
      var i = 0, l = ar.length, r = []
      for (; i < l; i++) r[i] = ar[i]
      return r
    }
  
    function previous(n) {
      while (n = n.previousSibling) if (n[nodeType] == 1) break;
      return n
    }
  
    function q(query) {
      return query.match(chunker)
    }
  
    // called using `this` as element and arguments from regex group results.
    // given => div.hello[title="world"]:foo('bar')
    // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
    function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
      var i, m, k, o, classes
      if (this[nodeType] !== 1) return false
      if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
      if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
      if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
        for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
      }
      if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
      if (wholeAttribute && !value) { // select is just for existance of attrib
        o = this.attributes
        for (k in o) {
          if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
            return this
          }
        }
      }
      if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
        // select is for attrib equality
        return false
      }
      return this
    }
  
    function clean(s) {
      return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
    }
  
    function checkAttr(qualify, actual, val) {
      switch (qualify) {
      case '=':
        return actual == val
      case '^=':
        return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
      case '$=':
        return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
      case '*=':
        return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
      case '~=':
        return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
      case '|=':
        return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
      }
      return 0
    }
  
    // given a selector, first check for simple cases then collect all base candidate matches and filter
    function _qwery(selector, _root) {
      var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
        , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        , dividedTokens = selector.match(dividers)
  
      if (!tokens.length) return r
  
      token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
      if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
      if (!root) return r
  
      intr = q(token)
      // collect base candidates to filter
      els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
        function (r) {
          while (root = root.nextSibling) {
            root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
          }
          return r
        }([]) :
        root[byTag](intr[1] || '*')
      // filter elements according to the right-most part of the selector
      for (i = 0, l = els.length; i < l; i++) {
        if (item = interpret.apply(els[i], intr)) r[r.length] = item
      }
      if (!tokens.length) return r
  
      // filter further according to the rest of the selector (the left side)
      each(r, function(e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
      return ret
    }
  
    // compare element to a selector
    function is(el, selector, root) {
      if (isNode(selector)) return el == selector
      if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?
  
      var selectors = selector.split(','), tokens, dividedTokens
      while (selector = selectors.pop()) {
        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        dividedTokens = selector.match(dividers)
        tokens = tokens.slice(0) // copy array
        if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
          return true
        }
      }
      return false
    }
  
    // given elements matching the right-most part of a selector, filter out any that don't match the rest
    function ancestorMatch(el, tokens, dividedTokens, root) {
      var cand
      // recursively work backwards through the tokens and up the dom, covering all options
      function crawl(e, i, p) {
        while (p = walker[dividedTokens[i]](p, e)) {
          if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
            if (i) {
              if (cand = crawl(p, i - 1, p)) return cand
            } else return p
          }
        }
      }
      return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
    }
  
    function isNode(el, t) {
      return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
    }
  
    function uniq(ar) {
      var a = [], i, j
      o: for (i = 0; i < ar.length; ++i) {
        for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
        a[a.length] = ar[i]
      }
      return a
    }
  
    function arrayLike(o) {
      return (typeof o === 'object' && isFinite(o.length))
    }
  
    function normalizeRoot(root) {
      if (!root) return doc
      if (typeof root == 'string') return qwery(root)[0]
      if (!root[nodeType] && arrayLike(root)) return root[0]
      return root
    }
  
    function byId(root, id, el) {
      // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
      return root[nodeType] === 9 ? root.getElementById(id) :
        root.ownerDocument &&
          (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
            (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
    }
  
    function qwery(selector, _root) {
      var m, el, root = normalizeRoot(_root)
  
      // easy, fast cases that we can dispatch with simple DOM calls
      if (!root || !selector) return []
      if (selector === window || isNode(selector)) {
        return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
      }
      if (selector && arrayLike(selector)) return flatten(selector)
      if (m = selector.match(easy)) {
        if (m[1]) return (el = byId(root, m[1])) ? [el] : []
        if (m[2]) return arrayify(root[byTag](m[2]))
        if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
      }
  
      return select(selector, root)
    }
  
    // where the root is not document and a relationship selector is first we have to
    // do some awkward adjustments to get it to work, even with qSA
    function collectSelector(root, collector) {
      return function(s) {
        var oid, nid
        if (splittable.test(s)) {
          if (root[nodeType] !== 9) {
           // make sure the el has an id, rewrite the query, set root to doc and run it
           if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
           s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
           collector(root.parentNode || root, s, true)
           oid || root.removeAttribute('id')
          }
          return;
        }
        s.length && collector(root, s, false)
      }
    }
  
    var isAncestor = 'compareDocumentPosition' in html ?
      function (element, container) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (element, container) {
        container = container[nodeType] === 9 || container == window ? html : container
        return container !== element && container.contains(element)
      } :
      function (element, container) {
        while (element = element.parentNode) if (element === container) return 1
        return 0
      }
    , getAttr = function() {
        // detect buggy IE src/href getAttribute() call
        var e = doc.createElement('p')
        return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
          function(e, a) {
            return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
              e.getAttribute(a, 2) : e.getAttribute(a)
          } :
          function(e, a) { return e.getAttribute(a) }
     }()
    , hasByClass = !!doc[byClass]
      // has native qSA support
    , hasQSA = doc.querySelector && doc[qSA]
      // use native qSA
    , selectQSA = function (selector, root) {
        var result = [], ss, e
        try {
          if (root[nodeType] === 9 || !splittable.test(selector)) {
            // most work is done right here, defer to qSA
            return arrayify(root[qSA](selector))
          }
          // special case where we need the services of `collectSelector()`
          each(ss = selector.split(','), collectSelector(root, function(ctx, s) {
            e = ctx[qSA](s)
            if (e.length == 1) result[result.length] = e.item(0)
            else if (e.length) result = result.concat(arrayify(e))
          }))
          return ss.length > 1 && result.length > 1 ? uniq(result) : result
        } catch(ex) { }
        return selectNonNative(selector, root)
      }
      // no native selector support
    , selectNonNative = function (selector, root) {
        var result = [], items, m, i, l, r, ss
        selector = selector.replace(normalizr, '$1')
        if (m = selector.match(tagAndOrClass)) {
          r = classRegex(m[2])
          items = root[byTag](m[1] || '*')
          for (i = 0, l = items.length; i < l; i++) {
            if (r.test(items[i].className)) result[result.length] = items[i]
          }
          return result
        }
        // more complex selector, get `_qwery()` to do the work for us
        each(ss = selector.split(','), collectSelector(root, function(ctx, s, rewrite) {
          r = _qwery(s, ctx)
          for (i = 0, l = r.length; i < l; i++) {
            if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
          }
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      }
    , configure = function (options) {
        // configNativeQSA: use fully-internal selector or native qSA where present
        if (typeof options[useNativeQSA] !== 'undefined')
          select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
      }
  
    configure({ useNativeQSA: true })
  
    qwery.configure = configure
    qwery.uniq = uniq
    qwery.is = is
    qwery.pseudos = {}
  
    return qwery
  }, this);
  

  provide("qwery", module.exports);

  (function ($) {
    var q = require('qwery')
  
    $.pseudos = q.pseudos
  
    $._select = function (s, r) {
      // detect if sibling module 'bonzo' is available at run-time
      // rather than load-time since technically it's not a dependency and
      // can be loaded in any order
      // hence the lazy function re-definition
      return ($._select = (function (b) {
        try {
          b = require('bonzo')
          return function (s, r) {
            return /^\s*</.test(s) ? b.create(s, r) : q(s, r)
          }
        } catch (e) { }
        return q
      })())(s, r)
    }
  
    $.ender({
        find: function (s) {
          var r = [], i, l, j, k, els
          for (i = 0, l = this.length; i < l; i++) {
            els = q(s, this[i])
            for (j = 0, k = els.length; j < k; j++) r.push(els[j])
          }
          return $(q.uniq(r))
        }
      , and: function (s) {
          var plus = $(s)
          for (var i = this.length, j = 0, l = this.length + plus.length; i < l; i++, j++) {
            this[i] = plus[j]
          }
          return this
        }
      , is: function(s, r) {
          var i, l
          for (i = 0, l = this.length; i < l; i++) {
            if (q.is(this[i], s, r)) {
              return true
            }
          }
          return false
        }
    }, true)
  }(ender));
  

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Bonzo: DOM Utility (c) Dustin Diaz 2012
    * https://github.com/ded/bonzo
    * License MIT
    */
  (function (name, definition, context) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof context['define'] != 'undefined' && context['define'] == 'function' && context['define']['amd']) define(name, definition)
    else context[name] = definition()
  })('bonzo', function() {
    var context = this
      , win = window
      , doc = win.document
      , html = doc.documentElement
      , parentNode = 'parentNode'
      , query = null
      , specialAttributes = /^(checked|value|selected)$/i
      , specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i // tags that we have trouble inserting *into*
      , table = ['<table>', '</table>', 1]
      , td = ['<table><tbody><tr>', '</tr></tbody></table>', 3]
      , option = ['<select>', '</select>', 1]
      , noscope = ['_', '', 0, 1]
      , tagMap = { // tags that we have trouble *inserting*
            thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
          , tr: ['<table><tbody>', '</tbody></table>', 2]
          , th: td , td: td
          , col: ['<table><colgroup>', '</colgroup></table>', 2]
          , fieldset: ['<form>', '</form>', 1]
          , legend: ['<form><fieldset>', '</fieldset></form>', 2]
          , option: option, optgroup: option
          , script: noscope, style: noscope, link: noscope, param: noscope, base: noscope
        }
      , stateAttributes = /^(checked|selected)$/
      , ie = /msie/i.test(navigator.userAgent)
      , hasClass, addClass, removeClass
      , uidMap = {}
      , uuids = 0
      , digit = /^-?[\d\.]+$/
      , dattr = /^data-(.+)$/
      , px = 'px'
      , setAttribute = 'setAttribute'
      , getAttribute = 'getAttribute'
      , byTag = 'getElementsByTagName'
      , features = function() {
          var e = doc.createElement('p')
          e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>'
          return {
            hrefExtended: e[byTag]('a')[0][getAttribute]('href') != '#x' // IE < 8
          , autoTbody: e[byTag]('tbody').length !== 0 // IE < 8
          , computedStyle: doc.defaultView && doc.defaultView.getComputedStyle
          , cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat'
          , transform: function () {
              var props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'], i
              for (i = 0; i < props.length; i++) {
                if (props[i] in e.style) return props[i]
              }
            }()
          , classList: 'classList' in e
          }
        }()
      , trimReplace = /(^\s*|\s*$)/g
      , whitespaceRegex = /\s+/
      , toString = String.prototype.toString
      , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, boxFlex: 1, WebkitBoxFlex: 1, MozBoxFlex: 1 }
      , trim = String.prototype.trim ?
          function (s) {
            return s.trim()
          } :
          function (s) {
            return s.replace(trimReplace, '')
          }
  
    function classReg(c) {
      return new RegExp("(^|\\s+)" + c + "(\\s+|$)")
    }
  
    function each(ar, fn, scope) {
      for (var i = 0, l = ar.length; i < l; i++) fn.call(scope || ar[i], ar[i], i, ar)
      return ar
    }
  
    function deepEach(ar, fn, scope) {
      for (var i = 0, l = ar.length; i < l; i++) {
        if (isNode(ar[i])) {
          deepEach(ar[i].childNodes, fn, scope)
          fn.call(scope || ar[i], ar[i], i, ar)
        }
      }
      return ar
    }
  
    function camelize(s) {
      return s.replace(/-(.)/g, function (m, m1) {
        return m1.toUpperCase()
      })
    }
  
    function decamelize(s) {
      return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
    }
  
    function data(el) {
      el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
      var uid = el[getAttribute]('data-node-uid')
      return uidMap[uid] || (uidMap[uid] = {})
    }
  
    function clearData(el) {
      var uid = el[getAttribute]('data-node-uid')
      if (uid) delete uidMap[uid]
    }
  
    function dataValue(d, f) {
      try {
        return (d === null || d === undefined) ? undefined :
          d === 'true' ? true :
            d === 'false' ? false :
              d === 'null' ? null :
                (f = parseFloat(d)) == d ? f : d;
      } catch(e) {}
      return undefined
    }
  
    function isNode(node) {
      return node && node.nodeName && node.nodeType == 1
    }
  
    function some(ar, fn, scope, i, j) {
      for (i = 0, j = ar.length; i < j; ++i) if (fn.call(scope, ar[i], i, ar)) return true
      return false
    }
  
    function styleProperty(p) {
        (p == 'transform' && (p = features.transform)) ||
          (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + "Origin")) ||
          (p == 'float' && (p = features.cssFloat))
        return p ? camelize(p) : null
    }
  
    var getStyle = features.computedStyle ?
      function (el, property) {
        var value = null
          , computed = doc.defaultView.getComputedStyle(el, '')
        computed && (value = computed[property])
        return el.style[property] || value
      } :
  
      (ie && html.currentStyle) ?
  
      function (el, property) {
        if (property == 'opacity') {
          var val = 100
          try {
            val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity
          } catch (e1) {
            try {
              val = el.filters('alpha').opacity
            } catch (e2) {}
          }
          return val / 100
        }
        var value = el.currentStyle ? el.currentStyle[property] : null
        return el.style[property] || value
      } :
  
      function (el, property) {
        return el.style[property]
      }
  
    // this insert method is intense
    function insert(target, host, fn) {
      var i = 0, self = host || this, r = []
        // target nodes could be a css selector if it's a string and a selector engine is present
        // otherwise, just use target
        , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
      // normalize each node in case it's still a string and we need to create nodes on the fly
      each(normalize(nodes), function (t) {
        each(self, function (el) {
          var n = !el[parentNode] || (el[parentNode] && !el[parentNode][parentNode]) ?
            function () {
              var c = el.cloneNode(true)
                , cloneElems
                , elElems
  
              // check for existence of an event cloner
              // preferably https://github.com/fat/bean
              // otherwise Bonzo won't do this for you
              if (self.$ && self.cloneEvents) {
                self.$(c).cloneEvents(el)
  
                // clone events from every child node
                cloneElems = self.$(c).find('*')
                elElems = self.$(el).find('*')
  
                for (var i = 0; i < elElems.length; i++)
                  self.$(cloneElems[i]).cloneEvents(elElems[i])
              }
              return c
            }() : el
          fn(t, n)
          r[i] = n
          i++
        })
      }, this)
      each(r, function (e, i) {
        self[i] = e
      })
      self.length = i
      return self
    }
  
    function xy(el, x, y) {
      var $el = bonzo(el)
        , style = $el.css('position')
        , offset = $el.offset()
        , rel = 'relative'
        , isRel = style == rel
        , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]
  
      if (style == 'static') {
        $el.css('position', rel)
        style = rel
      }
  
      isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
      isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)
  
      x != null && (el.style.left = x - offset.left + delta[0] + px)
      y != null && (el.style.top = y - offset.top + delta[1] + px)
  
    }
  
    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once
    // so we iterate down below
    if (features.classList) {
      hasClass = function (el, c) {
        return el.classList.contains(c)
      }
      addClass = function (el, c) {
        el.classList.add(c)
      }
      removeClass = function (el, c) {
        el.classList.remove(c)
      }
    }
    else {
      hasClass = function (el, c) {
        return classReg(c).test(el.className)
      }
      addClass = function (el, c) {
        el.className = trim(el.className + ' ' + c)
      }
      removeClass = function (el, c) {
        el.className = trim(el.className.replace(classReg(c), ' '))
      }
    }
  
  
    // this allows method calling for setting values
    // example:
    // bonzo(elements).css('color', function (el) {
    //   return el.getAttribute('data-original-color')
    // })
    function setter(el, v) {
      return typeof v == 'function' ? v(el) : v
    }
  
    function Bonzo(elements) {
      this.length = 0
      if (elements) {
        elements = typeof elements !== 'string' &&
          !elements.nodeType &&
          typeof elements.length !== 'undefined' ?
            elements :
            [elements]
        this.length = elements.length
        for (var i = 0; i < elements.length; i++) this[i] = elements[i]
      }
    }
  
    Bonzo.prototype = {
  
        // indexr method, because jQueriers want this method. Jerks
        get: function (index) {
          return this[index] || null
        }
  
        // itetators
      , each: function (fn, scope) {
          return each(this, fn, scope)
        }
  
      , deepEach: function (fn, scope) {
          return deepEach(this, fn, scope)
        }
  
      , map: function (fn, reject) {
          var m = [], n, i
          for (i = 0; i < this.length; i++) {
            n = fn.call(this, this[i], i)
            reject ? (reject(n) && m.push(n)) : m.push(n)
          }
          return m
        }
  
      // text and html inserters!
      , html: function (h, text) {
          var method = text ?
            html.textContent === undefined ?
              'innerText' :
              'textContent' :
            'innerHTML';
          function append(el) {
            each(normalize(h), function (node) {
              el.appendChild(node)
            })
          }
          return typeof h !== 'undefined' ?
              this.empty().each(function (el) {
                !text && specialTags.test(el.tagName) ?
                  append(el) :
                  (function () {
                    try { (el[method] = h) }
                    catch(e) { append(el) }
                  }())
              }) :
            this[0] ? this[0][method] : ''
        }
  
      , text: function (text) {
          return this.html(text, 1)
        }
  
        // more related insertion methods
      , append: function (node) {
          return this.each(function (el) {
            each(normalize(node), function (i) {
              el.appendChild(i)
            })
          })
        }
  
      , prepend: function (node) {
          return this.each(function (el) {
            var first = el.firstChild
            each(normalize(node), function (i) {
              el.insertBefore(i, first)
            })
          })
        }
  
      , appendTo: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t.appendChild(el)
          })
        }
  
      , prependTo: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t.insertBefore(el, t.firstChild)
          })
        }
  
      , before: function (node) {
          return this.each(function (el) {
            each(bonzo.create(node), function (i) {
              el[parentNode].insertBefore(i, el)
            })
          })
        }
  
      , after: function (node) {
          return this.each(function (el) {
            each(bonzo.create(node), function (i) {
              el[parentNode].insertBefore(i, el.nextSibling)
            })
          })
        }
  
      , insertBefore: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            t[parentNode].insertBefore(el, t)
          })
        }
  
      , insertAfter: function (target, host) {
          return insert.call(this, target, host, function (t, el) {
            var sibling = t.nextSibling
            if (sibling) {
              t[parentNode].insertBefore(el, sibling);
            }
            else {
              t[parentNode].appendChild(el)
            }
          })
        }
  
      , replaceWith: function(html) {
          this.deepEach(clearData)
  
          return this.each(function (el) {
            el.parentNode.replaceChild(bonzo.create(html)[0], el)
          })
        }
  
        // class management
      , addClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            // we `each` here so you can do $el.addClass('foo bar')
            each(c, function (c) {
              if (c && !hasClass(el, setter(el, c)))
                addClass(el, setter(el, c))
            })
          })
        }
  
      , removeClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c && hasClass(el, setter(el, c)))
                removeClass(el, setter(el, c))
            })
          })
        }
  
      , hasClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return some(this, function (el) {
            return some(c, function (c) {
              return c && hasClass(el, c)
            })
          })
        }
  
      , toggleClass: function (c, condition) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c) {
                typeof condition !== 'undefined' ?
                  condition ? addClass(el, c) : removeClass(el, c) :
                  hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
              }
            })
          })
        }
  
        // display togglers
      , show: function (type) {
          return this.each(function (el) {
            el.style.display = type || ''
          })
        }
  
      , hide: function () {
          return this.each(function (el) {
            el.style.display = 'none'
          })
        }
  
      , toggle: function (callback, type) {
          this.each(function (el) {
            el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : type || ''
          })
          callback && callback()
          return this
        }
  
        // DOM Walkers & getters
      , first: function () {
          return bonzo(this.length ? this[0] : [])
        }
  
      , last: function () {
          return bonzo(this.length ? this[this.length - 1] : [])
        }
  
      , next: function () {
          return this.related('nextSibling')
        }
  
      , previous: function () {
          return this.related('previousSibling')
        }
  
      , parent: function() {
          return this.related(parentNode)
        }
  
      , related: function (method) {
          return this.map(
            function (el) {
              el = el[method]
              while (el && el.nodeType !== 1) {
                el = el[method]
              }
              return el || 0
            },
            function (el) {
              return el
            }
          )
        }
  
        // meh. use with care. the ones in Bean are better
      , focus: function () {
          this.length && this[0].focus()
          return this
        }
  
      , blur: function () {
          return this.each(function (el) {
            el.blur()
          })
        }
  
        // style getter setter & related methods
      , css: function (o, v, p) {
          // is this a request for just getting a style?
          if (v === undefined && typeof o == 'string') {
            // repurpose 'v'
            v = this[0]
            if (!v) {
              return null
            }
            if (v === doc || v === win) {
              p = (v === doc) ? bonzo.doc() : bonzo.viewport()
              return o == 'width' ? p.width : o == 'height' ? p.height : ''
            }
            return (o = styleProperty(o)) ? getStyle(v, o) : null
          }
          var iter = o
          if (typeof o == 'string') {
            iter = {}
            iter[o] = v
          }
  
          if (ie && iter.opacity) {
            // oh this 'ol gamut
            iter.filter = 'alpha(opacity=' + (iter.opacity * 100) + ')'
            // give it layout
            iter.zoom = o.zoom || 1;
            delete iter.opacity;
          }
  
          function fn(el, p, v) {
            for (var k in iter) {
              if (iter.hasOwnProperty(k)) {
                v = iter[k];
                // change "5" to "5px" - unless you're line-height, which is allowed
                (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
                el.style[p] = setter(el, v)
              }
            }
          }
          return this.each(fn)
        }
  
      , offset: function (x, y) {
          if (typeof x == 'number' || typeof y == 'number') {
            return this.each(function (el) {
              xy(el, x, y)
            })
          }
          if (!this[0]) return {
              top: 0
            , left: 0
            , height: 0
            , width: 0
          }
          var el = this[0]
            , width = el.offsetWidth
            , height = el.offsetHeight
            , top = el.offsetTop
            , left = el.offsetLeft
          while (el = el.offsetParent) {
            top = top + el.offsetTop
            left = left + el.offsetLeft
  
            if (el != document.body) {
              top -= el.scrollTop
              left -= el.scrollLeft
            }
          }
  
          return {
              top: top
            , left: left
            , height: height
            , width: width
          }
        }
  
      , dim: function () {
          if (!this.length) return { height: 0, width: 0 }
          var el = this[0]
            , orig = !el.offsetWidth && !el.offsetHeight ?
               // el isn't visible, can't be measured properly, so fix that
               function (t, s) {
                  s = {
                      position: el.style.position || ''
                    , visibility: el.style.visibility || ''
                    , display: el.style.display || ''
                  }
                  t.first().css({
                      position: 'absolute'
                    , visibility: 'hidden'
                    , display: 'block'
                  })
                  return s
                }(this) : null
            , width = el.offsetWidth
            , height = el.offsetHeight
  
          orig && this.first().css(orig)
          return {
              height: height
            , width: width
          }
        }
  
        // attributes are hard. go shopping
      , attr: function (k, v) {
          var el = this[0]
          if (typeof k != 'string' && !(k instanceof String)) {
            for (var n in k) {
              k.hasOwnProperty(n) && this.attr(n, k[n])
            }
            return this
          }
          return typeof v == 'undefined' ?
            !el ? null : specialAttributes.test(k) ?
              stateAttributes.test(k) && typeof el[k] == 'string' ?
                true : el[k] : (k == 'href' || k =='src') && features.hrefExtended ?
                  el[getAttribute](k, 2) : el[getAttribute](k) :
            this.each(function (el) {
              specialAttributes.test(k) ? (el[k] = setter(el, v)) : el[setAttribute](k, setter(el, v))
            })
        }
  
      , removeAttr: function (k) {
          return this.each(function (el) {
            stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
          })
        }
  
      , val: function (s) {
          return (typeof s == 'string') ?
            this.attr('value', s) :
            this.length ? this[0].value : null
        }
  
        // use with care and knowledge. this data() method uses data attributes on the DOM nodes
        // to do this differently costs a lot more code. c'est la vie
      , data: function (k, v) {
          var el = this[0], uid, o, m
          if (typeof v === 'undefined') {
            if (!el) return null
            o = data(el)
            if (typeof k === 'undefined') {
              each(el.attributes, function(a) {
                (m = ('' + a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
              })
              return o
            } else {
              if (typeof o[k] === 'undefined')
                o[k] = dataValue(this.attr('data-' + decamelize(k)))
              return o[k]
            }
          } else {
            return this.each(function (el) { data(el)[k] = v })
          }
        }
  
        // DOM detachment & related
      , remove: function () {
          this.deepEach(clearData)
  
          return this.each(function (el) {
            el[parentNode] && el[parentNode].removeChild(el)
          })
        }
  
      , empty: function () {
          return this.each(function (el) {
            deepEach(el.childNodes, clearData)
  
            while (el.firstChild) {
              el.removeChild(el.firstChild)
            }
          })
        }
  
      , detach: function () {
          return this.map(function (el) {
            return el[parentNode].removeChild(el)
          })
        }
  
        // who uses a mouse anyway? oh right.
      , scrollTop: function (y) {
          return scroll.call(this, null, y, 'y')
        }
  
      , scrollLeft: function (x) {
          return scroll.call(this, x, null, 'x')
        }
  
    }
  
    function normalize(node) {
      return typeof node == 'string' ? bonzo.create(node) : isNode(node) ? [node] : node // assume [nodes]
    }
  
    function scroll(x, y, type) {
      var el = this[0]
      if (!el) return this
      if (x == null && y == null) {
        return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
      }
      if (isBody(el)) {
        win.scrollTo(x, y)
      } else {
        x != null && (el.scrollLeft = x)
        y != null && (el.scrollTop = y)
      }
      return this
    }
  
    function isBody(element) {
      return element === win || (/^(?:body|html)$/i).test(element.tagName)
    }
  
    function getWindowScroll() {
      return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
    }
  
    function bonzo(els, host) {
      return new Bonzo(els, host)
    }
  
    bonzo.setQueryEngine = function (q) {
      query = q;
      delete bonzo.setQueryEngine
    }
  
    bonzo.aug = function (o, target) {
      // for those standalone bonzo users. this love is for you.
      for (var k in o) {
        o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
      }
    }
  
    bonzo.create = function (node) {
      // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
      return typeof node == 'string' && node !== '' ?
        function () {
          var tag = /^\s*<([^\s>]+)/.exec(node)
            , el = doc.createElement('div')
            , els = []
            , p = tag ? tagMap[tag[1].toLowerCase()] : null
            , dep = p ? p[2] + 1 : 1
            , ns = p && p[3]
            , pn = parentNode
            , tb = features.autoTbody && p && p[0] == '<table>' && !(/<tbody/i).test(node)
  
          el.innerHTML = p ? (p[0] + node + p[1]) : node
          while (dep--) el = el.firstChild
          // for IE NoScope, we may insert cruft at the begining just to get it to work
          if (ns && el && el.nodeType !== 1) el = el.nextSibling
          do {
            // tbody special case for IE<8, creates tbody on any empty table
            // we don't want it if we're just after a <thead>, <caption>, etc.
            if ((!tag || el.nodeType == 1) && (!tb || el.tagName.toLowerCase() != 'tbody')) {
              els.push(el)
            }
          } while (el = el.nextSibling)
          // IE < 9 gives us a parentNode which messes up insert() check for cloning
          // `dep` > 1 can also cause problems with the insert() check (must do this last)
          each(els, function(el) { el[pn] && el[pn].removeChild(el) })
          return els
  
        }() : isNode(node) ? [node.cloneNode(true)] : []
    }
  
    bonzo.doc = function () {
      var vp = bonzo.viewport()
      return {
          width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
        , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
      }
    }
  
    bonzo.firstChild = function (el) {
      for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
        if (c[i].nodeType === 1) e = c[j = i]
      }
      return e
    }
  
    bonzo.viewport = function () {
      return {
          width: ie ? html.clientWidth : self.innerWidth
        , height: ie ? html.clientHeight : self.innerHeight
      }
    }
  
    bonzo.isAncestor = 'compareDocumentPosition' in html ?
      function (container, element) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (container, element) {
        return container !== element && container.contains(element);
      } :
      function (container, element) {
        while (element = element[parentNode]) {
          if (element === container) {
            return true
          }
        }
        return false
      }
  
    return bonzo
  }, this); // the only line we care about using a semi-colon. placed here for concatenation tools
  

  provide("bonzo", module.exports);

  (function ($) {
  
    var b = require('bonzo')
    b.setQueryEngine($)
    $.ender(b)
    $.ender(b(), true)
    $.ender({
      create: function (node) {
        return $(b.create(node))
      }
    })
  
    $.id = function (id) {
      return $([document.getElementById(id)])
    }
  
    function indexOf(ar, val) {
      for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
      return -1
    }
  
    function uniq(ar) {
      var r = [], i = 0, j = 0, k, item, inIt
      for (; item = ar[i]; ++i) {
        inIt = false
        for (k = 0; k < r.length; ++k) {
          if (r[k] === item) {
            inIt = true; break
          }
        }
        if (!inIt) r[j++] = item
      }
      return r
    }
  
    $.ender({
      parents: function (selector, closest) {
        if (!this.length) return this
        var collection = $(selector), j, k, p, r = []
        for (j = 0, k = this.length; j < k; j++) {
          p = this[j]
          while (p = p.parentNode) {
            if (~indexOf(collection, p)) {
              r.push(p)
              if (closest) break;
            }
          }
        }
        return $(uniq(r))
      }
  
    , parent: function() {
        return $(uniq(b(this).parent()))
      }
  
    , closest: function (selector) {
        return this.parents(selector, true)
      }
  
    , first: function () {
        return $(this.length ? this[0] : this)
      }
  
    , last: function () {
        return $(this.length ? this[this.length - 1] : [])
      }
  
    , next: function () {
        return $(b(this).next())
      }
  
    , previous: function () {
        return $(b(this).previous())
      }
  
    , appendTo: function (t) {
        return b(this.selector).appendTo(t, this)
      }
  
    , prependTo: function (t) {
        return b(this.selector).prependTo(t, this)
      }
  
    , insertAfter: function (t) {
        return b(this.selector).insertAfter(t, this)
      }
  
    , insertBefore: function (t) {
        return b(this.selector).insertBefore(t, this)
      }
  
    , siblings: function () {
        var i, l, p, r = []
        for (i = 0, l = this.length; i < l; i++) {
          p = this[i]
          while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
          p = this[i]
          while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
        }
        return $(r)
      }
  
    , children: function () {
        var i, l, el, r = []
        for (i = 0, l = this.length; i < l; i++) {
          if (!(el = b.firstChild(this[i]))) continue;
          r.push(el)
          while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
        }
        return $(uniq(r))
      }
  
    , height: function (v) {
        return dimension.call(this, 'height', v)
      }
  
    , width: function (v) {
        return dimension.call(this, 'width', v)
      }
    }, true)
  
    function dimension(type, v) {
      return typeof v == 'undefined'
        ? b(this).dim()[type]
        : this.css(type, v)
    }
  }(ender));

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*
   *  Copyright 2011 Twitter, Inc.
   *  Licensed under the Apache License, Version 2.0 (the "License");
   *  you may not use this file except in compliance with the License.
   *  You may obtain a copy of the License at
   *
   *  http://www.apache.org/licenses/LICENSE-2.0
   *
   *  Unless required by applicable law or agreed to in writing, software
   *  distributed under the License is distributed on an "AS IS" BASIS,
   *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   *  See the License for the specific language governing permissions and
   *  limitations under the License.
   */
  
  var Hogan = {};
  
  (function (Hogan, useArrayBuffer) {
    Hogan.Template = function (renderFunc, text, compiler, options) {
      this.r = renderFunc || this.r;
      this.c = compiler;
      this.options = options;
      this.text = text || '';
      this.buf = (useArrayBuffer) ? [] : '';
    }
  
    Hogan.Template.prototype = {
      // render: replaced by generated code.
      r: function (context, partials, indent) { return ''; },
  
      // variable escaping
      v: hoganEscape,
  
      // triple stache
      t: coerceToString,
  
      render: function render(context, partials, indent) {
        return this.ri([context], partials || {}, indent);
      },
  
      // render internal -- a hook for overrides that catches partials too
      ri: function (context, partials, indent) {
        return this.r(context, partials, indent);
      },
  
      // tries to find a partial in the curent scope and render it
      rp: function(name, context, partials, indent) {
        var partial = partials[name];
  
        if (!partial) {
          return '';
        }
  
        if (this.c && typeof partial == 'string') {
          partial = this.c.compile(partial, this.options);
        }
  
        return partial.ri(context, partials, indent);
      },
  
      // render a section
      rs: function(context, partials, section) {
        var tail = context[context.length - 1];
  
        if (!isArray(tail)) {
          section(context, partials, this);
          return;
        }
  
        for (var i = 0; i < tail.length; i++) {
          context.push(tail[i]);
          section(context, partials, this);
          context.pop();
        }
      },
  
      // maybe start a section
      s: function(val, ctx, partials, inverted, start, end, tags) {
        var pass;
  
        if (isArray(val) && val.length === 0) {
          return false;
        }
  
        if (typeof val == 'function') {
          val = this.ls(val, ctx, partials, inverted, start, end, tags);
        }
  
        pass = (val === '') || !!val;
  
        if (!inverted && pass && ctx) {
          ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
        }
  
        return pass;
      },
  
      // find values with dotted names
      d: function(key, ctx, partials, returnFound) {
        var names = key.split('.'),
            val = this.f(names[0], ctx, partials, returnFound),
            cx = null;
  
        if (key === '.' && isArray(ctx[ctx.length - 2])) {
          return ctx[ctx.length - 1];
        }
  
        for (var i = 1; i < names.length; i++) {
          if (val && typeof val == 'object' && names[i] in val) {
            cx = val;
            val = val[names[i]];
          } else {
            val = '';
          }
        }
  
        if (returnFound && !val) {
          return false;
        }
  
        if (!returnFound && typeof val == 'function') {
          ctx.push(cx);
          val = this.lv(val, ctx, partials);
          ctx.pop();
        }
  
        return val;
      },
  
      // find values with normal names
      f: function(key, ctx, partials, returnFound) {
        var val = false,
            v = null,
            found = false;
  
        for (var i = ctx.length - 1; i >= 0; i--) {
          v = ctx[i];
          if (v && typeof v == 'object' && key in v) {
            val = v[key];
            found = true;
            break;
          }
        }
  
        if (!found) {
          return (returnFound) ? false : "";
        }
  
        if (!returnFound && typeof val == 'function') {
          val = this.lv(val, ctx, partials);
        }
  
        return val;
      },
  
      // higher order templates
      ho: function(val, cx, partials, text, tags) {
        var compiler = this.c;
        var options = this.options;
        options.delimiters = tags;
        var text = val.call(cx, text);
        text = (text == null) ? String(text) : text.toString();
        this.b(compiler.compile(text, options).render(cx, partials));
        return false;
      },
  
      // template result buffering
      b: (useArrayBuffer) ? function(s) { this.buf.push(s); } :
                            function(s) { this.buf += s; },
      fl: (useArrayBuffer) ? function() { var r = this.buf.join(''); this.buf = []; return r; } :
                             function() { var r = this.buf; this.buf = ''; return r; },
  
      // lambda replace section
      ls: function(val, ctx, partials, inverted, start, end, tags) {
        var cx = ctx[ctx.length - 1],
            t = null;
  
        if (!inverted && this.c && val.length > 0) {
          return this.ho(val, cx, partials, this.text.substring(start, end), tags);
        }
  
        t = val.call(cx);
  
        if (typeof t == 'function') {
          if (inverted) {
            return true;
          } else if (this.c) {
            return this.ho(t, cx, partials, this.text.substring(start, end), tags);
          }
        }
  
        return t;
      },
  
      // lambda replace variable
      lv: function(val, ctx, partials) {
        var cx = ctx[ctx.length - 1];
        var result = val.call(cx);
  
        if (typeof result == 'function') {
          result = coerceToString(result.call(cx));
          if (this.c && ~result.indexOf("{\u007B")) {
            return this.c.compile(result, this.options).render(cx, partials);
          }
        }
  
        return coerceToString(result);
      }
  
    };
  
    var rAmp = /&/g,
        rLt = /</g,
        rGt = />/g,
        rApos =/\'/g,
        rQuot = /\"/g,
        hChars =/[&<>\"\']/;
  
  
    function coerceToString(val) {
      return String((val === null || val === undefined) ? '' : val);
    }
  
    function hoganEscape(str) {
      str = coerceToString(str);
      return hChars.test(str) ?
        str
          .replace(rAmp,'&amp;')
          .replace(rLt,'&lt;')
          .replace(rGt,'&gt;')
          .replace(rApos,'&#39;')
          .replace(rQuot, '&quot;') :
        str;
    }
  
    var isArray = Array.isArray || function(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    };
  
  })(typeof exports !== 'undefined' ? exports : Hogan);
  
  

  provide("hogan.js-template", module.exports);

  $.ender(module.exports);

}());