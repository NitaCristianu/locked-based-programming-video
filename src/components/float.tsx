import { Node, Shape } from "@motion-canvas/2d";
import { createSignal, easeInOutSine, loop, Reference, Signal, SimpleSignal, waitFor } from "@motion-canvas/core";

export function* Float(component : Reference<Shape> | Shape, speed: number = 1, amplitude = 1, scale : SimpleSignal<number> = createSignal<number>(1)){
    amplitude /= 10;
    speed *= 3;
    if (component instanceof Shape){
        yield loop(Infinity, ()=>component ? component.offset([0, amplitude], speed, easeInOutSine).to([0, -amplitude * scale()], speed, easeInOutSine) : waitFor(amplitude));
    }else{
        yield loop(Infinity, ()=>component() ? component().offset([0, amplitude], speed, easeInOutSine).to([0, -amplitude * scale()], speed, easeInOutSine) : waitFor(amplitude));
    }
}