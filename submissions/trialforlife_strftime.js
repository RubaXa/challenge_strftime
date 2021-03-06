;(function() {
  var namespace;

  if (typeof module !== 'undefined') {
    namespace = module.exports = strftime;
  }
  else {
    namespace = (function(){ return this || (1,eval)('this') }());
  }

  function words(s) { return (s || '').split(' '); }//?
  var DefaultLocale =
  { days: words('Sunday Monday Tuesday Wednesday Thursday Friday Saturday')
  , shortDays: words('Sun Mon Tue Wed Thu Fri Sat')
  , months: words('January February March April May June July August September October November December')
  , shortMonths: words('Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec')
  , AM: 'AM'
  , PM: 'PM'
  , am: 'am'
  , pm: 'pm'
  };

  namespace.strftime = strftime;

  function strftime(fmt, d, locale) {
    return _strftime(fmt, d, locale);
  }

  namespace.strftimeTZ = strftime.strftimeTZ = strftimeTZ;

  function strftimeTZ(fmt, d, locale, timezone) {
    if ((typeof locale == 'number' || typeof locale == 'string') && timezone == null) {
      timezone = locale;
      locale = undefined;
    }
    return _strftime(fmt, d, locale, { timezone: timezone });
  }

  namespace.strftimeUTC = strftime.strftimeUTC = strftimeUTC;

  function strftimeUTC(fmt, d, locale) {
    return _strftime(fmt, d, locale, { utc: true });
  }

  namespace.localizedStrftime = strftime.localizedStrftime = localizedStrftime;

  function localizedStrftime(locale) {
    return function(fmt, d, options) {
      return strftime(fmt, d, locale, options);
    };
  }

  function _strftime(fmt, d, locale, options) {
    options = options || {};
    if (d && !quacksLikeDate(d)) {
      locale = d;
      d = undefined;
    }
    d = d || new Date();
    locale = locale || DefaultLocale;
    locale.formats = locale.formats || {};

    var timestamp = d.getTime(),
        tz = options.timezone,
        tzType = typeof tz,
        optionsUtc = options.utc;

    if (optionsUtc || tzType == 'number' || tzType == 'string') {
      d = dateToUTC(d);
    }

    if (tz) {
      if (tzType == 'string') {
        var sign = tz[0] == '-' ? -1 : 1,
            hours = +(tz.slice(1, 3), 10),
            mins = +(tz.slice(3, 5), 10),
            tz = sign * (60 * hours) + mins;
      }

      if (tzType) {
        d = new Date(d.getTime() + (tz * 60000));
      }
    }

    return fmt.replace(/%([-_0]?.)/g, function(_, c) {
      var mod,
          padding,
          cLength = c.length;

      if (cLength == 2) {
        mod = c[0];
        switch (mod){
            case '-':
                padding = '';
                break;
            case '_':
                padding = ' ';
                break;
            case '0':
                padding = '0';
                break;
            default:
                return _;
        }
        c = c[1];
      }

      var dGetDay= d.getDay(),
          dGetMonth = d.getMonth(),
          dGetFullYear = d.getFullYear(),
          localeFormats = locale.formats,
          dGetDate = d.getDate(),
          dGetHours = d.getHours(),
          optionsUtc = options.utc;

      switch (c) {
        // 'Thursday'
        case 'A': return locale.days[dGetDay];

        // 'Thu'
        case 'a': return locale.shortDays[dGetDay];

        // 'January'
        case 'B': return locale.months[dGetMonth];

        // 'Jan'
        case 'b': return locale.shortMonths[dGetMonth];

        // '19'
        case 'C': return pad(Math.floor(dGetFullYear / 100), padding);

        // '01/01/70'
        case 'D': return _strftime(localeFormats.D || '%m/%d/%y', d, locale);

        // '01'
        case 'd': return pad(dGetDate, padding);

        // '01'
        case 'e': return dGetDate;

        // '1970-01-01'
        case 'F': return _strftime(localeFormats.F || '%Y-%m-%d', d, locale);

        // '00'
        case 'H': return pad(dGetHours, padding);

        // 'Jan'
        case 'h': return locale.shortMonths[dGetMonth];

        // '12'
        case 'I': return pad(hours12(d), padding);

        // '000'
        case 'j':
          var y = new Date(dGetFullYear, 0, 1),
              day = Math.ceil((d.getTime() - y.getTime()) / (1000 * 60 * 60 * 24));
          return pad(day, 3);

        // ' 0'
        case 'k': return pad(dGetHours, padding == null ? ' ' : padding);

        // '000'
        case 'L': return pad(Math.floor(timestamp % 1000), 3);

        // '12'
        case 'l': return pad(hours12(d), padding == null ? ' ' : padding);

        // '00'
        case 'M': return pad(d.getMinutes(), padding);

        // '01'
        case 'm': return pad(dGetMonth + 1, padding);

        // '\n'
        case 'n': return '\n';

        // '1st'
        case 'o': return String(dGetDate) + ordinal(dGetDate);

        // 'am'
        case 'P': return dGetHours < 12 ? locale.am : locale.pm;

        // 'AM'
        case 'p': return dGetHours < 12 ? locale.AM : locale.PM;

        // '00:00'
        case 'R': return _strftime(localeFormats.R || '%H:%M', d, locale);

        // '12:00:00 AM'
        case 'r': return _strftime(localeFormats.r || '%I:%M:%S %p', d, locale);

        // '00'
        case 'S': return pad(d.getSeconds(), padding);

        // '0'
        case 's': return Math.floor(timestamp / 1000);

        // '00:00:00'
        case 'T': return _strftime(localeFormats.T || '%H:%M:%S', d, locale);

        // '\t'
        case 't': return '\t';

        // '00'
        case 'U': return pad(weekNumber(d, 'sunday'), padding);

        // '4'
        case 'u':
          var day = dGetDay;
          return day == 0 ? 7 : day; // 1 - 7, Monday is first day of the week

        // '1-Jan-1970'
        case 'v': return _strftime(localeFormats.v || '%e-%b-%Y', d, locale);

        // '00'
        case 'W': return pad(weekNumber(d, 'monday'), padding);

        // '4'
        case 'w': return dGetDay; // 0 - 6, Sunday is first day of the week

        // '1970'
        case 'Y': return dGetFullYear;

        // '70'
        case 'y':
          var y = String(dGetFullYear),
              param = y.length - 2;

          return y.slice(param);

        // 'GMT'
        case 'Z':
          if (optionsUtc) {
            return "GMT";
          }
          else {
            var tzString = d.toString().match(/\((\w+)\)/);
            return tzString && tzString[1] || '';
          }

        // '+0000'
        case 'z':
          if (optionsUtc) {
            return "+0000";
          }
          else {
            var off = typeof tz == 'number' ? tz : -d.getTimezoneOffset();
            return (off < 0 ? '-' : '+') + pad(Math.abs(off / 60)) + pad(off % 60);
          }

        default: return c;
      }
    });
  }

  function dateToUTC(d) {
    var msDelta = (d.getTimezoneOffset() || 0) * 60000;
    return new Date(d.getTime() + msDelta);
  }

  var RequiredDateMethods = ['getTime', 'getTimezoneOffset', 'getDay', 'getDate', 'getMonth', 'getFullYear', 'getYear', 'getHours', 'getMinutes', 'getSeconds'];
  function quacksLikeDate(x) {
    var i = 0,
        n = RequiredDateMethods.length;
    for (i = 0; i < n; ++i) {
      if (typeof x[RequiredDateMethods[i]] != 'function') {
        return false;
      }
    }
    return true;
  }

  function pad(n, padding, length) {
    if (typeof padding === 'number') {
      length = padding;
      padding = '0';
    }

    // Defaults handle pad(n) and pad(n, <padding>)
    if (padding == null) {
      padding = '0';
    }
    length = length || 2;

    var s = String(n);
    // padding may be an empty string, don't loop forever if it is
    // do not put s.length in var
    if (padding) {
      while (s.length < length) s = padding + s;
    }
    return s;
  }

  function hours12(d) {
    var hour = d.getHours();
    if (hour == 0) hour = 12;
    else if (hour > 12) hour -= 12;
    return hour;
  }

  // Get the ordinal suffix for a number: st, nd, rd, or th
  function ordinal(n) {
    var i = n % 10, 
        ii = n % 100;
    if ((ii >= 11 && ii <= 13) || i === 0 || i >= 4) {
      return 'th';
    }
    switch (i) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
    }
  }

  // firstWeekday: 'sunday' or 'monday', default is 'sunday'
  //
  // Pilfered & ported from Ruby's strftime implementation.
  function weekNumber(d, firstWeekday) {
    firstWeekday = firstWeekday || 'sunday';

    // This works by shifting the weekday back by one day if we
    // are treating Monday as the first day of the week.
    var wday = d.getDay();
    if (firstWeekday == 'monday') {
      if (wday == 0) // Sunday
        wday = 6;
      else
        wday--;
    }
    var firstDayOfYear = new Date(d.getFullYear(), 0, 1),
        yday = (d - firstDayOfYear) / 86400000,
        weekNum = (yday + 7 - wday) / 7;
    return Math.floor(weekNum);
  }

}());