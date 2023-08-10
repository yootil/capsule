import { describe, it } from 'mocha';
import { expect } from 'chai'
import { toDataString, fromDataString } from '@yootil/capsule/index';

describe('helpers', () => {
  describe('toDataString()', () => {
    it('toDataString() works on primitives', () => {
      expect(toDataString('foo')).to.deep.equal(`{"__data__":"foo"}`);
      expect(toDataString(5)).to.deep.equal(`{"__data__":5}`);
      expect(toDataString(true)).to.deep.equal(`{"__data__":true}`);
      expect(toDataString(null)).to.deep.equal(`{"__data__":null}`);
      expect(toDataString(undefined)).to.deep.equal(`{}`); // TODO: force undefined
    });

    it('toDataString() works on basic structures', () => {
      // may have issues with formatting
      expect(toDataString({ foo: 'bar' })).to.deep.equal(`{"__data__":{"foo":"bar"}}`);
      expect(toDataString([1, 'foo', { val: 3 }])).to.deep.equal(`{"__data__":[1,"foo",{"val":3}]}`);
    });
    it('toDataString() works on hydrateable structures', () => {
      // may have issues with formatting
      expect(toDataString(new Date(1657196329497))).to.deep.equal(`{"__data__":"2022-07-07T12:18:49.497Z","__type__":"date"}`);
    });
  });

  describe('fromDataString()', () => {
    it('fromDataString() works on primitives', () => {
      expect(fromDataString(`{"__data__":"foo"}`)).to.deep.equal('foo');
      expect(fromDataString(`{"__data__":5}`)).to.deep.equal(5);
      expect(fromDataString(`{"__data__":true}`)).to.deep.equal(true);
      expect(fromDataString(`{"__data__":null}`)).to.deep.equal(null);
      expect(fromDataString(`{}`)).to.deep.equal(undefined);
    });

    it('fromDataString() works on structures', () => {
      // todo: somehow have date hydration?
      expect(fromDataString(`{"__data__":"2022-07-07T12:18:49.497Z"}`)).to.deep.equal('2022-07-07T12:18:49.497Z');
      expect(fromDataString(`{"__data__":{"foo":"bar"}}`)).to.deep.equal({ foo: 'bar' });
      expect(fromDataString(`{"__data__":[1,"foo",{"val":3}]}`)).to.deep.equal([1, 'foo', { val: 3 }]);
    });

    it('fromDataString() rehydrates dates when conditions are met', () => {
      // Config not enabled
      expect(fromDataString(`{"__data__":"2022-07-07T12:18:49.497Z","__type__":"date"}`)).to.deep.equal('2022-07-07T12:18:49.497Z');

      // Config enabled, but type not set
      expect(fromDataString(`{"__data__":"2022-07-07T12:18:49.497Z"}`, {
        transforms: {
          'Date': true
        },
      })).to.deep.equal('2022-07-07T12:18:49.497Z');

      expect(fromDataString(`{"__data__":"2022-07-07T12:18:49.497Z","__type__":"date"}`, {
        transforms: {
          'Date': true
        },
      })).to.deep.equal(new Date(1657196329497));
    });
  });
});