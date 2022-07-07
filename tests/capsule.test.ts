import { describe, it } from 'mocha';
import { expect } from 'chai'
import { Capsule, toDataString } from '@yootil/capsule/index';
import localStorage from '@yootil/capsule/local-storage';

describe('Capsule', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.itemInsertionCallback = null;
  });

  describe('constructor()', () => {
    it('sets the prefix', () => {
      const capsule = new Capsule('test', {});

      // @ts-ignore
      expect(capsule.prefix).to.deep.equal('test');
      // @ts-ignore
      expect(capsule.prefixDel).to.deep.equal('test_');
    });

    it('should read prefixed keys from localStorage', () => {
      localStorage.setItem(`key0`, 'value0');
      localStorage.setItem(`test:key1`, 'value1');
      localStorage.setItem(`test_key2`, 'value2');
      localStorage.setItem(`test_key3`, 'value3');

      const capsule = new Capsule('test', {});

      // @ts-ignore
      expect(capsule.keys).to.deep.equal(new Set([
        'key2',
        'key3',
      ]));
    });

    it('should set initial data', () => {
      localStorage.setItem(`test_key3`, 'value3');

      const capsule = new Capsule('test', {
        key2: 'initial-value-2',
      });

      expect(localStorage.getItem('test_key2')).to.deep.equal(`{"__data__":"initial-value-2"}`);
    });

    it('should not overwrite saved data with initial data', () => {
      localStorage.setItem(`test_key2`, `{"__data__":"initial-value-previous"}`);

      const capsule = new Capsule('test', {
        key2: 'initial-value-2',
      });

      expect(localStorage.getItem('test_key2')).to.deep.equal(`{"__data__":"initial-value-previous"}`);
    });
  });

  describe('prefix helpers', () => {
    it('prefixKey_() should add the prefix and delimiter', () => {
      const capsule = new Capsule('test', {});

      // @ts-ignore
      const key = capsule.prefixKey_(`key`);

      expect(key).to.deep.equal(`test_key`);
    });

    it('unprefixKey_() should remove the prefix and delimiter', () => {
      const capsule = new Capsule('test', {});

      // @ts-ignore
      const key = capsule.unprefixKey_(`test_key`);

      expect(key).to.deep.equal(`key`);
    });
  });

  describe('has()', () => {
    it('has() returns false when the key is not present', () => {
      const capsule = new Capsule('test', {
        foo: 'bar',
      });

      // This raises: TS2345: Argument of type '"foobar"' is not assignable to parameter of type '"foo"'.
      // @ts-ignore
      expect(capsule.has('foobar')).to.deep.equal(false);
    });

    it('has() returns tru when the key is present', () => {
      const capsule = new Capsule('test', {
        foo: 'bar',
      });

      expect(capsule.has('foo')).to.deep.equal(true);
    });
  });

  describe('get()', () => {
    it('get() returns undefined if key does not exist', () => {
      const capsule = new Capsule('test', {});

      expect(capsule.get('foo')).to.deep.equal(undefined);
    });

    it('get() returns default value if key does not exist', () => {
      const capsule = new Capsule('test', {});

      expect(capsule.get('foo', 'defaultValue!')).to.deep.equal('defaultValue!');
    });

    it('get() returns the value if key does exist', () => {
      const capsule = new Capsule('test', {
        foo: 'bar',
      });

      expect(capsule.get('foo')).to.deep.equal('bar');
      expect(capsule.get('foo', 'defaultValue!')).to.deep.equal('bar');
    });

    it('get() respects type info', () => {
      const capsule = new Capsule('test', {
        foo: {
          count: 5,
        },
      });

      const value = capsule.get('foo');

      // Typing info is present
      expect(value.count).to.deep.equal(5);
    });

    it('get() throws a specific error if the value is malformed', () => {
      const capsule = new Capsule('test', {
        foo: 'bar',
      });

      localStorage.setItem(`test_foo`, `{"__data__":"malformed`);

      try {
        const value = capsule.get('foo');
        expect(value).to.deep.equal('this should never match');
      } catch (error) {
        expect(error.message).to.deep.equal(
          `Capsule (test) could not load the item with key: foo`
        );
      }
    });
  });

  describe('set()', () => {
    it('set() registers the key', () => {
      const capsule = new Capsule('test', {});

      // @ts-ignore
      expect(capsule.keys.has('foo')).to.deep.equal(false);
      expect(capsule.has('foo')).to.deep.equal(false);

      capsule.set('foo', 'bar');

      // @ts-ignore
      expect(capsule.keys.has('foo')).to.deep.equal(true);
      expect(capsule.has('foo')).to.deep.equal(true);

    });

    it('set() adds the value to localStorage', () => {
      const capsule = new Capsule('test', {});

      expect(localStorage.getItem(`test_foo`)).to.deep.equal(null);
      expect(capsule.get('foo')).to.deep.equal(undefined);

      capsule.set('foo', 'bar');

      expect(localStorage.getItem(`test_foo`)).to.deep.equal(toDataString('bar'));
      expect(capsule.get('foo')).to.deep.equal('bar');
    });

    it('set() overwrites the value in localStorage', () => {
      const capsule = new Capsule('test', {
        foo: 'notbar',
      });

      expect(localStorage.getItem(`test_foo`)).to.deep.equal(toDataString('notbar'));
      expect(capsule.get('foo')).to.deep.equal('notbar');

      capsule.set('foo', 'bar');

      expect(localStorage.getItem(`test_foo`)).to.deep.equal(toDataString('bar'));
      expect(capsule.get('foo')).to.deep.equal('bar');
    });
  });

  describe('remove()', () => {
    it('remove() unregisters the key', () => {
      const capsule = new Capsule('test', {
        foo: 'bar',
      });

      // @ts-ignore
      expect(capsule.keys.has('foo')).to.deep.equal(true);
      expect(capsule.has('foo')).to.deep.equal(true);

      capsule.remove('foo');

      // @ts-ignore
      expect(capsule.keys.has('foo')).to.deep.equal(false);
      expect(capsule.has('foo')).to.deep.equal(false);

    });

    it('remove() removes the value from localStorage', () => {
      const capsule = new Capsule('test', {
        foo: 'bar',
      });

      expect(localStorage.getItem(`test_foo`)).to.deep.equal(toDataString('bar'));
      expect(capsule.get('foo')).to.deep.equal('bar');

      capsule.remove('foo');

      expect(localStorage.getItem(`test_foo`)).to.deep.equal(null);
      expect(capsule.get('foo')).to.deep.equal(undefined);
    });
  });

  describe('flush()', () => {
    it('flush() unregisters all keys', () => {
      const capsule = new Capsule('test', {
        foo: 'bar',
        second: 'key',
      });

      // @ts-ignore
      expect(capsule.keys.has('foo')).to.deep.equal(true);
      expect(capsule.has('foo')).to.deep.equal(true);
      // @ts-ignore
      expect(capsule.keys.has('second')).to.deep.equal(true);
      expect(capsule.has('second')).to.deep.equal(true);

      capsule.flush();

      // @ts-ignore
      expect(capsule.keys).to.deep.equal(new Set());
      expect(capsule.has('foo')).to.deep.equal(false);
      expect(capsule.has('second')).to.deep.equal(false);
    });

    it('flush() removes all values of this capsule from localStorage', () => {
      const capsule = new Capsule('test', {
        foo: 'bar',
        second: 'key',
      });

      expect(localStorage.getItem(`test_foo`)).to.deep.equal(toDataString('bar'));
      expect(capsule.get('foo')).to.deep.equal('bar');
      expect(localStorage.getItem(`test_second`)).to.deep.equal(toDataString('key'));
      expect(capsule.get('second')).to.deep.equal('key');

      capsule.flush();

      expect(localStorage.getItem(`test_foo`)).to.deep.equal(null);
      expect(capsule.get('foo')).to.deep.equal(undefined);
      expect(localStorage.getItem(`test_second`)).to.deep.equal(null);
      expect(capsule.get('second')).to.deep.equal(undefined);
    });
  });
});