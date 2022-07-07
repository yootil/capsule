# capsule

A lightweight wrapper for better, typed localStorage interactions.

## Installation

Install using npm/yarn

    npm i @yootil/capsule
    
## Usage

```typescript
import { Capsule } from '@yootil/capsule';

const capsule = new Capsule('my-app', {
    myValue: 'initial value if not yet in localStorage',
});

capsule.get('myValue'); // 'initial value if not yet in localStorage'

capsule.set('myValue', 'another string!'); // is now 'another string!'

// Keys do not conflict across namespaced capsules
const otherCapsule = new Capsule('my-other-app', {
    myValue: 'a different value for a different app',
});

capsule.get('myValue'); // is still 'another string!'
otherCapsule.get('myOtherCapsule'); // 'a different value for a different app'

// Can save and retreieve POJOs
capsule.set('myMap', {
  foo: 'bar',
  list: [123, { value: 456 }, false],
  time: new Date(),
});

capsule.get('myMap');
/*
{
  foo: 'bar',
  list: [123, { value: 456 }, false],
  time: "2022-07-07T12:54:30.740Z", // Note that Dates do not currently re-hydrate
}
*/

// Can be given types
capsule.get<number>('foo'); // typescript now treats return type as 'number'
```