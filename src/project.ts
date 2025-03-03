import { makeProject } from '@motion-canvas/core';

import intro from './scenes/intro?scene';
import concurentPrograming from './scenes/concurent-programing?scene';
import cpuCores from './scenes/cpu-cores?scene';
import concurentPrograming2 from './scenes/concurent-programing2?scene';
import atomicity from './scenes/atomicity?scene';
import raceCondition from './scenes/race-condition?scene';
import atomicity2 from './scenes/atomicity2?scene';
import mutex from './scenes/mutex?scene';
import mutex2 from './scenes/mutex2?scene';
import mutexExample from './scenes/mutex-example?scene';
import criticalSection from './scenes/critical-section?scene';
import criticalSectionWorkings from './scenes/critical-section-workings?scene';
import criticalSectionExample from './scenes/critical-section-example?scene';
import semaphore from './scenes/semaphore?scene';
import promiseFuture from './scenes/promise-future?scene';
import events from './scenes/events?scene';
import deadlock from './scenes/deadlock?scene';
import coffman from './scenes/coffman?scene';
import starvation from './scenes/starvation?scene';
import starvation2 from './scenes/starvation2?scene';
import globalOrder from './scenes/global-ordering?scene';

import { Code, LezerHighlighter } from '@motion-canvas/2d';
import { HighlightStyle } from '@codemirror/language';
import { styleTags, Tag, tags } from '@lezer/highlight';
import { parser } from '@lezer/cpp';

import audio from '../src/audio/intro.mp3';

styleTags({
  "MOV": tags.keyword
})

export const DarkAssmStyle = new LezerHighlighter(parser, HighlightStyle.define([
  { tag: tags.keyword, color: '#FF79C6', fontWeight: 'bold' }, // Purple keywords
  { tag: tags.function(tags.variableName), color: '#50FA7B' }, // Green functions
  { tag: tags.number, color: '#BD93F9' }, // Lavender numbers
  { tag: tags.string, color: '#F1FA8C' }, // Yellow strings
  { tag: tags.comment, color: '#b9cbff', fontStyle: 'italic' }, // Gray comments
  { tag: tags.operator, color: '#FF5555' }, // Red operators
  { tag: tags.typeName, color: '#FF5555' }, //Red types
]));

export const DarkCppStyle = new LezerHighlighter(parser, HighlightStyle.define([
  { tag: tags.keyword, color: '#FF79C6', fontWeight: 'bold' }, // Purple keywords
  { tag: tags.function(tags.variableName), color: '#50FA7B' }, // Green functions
  { tag: tags.number, color: '#BD93F9' }, // Lavender numbers
  { tag: tags.string, color: '#F1FA8C' }, // Yellow strings
  { tag: tags.comment, color: '#b9cbff', fontStyle: 'italic' }, // Gray comments
  { tag: tags.operator, color: '#FF5555' }, // Red operators
  { tag: tags.typeName, color: '#FF5555' }, //Red types
]));

export const LightCppStyle = new LezerHighlighter(parser, HighlightStyle.define([
  { tag: tags.keyword, color: '#005CC5', fontWeight: 'bold' }, // Dark blue keywords
  { tag: tags.function(tags.variableName), color: '#22863A' }, // Green functions
  { tag: tags.number, color: '#6F42C1' }, // Purple numbers
  { tag: tags.string, color: '#E36209' }, // Orange strings
  { tag: tags.comment, color: '#6A737D', fontStyle: 'italic' }, // Gray comments
  { tag: tags.operator, color: '#D73A49' }, // Red operators
]));

Code.defaultHighlighter = DarkCppStyle;

export default makeProject({
  scenes: [mutex],
  audio : audio,
  experimentalFeatures: true
});
