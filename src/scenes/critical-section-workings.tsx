import { Circle, Code, Gradient, makeScene2D, Node, Rect, Txt } from "@motion-canvas/2d";
import { all, BBox, chain, createRef, createSignal, Direction, easeOutCubic, linear, slideTransition, textLerp, useLogger, Vector2, waitFor, waitUntil, zoomInTransition } from "@motion-canvas/core";
import { Background } from "../components/background";
import gaussianblur from "../shaders/glassmorphic.glsl";
import { GMRect } from "../components/glassmorphic_rect";
import { Chapter } from "../components/chapter";

const example_code = `\
void EnterCriticalSection(CRITICAL_SECTION *cs) {
    if (TryEnterCriticalSection(cs)) {
        return; // Successfully acquired the lock
    }

    while (true) {
        for (int i = 0; i < SPIN_COUNT; i++) {
            if (TryEnterCriticalSection(cs)) {
                return; 
            }
        }

        // If spinning fails, use a kernel-level wait
        WaitForSingleObject(cs->LockSemaphore, INFINITE);

        // After being signaled, attempt to acquire the lock again
        if (TryEnterCriticalSection(cs)) {
            return; // Successfully acquired the lock
        }
    }

}`;

export default makeScene2D(function* (view) {
    yield slideTransition(Direction.Right, 1);
    view.add(<Background />);
    const code = createRef<Code>();
    const code_rect = createRef<Node>();
    const scroll = createSignal<number>(0);
    const spinstate_signal = createSignal<number>(0);
    const codespin_signal = createSignal<number>(0);
    
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
                blurstrength: 52,
            }
        }}
    />);

    view.add(<Chapter
        chapterNumber={2}
        icon={"material-symbols:cycle-rounded"}
        name={"Critical Sections"}
    />);

    view.add(<Node ref={code_rect} x={-200}>
        <GMRect
            height={() => code().height() + 140}
            width={() => code().width() + 100}
            darkness={-.4}
            borderModifier={-.9}
            removeShadow={0}
            shadowColor={"#fff"}
        />
        <Code
            code={example_code}
            fontSize={30}
            ref={code}
        >
            <Rect
                size={[1050, 580]}
                radius={32}
                end={codespin_signal}
                opacity={codespin_signal}
                stroke={new Gradient({
                    fromY : -275,
                    toY : 275,
                    stops: [
                        {offset : 0, color : "#fff5"},
                        {offset : 0.3, color : "#fffc"},
                        {offset : 0.7, color : "#fffc"},
                        {offset : 1, color : "#fff5"},
                    ]
                })}
                fill={"#fff1"}
                lineDash={[60, 10]}
                lineWidth={5}
                x={30}
                y={50}
            >
                <Txt
                    text={()=>textLerp("", "SPINNING STATE", codespin_signal())}
                    opacity={codespin_signal}
                    fill={"#fffd"}
                    fontFamily={"Poppins"}
                    fontWeight={300}
                    x={350}
                    y={-250}
                    fontSize={40}
                    zIndex={1}
                />
            </Rect>
        </Code>
        <Rect
            width={20}
            height={90}
            radius={16}
            x={() => code().right().x}
            y={() => -350 + 900 * scroll()}
            stroke={"white"}
            lineWidth={4}
            fill={"#fff1"}
        />
    </Node>);
    code_rect().save();
    code_rect().scale(0.7);
    code_rect().x(-1400);

    const time = createSignal<number>(0);
    const thread = createRef<GMRect>();
    const spinscale = 35;

    view.add(<GMRect
        ref={thread}
        size={300}
        radius={1000}
    >
        <Txt
            text={"A"}
            zIndex={1}
            fontFamily={"Poppins"}
            fontSize={150}
            fontWeight={500}
            fill={"#fffa"}
            shadowBlur={10}
            shadowColor={"#fffa"}
        />;
        <Circle
            size={400}
            stroke={"#fffa"}
            lineWidth={15}
            shadowBlur={15}
            shadowColor={"#fff"}
            opacity={spinstate_signal}
            startAngle={() => 180 + time() * spinscale}
            endAngle={() => -40 + time() * spinscale}
        />
        <Circle
            size={400}
            stroke={"#fffa"}
            lineWidth={15}
            shadowBlur={15}
            shadowColor={"#fff"}
            opacity={spinstate_signal}
            startAngle={() => -30 + time() * spinscale}
            endAngle={() => 60 + time() * spinscale}
        />
        <Circle
            size={400}
            stroke={"#fffa"}
            lineWidth={15}
            shadowBlur={15}
            shadowColor={"#fff"}
            opacity={spinstate_signal}
            startAngle={() => 70 + time() * spinscale}
            endAngle={() => 170 + time() * spinscale}
        />
    </GMRect>);
    thread().save();
    thread().scale(0);
    thread().y(50);

    yield time(1000, 1000, linear);
    yield* chain(
        waitUntil("start"),
        thread().restore(1, easeOutCubic),
        waitFor(0.6),
        spinstate_signal(1, 1),
        waitUntil("code"),
        all(
            code_rect().restore(1.5),
            thread().x(650, 1),
        ),
        waitFor(.3),
        codespin_signal(1, 1),
    );

    yield* waitUntil("next");
});