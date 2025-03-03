import { makeScene2D, Node, Rect, Txt } from "@motion-canvas/2d";
import { all, createRef, createRefArray, waitUntil } from "@motion-canvas/core";
import { Background } from "../components/background";
import gaussianblur from '../shaders/glassmorphic.glsl';

export default makeScene2D(function* (view) {
    view.add(<Background />);
    view.add(<Rect
        size={'100%'}
        fill={"white"}
        shaders={{
            fragment: gaussianblur,
            uniforms: {
                strength: 10.,
                opacity: 0.9,
                darkness: -.4,
                borderModifier: -1.5,
                blurstrength: () => 52,
            }
        }}
    />);
    const questions = `\
1. Do you use a mutex?
2. Does any thread go to sleep while holding a lock?
3. Is anyone able to forcibly break the lock of a sleeping thread?
4. Does a cycle appears in your dependency graph?`.split('\n');

    const questions_refs = createRefArray<Txt>();
    view.add(<Node>
        {questions.map((content, i) => <Txt
            text={content}
            zIndex={1}
            y={i*200 - 300}
            fill={"white"}
            fontFamily={"Poppins"}
            fontWeight={600}
            shadowBlur={10}
            shadowColor={"#fffa"}
            ref={questions_refs}
        />)}
    </Node>);
    yield* waitUntil("1");
    yield* all(...questions_refs.map((q, i)=> i != 0 ? q.opacity(.4, 1) : q.opacity(1, 1))),
    yield* waitUntil("2");
    yield* all(...questions_refs.map((q, i)=> i != 1 ? q.opacity(.4, 1) : q.opacity(1, 1))),
    yield* waitUntil("3");
    yield* all(...questions_refs.map((q, i)=> i != 2 ? q.opacity(.4, 1) : q.opacity(1, 1))),
    yield* waitUntil("4");
    yield* all(...questions_refs.map((q, i)=> i != 3 ? q.opacity(.4, 1) : q.opacity(1, 1))),
    yield* waitUntil("stop");
    yield* all(...questions_refs.map(q=> q.opacity(1, 1) ));

    yield* waitUntil('next');
});