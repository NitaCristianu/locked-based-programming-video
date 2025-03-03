import { Circle, Code, Gradient, Icon, Layout, Line, lines, makeScene2D, Node, Rect, Txt, View2D } from "@motion-canvas/2d";
import { all, any, chain, createRef, createRefArray, createSignal, delay, easeInCubic, easeInOutSine, easeOutCubic, linear, loop, range, Reference, sequence, SimpleSignal, Vector2, waitUntil } from "@motion-canvas/core";
import { Background } from "../components/background";
import gaussianblur from "../shaders/glassmorphic.glsl";
import { GMRect } from "../components/glassmorphic_rect";
import { Chapter } from "../components/chapter";
import { alphabet, remap } from "../components/CommonMath";
import { Float } from "../components/float";
import mutexProtectionExamples from "../assets/example-code/mutex-protection-examples";

function createMutexRect(view: View2D) {
    const mutex_rect = createRef<Rect>();
    const mutex_title = createRef<Txt>();
    const mutex_icon = createRef<Icon>();
    const mutex_desc = createRef<Rect>();

    view.add(<GMRect
        height={200}
        width={800}
        scale={.6}
        zIndex={2}
        scaleY={0}
        ref={mutex_rect}
        darkness={.2}
    >
        <Txt
            ref={mutex_title}
            zIndex={1}
            text={"MUTEX"}
            fontSize={120}
            fontWeight={1000}
            lineWidth={4}
            fontFamily={"Poppins"}
            fill={"#fff8"}
            stroke={new Gradient({
                fromY: -25,
                toY: 25,
                stops: [
                    { offset: 0, color: "#fff5" },
                    { offset: .5, color: "#fff" },
                    { offset: 1, color: "#fff5" },
                ]
            })}
        />
        <Icon
            icon={"material-symbols:lock"}
            size={100}
            zIndex={1}
            scale={0}
            opacity={0}
            ref={mutex_icon}
        />
        <Rect
            radius={16}
            y={80}
            stroke={"#fff0"}
            ref={mutex_desc}
            scaleY={0}
        >
            <Txt
                text={"Makes operations atomic."}
                textAlign={'center'}
                zIndex={1}
                fontFamily={"Poppins"}
                fontSize={30}
                fill={"white"}
                opacity={0.8}
            />
            <Txt
                y={40}
                text={"Using a lock-based system."}
                textAlign={'center'}
                zIndex={1}
                fontFamily={"Poppins"}
                fontSize={30}
                fill={"white"}
                opacity={0.8}
            />
        </Rect>
    </GMRect>);
    return { mutex_rect, mutex_icon, mutex_title, mutex_desc };
}

export default makeScene2D(function* (view) {
    view.add(<Background />);
    // view.add(<Rect
    //     size={'100%'}
    //     fill={"white"}
    //     shaders={{
    //         fragment: gaussianblur,
    //         uniforms: {
    //             strength: 10.,
    //             opacity: 0.9,
    //             darkness: -.4,
    //             borderModifier: -1.5,
    //             blurstrength: 52,
    //         }
    //     }}
    // />);

    const chapter = createRef<Chapter>();
    view.add(<Chapter
        name="Mutex"
        icon="material-symbols:lock"
        chapterNumber={1}
        ref={chapter}
    />);
        
    const { mutex_rect, mutex_icon, mutex_title, mutex_desc } = createMutexRect(view);

    yield* chain(
        waitUntil("appear"),
        all(
            mutex_rect().scale(1, 1, easeOutCubic),
        ),
        waitUntil("description"),
        all(
            mutex_desc().scale(1, .5, easeOutCubic),
            mutex_desc().y(130, .5, easeOutCubic),
        ),
        waitUntil("transform"),
        any(
            mutex_title().opacity(0, .5),
            mutex_title().scale(0, .5),
            mutex_desc().opacity(0, .4, easeInCubic),
            mutex_desc().scale([.7, 0], .5, easeInCubic),
            mutex_desc().y(70, .5, easeInCubic),
            mutex_rect().width(mutex_rect().height(), .5),
            mutex_rect().radius(500, .5),
            delay(.15, all(
                mutex_icon().scale(1, .6, easeOutCubic),
                mutex_icon().opacity(1, .6, easeOutCubic),
            )),
            mutex_rect().scale(2, .8, easeOutCubic),
        ),
    );

    const time = createSignal<number>(0);
    const offset = createSignal<number>(() => time() / 4);
    const pop_signal = createSignal<number>(0);
    const radius = () => mutex_rect().size().x;
    const getPosition = (i: number) => new Vector2(Math.cos(i * Math.PI / 3 + offset()), Math.sin(i * Math.PI / 3 + offset())).mul(radius());
    const apifunctions = createRefArray<Rect>();

    const mutexInitial = {
        rect: createRef<Rect>(),
        code: createRef<Code>(),
    };
    var inital_example = mutexProtectionExamples[0];
    const temp_code_lines = inital_example.split("\n");
    temp_code_lines.splice(8, 1);
    temp_code_lines.splice(10, 1);
    inital_example = temp_code_lines.join('\n');

    view.add(<GMRect
        height={650}
        width={900}
        translucency={1}
        paddingLeft={30}
        paddingRight={30}
        radius={16}
        x={-1500} // -400
        zIndex={1}
        ref={mutexInitial.rect}
    >
        <Txt
            text={"utils.c"}
            zIndex={1}
            fontSize={40}
            fill={"white"}
            y={-270}
            x={-360}
            fontWeight={500}
            fontFamily={"Poppins"}
        />

        <Rect
            alignItems={'center'}
            y={-270}
            x={350}
            gap={30}
            zIndex={1}
            layout
        >
            {range(3).map(i => <Circle
                size={20}
                stroke={"#fffa"}
                lineWidth={2}
            />)}
        </Rect>
        <Code
            code={inital_example}
            fontSize={25}
            zIndex={3}
            y={50}
            fontFamily={"Fira Code"}
            ref={mutexInitial.code}
        />

    </GMRect>)

    mutex_rect().add(<Node>
        {...["create", "delete", "lock", "unlock", "try_lock", "try_unlock"].map((func_name, i) => <Rect
            position={() => getPosition(i).mul(pop_signal())}
            opacity={() => remap(0.3, 1, 0, 1, pop_signal())}
            ref={apifunctions}
            fill={"#fff2"}
            layout
            padding={10}
            radius={32}
            fontSize={20}
            paddingLeft={20}
            paddingRight={20}
            stroke={new Gradient({
                fromY: -25,
                toY: 25,
                stops: [
                    { offset: 0, color: "#fff4" },
                    { offset: .5, color: "#fff" },
                    { offset: 1, color: "#fff4" },
                ]
            })}
            lineWidth={2}
        >
            <Txt
                text={func_name}
                fill={"white"}
                fontFamily={"Fira Code"}
            />
        </Rect>)}
    </Node >);

    yield time(1000, 1000, linear);
    yield* chain(
        waitUntil("API"),
        pop_signal(1, 2, easeOutCubic),
        waitUntil("create"),
        all(
            ...apifunctions.map((rect, i) => i == 1 || i == 0 ? any(
                rect.scale(1.1, .7),
                rect.opacity(1, .7),
            ) : any(
                rect.scale(.9, .7),
                rect.opacity(0.4, .7),
            ))
        ),
        waitUntil("lock"),
        all(
            ...apifunctions.map((rect, i) => i == 2 || i == 3 ? any(
                rect.scale(1.1, .7),
                rect.opacity(1, .7),
            ) : any(
                rect.scale(.9, .7),
                rect.opacity(0.4, .7),
            ))
        ),
        waitUntil("unlock"),
        all(
            ...apifunctions.map((rect, i) => i == 4 || i == 5 ? any(
                rect.scale(1.1, .7),
                rect.opacity(1, .7),
            ) : any(
                rect.scale(.9, .7),
                rect.opacity(0.4, .7),
            ))
        ),
        waitUntil("example"),
    );
    const showDangerZone = createSignal<number>(0);
    view.add(<Icon
        icon={"solar:danger-triangle-bold"}
        zIndex={99}
        size={50}
        scale={() => 1 + easeOutCubic(showDangerZone()) / 5}
        x={() => 470 + 30 * showDangerZone() + mutexInitial.rect().x()}
        y={() => 100 + mutexInitial.rect().y()}
        opacity={showDangerZone}
        color={"ff0"}
        shadowColor={"ff0a"}
        shadowBlur={20}
    />);
    view.add(<Line
        x={() => 450 + mutexInitial.rect().x()}
        y={() => 100 + mutexInitial.rect().y()}
        zIndex={1}
        points={[[0, -80], [0, 80]]}
        scale={showDangerZone}
        stroke={new Gradient({
            fromY: -50,
            toY: 50,
            stops: [
                { offset: 0, color: "#ff00" },
                { offset: .3, color: "#ff0" },
                { offset: .7, color: "#ff0" },
                { offset: 1, color: "#ff00" },
            ]
        })}
        lineWidth={4}
    />);

    const terminal = createRef<GMRect>();
    view.add(<GMRect
        ref={terminal}
        size={[700, 200]}
        y={200}
        x={-100}
        shadowColor={"#fff6"}
        zIndex={1}
        scale={[0.7, 0]}
    >
        <Txt
            text={"globals.h"}
            zIndex={1}
            fontSize={40}
            fill={"white"}
            y={-50}
            x={-230}
            fontWeight={500}
            fontFamily={"Poppins"}
        />

        <Rect
            alignItems={'center'}
            y={-50}
            x={250}
            gap={30}
            zIndex={1}
            layout
        >
            {range(3).map(i => <Circle
                size={20}
                stroke={"#fffa"}
                lineWidth={2}
            />)}
        </Rect>
        <Code
            code={"#include <pthread.h>\nextern pthread_mutex_t mutex;"}
            fontSize={25}
            zIndex={3}
            y={20}
            x={-100}
            fontFamily={"Fira Code"}
        />
    </GMRect>)

    const offset_pos = offset();
    const lock_api = apifunctions[2].clone({ zIndex: 3, fill: "#fff3", opacity: 0 });
    const unlock_api = apifunctions[3].clone({ zIndex: 3, fill: "#fff3", opacity: 0 });
    mutex_rect().add(lock_api);
    mutex_rect().add(unlock_api);
    const mutex_new_code_lines = mutexProtectionExamples[0].split("\n");
    mutex_new_code_lines.splice(7, 1);
    mutex_new_code_lines.splice(11, 1);
    const mutex_new_code = mutex_new_code_lines.join("\n");

    yield* chain(
        all(
            ...apifunctions.map(rect => any(
                rect.scale(1.1, .7),
                rect.opacity(1, .7),
            )),
            mutexInitial.rect().x(-400, 1),
            mutex_rect().x(950, 1),
            mutex_rect().scale(2.7, 1),
            offset(() => offset_pos + offset_pos % (Math.PI / 2) + 4.5 % (Math.PI * 2) + time() / 12, 1),
        ),
        waitUntil("identify"),
        all(
            mutexInitial.code().selection(lines(8, 10), .4),
            showDangerZone(1, .8, easeOutCubic),
        ),
        waitUntil("external"),
        all(
            mutexInitial.rect().y(-50, 1),
            terminal().scale(1, 1),
            terminal().y(300, 1),
            mutexInitial.code().code.prepend(`#include "globals.h"\n`, 1),
        ),
        waitUntil("place"),
        sequence(
            0.75,
            all(
                terminal().scale(0, 1),
                terminal().y(800, 1),
                unlock_api.opacity(1, .5),
                unlock_api.position(() => [-543, 53 + mutexInitial.rect().y() + 63 - 25], 1),
                unlock_api.width(700, 1),
                unlock_api.scale(.25, 1),
                lock_api.opacity(1, .5),
                lock_api.position(() => [-543, 18 + mutexInitial.rect().y() + 63 - 25], 1),
                lock_api.width(700, 1),
                lock_api.scale(.25, 1),
                showDangerZone(0, .8, easeOutCubic),
            ),
            all(
                mutexInitial.rect().y(0, 1),
                mutexInitial.rect().scale(1.2, 1),
                mutexInitial.rect().x(-300, 1),
                lock_api.opacity(0, .4),
                unlock_api.opacity(0, .4),
                mutexInitial.code().code(mutex_new_code, .4),
                mutexInitial.code().selection(lines(7, 10), .4),
            )
        ),
    );

    const container_codes = createRef<Node>();
    view.add(<Node
        ref={container_codes}
    >
        {
            ...range(5).map(i => (

                <GMRect
                    height={650}
                    width={1200}
                    translucency={1}
                    paddingLeft={30}
                    paddingRight={30}
                    radius={16}
                    x={-1500 - i * 1300}
                    zIndex={1}
                >
                    <Txt
                        text={"utils.c"}
                        zIndex={1}
                        fontSize={40}
                        fill={"white"}
                        y={-270}
                        x={-360}
                        fontWeight={500}
                        fontFamily={"Poppins"}
                    />

                    <Rect
                        alignItems={'center'}
                        y={-270}
                        x={350}
                        gap={30}
                        zIndex={1}
                        layout
                    >
                        {range(3).map(i => <Circle
                            size={20}
                            stroke={"#fffa"}
                            lineWidth={2}
                        />)}
                    </Rect>
                    <Code
                        fontSize={25}
                        zIndex={3}
                        y={50}
                        code={mutexProtectionExamples[i+1]}
                        fontFamily={"Fira Code"}
                    />

                </GMRect>
            ))
        }
    </Node>);

    yield* chain(
        mutex_rect().x(1800, 1),
        any(
            container_codes().x(container_codes().x() + 3900, 9, linear),
            mutexInitial.rect().scale(1, .6),
            mutexInitial.rect().x(mutexInitial.rect().x() + 3900, 9, linear),
        )

    )

    yield* waitUntil("next");
});