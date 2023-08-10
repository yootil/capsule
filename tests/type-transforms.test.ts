import { describe, it } from 'mocha';
import { expect } from 'chai'
import { dateFromJSON, dateToJSON, inferType, narrowIfHydrateable } from '@yootil/capsule/type-transforms';

describe('type-transforms', () => {
  describe('inferType()', () => {
    it('inferType() works on supported values', () => {
      expect(inferType('foo')).to.deep.equal(`string`);
      expect(inferType(5)).to.deep.equal(`number`);
      expect(inferType(0)).to.deep.equal(`number`);
      expect(inferType(true)).to.deep.equal(`boolean`);
      expect(inferType(false)).to.deep.equal(`boolean`);
      expect(inferType(null)).to.deep.equal(`null`);
      expect(inferType(new Date(1657196329497))).to.deep.equal(`date`);
      expect(inferType([])).to.deep.equal(`array`);
      expect(inferType([null, 5])).to.deep.equal(`array`);
      expect(inferType({})).to.deep.equal(`object`);
      expect(inferType({ foo: 'bar' })).to.deep.equal(`object`);
    });

    it('inferType() works for date only on valid dates', () => {
      expect(inferType(new Date(1657196329497))).to.deep.equal(`date`);
      expect(inferType(new Date(0))).to.deep.equal(`date`);
      expect(inferType(new Date(-1))).to.deep.equal(`date`);
      expect(inferType(new Date('bad date'))).to.deep.equal(undefined);
    });

    it('inferType() returns undefined for unsupported values', () => {
      // may have issues with formatting
      expect(inferType(undefined)).to.deep.equal(undefined);
      expect(inferType(BigInt(1))).to.deep.equal(undefined);
      expect(inferType(BigInt(9007199254740991))).to.deep.equal(undefined);
      expect(inferType(Symbol('descriptor'))).to.deep.equal(undefined);
    });
  });

  it('narrowIfHydrateable() works as expected', () => {
    expect(narrowIfHydrateable('date')).to.deep.equal('date');
    expect(narrowIfHydrateable('string')).to.deep.equal(undefined);
    expect(narrowIfHydrateable('number')).to.deep.equal(undefined);
    expect(narrowIfHydrateable('boolean')).to.deep.equal(undefined);
    expect(narrowIfHydrateable('array')).to.deep.equal(undefined);
    expect(narrowIfHydrateable('object')).to.deep.equal(undefined);
    expect(narrowIfHydrateable('null')).to.deep.equal(undefined);
  });

  it('dateToJSON() works as expected', () => {
    expect(dateToJSON(new Date(1657196329497))).to.deep.equal('2022-07-07T12:18:49.497Z');
    expect(dateToJSON(new Date(0))).to.deep.equal('1970-01-01T00:00:00.000Z');
    expect(dateToJSON(new Date(-1))).to.deep.equal('1969-12-31T23:59:59.999Z');
  });

  it('dateFromJSON() works as expected', () => {
    expect(dateFromJSON('2022-07-07T12:18:49.497Z')).to.deep.equal(new Date(1657196329497));
    expect(dateFromJSON('1970-01-01T00:00:00.000Z')).to.deep.equal(new Date(0));
    expect(dateFromJSON('1969-12-31T23:59:59.999Z')).to.deep.equal(new Date(-1));
  });
});