import { Bezier, Circle, Code, CubicBezier, Gradient, Icon, Line, lines, makeScene2D, Node, QuadBezier, Ray, Rect, Txt, View2D } from "@motion-canvas/2d";
import { all, BBox, chain, Color, createRef, createSignal, DEFAULT, easeInOutSine, easeOutCubic, isType, range, Reference, sequence, Vector2, waitFor, waitUntil } from "@motion-canvas/core";
import { Background } from "../components/background";
import { GMRect, GMRectProps } from "../components/glassmorphic_rect";
import gaussianblur from "../shaders/glassmorphic.glsl";
import { Chapter } from "../components/chapter";

const code_text = `\
// Function that performs a computation and sets a value using a promise
void compute_square(std::promise<int> promise, int value) {
    std::this_thread::sleep_for(std::chrono::seconds(2)); // Simulate work
    promise.set_value(value * value); // Set the result of the computation
}
int main() {
    int number = 5;

    // Create a promise and get its associated future
    std::promise<int> promise;
    std::future<int> future = promise.get_future();

    // Start a thread to compute the square
    std::thread worker(compute_square, std::move(promise), number);

    std::cout << "Waiting for the result...\\n";

    // Retrieve the result from the future
    int result = future.get();

    std::cout << "The square of " << number << " is " << result << ".\\n";

    // Join the thread
    worker.join();

    return 0;
}`;

function getRegexForCodeSections() {
    return {
        promiseFunction: /void\s+compute_square\(.*?\)\s*{[^}]*}/gs,
        futureGet: /future\.get\(\);/g
    };
}

const colors = {
    promise: new Color("#ff0"),
    future: new Color("#f0f")
}

function* createSynsRect(view: Node, innerText: string, initialProps?: GMRectProps) {
    const ref = createRef<GMRect>();
    const color = colors[innerText == "promise" ? innerText : 'future']
    view.add(<GMRect
        size={[600, 200]}
        ref={ref}
        scale={0}
        y={50}
        darkness={.2}
        shadowColor={color.alpha(.6)}
        fill={color.saturate(-2).alpha(.4)}
        {...initialProps}
    >
        <Txt
            zIndex={1}
            text={innerText.toUpperCase()}
            fontSize={80}
            fill={"white"}
            fontWeight={800}
            shadowBlur={10}
            shadowColor={"white"}
        />
        <Icon
            zIndex={1}
            icon={innerText == "future" ? "material-symbols:clock-arrow-up-rounded" : "material-symbols:handshake"}
            color={color.brighten(9)}
            size={110}
            shadowBlur={10}
            shadowColor={color.alpha(.5)}
            opacity={0}
        />
    </GMRect>);
    yield all(
        ref().scale(1, .5, easeOutCubic),
        ref().y(0, .5, easeOutCubic),
    );
    return ref;
}

function* shrinkSyncRect(rect: Reference<GMRect>) {
    const icon = rect().findFirst(node => node instanceof Icon);
    const text = rect().findFirst(node => node instanceof Txt);
    yield* all(
        icon.opacity(1, .7),
        text.opacity(0, .7),
        rect().width(rect().height(), 1),
        rect().x(rect().x() + 60, 1),
        rect().scale(.7, 1),
    )
}

function* createConnection(view: Node, a: Vector2, b: Vector2, offset: number) {
    const ref = createRef<Ray>();
    view.add(<QuadBezier
        p0={a.addY(-offset)}
        p1={() => a.add(b).div(2).addY(-offset * 3)}
        p2={b.addY(-offset)}
        lineWidth={6}
        stroke={"white"}
        endOffset={20}
        startOffset={20}
        endArrow
        end={0}
        arrowSize={10}
        ref={ref}
        lineDash={[20, 30]}
    />);
    yield ref().end(1, 1);

    return ref;
}

function* highlight_code_sections(code: Code, index: "promise" | "future") {
    const bbox = createSignal(() => {
        const code_section = code.findAllRanges(index == "future" ? getRegexForCodeSections().futureGet : getRegexForCodeSections().promiseFunction);
        const bboxes = code.getSelectionBBox(code_section);
        const result = BBox.fromBBoxes(...bboxes);
        return result.expand([4, 8]);
    });

    const ref = createRef<Rect>();
    code.add(<Rect
        ref={ref}
        offset={-1}
        opacity={0}
        size={bbox().size}
        position={bbox().position}
        radius={8}
        stroke={colors[index]}
        lineWidth={2}
        fill={colors[index].alpha(0.1)}
        shadowBlur={30}
        shadowColor={colors[index].alpha(1)}
    />);

    return {
        spawn: function* () {
            yield* all(
                ref().opacity(1, 1),
            )
        },
        despawn: function* () {
            yield* all(
                ref().opacity(0, 1),
                ref().y(ref().y() + 50, 1),
            )
        },
        ref: ref
    };
}

function* rect_talk(view: View2D, rect: Reference<GMRect>, content: string) {
    const ref = createRef<Txt>();

    view.add(<Txt
        fontSize={30}
        fill={"white"}
        ref={ref}
        scale={[.7, 1]}
        shadowColor={"#000a"}
        shadowBlur={10}
        textAlign={'left'}
        position={rect().position}
    />);

    return {
        ref: ref,
        spawn: function* () {
            yield* all(
                ref().scale(1, 1),
                ref().left(rect().right, 1, easeOutCubic),
                ref().text(content, 1)
            )
        },
        despawn: function* () {
            yield* all(
                ref().scale(.5, .7),
                ref().opacity(0, 1),
            )
        },
    };
}

export default makeScene2D(function* (view) {
    view.add(<Background />);
    const title = createRef<Txt>();

    view.add(<Chapter
        chapterNumber={5}
        name={"PROMISE & FUTURE"}
        icon={"material-symbols:clock-arrow-up-rounded"}
    />)

    const code = {
        code: createRef<Code>(),
        rect: createRef<Rect>()
    };

    view.add(<Rect
        size={'100%'}
        fill={"white"}
        shaders={{
            fragment: gaussianblur,
            uniforms: {
                strength: 10.,
                opacity: 0.6,
                darkness: -.4,
                borderModifier: -1.5,
                blurstrength: 52,
            }
        }}
    />);

    view.add(<GMRect
        size={[1100, 1000]}
        x={-360}
        ref={code.rect}
        darkness={-.4}
    >
        <Rect
            layout
            y={-460}
            justifyContent={'space-between'}
            width={1100}
            padding={60}
            zIndex={3}
        >
            <Txt
                text={"example.c"}
                fontSize={40}
                zIndex={4}
                fill={"white"}
                fontWeight={300}
                fontFamily={"Poppins"}
            />
            <Rect
                alignItems={'center'}
                gap={30}
                layout
            >
                {range(3).map(i => <Circle
                    size={20}
                    stroke={"#fffa"}
                    lineWidth={2}
                />)}
            </Rect>
        </Rect>
        <Code
            ref={code.code}
            fontSize={24}
            code={code_text}
            zIndex={1}
        />
    </GMRect>);
    code.rect().x(-1500);
    code.rect().save();
    code.rect().scale(0.7);
    code.rect().y(-100);

    view.add(<Txt
        ref={title}
        y={-400}
        fontSize={70}
        fill={"#fff2"}
        stroke={new Gradient({
            fromY: -35,
            toY: 35,
            stops: [
                { offset: 0, color: "#fff3" },
                { offset: .3, color: "#fff" },
                { offset: .7, color: "#fff" },
                { offset: 1, color: "#fff3" },
            ]
        })}
        lineWidth={3}
        fontFamily={"Poppins"}
        fontWeight={700}
        text={"SYNCHRONIZATION PRIMITIVES"}
    />);

    const promise = yield* createSynsRect(view, "promise", { x: -400 });
    const future = yield* createSynsRect(view, "future", { x: 400 });
    yield* waitFor(.5);
    const line_pf = yield* createConnection(view, promise().right(), future().left(), 30);

    yield* chain(
        waitUntil('slide'),
        sequence(
            0.24,
            all(
                line_pf().end(0, .6),
                line_pf().opacity(0, .6),
                title().y(-700, 1),
            ),
            all(
                promise().position([450, -100], .8),
                future().position([450, 100], .8),
                promise().height(150, 1),
                future().height(150, 1),
            )
        )
    );

    const promise_section = yield* highlight_code_sections(code.code(), "promise");
    const future_section = yield* highlight_code_sections(code.code(), "future");
    
    const workertext = createRef<Txt>();
    promise_section.ref().add(<Txt
        ref={workertext}
        text={"WORKER THREAD"}
        fontFamily={"Poppins"}
        fontWeight={600}
        fill={"#ffa"}
        y={-100}
        scale={[.4, 0]}
    />)

    const line = createRef<Line>();
    view.add(<CubicBezier
        p0={promise().bottom}
        p3={future().top}
        p1={[-100, 100]}
        p2={[-100, -100]}
        end={0}
        startOffset={20}
        endOffset={20}
        endArrow
        stroke={"#fff"}
        shadowColor={"#fffa"}
        shadowBlur={10}
        lineDash={[20, 10]}
        arrowSize={10}
        lineWidth={3}
        ref={line}
    />);

    yield* chain(
        sequence(
            .3,
            code.rect().restore(.6),
            all(
                shrinkSyncRect(promise),
                code.rect().x(-50, 1),
                shrinkSyncRect(future),
            )
        ),
        waitUntil("worker thread"),
        all(
            promise_section.spawn(),
            workertext().scale(1, 1),
        ),
        waitUntil("remv worker thread"),
        all(
            promise_section.despawn(),
            workertext().scale(0, 1),
        ),
        waitUntil('move'),
        all(
            promise().y(promise_section.ref().y() + promise_section.ref().height() / 2, 1),
            promise_section.ref().y(promise_section.ref().y(),1),
            promise_section.spawn(),
        ),
        all(
            future().y(future_section.ref().y() + future_section.ref().height() / 2, 1),
            future().x(future_section.ref().x() + future_section.ref().width(), 1),
            future().scale(.5, 1),
            future_section.spawn(),
        ),
        line().end(1, 1),
    );

    const dialog1 = yield* rect_talk(view, promise, "Give me more 2 seconds");
    const dialog2 = yield* rect_talk(view, future, "Bro I've been waiting since 70'");

    yield* waitUntil("talk");
    yield* chain(
        dialog1.spawn(),
        dialog2.spawn(),
    );

    yield* waitUntil("clean");
    yield* all(
        dialog1.despawn(),
        dialog2.despawn(),
        line().opacity(0, 1),
        line().end(0, 1),
        promise_section.despawn(),
        future_section.despawn(),
        promise().scale(0, 1),
        future().scale(0, 1),
        code.rect().x(0, 1),
        code.code().selection(lines(8, 10), 1),
    );
    yield* waitUntil("thread.get");
    yield* all(
        code.code().selection(lines(17,18), 1),
    );

    yield* waitUntil("default");
    yield* code.code().selection(DEFAULT, 1);

    yield* waitUntil("next");
});