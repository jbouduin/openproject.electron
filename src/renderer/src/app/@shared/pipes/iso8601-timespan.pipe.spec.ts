import { Iso8601TimespanPipe } from './iso8601-timespan.pipe';

describe('Iso8601TimespanPipe', () => {
  it('create an instance', () => {
    const pipe = new Iso8601TimespanPipe();
    expect(pipe).toBeTruthy();
  });
});
