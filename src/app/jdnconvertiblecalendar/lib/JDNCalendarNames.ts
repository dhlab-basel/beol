/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Names of weekdays
interface Weekdays {
  long: string[];

  short?: string[];

  narrow?: string[];
}

// Map of locales to weekdays
interface LocaleToWeekdays {
  [locale: string]: Weekdays;
}

// Names of months
interface Months {
  long: string[];

  short?: string[];

  narrow?: string[];
}

// Map of Locales to names of months
interface LocaleToMonths {
  [locale: string]: Months;
}

// Names of weekdays and months for a calendar.
interface Names {
  weekdays: LocaleToWeekdays;

  months: LocaleToMonths;
}

// Map of calendars to names
// of weekdays and months.
interface Calendars {
  [calendar: string]: Names;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JDNConvertibleCalendarNames {
  const defaultLocale = 'en';

  const defaultFormat = 'long';

  const labels: Calendars = JSON.parse(`{
  "Gregorian": {
    "weekdays": {
      "en": {
        "long": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "short": ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"],
        "narrow": ["Su", "M", "Tu", "W", "Th", "F", "Sa"]
      },
      "de": {
        "long": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Sonntag"],
        "short": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        "narrow": ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
      }
    },
    "months": {
      "en": {
        "long": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        "short": ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
      },
      "de": {
        "long": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
        "short": ["Jan", "Feb", "März", "Apr", "Mai", "Jun", "Jul", "Aug", "Sept", "Okt", "Nov", "Dez"]
      }
    }
  },
  "Islamic": {
    "weekdays": {
      "en": {
        "long": ["al-Aḥad", "al-Ithnayn", "al-Thulāthāʾ", "al-Arbiʿāʾ", "al-Khamīs", "al-Jumʿah", "al-Sabt"]
      },
      "ar": {
        "long": ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      }
    },
    "months": {
      "en": {
        "long": ["Muḥarram", "Ṣafar", "Rabīʿ al-Awwal", "Rabīʿ al-Thānī", "Jumādā al-Ūlā", "Jumādā al-Ākhirah", "Rajab", "Shaʿbān", "Ramaḍān", "Shawwāl", "Dhū al-Qaʿdah", "Dhū al-Ḥijjah"]
      },
      "ar": {
        "long": ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الججة"]
      }
    }
  }
}`);

  /**
   * Get names of weekdays for the given calendar and the given locale in the given format.
   * Will fall back to the default locale if there are no names available for the preferred locale.
   * Will fall back to long if the preferred format is not available.
   *
   * @param calendar the calendar to get the weekday names for.
   * @param locale the preferred locale.
   * @param format the preferred format.
   */
  export const getWeekdayNames = (
    calendar: 'Gregorian' | 'Julian' | 'Islamic',
    locale: string,
    format: 'long' | 'short' | 'narrow'
  ): string[] => {
    let weekdays: Weekdays;

    // get the weekdays for the given calendar in the preferred locale, if available.
    if (labels[calendar].weekdays.hasOwnProperty(locale)) {
      weekdays = labels[calendar].weekdays[locale];
    } else {
      weekdays = labels[calendar].weekdays[defaultLocale];
    }

    let weekydayNames: string[];

    // get the requested format, if available.
    if (weekdays.hasOwnProperty(format)) {
      weekydayNames = weekdays[format] as string[];
    } else {
      weekydayNames = weekdays[defaultFormat];
    }

    return weekydayNames;
  };

  /**
   * Get names of months for the given calendar and the given locale in the given format.
   * Will fall back to the default locale if there are no names available for the preferred locale.
   * Will fall back to long if the preferred format is not available.
   *
   * @param calendar calendar the calendar to get the month names for.
   * @param locale the preferred locale.
   * @param format the preferred format.
   */
  export const getMonthNames = (
    calendar: 'Gregorian' | 'Julian' | 'Islamic',
    locale: string,
    format: 'long' | 'short' | 'narrow'
  ): string[] => {
    let months: Months;

    // get the month names for the given calendar in the preferred locale, if available.
    if (labels[calendar].months.hasOwnProperty(locale)) {
      months = labels[calendar].months[locale];
    } else {
      months = labels[calendar].months[defaultLocale];
    }

    let monthsNames: string[];

    // get the requested format, if available.
    if (months.hasOwnProperty(format)) {
      monthsNames = months[format] as string[];
    } else {
      monthsNames = months[defaultFormat];
    }

    return monthsNames;
  };
}
