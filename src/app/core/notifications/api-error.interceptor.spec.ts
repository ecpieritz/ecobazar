import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { apiErrorInterceptor } from './api-error.interceptor';
import { NotificationStore } from './notification.store';

describe('apiErrorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let notifications: NotificationStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    notifications = TestBed.inject(NotificationStore);
  });

  afterEach(() => {
    notifications.clear();
    httpTesting.verify();
  });

  it('should publish a global notification for server failures', async () => {
    const requestPromise = firstValueFrom(http.get('/api/failure'));
    httpTesting.expectOne('/api/failure').flush('Failure', {
      status: 500,
      statusText: 'Server Error',
    });

    await expect(requestPromise).rejects.toMatchObject({ status: 500 });
    expect(notifications.notifications()).toEqual([
      expect.objectContaining({ kind: 'error', title: 'Request failed' }),
    ]);
  });

  it('should leave handled validation failures to their feature', async () => {
    const requestPromise = firstValueFrom(http.get('/api/invalid'));
    httpTesting.expectOne('/api/invalid').flush('Invalid', {
      status: 400,
      statusText: 'Bad Request',
    });

    await expect(requestPromise).rejects.toMatchObject({ status: 400 });
    expect(notifications.notifications()).toEqual([]);
  });
});
