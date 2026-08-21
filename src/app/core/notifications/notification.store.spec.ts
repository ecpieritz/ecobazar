import { NotificationStore } from './notification.store';

describe('NotificationStore', () => {
  let store: NotificationStore;

  beforeEach(() => {
    store = new NotificationStore();
  });

  afterEach(() => store.clear());

  it('should publish and dismiss application notifications', () => {
    const id = store.show({
      kind: 'info',
      title: 'Catalog updated',
      message: 'Fresh products are available.',
      duration: 0,
    });

    expect(store.notifications()).toEqual([
      expect.objectContaining({ id, kind: 'info', title: 'Catalog updated' }),
    ]);

    store.dismiss(id);

    expect(store.notifications()).toEqual([]);
  });

  it('should keep the four most recent notifications', () => {
    for (let index = 1; index <= 6; index += 1) {
      store.show({
        kind: 'success',
        title: `Message ${index}`,
        message: 'Done',
        duration: 0,
      });
    }

    expect(store.notifications()).toHaveLength(4);
    expect(store.notifications().map(({ title }) => title)).toEqual([
      'Message 3',
      'Message 4',
      'Message 5',
      'Message 6',
    ]);
  });
});
