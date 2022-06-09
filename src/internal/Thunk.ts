/**
 * A _Thunk_ is a representation of a _lazy_ computation or its value
 * if it had been computed before.
 *
 * @typeParam A - Type of _data_ being processed by this computation.
 */
export type Thunk<A> = A | (() => A);
