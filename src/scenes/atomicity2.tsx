import { Code, makeScene2D, saturate, Txt, Node, View2D, Ray, Line, Rect, Icon, blur, Layout, Gradient, lines } from "@motion-canvas/2d";
import { all, chain, Color, createRef, createRefArray, createSignal, DEFAULT, delay, easeOutCubic, linear, PossibleColor, PossibleVector2, range, sequence, spawn, textLerp, useLogger, useRandom, Vector2, waitUntil } from "@motion-canvas/core";
import { Background } from "../components/background";
import gaussianblur from "../shaders/glassmorphic.glsl";
import { GMRect } from "../components/glassmorphic_rect";
import { DarkAssmStyle, DarkCppStyle } from "../project";
import { Float } from "../components/float";

export default makeScene2D(function* (view) {
    view.add(<Background />);

    const blursterngth = createSignal<number>(1);
    const blurrect = <Rect
        size={'100%'}
        fill={"white"}
        shaders={{
            fragment: gaussianblur,
            uniforms: {
                strength: 10.,
                opacity: () => blursterngth() * 0.9,
                darkness: -.4,
                borderModifier: -1.5,
                blurstrength: () => blursterngth() * 50 + 2,
            }
        }}
    />;
    view.add(blurrect);

    const natural = createRef<GMRect>();
    const artificial = createRef<GMRect>();
    const title = createRef<Txt>();
    const rays = createRefArray<Line>();

    view.add(<Txt
        text={"ATOMIC OPERATIONS"}
        lineWidth={4}
        fontSize={130}
        ref={title}
        y={-600}
        fontFamily={"Poppins"}
        fill={"#fff0"}
        stroke={new Gradient({
            fromY: -25,
            toY: 25,
            stops: [
                { offset: 0, color: "#fff5" },
                { offset: .5, color: "#fff" },
                { offset: 1, color: "#fff5" },
            ]
        })}
        fontWeight={700}
    />);

    view.add([artificial, natural].map((kind, i) => <Line
        ref={rays}
        points={() => [
            title().bottom().addX(i == 1 ? -300 : 300),
            title().bottom().add(kind().top()).div(2).addX(i == 1 ? -100 : 100),
            kind().top(),
        ]}
        radius={300}
        lineWidth={6}
        lineDash={[40, 10]}
        end={0}
        stroke={new Gradient({
            fromY: -225,
            toY: 225,
            stops: [
                { offset: 0, color: "#fff5" },
                { offset: .5, color: "#fff" },
                { offset: 1, color: "#fff5" },
            ]
        })}
        arrowSize={10}
        endOffset={50}
        startOffset={50}
        endArrow
    />));

    view.add(<GMRect
        size={[500, 600]}
        shadowColor={"#fffa"}
        translucency={0.2}
        darkness={-.2}
        scale={[.5, 0]}
        x={-300}
        ref={natural}
        y={50}
    >
        <Layout
            layout
            size={[500, 600]}
            zIndex={1}
            direction={"column"}
            justifyContent={'start'}
            fontFamily={"Poppins"}
            alignItems={'center'}
            padding={30}
            gap={30}
        >
            <Rect
                direction={'column'}
                alignItems={'center'}
            >
                <Txt
                    text={"NATURAL"}
                    fill={new Gradient({
                        fromY: -25,
                        toY: 25,
                        stops: [
                            { offset: 0, color: "#fff5" },
                            { offset: .5, color: "#fff" },
                            { offset: 1, color: "#fff5" },
                        ]
                    })}
                    fontWeight={700}
                />
                <Line
                    points={[
                        [-200, 0],
                        [200, 0]
                    ]}
                    stroke={new Gradient({
                        fromX: -200,
                        toX: 200,
                        stops: [
                            { offset: 0, color: "#fff0" },
                            { offset: .2, color: "#fff" },
                            { offset: .8, color: "#fff" },
                            { offset: 1, color: "#fff0" },
                        ]
                    })}
                    lineWidth={2}
                />
            </Rect>
            <Rect
                direction={'column'}
                alignItems={'center'}
                gap={30}
            >
                <Txt
                    fontSize={25}
                    fontWeight={300}
                    fill={'white'}
                    textAlign={'center'}
                >{"Ussually is something really\nbasic, thus is so fast it can't\nbe interrupted."}</Txt>
                <Rect
                    fill={"#0004"}
                    radius={12}
                    padding={10}
                    lineWidth={1}
                    stroke={"#fffa"}
                    height={70}
                    alignItems={'center'}
                    justifyContent={'center'}
                    width={'100%'}
                >
                    <Code
                        code={"MOV RAX, [memory_location]"}
                        fontSize={25}
                    />
                </Rect>
                <Rect
                    fill={"#0004"}
                    radius={12}
                    padding={10}
                    lineWidth={1}
                    stroke={"#fffa"}
                    justifyContent={'center'}
                    alignItems={'center'}
                    width={'100%'}
                    height={70}
                >
                    <Code
                        code={"MOV [memory_location], RAX"}
                        highlighter={DarkAssmStyle}
                        fontSize={25}
                    />
                </Rect>
                <Rect
                    fill={"#0004"}
                    radius={12}
                    padding={10}
                    lineWidth={1}
                    stroke={"#fffa"}
                    justifyContent={'center'}
                    alignItems={'center'}
                    width={'100%'}
                    height={70}
                >
                    <Code
                        code={"XCHG RAX, [memory_location]"}
                        fontSize={25}
                    />
                </Rect>
            </Rect>

        </Layout>
    </GMRect>);

    view.add(<GMRect
        size={[500, 600]}
        shadowColor={"#fffa"}
        translucency={0.2}
        darkness={-.2}
        scale={[.5, 0]}
        x={300}
        ref={artificial}
        y={50}
    >
        <Layout
            layout
            size={[500, 600]}
            zIndex={1}
            direction={"column"}
            justifyContent={'start'}
            fontFamily={"Poppins"}
            alignItems={'center'}
            padding={30}
            gap={30}
        >
            <Rect
                direction={'column'}
                alignItems={'center'}
            >
                <Txt
                    text={"ARTIFICIAL"}
                    fill={new Gradient({
                        fromY: -25,
                        toY: 25,
                        stops: [
                            { offset: 0, color: "#fff5" },
                            { offset: .5, color: "#fff" },
                            { offset: 1, color: "#fff5" },
                        ]
                    })}
                    fontWeight={700}
                />
                <Line
                    points={[
                        [-200, 0],
                        [200, 0]
                    ]}
                    stroke={new Gradient({
                        fromX: -200,
                        toX: 200,
                        stops: [
                            { offset: 0, color: "#fff0" },
                            { offset: .2, color: "#fff" },
                            { offset: .8, color: "#fff" },
                            { offset: 1, color: "#fff0" },
                        ]
                    })}
                    lineWidth={2}
                />
            </Rect>
            <Rect
                direction={'column'}
                alignItems={'center'}
                gap={30}
            >
                <Txt
                    fontSize={25}
                    fontWeight={300}
                    fill={'white'}
                    textAlign={'center'}
                >{"More complex operations\nthat need to be manually\nensured as atomic."}</Txt>
                <Rect
                    fill={"#0004"}
                    radius={12}
                    padding={10}
                    lineWidth={1}
                    stroke={"#fffa"}
                    width={'100%'}
                    justifyContent={'center'}
                >
                    <Icon
                        icon={"tabler:lock-question"}
                        size={50}
                    />
                </Rect>
                <Rect
                    fill={"#0004"}
                    radius={12}
                    padding={10}
                    lineWidth={1}
                    stroke={"#fffa"}
                    width={'100%'}
                    justifyContent={'center'}
                >
                    <Icon
                        icon={"tabler:lock-question"}
                        size={50}
                    />
                </Rect>
                <Rect
                    fill={"#0004"}
                    radius={12}
                    padding={10}
                    lineWidth={1}
                    stroke={"#fffa"}
                    width={'100%'}
                    justifyContent={'center'}
                >
                    <Icon
                        icon={"tabler:lock-question"}
                        size={50}
                    />
                </Rect>
            </Rect>
        </Layout>
    </GMRect>);

    yield* chain(
        waitUntil("title"),
        title().y(-450, 1),
        sequence(
            .6,
            all(
                ...rays.map(r => r.end(1, 1)),
            ),
            all(
                natural().scale(.75, 1),
                natural().y(0, 1),
            ),
            all(
                artificial().scale(.75, 1),
                artificial().y(0, 1),
            ),
        ),
        all(
            ...rays.map(r => r.opacity(0, .6)),
            ...rays.map(r => r.end(0, .6)),
            artificial().scale(1, 1),
            natural().scale(1, 1),
            title().y(-600, 1),
        ),
    );
    title().remove();
    rays().remove();

    yield* waitUntil("natural");
    yield* all(
        natural().scale(1.1, 1),
        artificial().scale(.9, 1)
    );
    yield* waitUntil("aritifical");
    yield* all(
        natural().scale(1, 1),
        artificial().scale(1, 1)
    );

    const codeExampleRect = createRef<GMRect>();
    const codeExample = createRef<Code>();
    view.add(<GMRect
        size={[800, 500]}
        x={1400}
        ref={codeExampleRect}
        darkness={.3}
        borderModifier={-.9}
    >
        <Code
            ref={codeExample}
            zIndex={1}
            fontSize={40}
            code={`\
int size = CalculateSize();
Item item  = ProduceItem(size);
// invocation
AddItemToQueue(&g_queue, item);
// response
FreeItem(item);
printf("success!\\n");`}
        />

    </GMRect>)
    yield* waitUntil("example");
    yield* all(
        artificial().x(-1300, 2),
        natural().x(-1530, 2),
        codeExampleRect().x(0, 2),
    );
    yield* Float(codeExampleRect);
    natural().remove();
    artificial().remove();
    
    yield* chain(
        waitUntil("start"),
        codeExample().selection(lines(2), .4),
        waitUntil("end"),
        codeExample().selection(lines(4), .4),
        waitUntil("section"),
        codeExample().selection(lines(2, 4), .4),
        waitUntil("back"),
        codeExample().selection(DEFAULT, .4),
    );

    const otherRect = createRef<Rect>();
    yield* Float(otherRect);
    view.add(<Rect
        layout
        ref={otherRect}
        direction={'column'}
        y={50}
        opacity={0}
    >
        <Txt
            text={"Synchronization".toUpperCase()}
            textAlign={'center'}
            lineWidth={4}
            fontSize={130}
            fontFamily={"Poppins"}
            y={60}
            fill={"#fff0"}
            stroke={new Gradient({
                fromY: -25,
                toY: 25,
                stops: [
                    { offset: 0, color: "#fff5" },
                    { offset: .5, color: "#fff" },
                    { offset: 1, color: "#fff5" },
                ]
            })}
            fontWeight={700}
        />
        <Txt
            text={"Primitives".toUpperCase()}
            textAlign={'center'}
            lineWidth={4}
            fontSize={130}
            fontFamily={"Poppins"}
            y={60}
            fill={"#fff2"}
            stroke={new Gradient({
                fromY: -25,
                toY: 25,
                stops: [
                    { offset: 0, color: "#fff5" },
                    { offset: .5, color: "#fff" },
                    { offset: 1, color: "#fff5" },
                ]
            })}
            fontWeight={700}
        />

    </Rect>);


    yield* chain(
        waitUntil("sync"),
        sequence(
            1.2,
            codeExampleRect().x(-1500, 2),
            all(
                otherRect().opacity(1, 1.5),
                otherRect().y(0, 1.5),
            )
        )
    );

    yield* waitUntil("next");
});