import {run} from '@cycle/run';
import xs from 'xstream';
import {makeDOMDriver} from '@cycle/dom';
import app from './app';

function clientSideApp(sources) {
  const sinks = app(sources);
  sinks.DOM = sinks.DOM.drop(1);
  return sinks;
}

function preventDefaultDriver(ev$) {
  ev$.addListener({
    next: ev => ev.preventDefault(),
  });
}

run(clientSideApp, {
  DOM: makeDOMDriver('.app-container'),
  context: () => xs.of(window.appContext),
  PreventDefault: preventDefaultDriver,
});
