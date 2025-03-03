import { Circle, CODE, Code, contrast, Gradient, grayscale, hue, Icon, invert, Latex, Layout, Line, lines, makeScene2D, Ray, Rect, Txt } from '@motion-canvas/2d';
import { all, any, BBox, chain, Color, createRef, createRefArray, createSignal, DEFAULT, delay, easeOutBack, easeOutCubic, linear, PossibleVector2, range, textLerp, threads, Vector2, waitFor, waitUntil } from '@motion-canvas/core';
import { Background } from '../components/background';
import { GMRect } from '../components/glassmorphic_rect';
import { MouseCursor } from '../components/mouseicon';

export default makeScene2D(function* (view) {

    const hue_rotate_filter = createSignal<number>(0);
    const thread_count = 3;
    const thread_names = "ABC".split("");
    const thread_duration = [new Vector2(0, 10), new Vector2(5, 20), new Vector2(15, 25)];
    const time_unit_pixels = createSignal<number>(0);
    const timeline_duration = 30;
    const wasted_time = timeline_duration - Math.max(...thread_duration.map(duration => duration.y));
    const currentTime = createSignal<number>(0);
    const functionOrder = createSignal<number>(0);
    const appearBug = createSignal<number>(0);
    const appearSus = createSignal<number>(0);
    const hasTransitioned = createSignal<number>(0);

    const thread_rects = createRefArray<Rect>();
    const time_mark = createRef<Ray>();
    const concurrent_card = createRef<GMRect>();
    const card_title = createRef<Txt>();
    const card_description = createRef<Txt>();
    const card_code = createRef<Code>();
    const expected_output = createRef<GMRect>();
    const output_code = createRef<Code>();
    const debug_play = createRef<Icon>();
    const debug_pause = createRef<Icon>();
    const cursor = createRef<MouseCursor>();
    const function_rects = createRefArray<GMRect>();
    const functionGraph = createRef<GMRect>();

    view.add(<Background filters={[hue(hue_rotate_filter)]} />);
    view.add(<GMRect
        size={[1300, 400]}
        y={-250}
        translucency={1}
        offsetY={3}
        ref={concurrent_card}
    >
        <Layout
            layout
            zIndex={3}
            direction={"column"}
            paddingTop={80}
            size={[1300, 400]}
            alignItems={'center'}
            padding={50}
        >
            <Txt
                fontSize={70}
                fontFamily={"Poppins"}
                ref={card_title}
                fill="rgb(255, 255, 255)"
                shadowColor={"white"}
                fontWeight={700}
                shadowBlur={10}
                textAlign={'left'}
                text={`CONCURRENT PROGRAMMING`}
            />
            <Txt
                fontSize={35}
                ref={card_description}
                text={`"a program that allows multiple processes or threads
to execute simultaneously, leading to non-deterministic
behavior where the same input can produce different correct
outputs"`}
                fontWeight={300}
                fill={"white"}

                fontFamily={"Poppins"}
                textAlign={'center'}
            />
        </Layout>
        <Icon
            ref={debug_play}
            icon={"material-symbols:play-arrow-rounded"}
            size={80}
            zIndex={3}
            y={-380}
        />
        <Icon
            ref={debug_pause}
            icon={"material-symbols:pause-rounded"}
            opacity={0}
            size={80}
            zIndex={3}
            y={-380}
        />
        <Code
            zIndex={2}
            ref={card_code}
            filters={[contrast(2)]}
            y={50}
            code={`\
void functionA() {
    printf("A running...\\n");
    for (int i = 1; i <= 3; i++) printf("A%d ", i);
    printf("\\n");
}

void functionB() {
    printf("B running...\\n");
    for (int i = 1; i <= 2; i++) printf("B%d ", i);
    printf("\\n");
}

void functionC() {
    printf("C running...\\n");
    for (int i = 1; i <= 4; i++) printf("C%d ", i);
    printf("\\n");
}

int main() {
    printf("Start\\n");
    functionA();
    functionB();
    functionC();
    printf("End\\n");
    return 0;
}`}
            fontFamily={"Fira Code"}
            fontSize={24}
            size={() => concurrent_card().size()}
            opacity={0}
        />
        {...["A", "B", "C"].map((name, i) => {
            const height = 160

            return <GMRect
                translucency={.2}
                height={height}
                radius={16}
                width={() => concurrent_card().width() - 100}
                y={175 * i - 252}
                zIndex={3}
                scaleY={0}
                scaleX={.7}
                ref={function_rects}
            >
                <GMRect
                    opacity={() => function_rects[i].scale().y > 0.4 ? function_rects[i].scale().y / 0.4 : 0}
                    size={60}
                    radius={1000}
                    translucency={1}
                    x={() => function_rects[i].width() / 2}
                    y={() => -function_rects[i].height() / 2}
                ><Txt
                        text={name}
                        size={30}
                        zIndex={3}
                        fontFamily={"Poppins"}
                        fontWeight={700}
                        y={() => i != 0 ? -13 : -15}
                        x={() => i != 1 ? -3 : 0}
                        fill={"white"}
                        shadowBlur={5}
                        shadowColor={"#c6b8ff"}
                    />
                    {(i == 2 ? 1 : null) ??
                        <Ray
                            toY={100}
                            lineWidth={3}
                            stroke={'#c6b8ff'}
                            endArrow
                            end={functionOrder}
                            arrowSize={10}
                        />
                    }
                </GMRect>
            </GMRect>
        })}
    </GMRect>);

    view.add(<Rect
        size={[1500, 350]}
        y={320}
    >
        <Ray
            ref={time_mark}
            toY={-320}
            x={() => time_unit_pixels() * timeline_duration / -2 + timeline_duration * time_unit_pixels() * currentTime() / timeline_duration}
            opacity={() => currentTime() < timeline_duration - 5 ? (currentTime() > 5 ? 1 : currentTime() / 5) : (timeline_duration - currentTime()) / 5}
            lineWidth={5}
            zIndex={-1}
            stroke={new Gradient({ from: 0, to: -120, stops: [{ color: "#fff", offset: 0 }, { color: "#fff0", offset: 1 }] })}
        >
            <Circle
                fill={"white"}
                size={24}
            >
                <Circle
                    size={35}
                    stroke={"white"}
                    lineWidth={3}
                />
                <Txt
                    text={() => currentTime().toFixed(2)}
                    y={50}
                    fontSize={30}
                    fontFamily={"Fira Code"}
                    fill={"white"}
                />
            </Circle>
        </Ray>
        <Ray
            toX={() => time_unit_pixels() * timeline_duration}
            x={() => -timeline_duration * time_unit_pixels() / 2}
            lineWidth={5}
            stroke={"white"}
            endArrow

        >
            <Txt
                text={"time"}
                fontFamily={"Fira Code"}
                y={30}
                x={() => time_unit_pixels() * timeline_duration + 30}
                scale={() => time_unit_pixels() / 40}
                fill={"white"}
                fontWeight={600}
                fontSize={30}
            />
            {range(thread_count).map(i => <Rect
                clip
                ref={thread_rects}
                width={() => {
                    const length = Math.abs(thread_duration[i].x - thread_duration[i].y);
                    return length * time_unit_pixels()
                }}
                height={70}
                radius={10}
                y={i % 2 * 100 - 170}
                x={() => {
                    const width = Math.abs(thread_duration[i].x - thread_duration[i].y);
                    return (width / 2 + thread_duration[i].x + wasted_time / 2) * time_unit_pixels();
                }}
                shadowBlur={20}
                lineWidth={() => 1 * (time_unit_pixels() / 40)}
                fill={"#fff1"}
                stroke={"white"}
                shadowColor={'white'}
            >
                <Rect
                    left={() => {
                        const length = Math.abs(thread_duration[i].x - thread_duration[i].y);
                        return [-length * time_unit_pixels() / 2, 0];
                    }}
                    height={200}
                    width={() => {
                        const thread_center = thread_rects[i].absolutePosition().x;
                        const thread_width = thread_rects[i].width();
                        const threadLeftX = thread_center - thread_width / 2;
                        const timeline_pos = time_mark().position().x+1010;
                        return Math.max(0, timeline_pos - threadLeftX)
                    }}

                    fill={() => {
                        const thread_center = thread_rects[i].absolutePosition().x;
                        const thread_width = thread_rects[i].width();
                        const threadLeftX = thread_center - thread_width / 2;
                        const timeline_pos = time_mark().absolutePosition().x;
                        const width = Math.max(0, timeline_pos - threadLeftX)
                        return new Gradient({
                            fromX: 0,
                            toX: width / 2,
                            stops: [{ offset: 0, color: "#fff3" }, { offset: 0.7, color: "#fff3" }, { offset: 1, color: "#ffff" }]
                        })
                    }}
                />
                <Txt
                    text={() => textLerp("", `Thread ${thread_names[i]}`, time_unit_pixels() / 40)}
                    textAlign={'left'}
                    width={() => thread_rects[i].width()}
                    fontFamily={"Poppins"}
                    fontSize={30}
                    fill={"white"}
                    shadowBlur={10}
                    shadowColor={"black"}
                    padding={20}
                />
            </Rect>)}

        </Ray>
    </Rect>)

    view.add(<GMRect
        ref={expected_output}
        size={[450, 450]}
        x={1190}
        y={150}
        darkness={-.1}
        borderModifier={-1}
        shadowColor={"white"}
        translucency={1}
        blurstrength={30}
    >
        <Layout
            size={() => expected_output().size()}
            layout
            direction={'column'}
            padding={20}
            paddingTop={0}
            zIndex={3}
        >
            <Rect
                layout
                justifyContent={'space-between'}
                alignContent={'center'}
                alignItems={'center'}
                size="100%"
                height={80}
                zIndex={3}
            >
                <Txt
                    text={"CONSOLE"}
                    fontSize={30}
                    zIndex={4}
                    fill={"white"}
                    fontWeight={600}
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
                ref={output_code}
                code={""}
                fontSize={25}
                zIndex={3}
                fontFamily={"Fira Code"}
                filters={[contrast(99)]}
            />

        </Layout>
    </GMRect>)

    view.add(<MouseCursor
        ref={cursor}
        position={output_code().position().add([1200, 150])}
        zIndex={3}
    />)

    view.add(<GMRect
        size={[1200, 500]}
        x={1600}
        ref={functionGraph}
        blurstrength={100}
    >
        <Txt
            text={"EXECUTION FLOW"}
            zIndex={3}
            fontSize={70}
            y={-180}
            fontFamily={"Poppins"}
            fill="rgb(255, 255, 255)"
            shadowColor={"white"}
            fontWeight={700}
            shadowBlur={10}
            textAlign={'left'}
        />

        <Ray
            fromX={-500}
            toX={500}
            lineWidth={4}
            stroke={'#fff'}
            zIndex={3}
            y={140}
            arrowSize={15}
            endArrow
        >
            <Ray
                toY={-200}
                lineWidth={6}
                stroke={new Gradient({
                    fromY : 0,
                    toY : -180,
                    stops : [
                        {color : "#fff", offset: 0},
                        {color : "#fff0", offset: .2},
                        {color : "#fff0", offset: 0.4},
                        {color : "#fff0", offset: 0.6},
                        {color : "#fff", offset: 0.7},
                        {color : "#fff0", offset: .9},
                    ]
                })}
                opacity={appearBug}
                end={appearBug}
                
            >
             <Icon
                icon={"material-symbols:bug-report-rounded"}
                size={50}
                y={()=>-190 * appearBug()}
             /> 
             <Circle
                size={20}
                fill={'white'}
                shadowBlur={10}
                shadowColor={'white'}
             />
             <Rect
                size={30}
                fill={"#f583"}
                stroke={'#faa'}
                lineWidth={1}
                shadowBlur={30}
                shadowColor={"#faa"}
                width={500}
                height={110}
                y={-70}
                radius={16}
                x={-255}
                opacity={appearSus}
                start={()=>1-appearSus()}
             >
                <Txt
                    text={"bug origin".toUpperCase()}
                    y={()=>-80 * appearSus()}
                    fontSize={30}
                    fontFamily={"Poppins"}
                    fill={"rgb(250, 201, 213)"}
                    shadowBlur={10}
                    shadowColor={"rgb(255, 165, 199)"}
                    fontWeight={400}
                />
             </Rect>
            </Ray>
            <Layout
                width={1000}
                height={70}
                y={-70}
                paddingRight={10}
                gap={10}
                alignItems={'center'}
                layout
            >
                {[
                    ["main", 10, "#fff"],
                    ["functionA", 20, "rgb(89, 175, 255)"],
                    ["main", 10, "#fff"],
                    ["functionB", 20, "rgb(59, 243, 148)"],
                    ["main", 10, "#fff"],
                    ["functionC", 20, "rgb(175, 94, 250)"],
                    ["main", 10, "#fff"],
                ].map(data => <Rect
                    width={() => `${data[1]}%` as any}
                    height={data[0] == "main" ? '80%' : `100%`}
                    alignItems={'center'}
                    justifyContent={'center'}
                    radius={16}
                    shadowBlur={20}
                    lineWidth={1.5}
                    stroke={new Color("#fff").lerp(new Color(data[2]), .5)}
                    fill={new Color("#fff1").lerp(new Color(data[2]).alpha(.4), .5)}
                    shadowColor={'white'}
                    padding={10}
                >
                    <Txt
                        text={data[0] as any}
                        fontSize={25}
                        fontFamily={"Poppins"}
                        textAlign={'left'}
                        width={'100%'}
                        alignSelf={'center'}
                        fill={"white"}
                        shadowBlur={10}
                        shadowColor={"000a"}
                    />
                </Rect>)}
            </Layout>
            
        </Ray>

    </GMRect>)

    yield* chain(
        waitUntil('start'),
        all(
            time_unit_pixels(40, 1),
            concurrent_card().offset(0, 1),
        ),
        any(currentTime(30, 6, linear), waitFor(0)),
        waitUntil("not"),
        all(
            hasTransitioned(-30, 1),
            concurrent_card().skew([180, -180], 1),
            delay(.5, () => {
                card_title().text("NOT CONCURRENT PROGRAMMING"); card_description().text(`\
Not Concurrent Programming refers to programming paradigms,
methods, or systems that do not involve
tasks being executed simultaneously or overlapping in time.
(basically everything happens in a sequence)`)
            }),
            ...thread_rects.map(rect => rect.y(-170 + 100, 1)),
            hue_rotate_filter(-50, 1),
            thread_rects[1].width(300, 1),
            thread_rects[0].width(300, 1),
            thread_rects[2].width(300, 1),
        )

    );

    yield* chain(
        waitUntil("code"),
        all(
            concurrent_card().position(0, .7),
            concurrent_card().darkness(-.2, .7),
            concurrent_card().borderModifier(-1.0, .7),
            concurrent_card().size([900, 900], .8),
            card_title().opacity(0, .5),
            card_description().opacity(0, .5),
            time_unit_pixels(0, .5),
            card_code().opacity(1, 1),
            hue_rotate_filter(0, 1),
            ...thread_rects.map(rect => rect.opacity(0, .4)),
        ),
        waitUntil("output"),
        all(
            cursor().position([300, 0], 1),
            concurrent_card().x(-200, 1),
            expected_output().x(420, 1),
        ),
        cursor().goTo(debug_play().position().addX(-200), 1),
        all(
            cursor().click(),
            debug_play().opacity(0, .5),
            debug_pause().opacity(1, .5),
        ),
        chain(
            any(
                card_code().selection(lines(18), .3),
                cursor().goTo([0, -1000], 1),
            ),
            waitFor(.5),
            all(
                card_code().selection(lines(19), .3),
                output_code().code.append("Start\n", .5),
            ),
            card_code().selection(lines(20), .3),
            card_code().selection(lines(0), .3),
            waitFor(.3),
            any(
                card_code().selection(lines(1), .3),
                output_code().code.append("A running ... \n", .5),
            ),
            waitFor(.5),
            all(
                card_code().selection(lines(2), .3),
                chain(
                    output_code().code.append("A1", .3),
                    output_code().code.append(" A2", .2),
                    output_code().code.append(" A3", .2),
                )
            ),
            waitFor(.5),
            card_code().selection(lines(3), .3),
            card_code().selection(lines(21), .3),
            waitFor(.3),
            card_code().selection(lines(6), .3),
            all(
                card_code().selection(lines(7), .3),
                output_code().code.append("\nB running ...", .6),
            ),
            all(
                card_code().selection(lines(8), .3),
                chain(
                    output_code().code.append("\nB1", .3),
                    output_code().code.append(" B2", .3),
                    output_code().code.append(" B3", .3),
                )
            ),
            card_code().selection(lines(9), .3),
            waitFor(.3),
            card_code().selection(lines(22), .3),
            waitFor(.2),
            all(
                card_code().selection(lines(12, 16), .8),
                output_code().code.append("\nC running ...\nC1 C2 C3 C4\n", .6),
            ),
            waitFor(.2),
            all(
                card_code().selection(lines(23), .3),
                output_code().code.append("End", .3),
            ),
            waitFor(.3),
            card_code().selection(lines(24), .3),
            waitFor(.5),
            all(
                card_code().selection(DEFAULT, .3),
                debug_pause().opacity(0, .8),
                debug_play().opacity(1, .8),
            ),
            waitUntil("a"),
            function_rects[0].scale(1, .6),
            waitUntil('b'),
            all(
                expected_output().position([500, 220], .7),
                function_rects[1].scale(1, .6),
            ),
            waitUntil('c'),
            function_rects[2].scale(1, .6),
            waitUntil('order'),
            functionOrder(1, 1),
        ),
        waitUntil('graph'),
        cursor().position([1600, 100], 0),
        all(
            concurrent_card().x(-1200, 1),
            expected_output().x(-500, 1),
            functionGraph().x(0, 1),
            cursor().x(0, 1),
        ),
        all(
            cursor().position([-300, 700], .5),
        ),
        waitUntil('bug'),
        appearBug(1, 2, easeOutCubic),
        waitUntil('sus zone'),
        appearSus(1, 1, easeOutCubic)
    )

    yield* waitUntil("next");
});
