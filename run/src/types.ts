import {Stream} from 'xstream';

export interface FantasyObserver<T> {
  next(x: T): void;
  error(err: any): void;
  complete(c?: any): void;
}

export interface FantasySubscription {
  unsubscribe(): void;
}

export interface FantasyObservable<T> {
  subscribe(observer: FantasyObserver<T>): FantasySubscription;
}

export interface DevToolEnabledSource {
  _isCycleSource: string;
}

export type SinkProxies<Si> = {[P in keyof Si]: Stream<any>};

export type Driver<Si, So> = Si extends void
  ? (() => So)
  : ((stream: Si) => So);

export type DisposeFunction = () => void;

export type Drivers = {
  [name: string]: Driver<Stream<any>, any | void>;
};

export type Main = (...args: Array<any>) => any;

export type Sources<D extends Drivers> = {[k in keyof D]: ReturnType<D[k]>};

export type Sinks<M extends Main> = ReturnType<M>;

export type MatchingMain<D extends Drivers, M extends Main> =
  | Main & {
      (so: Sources<D>): Sinks<M>;
    }
  | Main & {
      (): Sinks<M>;
    };

export type ToStream<S> = S extends FantasyObservable<infer T> ? Stream<T> : S;

export type MatchingDrivers<D extends Drivers, M extends Main> = Drivers &
  {
    [k in string & keyof Sinks<M>]:
      | (() => Sources<D>[k])
      | ((si: ToStream<Sinks<M>[k]>) => Sources<D>[k])
  };

export interface CycleProgram<
  D extends MatchingDrivers<D, M>,
  M extends MatchingMain<D, M>
> {
  sources: Sources<D>;
  sinks: Sinks<M>;
  run(): DisposeFunction;
}

export interface Engine<D extends Drivers> {
  sources: Sources<D>;
  run<M extends MatchingMain<D, M>>(sinks: Sinks<M>): DisposeFunction;
  dispose(): void;
}
