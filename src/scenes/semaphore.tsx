import { Icon, makeScene2D, Node, Ray, Rect, Txt } from "@motion-canvas/2d";
import { Background } from "../components/background";
import { all, chain, createRef, createRefArray, createSignal, DEFAULT, easeInCubic, easeOutBack, easeOutCubic, linear, loop, range, sequence, SignalGenerator, useLogger, useRandom, Vector2, waitFor, waitUntil } from "@motion-canvas/core";
import { ObjectValue } from "../components/objectValue";
import { Notification } from "../components/notifcation";
import { Chapter } from "../components/chapter";

export default makeScene2D(function* (view) {
    view.add(<Background />);

    const objectValue = createRef<ObjectValue>();
    const thread_count = 7;
    const time = createSignal(0);

    const connection_anims = range(thread_count).map(i => createSignal(0));
    const threads = createRefArray<Rect>();
    const rays = createRefArray<Ray>();
    const camera = <Node />;
    view.add(camera);
    view.add(<Chapter
        chapterNumber={3}
        name={"Semaphore"}
        icon={"material-symbols:speed-camera-rounded"}
    />)

    camera.add(<ObjectValue
        type={"SEMAPHORE"}
        value={3}
        ref={objectValue}
        scale={0}
    />);

    camera.add(<Node>
        {...range(thread_count).map(i => (<Rect
            ref={threads}
            scale={0}
            offsetY={1}
            position={() => {
                const angle = 2 * Math.PI / thread_count * i + time() / 13 + Math.PI;
                const pos = new Vector2(Math.cos(angle), Math.sin(angle)).scale(360);

                return pos
            }}
            stroke={"#fffa"}
            lineWidth={3}
            layout
            ratio={1}
            justifyContent={'center'}
            alignItems={'center'}
            padding={35}
            radius={20}
            rotation={45}
            shadowBlur={5}
            shadowColor={"white"}
            fill={"#fff2"}
        >
            <Txt
                rotation={-45}
                fill={"white"}
                zIndex={1}
                fontFamily={"Fira Code"}
                text={`T${i}`}
            />
        </Rect>))}
    </Node>);

    camera.add(<Node>
        {...range(thread_count).map(i => <Ray
            from={() => threads[i].position()}
            to={() => objectValue().position()}
            lineWidth={5}
            stroke={"white"}
            endOffset={() => objectValue().size().x / 2 + 30}
            startOffset={() => threads[i].size().x / 2 + 30}
            endArrow
            arrowSize={10}
            end={connection_anims[i]}
            ref={rays}
        />)}
    </Node>)

    const lock_icon = createRef<Icon>();
    camera.add(<Icon
        position={() => rays[3].getPointAtPercentage(rays[3].end() + 0.25).position}
        icon={"material-symbols:lock"}
        size={50}
        shadowBlur={10}
        shadowColor={"rgb(255, 132, 132)"}
        scale={0}
        color={"rgba(255, 230, 237, .8)"}
        ref={lock_icon}
    />)

    yield time(1000, 1000, linear);
    yield* chain(
        waitUntil('start'),
        objectValue().pop(),
        all(...threads.map(obj => all(obj.scale(1, .7), obj.offset(0, .7)))),
        waitUntil("access"),
        sequence(
            .8,
            sequence(
                0.4,
                connection_anims[0](1, 1),
                objectValue().value(2, 1),
            ),
            sequence(
                0.4,
                connection_anims[1](1, 1),
                objectValue().value(1, 1),
            ),
            sequence(
                0.4,
                connection_anims[2](1, 1),
                objectValue().value(0, 1),
            ),
            sequence(
                .2,
                connection_anims[3](.5, .5, easeInCubic),
                lock_icon().scale(1, 1),
            )
        ),
    );

    const rect = createRef<Rect>();
    const api_rects = createRefArray<Rect>();
    view.add(<Rect
        layout
        direction={'column'}
        gap={50}
        left={[-1500, 0]}
        ref={rect}
    >
        {...["init(n)", "uninit()", "take()", "give()"].map(name => <Rect
            fill={"#0007"}
            radius={16}
            ref={api_rects}
            stroke={"#fff7"}
            lineWidth={4}
            justifyContent={'center'}
            padding={32}
            paddingRight={90}
            paddingLeft={90}
        >
            <Txt
                fontSize={80}
                textAlign={'center'}
                fill={"rgb(255, 255, 255)"}
                fontFamily={"Fira Code"}
            >.{name}</Txt>
        </Rect>)}
    </Rect>)

    yield* chain(
        waitUntil("api"),
        all(
            camera.x(400, 1),
            rect().left(() => [-view.width() / 2 + rect().width() / 2 - 200, 0], 1),
        ),
        waitUntil('high1'),
        all(
            api_rects[2].opacity(.5, 1),
            api_rects[3].opacity(.5, 1),
        ),
        waitUntil('high2'),
        all(
            api_rects[0].opacity(0.5, 1),
            api_rects[1].opacity(0.5, 1),
            api_rects[2].opacity(1, 1),
            api_rects[3].opacity(1, 1),
        ),
    )
    yield* chain(
        waitUntil('example'),
        all(
            lock_icon().opacity(0, 1),
            ...connection_anims.map(s => s(0, 1)),
            objectValue().value(3, 1),
        ),
        sequence(
            0.6,
            all(
                connection_anims[0](1, .5),
                api_rects[2].scale(1.06, 0.35).back(0.15),
                objectValue().value(2, 1),
            ),
            all(
                connection_anims[1](1, .5),
                api_rects[2].scale(1.06, 0.35).back(0.15),
                objectValue().value(1, 1),
            ),
            all(
                connection_anims[2](1, .5),
                api_rects[2].scale(1.06, 0.35).back(0.15),
                objectValue().value(0, 1),
            ),
            all(
                connection_anims[0](0, .5),
                api_rects[3].scale(1.06, 0.35).back(0.15),
                objectValue().value(1, 1),
            ),
            all(
                connection_anims[3](1, .5),
                api_rects[3].scale(1.06, 0.35).back(0.15),
                objectValue().value(0, 1),
            ),
            all(
                connection_anims[2](0, .5),
                connection_anims[5](1, .5),
            ),
            all(
                connection_anims[6](1, .5),
                connection_anims[3](0, .5),
            ),
            all(
                connection_anims[6](0, .5),
                connection_anims[1](0, .5),
                connection_anims[0](1, .5),
                connection_anims[4](1, .5),
            ),
        ),
    );

    const generator = useRandom();
    yield loop(function* () {
        var ammount = generator.nextInt(1, 4);
        const tasks: SignalGenerator<number, number>[] = [];
        for (let i = 0; i < ammount; i++) {
            var index0: number = -1;
            var index1: number = -1;
            while (index0 == -1 || connection_anims[index0]() == 1) {
                index0 = generator.nextInt(0, 6);
            }
            while (index1 == -1 || connection_anims[index1]() == 0) {
                index1 = generator.nextInt(0, 6);
            }
            tasks.push(connection_anims[index0](1, .5));
            tasks.push(connection_anims[index1](0, .5));
        }
        yield* all(...tasks);
        var ammount = 0;
        connection_anims.map(func => func() > 0 ? ammount += 1 : 0);
        objectValue().value(Math.max(3 - ammount, 0));
        yield* waitFor(.3);
    });
    yield* Notification(5, "Thus the concept of binary semaphore exists, it doesn’t just work as a regular mutex,\n the difference being that the binary semaphore can be unlocked by other threads.", view);

    yield* waitUntil("next");
});