import { Stream } from "../internal/Stream";

class Naturals extends Stream<number> {
    static Odd: Naturals = new Naturals().filterNot((n) => n % 2 === 0);
    static Even: Naturals = Naturals.Odd.map((n) => n + 1);

    constructor(from: number = 1) {
        super(from, () => new Naturals(from + 1));
    }
}

class PrimeSource extends Stream<number> {
    constructor(seed: Stream<number> = new Naturals(3)) {
        super(
            seed.first,
            () =>
                new PrimeSource(
                    seed.rest.filterNot((n) => n % seed.first === 0)
                )
        );
    }
}

const Primes = new PrimeSource().prepend(2);

class Fibonacci extends Stream<number> {
    constructor(a: number = 1, b: number = 1) {
        super(a, () => new Fibonacci(b, a + b));
    }
}

const Collatz = (n: number): Stream<number> => {
    if (n < 0) return Stream.Empty;
    const next = n % 2 === 0 ? n / 2 : n * 3 + 1;
    if (next === 1) return Stream.from(n, 1);
    return Collatz(next).prepend(n);
};

export { Naturals, Primes, Fibonacci, Collatz };
