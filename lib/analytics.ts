import { AppEventsLogger } from 'react-native-fbsdk-next';

const { AppEvents, AppEventParams } = AppEventsLogger;

type Booking = {
  id: string;
  kind: 'room' | 'bike' | 'package';
  value: number;          // price or total in INR
  startDate?: string;     // 'YYYY-MM-DD' (check-in / pickup)
  endDate?: string;       // 'YYYY-MM-DD' (check-out / return)
  city?: string;
  currency?: string;
};

const contentType = (kind: Booking['kind']) =>
  kind === 'room' ? 'hotel' : kind === 'bike' ? 'vehicle' : 'trip';

const params = (b: Booking) => ({
  [AppEventParams.ContentType]: contentType(b.kind),
  [AppEventParams.ContentID]: b.id,
  [AppEventParams.Currency]: b.currency ?? 'INR',
  ...(b.startDate && { fb_checkin_date: b.startDate }),
  ...(b.endDate && { fb_checkout_date: b.endDate }),
  ...(b.city && { fb_city: b.city }),
});

export const trackViewContent = (b: Booking) =>
  AppEventsLogger.logEvent(AppEvents.ViewedContent, b.value, params(b));

export const trackSearch = (opts: {
  query?: string;
  kind: 'room' | 'bike';
  city?: string;
  startDate?: string;
  endDate?: string;
}) =>
  AppEventsLogger.logEvent(AppEvents.Searched, {
    [AppEventParams.ContentType]: contentType(opts.kind),
    ...(opts.query && { [AppEventParams.SearchString]: opts.query }),
    ...(opts.city && { fb_city: opts.city }),
    ...(opts.startDate && { fb_checkin_date: opts.startDate }),
    ...(opts.endDate && { fb_checkout_date: opts.endDate }),
  });

export const trackRate = (id: string, rating: number, max = 5) =>
  AppEventsLogger.logEvent(AppEvents.Rated, rating, {
    [AppEventParams.ContentID]: id,
    [AppEventParams.MaxRatingValue]: max,
  });

export const trackRegistration = (method: 'email' | 'google' | 'phone') =>
  AppEventsLogger.logEvent(AppEvents.CompletedRegistration, {
    [AppEventParams.RegistrationMethod]: method,
  });

export const trackInitiateCheckout = (b: Booking) =>
  AppEventsLogger.logEvent(AppEvents.InitiatedCheckout, b.value, params(b));

export const trackAddPaymentInfo = (success: boolean) =>
  AppEventsLogger.logEvent(AppEvents.AddedPaymentInfo, {
    [AppEventParams.Success]: success ? 1 : 0,
  });

export const trackPurchase = (b: Booking) =>
  AppEventsLogger.logPurchase(b.value, b.currency ?? 'INR', params(b));

export const trackContact = () => AppEventsLogger.logEvent(AppEvents.Contact);