import { Thunk } from "./Thunk";

/**
 * A _Stream_ is a lazily computed linked list of data.
 *
 * @typeParam A - Type of _data_ in the stream.
 */
export class Stream<A> {
    protected constructor(
        readonly data?: A,
        private next: Thunk<Stream<A>> = () => Stream.Empty
    ) {}

    /**
     * Empty stream is sub-type of every other stream.
     */
    static Empty: Stream<never> = new Stream();

    static from<T>(...values: T[]): Stream<T> {
        if (values.length === 0) return Stream.Empty;
        return new Stream(values[0], () => Stream.from(...values.slice(1)));
    }

    /**
     * Retrieve the first _item_ of the stream if non-empty.
     *
     * @throws Error that states the stream is empty.
     * @returns The first item of the stream.
     */
    get first(): A {
        if (this.isEmpty) throw new Error("Empty stream");
        return this.data!;
    }

    get rest(): Stream<A> {
        if (typeof this.next === "function") {
            this.next = this.next();
        }
        return this.next;
    }

    get isEmpty(): boolean {
        return Object.is(this, Stream.Empty);
    }

    map<B>(f: (data: A) => B): Stream<B> {
        if (this.isEmpty) return Stream.Empty;
        return new Stream(f(this.first), () => this.rest.map(f));
    }

    filter(pred: (data: A) => boolean): Stream<A> {
        if (this.isEmpty) return this;
        if (pred(this.first)) {
            return new Stream(this.first, () => this.rest.filter(pred));
        }
        return this.rest.filter(pred);
    }

    filterNot(pred: (data: A) => boolean): Stream<A> {
        return this.filter((data) => !pred(data));
    }

    reduce(combine: (x: A, y: A) => A, accum: A): A {
        if (this.isEmpty) return accum;
        return this.rest.reduce(combine, combine(accum, this.first));
    }

    partition(pred: (data: A) => boolean): [Stream<A>, Stream<A>] {
        return [this.filter(pred), this.filterNot(pred)];
    }

    take(k: number): Stream<A> {
        if (this.isEmpty || k <= 0) return Stream.Empty;
        return new Stream(this.first, () => this.rest.take(k - 1));
    }

    drop(k: number): Stream<A> {
        if (this.isEmpty || k <= 0) return this;
        return this.rest.drop(k - 1);
    }

    zip<B>(other: Stream<B>): Stream<[A, B]> {
        if (this.isEmpty || other.isEmpty) return Stream.Empty;
        return new Stream([this.first, other.first], () =>
            this.rest.zip(other.rest)
        );
    }

    sample(k: number = 10): A[] {
        const result: A[] = [];
        if (this.isEmpty) return result;

        let position: Stream<A> = this;
        while (k-- > 0 && !position.isEmpty) {
            result.push(position.first);
            position = position.rest;
        }
        return result;
    }

    prepend(value: A): Stream<A> {
        return new Stream(value, () => this);
    }

    append(value: A): Stream<A> {
        if (this.isEmpty) return new Stream(value);
        return new Stream(this.first, () => this.rest.append(value));
    }

    combine(other: Stream<A>): Stream<A> {
        if (this.isEmpty) return other;
        return new Stream(this.first, this.rest.combine(other));
    }

    exists(pred: (value: A) => boolean): boolean {
        if (this.isEmpty) return false;
        if (pred(this.first)) return true;
        return this.rest.exists(pred);
    }

    forAll(pred: (value: A) => Boolean): boolean {
        if (this.isEmpty) return false;
        if (pred(this.first)) return this.rest.forAll(pred);
        return false;
    }

    toString(): string {
        if (this.isEmpty) return "Empty";
        return `Stream(${this.first}, <...>)`;
    }
}
