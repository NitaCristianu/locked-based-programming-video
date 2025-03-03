import { Circle, contrast, Gradient, grayscale, hue, Icon, invert, Latex, Layout, Line, lines, makeScene2D, Node, Ray, Rect, saturate, signal, Txt } from '@motion-canvas/2d';
import { all, any, BBox, chain, Color, createRef, createRefArray, createSignal, DEFAULT, delay, easeInExpo, easeInOutCubic, easeInOutQuint, easeOutBack, easeOutBounce, easeOutCubic, easeOutExpo, linear, loop, PossibleVector2, range, Reference, Signal, SimpleSignal, textLerp, Thread, threads, tween, useLogger, useRandom, useScene, Vector2, waitFor, waitUntil } from '@motion-canvas/core';
import { Background } from '../components/background';
import { GMRect } from '../components/glassmorphic_rect';
import { Notification } from '../components/notifcation';
import { Float } from '../components/float';

const rand_offsets: number[] = [];
function getRayPoints(thread: Rect, core: Reference<Rect> | Rect, time: SimpleSignal<number>, bottom: boolean = false, i = 0): PossibleVector2[] {
    const angle = 30;
    if (rand_offsets.length <= i) {
        const generator = useRandom(i);
        rand_offsets.push(generator.nextFloat(0, 100))
    }
    const t = time() + rand_offsets[i];

    const r = (thread.size().x * thread.scale().x) / 2;

    const threadPoint = new Vector2(Math.sin(angle + t), Math.cos(angle + t)).mul(r).add(thread.position());
    if (!(core instanceof Rect)) {
        core = core();
    }
    var corePoint = core.top().addX(Math.sin(t) * 100);
    if (bottom)
        corePoint = core.bottom().addX(Math.sin(t) * 100);

    return [
        threadPoint,
        corePoint.add(threadPoint).div(2).addX(Math.sin(t) * 30),
        corePoint
    ];

}

export default makeScene2D(function* (view) {
    const contrastSignal = createSignal(1);
    view.add(<Background filters={[saturate(contrastSignal)]} />);

    const initialThread = createRef<GMRect>();
    const instructions = createRefArray<GMRect>();
    const camera = createRef<Node>();

    const instruction_count = 5;
    const appear_instructions = createSignal(0);

    const title = createRef<Txt>();
    const initialCore = createRef<Rect>();
    const time = createSignal(0);
    const unselectedThreads = createSignal<number[]>([0, 0, 0, 0]);

    view.add(<Node ref={camera} />);

    yield* Float(initialThread);

    camera().add(<Txt
        text={"THREAD"}
        y={-300}
        fontFamily={"Poppins"}
        fontSize={100}
        fontWeight={700}
        ref={title}
        textAlign={'center'}
        width={"100%"}
        height={'10%'}
        fill={new Gradient({
            toY: 50,
            stops: [
                { offset: 0, color: "#fff" },
                { offset: 1, color: "#fff0" }
            ]
        })}
    />)

    camera().add(<GMRect
        ref={initialThread}
        size={300}
        radius={1000}
    >
        <Txt
            text={"A"}
            opacity={() => 1 - unselectedThreads()[0]}
            zIndex={3}
            fill={new Gradient({
                toY: 100,
                stops: [
                    { offset: 0, color: "#fff" },
                    { offset: 1, color: "#fff0" }
                ]
            })}
            fontSize={150}
            fontWeight={500}
            fontFamily={"Poppins"}
        />
    </GMRect>);

    camera().add(<Node>
        {range(instruction_count).map(i => <GMRect
            size={[400, 70]}
            scale={[.4, 0]}
            ref={instructions}
            y={() => (i - 2) * 120 * appear_instructions()}
            darkness={() => -.4 * appear_instructions()}
            borderModifier={() => -2 * appear_instructions()}
            shadowColor={() => new Color("#fff").lerp(new Color("#222"), appear_instructions())}
        >
            <Txt
                text={['mov esp, x', 'pushq y', 'subq esp, x', 'call house', 'xor esp, idk'][i]}
                fontFamily={"Fira Code"}
                zIndex={3}
                fill={new Gradient({
                    toY: 20,
                    stops: [
                        { offset: 0, color: "#fff" },
                        { offset: 1, color: "#fff0" }
                    ]
                })}
                fontSize={30}
            />
        </GMRect>)}
    </Node>);

    camera().add(<Rect
        x={1200}
        size={300}
        ref={initialCore}
        stroke={"white"}
        lineWidth={32}
        shadowBlur={20}
        shadowColor={"white"}
        radius={64}
    >
        <Txt
            text={"CORE\n0"}
            textAlign={"center"}
            fontFamily={"Fira Code"}
            fontWeight={800}
            fontSize={80}
            fill={"white"}
            shadowBlur={20}
            shadowColor={"#000a"}
        />
    </Rect>)

    yield time(1000, 1000, linear);
    yield* waitUntil("start");
    yield* all(
        initialThread().scale([.7, 0], 1, easeInOutQuint),
        title().y(-400, 1),
        title().text("INSTRUCTIONS", 2),
        title().opacity(0, .6).back(1),
        delay(.3, all(
            appear_instructions(1, 1.5, easeInOutQuint),
            ...instructions.map(instr => instr.scale(1, 1, easeInOutQuint)),
        )),
    );
    yield* waitUntil("cpu");
    yield* all(
        ...instructions.map(instr => instr.x(-300, 1)),
        title().opacity(0, .6),
        initialCore().x(200, 1),
    );
    yield* waitFor(.5);
    yield initialCore().x(0, 2),
        yield Notification(3, "The instructions are not always executed in the intended sequence;\nthe CPU might reorder them to improve performance.", view);
    yield* chain(
        ...instructions.map((instr, i) => any(
            instr.scale(0, .4 * ((instruction_count - i) / 2)),
            instr.position([200, 0], .5 * ((instruction_count - i) / 2)),
            initialCore().scale(.8, .4 * ((instruction_count - i) / 2)).back(.2),
            waitFor(.1 * ((instruction_count - i) / 2)),
        )),
    );
    yield* Float(initialCore);
    yield* waitUntil("Appear other threads")

    const ray_Initial = createRef<Line>();
    camera().add(<Line
        zIndex={-3}
        points={() => getRayPoints(initialThread(), initialCore(), time)}
        lineWidth={10}
        lineDash={[20, 10]}
        shadowBlur={10}
        shadowColor={"white"}
        endArrow
        ref={ray_Initial}
        endOffset={20}
        radius={300}
        startOffset={10}
        opacity={() => initialThread().scale().y * (1 - unselectedThreads()[0])}
        arrowSize={10}
        stroke={"white"}
    />);

    const otherlines_opacity = createSignal(0);
    const core_clones: Rect[] = [
        initialCore().clone(),
        initialCore().clone(),
        initialCore().clone(),
    ];
    const thread_clones: GMRect[] = [
        initialThread().clone(),
        initialThread().clone(),
        initialThread().clone(),
    ];
    const line_clones: Line[] = [
        ray_Initial().clone(),
        ray_Initial().clone(),
        ray_Initial().clone(),
    ];
    line_clones.forEach((clone, i) => {
        clone.points(() => getRayPoints(thread_clones[i], core_clones[i], time, i % 2 ? false : true, i + 1))
        clone.opacity(()=>(1-unselectedThreads()[i+1]) * otherlines_opacity());
        camera().add(clone);
    })
    thread_clones.forEach((clone, i) => {
        clone.x(i * 350 - 150);
        clone.scale(0); // .6
        (clone.findFirst(node => true) as Txt).text(`${["BCD"[i]]}`);
        (clone.findFirst(node => true) as Txt).opacity(() => 1 - unselectedThreads()[i + 1]);
        clone.y(-330 * (i % 2 * 2 - 1))
        camera().add(clone);
    })
    core_clones.forEach((clone, i) => {
        clone.x(i * 350 - 150 + 1500);
        (clone.findFirst(node => true) as Txt).text(`CORE\n${i + 1}`);
        camera().add(clone);
    })
    yield* Float(thread_clones[0]);
    yield* Float(thread_clones[1]);
    yield* Float(thread_clones[2]);
    yield* Float(core_clones[0]);
    yield* Float(core_clones[1]);
    yield* Float(core_clones[2]);

    yield* all(
        initialThread().scale(.6, 1),
        initialThread().position([140, -350], 1),
    );

    yield* waitUntil("others");
    yield* all(
        initialCore().x(-500, 1),
        initialThread().x(-700, 1),
        ...core_clones.map(core => core.x(core.x() - 1500, 1)),
        delay(.5, all(
            otherlines_opacity(1, 1, easeOutCubic),
            ...thread_clones.map(clone => clone.scale(.6, 1, easeOutCubic)),
        ))
    )

    yield* waitUntil("one core");
    yield* all(
        ...line_clones.map((clone, i) => clone.points(() => getRayPoints(thread_clones[i], initialCore, time, i % 2 ? false : true, 1 + i), 1.5)),
        ...core_clones.map((clone, i) => clone.x(clone.x() + 2500, 1)),
        initialCore().x(0, 1),
        initialThread().position([-300, -300], 1),
        thread_clones[2].position([400, 300], 1),
    );

    const n_threads = 4;
    const thread_names = "ABCD".split("");
    const thread_duration = [new Vector2(0, 10), new Vector2(10, 20), new Vector2(20, 30), new Vector2(30, 40)];
    const time_unit_pixels = createSignal<number>(0);
    const timeline_duration = 40;
    const wasted_time = timeline_duration - Math.max(...thread_duration.map(duration => duration.y));
    const currentTime = createSignal<number>(0);
    const rect_timeline_x = createSignal<number>(400);

    const time_mark = createRef<Ray>();
    const thread_rects = createRefArray<Rect>();
    const lap = createSignal(1);
    const n_laps = 4;

    view.add(<Rect
        size={[1500, 350]}
        y={100}
        x={rect_timeline_x}
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
                scale={() => time_unit_pixels() / 20}
                fill={"white"}
                fontWeight={600}
                fontSize={30}
            />
            {range(n_threads).map(i => <Rect
                clip
                ref={thread_rects}
                width={() => {
                    const length = Math.abs(thread_duration[i].x - thread_duration[i].y);
                    return length * time_unit_pixels()
                }}
                height={70}
                radius={10}
                y={1 * 100 - 170}
                x={() => {
                    const width = Math.abs(thread_duration[i].x - thread_duration[i].y);
                    return (width / 2 + thread_duration[i].x + wasted_time / 2) * time_unit_pixels();
                }}
                shadowBlur={20}
                lineWidth={() => 1 * (time_unit_pixels() / 20)}
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
                        const timeline_pos = time_mark().absolutePosition().x;
                        return Math.min(
                            Math.max(0,
                                timeline_pos - threadLeftX,
                                thread_width * (lap() - 1) / n_laps,
                            ),
                            thread_width * lap() / n_laps
                        );
                    }}

                    fill={() => {
                        const thread_center = thread_rects[i].absolutePosition().x;
                        const thread_width = thread_rects[i].width();
                        const threadLeftX = thread_center - thread_width / 2;
                        const timeline_pos = time_mark().absolutePosition().x;
                        const width = Math.min(
                            Math.max(0,
                                timeline_pos - threadLeftX,
                                thread_width * (lap() - 1) / n_laps,
                            ),
                            thread_width * lap() / n_laps
                        );
                        return new Gradient({
                            fromX: 0,
                            toX: width / 2,
                            stops: [{ offset: 0, color: "#fff3" }, { offset: 0.7, color: "#fff3" }, { offset: 1, color: "#ffff" }]
                        })
                    }}
                />
                <Txt
                    text={() => textLerp("", `Thread ${thread_names[i]}`, time_unit_pixels() / 20)}
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
    </Rect>);

    yield* waitUntil("timeline");
    yield* camera().x(-400, 2);
    yield* all(
        time_unit_pixels(18, 1),
    );
    yield* chain(
        all(
            currentTime(2.5, 0.5, linear).to(10, 0.2, linear),
            unselectedThreads([0, 1, 1, 1], .2)
        ),
        all(
            currentTime(12.5, 0.5, linear).to(20, 0.2, linear),
            unselectedThreads([1, 0, 1, 1], .2)
        ),
        all(
            currentTime(22.5, 0.5, linear).to(30, 0.2, linear),
            unselectedThreads([1, 1, 0, 1], .2)
        ),
        all(
            currentTime(32.5, 0.5, linear).to(2.5, 0.2, linear),
            unselectedThreads([1, 1, 1, 0], .2)
        ),
        any(lap(2, .2), waitFor(0.01)),
        all(
            currentTime(5, 0.5, linear).to(12.5, 0.2, linear),
            unselectedThreads([0, 1, 1, 1], .2)
        ),
        all(
            currentTime(15, 0.5, linear).to(22.5, 0.2, linear),
            unselectedThreads([1, 0, 1, 1], .2)

        ),
        all(
            currentTime(25, 0.5, linear).to(32.5, 0.2, linear),
            unselectedThreads([1, 1, 0, 1], .2)

        ),
        all(
            currentTime(35, 0.5, linear).to(5, 0.2, linear),
            unselectedThreads([1, 1, 1, 0], .2)

        ),
        any(lap(3, .2), waitFor(0.01)),
        all(
            currentTime(7.5, 0.5, linear).to(15, 0.2, linear),
            unselectedThreads([0, 1, 1, 1], .2)
        ),
        all(
            currentTime(17.5, 0.5, linear).to(25, 0.2, linear),
            unselectedThreads([1, 0, 1, 1], .2)
        ),
        all(
            currentTime(27.5, 0.5, linear).to(35, 0.2, linear),
            unselectedThreads([1, 1, 0, 1], .2)
        ),
        all(
            currentTime(37.5, 0.5, linear),
            unselectedThreads([1, 1, 1, 0], .2)
        ),
        any(lap(4, .2), waitFor(0.01)),
        all(
            currentTime(7.5, 0.5, linear),
            unselectedThreads([0, 1, 1, 1], .2)
        ),
        all(
            currentTime(10, 0.5, linear).to(17.5, 0.2, linear),
            unselectedThreads([1, 0, 1, 1], .2)
        ),
        all(
            currentTime(20, 0.5, linear).to(27.5, 0.2, linear),
            unselectedThreads([1, 1, 0, 1], .2)
        ),
        all(
            currentTime(30, 0.5, linear).to(37.5, 0.2, linear),
            unselectedThreads([1, 1, 1, 0], .2)
        ),
        all(
            currentTime(40, 0.5, linear),
            unselectedThreads([0, 0, 0, 0], .2)
        )
    );
    const generator = useRandom();
    const instructions_container = createRef<Rect>();
    const instructions_refs = createRefArray<GMRect>();
    const names = ['x', 'd', 'e', 'c', 'g', 'a', 'b', 'f', 'h', 'y', 'z'];
    const instructions_data = [
        'mov eax, var1',
        'add rbx, 42h',
        'cmp rcx, var2',
        'jmp target_label',
        'lea rdx, [rbp-8]',
        'inc rsi',
        'test r10, r10',
        'movzx ecx, byte ptr [rax]',
        'imul ebx, ecx, 5',
        'shr rdx, 1',
        'sal eax, 2',
    ]
    const bugIcon = createRef<Icon>();
    view.add(<Node ref={instructions_container} x={-4600}>
        <Icon
            ref={bugIcon}
            icon={"material-symbols:bug-report-rounded"}
            size={100}
            color={"rgb(255, 130, 130)"}
            shadowColor={"rgb(221, 46, 46)"}
            shadowBlur={30}
            opacity={0}
            x={() => (a.x() + b.x()) / 2}
        >
            <Circle
                size={140}
                lineWidth={5}
                shadowColor={"rgb(255, 0, 0)"}
                shadowBlur={100}
                lineDash={[20, 20]}
                stroke={"rgb(250, 200, 200)"}
            />
            <Circle
                size={140}
                lineWidth={5}
                shadowColor={"rgb(255, 0, 0)"}
                shadowBlur={100}
                lineDash={[20, 20]}
                stroke={"rgb(250, 200, 200)"}
            />
            <Circle
                size={140}
                lineWidth={5}
                shadowColor={"rgb(255, 0, 0)"}
                shadowBlur={100}
                lineDash={[20, 20]}
                stroke={"rgb(250, 200, 200)"}
            />
            <Circle
                size={140}
                lineWidth={5}
                shadowColor={"rgb(255, 0, 0)"}
                shadowBlur={100}
                lineDash={[20, 20]}
                stroke={"rgb(250, 200, 200)"}
            />
            <Circle
                size={140}
                lineWidth={5}
                shadowColor={"rgb(255, 0, 0)"}
                shadowBlur={100}
                lineDash={[20, 20]}
                stroke={"rgb(250, 200, 200)"}
            />
            <Circle
                size={140}
                lineWidth={5}
                shadowColor={"rgb(255, 0, 0)"}
                shadowBlur={100}
                lineDash={[20, 20]}
                stroke={"rgb(250, 200, 200)"}
            />
            <Circle
                size={140}
                lineWidth={5}
                shadowColor={"rgb(255, 0, 0)"}
                shadowBlur={100}
                lineDash={[20, 20]}
                stroke={"rgb(250, 200, 200)"}
            />
            <Circle
                size={140}
                lineWidth={5}
                shadowColor={"rgb(255, 0, 0)"}
                shadowBlur={100}
                lineDash={[20, 20]}
                stroke={"rgb(250, 200, 200)"}
            />
            <Circle
                size={140}
                lineWidth={5}
                shadowColor={"rgb(255, 0, 0)"}
                shadowBlur={100}
                lineDash={[20, 20]}
                stroke={"rgb(250, 200, 200)"}
            />
            <Circle
                size={140}
                lineWidth={5}
                shadowColor={"rgb(255, 0, 0)"}
                shadowBlur={100}
                lineDash={[20, 20]}
                stroke={"rgb(250, 200, 200)"}
            />
        </Icon>
        {range(instructions_data.length).map(i => <GMRect
            size={[400, 70]}
            x={() => (i - 2) * 420}
            y={(generator.nextInt(0, 3) * 2 - 1) * 80 + (names[i] == 'c' ? 125 : 0) + (names[i] == 'a' || names[i] == 'b'  ? -125 : 0) + (names[i] == 'g' ? 450 : 0)}
            darkness={() => -.4}
            borderModifier={() => -2}
            shadowColor={() => new Color("#222")}
            ref={instructions_refs}
        >
            <Txt
                text={instructions_data[i]}
                fontFamily={"Fira Code"}
                zIndex={3}
                fill={new Gradient({
                    toY: 20,
                    stops: [
                        { offset: 0, color: "#fff" },
                        { offset: 1, color: "#fff0" }
                    ]
                })}
                fontSize={30}
            />
            <Txt
                text={names[i]}
                y={-80}
                shadowColor={"black"}
                shadowBlur={10}
                fontFamily={"Fira Code"}
                fill={"white"}
            />
        </GMRect>)}
    </Node>);

    yield* waitUntil("slide");
    yield all(
        rect_timeline_x(-1400, 1),
        camera().x(-1500, 1),
        camera().scale(3, 1),
        instructions_container().x(500, 35, easeOutCubic),
        contrastSignal(1.2, 2),
    );
    yield* waitUntil("switch ab");
    const a = instructions_refs[names.findIndex(val => val == "a")];
    const b = instructions_refs[names.findIndex(val => val == "b")];
    const c = instructions_refs[names.findIndex(val => val == "c")];
    const ac_dep_line = createRef<Line>();
    const bac_dep_line = createRef<Line>();
    yield all(
        a.x(b.x(), 1),
        b.x(a.x(), 1),
        bugIcon().y(-250, 1, easeOutCubic),
        bugIcon().opacity(1, 1, easeOutCubic),
        contrastSignal(0.5, 2),
    );
    instructions_container().add(<Line
        ref={bac_dep_line}
        lineWidth={5}
        stroke={"white"}
        lineDash={[20, 5]}
        startOffset={20}
        endOffset={20}
        radius={32}
        endArrow
        arrowSize={10}
        end={0}
        points={() => [
            b.top().addX(-100),
            b.top().add([-100,-125])
        ]}

    />)
    instructions_container().add(<Line
        ref={ac_dep_line}
        lineWidth={5}
        stroke={"white"}
        lineDash={[20, 5]}
        endOffset={80}
        startOffset={20}
        radius={32}
        endArrow
        arrowSize={10}
        end={0}
        points={() => {
            const p0 = a.left();
            const p1 = c.top();
            p1.y = p0.y;
            const p2 = c.top();

            return [
                p0,
                p1,
                p2
            ]
        }}
    />);

    yield* waitUntil("data-dependency");
    bugIcon().position(bugIcon().position());
    const bugIcon2 = bugIcon().clone({ position: () => b.top().add([-100, -150]), scale: 0 });
    instructions_container().add(bugIcon2);
    yield delay(1, chain(
        b.x(b.x() - 420, 1.5),
        bac_dep_line().end(1, .5),
        all(
            bugIcon2.position(() => b.top().add([-100, -200]), .7),
            bugIcon2.scale(.7, .7),
        ),
    )

    )
    yield* all(
        ac_dep_line().end(1, 1),
        delay(.8, c.y(c.y() + 30, .5))
    );
    yield* waitUntil("c_not_working");
    yield* ac_dep_line().points(() => {
        const p0 = a.left();
        const p1 = c.top();
        p1.y = p0.y;
        const p2 = c.top().addY(-550);
        // const p3 = c.top().addY(-550).addX(-1500);

        return [
            p0,
            p1,
            p2,
            // p3
        ]
    }, 2),
    yield ac_dep_line().points(() => {
        const p0 = a.left();
        const p1 = c.top();
        p1.y = p0.y;
        const p2 = c.top().addY(-550);
        const p3 = c.top().addY(-550).addX(-2500);

        return [
            p0,
            p1,
            p2,
            p3
        ]
    }, 2),

        yield* waitUntil("next");
});
