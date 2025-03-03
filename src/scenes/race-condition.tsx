import { Circle, CODE, Code, contrast, Gradient, grayscale, hue, Icon, invert, Latex, Layout, Line, lines, makeScene2D, Node, Ray, Rect, Txt } from '@motion-canvas/2d';
import { all, any, BBox, chain, Color, createRef, createRefArray, createSignal, DEFAULT, delay, easeInCubic, easeOutBack, easeOutCubic, linear, PossibleVector2, range, Reference, SimpleSignal, textLerp, threads, Vector2, waitFor, waitUntil } from '@motion-canvas/core';
import { Background } from '../components/background';
import { GMRect } from '../components/glassmorphic_rect';
import { MouseCursor } from '../components/mouseicon';
import { Float } from '../components/float';
import { lerp, remap, smooth_remap } from '../components/CommonMath';
import { Notification } from '../components/notifcation';

function createRegisterElement(data: {
    read: SimpleSignal<number, void>;
    mid: SimpleSignal<number, void>;
    write: SimpleSignal<number, void>;
}, name: string) {
    return <GMRect
        size={[400, 360]}
        x={-600}
        scale={0}
        translucency={1}
        clip
    >
        <Rect
            size={[400, 360]}
            layout
            direction={'column'}
            zIndex={1}
            padding={16}
            gap={16}
            fontFamily={"Poppins"}
        >
            <Txt
                fill={new Gradient({
                    toY: 30,
                    fromY: -30,
                    stops: [
                        { offset: 0.0, color: "#fff0" },
                        { offset: 0.2, color: "#fffb" },
                        { offset: 0.8, color: "#fffd" },
                        { offset: 1, color: "#fff0" }
                    ]
                })}
                fontWeight={500}
                textAlign={'center'}
            >Register <Txt fontWeight={800} text={name} /></Txt>
            <Rect
                width={'100%'}
                fill={"#0002"}
                padding={16}
                radius={25}
                layout
                lineWidth={3}
                stroke={new Gradient({
                    toY: 30,
                    toX: 20,
                    fromY: -30,
                    stops: [
                        { offset: 0.0, color: "#fff0" },
                        { offset: 1, color: "#fffb" },
                    ]
                })}
            >
                <Txt
                    fontFamily={"Fira Code"}
                    fontSize={30}
                    fill={"white"}
                    text={() => `read : ${data.read() ? data.read().toFixed(0) : "----"}`}
                />
            </Rect>
            <Rect
                width={'100%'}
                fill={"#0002"}
                padding={16}
                radius={25}
                layout
                lineWidth={3}
                stroke={new Gradient({
                    toY: 30,
                    toX: 20,
                    fromY: -30,
                    stops: [
                        { offset: 0.0, color: "#fff0" },
                        { offset: 1, color: "#fffb" },
                    ]
                })}
            >
                <Txt
                    fontFamily={"Fira Code"}
                    fontSize={30}
                    fill={"white"}
                    text={() => `${name == "A" ? "inc" : "mul"} : ${data.mid() ? `${data.mid().toFixed(0)} -> ${(name == 'A' ? data.mid() + 1 : data.mid() * 2).toFixed(0)}` : "----"}`}
                />
            </Rect>
            <Rect
                width={'100%'}
                fill={"#0002"}
                padding={16}
                radius={25}
                layout
                lineWidth={3}
                stroke={new Gradient({
                    toY: 30,
                    toX: 20,
                    fromY: -30,
                    stops: [
                        { offset: 0.0, color: "#fff0" },
                        { offset: 1, color: "#fffb" },
                    ]
                })}
            >
                <Txt
                    fontFamily={"Fira Code"}
                    fontSize={30}
                    fill={"white"}
                    text={() => `write : ${data.write() ? data.write().toFixed(0) : "----"}`}
                />
            </Rect>
        </Rect>

    </GMRect>
}

export default makeScene2D(function* (view) {

    view.add(<Background />);

    const objectX = createRef<GMRect>();
    const threadA = createRef<Line>();
    const threadB = createRef<Line>();
    const SW = view.size().x // Screen width
    const SH = view.size().y // Screen height
    const objectValue = createSignal(10);
    const traverseInc = createSignal<number>(0);
    const traverseMul = createSignal<number>(0);
    const camera = createRef<Node>();
    const incrementCirlce = createRef<Circle>();
    const multiplyCircle = createRef<Circle>();
    const pauseSignal = createSignal<number>(0);
    const raceCondition = createRef<GMRect>();
    const badge_container = createRef<GMRect>();

    view.add(<Rect zIndex={3} opacity={() => lerp(0, .5, pauseSignal())} size={'100%'} fill={"black"} />)
    view.add(<Node ref={camera} />)

    camera().add(<GMRect
        size={200}
        radius={200}
        ref={objectX}
        scale={0}
        translucency={1}
    >
        <Txt
            fontSize={90}
            zIndex={1}
            fontFamily={"Fira Code"}
            shadowBlur={20}
            shadowColor={"white"}
            text={() => objectValue().toFixed(0)}
            fill={new Gradient({
                toY: 40,
                fromY: -40,
                stops: [
                    { offset: 0.0, color: "#fff0" },
                    { offset: 0.2, color: "#fff" },
                    { offset: 0.8, color: "#fff" },
                    { offset: 1, color: "#fff0" }
                ]
            })}
        />
        <Txt
            fontSize={20}
            zIndex={1}
            fontFamily={"Fira Code"}
            shadowBlur={20}
            shadowColor={"white"}
            text={"64bit int"}
            letterSpacing={-1}
            opacity={.8}
            y={50}
            fill={new Gradient({
                toY: 40,
                fromY: -40,
                stops: [
                    { offset: 0.0, color: "#fff0" },
                    { offset: 0.2, color: "#fff" },
                    { offset: 1, color: "#fff" },
                ]
            })}
        />
        <Txt
            scale={0}
            y={-40}
            fill={"white"}
            fontFamily={"Poppins"}
            shadowBlur={20}
            shadowColor={"black"}
        >Shared Object (shared int)</Txt>
    </GMRect>);

    camera().add(<Line
        points={[
            [-SW / 2, -SH * .25],
            [-SW / 8, -SH * .25],
            [0, 0],
            [SW / 8, SH * .25],
            [SW / 2, SH * .25],
        ]}
        radius={500}
        zIndex={-1}
        stroke={"white"}
        lineWidth={10}
        ref={threadA}
        end={0}
    >
        <Txt
            left={() => {
                const p = threadA().getPointAtPercentage(0.05);
                return p.position.add(p.normal.mul(50));
            }}
            fill={"white"}
            fontFamily={"Poppins"}
            layout
            textAlign={'center'}
            justifyContent={'center'}
        >
            <Txt
                text={() => textLerp("", "Thread", threadA().end())}
            />
            <Txt
                fontFamily={'abc'}
                fontSize={80}
                text={" A"}
                opacity={() => threadA().end() > .5 ? threadA().end() : 0}
            />
        </Txt>
        <Circle
            ref={incrementCirlce}
            size={45}
            stroke={"white"}
            lineWidth={4}
            position={() => {
                const t = traverseInc();
                return threadA().getPointAtPercentage(t).position
            }
            }
            opacity={() => remap(0, .05, 0, 1, traverseInc()) * smooth_remap(0.6, 1, 1, 0, traverseInc())}
            shadowColor={"rgb(240, 56, 240)"}
            shadowBlur={30}
        >
            <Circle
                fill={"white"}
                size={30}
                shadowColor={"rgb(74, 56, 240)"}
                shadowBlur={30}
            />

            <Txt
                fontFamily={"Fira Code"}
                shadowColor={"rgb(56, 240, 225)"}
                shadowBlur={30}
                text={"INC 1"}
                fontSize={35}
                y={50}
                fill={"white"}
            />

        </Circle>
    </Line>);
    camera().add(<Line
        points={threadA().points().map(point => new Vector2(point as PossibleVector2).mul([1, -1]))}
        radius={500}
        zIndex={-1}
        stroke={"#ffffffff"}
        lineWidth={10}
        end={0}
        ref={threadB}
    >
        <Txt
            left={() => {
                const p = threadB().getPointAtPercentage(0.05);
                return p.position.add(p.normal.mul(50));
            }}
            fill={"white"}
            fontFamily={"Poppins"}
            layout
            textAlign={'center'}
            justifyContent={'center'}
        >
            <Txt
                text={() => textLerp("", "Thread", threadB().end())}
            />
            <Txt
                fontFamily={'abc'}
                fontSize={80}
                text={" B"}
                opacity={() => threadB().end() > .5 ? threadB().end() : 0}
            />
        </Txt>
        <Circle
            size={45}
            ref={multiplyCircle}
            stroke={"white"}
            lineWidth={4}
            position={() => {
                const t = traverseMul();
                return threadB().getPointAtPercentage(t).position
            }
            }
            opacity={() => remap(0, .05, 0, 1, traverseMul()) * smooth_remap(.6, 1, 1, 0, traverseMul())}
            shadowColor={"rgb(240, 56, 240)"}
            shadowBlur={30}
        >
            <Circle
                fill={"white"}
                size={30}
                shadowColor={"rgb(56, 120, 240)"}
                shadowBlur={30}
            />

            <Txt
                fontFamily={"Fira Code"}
                shadowColor={"rgb(105, 56, 240)"}
                shadowBlur={30}
                text={"MUL 2"}
                fontSize={35}
                y={50}
                fill={"white"}
            />

        </Circle>
    </Line>);

    view.add(<GMRect
        size={[600, 300]}
        x={-1400}
        scale={1.4}
        darkness={-.5}
        borderModifier={-.6}
        ref={badge_container}
        translucency={1}
        shadowColor={"rgba(253, 30, 30, 0.5)"}
        zIndex={5}
    >
        <GMRect
            translucency={.6}
            size={200}
            zIndex={3}
            darkness={-.8}
            borderModifier={-2}
            shadowColor={"rgb(250, 44, 44)"}
            x={-150}
        >
            <Icon
                icon={"material-symbols:flag-circle-rounded"}
                size={150}
                color={"rgb(255, 33, 33)"}
                shadowBlur={20}
                shadowColor={"rgb(255, 44, 44)"}
                zIndex={1}
            />
        </GMRect>
        <Rect
            zIndex={1}
            y={-8}
            scale={.85}
            x={20}
        >

            <Txt
                fontFamily={"Poppins"}
                fontSize={30}
                x={120}
                y={-70}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                shadowColor={"white"}
                fontWeight={800}
            >CRITICAL DATA RACE</Txt>
            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={-40}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={`threads access shared`}
            />
            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={-20}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={`data without synchronization`}
            />

            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={20}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={`--------causes--------`.toUpperCase()}
                fontWeight={500}
            />
            {/*
        Lack of thread synchronization
Incorrect locking mechanisms applied
Concurrent access to resources
        */}
            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={45}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={"- Lack of thread sync"}
            />
            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={70}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={`- Incorrect locking`}
            />
            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={90}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={`mechanisms applied`}
            />
        </Rect>
    </GMRect>)


    yield* waitUntil("start");
    yield* chain(
        any(waitFor(0.8), threadA().end(1, 2)),
        any(threadB().end(1, 2), waitFor(1)),
    );

    yield* waitUntil("object");
    yield* objectX().scale(1, 1);
    yield chain(
        all(
            objectX().findLast(pred => pred instanceof Txt).y(-210, .8),
            objectX().findLast(pred => pred instanceof Txt).scale(1, .8),
        ),
        waitFor(2),
        all(
            objectX().findLast(pred => pred instanceof Txt).y(80, .8),
            objectX().findLast(pred => pred instanceof Txt).scale(0, .8),
        ),
    );
    yield* waitUntil("travel inc");
    yield traverseInc(1, 5);
    yield delay(1, traverseMul(1, 5));
    yield* chain(waitUntil('inc'),
        all(
            objectValue(objectValue() + 1, 0),
            any(objectX().scale(1.1, .2).back(.2)),
        )
    );
    yield* chain(waitUntil('mul'),
        all(
            objectValue(objectValue() * 2, 0),
            any(objectX().scale(1.1, .2).back(.2)),
        )
    );

    yield* waitUntil("goBack");
    yield* all(
        traverseInc(0, 1),
        traverseMul(0, 1),
        objectValue(10, 1),
    );
    yield traverseMul(1, 5);
    yield delay(1, traverseInc(1, 5));

    yield* chain(waitUntil('mul2'),
        all(
            objectValue(objectValue() * 2, 0),
            any(objectX().scale(1.1, .2).back(.2)),
        )
    );
    yield* chain(waitUntil('inc2'),
        all(
            objectValue(objectValue() + 1, 0),
            any(objectX().scale(1.1, .2).back(.2)),
        )
    );
    yield Notification(3, `\
The previous result was 22, the current one is 21.\nIndeed, 21 might not be equal to 22.`, camera());

    yield* waitUntil("critical race");
    traverseInc(0);
    traverseMul(0);
    view.add(<Icon
        icon={"material-symbols:pause-rounded"}
        size={120}
        position={[-SW / 2 + 200, SH / 2 - 200]}
        scale={() => lerp(.4, 1.3, pauseSignal())}
        opacity={() => lerp(0, .4, pauseSignal())}
    />);
    const badge_container_icon = createRef<GMRect>();
    view.add(<GMRect
        size={[600, 300]}
        x={-1400}
        scale={1.4}
        darkness={-.5}
        borderModifier={-.6}
        ref={raceCondition}
        translucency={1}
        shadowColor={"rgba(253, 30, 30, 0.5)"}
        zIndex={5}
    >
        <GMRect
            translucency={.6}
            size={200}
            zIndex={3}
            darkness={-.8}
            borderModifier={-2}
            ref={badge_container_icon}
            shadowColor={"rgb(250, 44, 44)"}
            x={-150}
        >
            <Icon
                icon={"material-symbols:flag-circle-outline-rounded"}
                size={150}
                color={"rgb(255, 33, 33)"}
                shadowBlur={20}
                shadowColor={"rgb(255, 44, 44)"}
                zIndex={1}
            />
        </GMRect>
        <Rect
            zIndex={1}
            y={-8}
            scale={.85}
            x={20}
        >

            <Txt
                fontFamily={"Poppins"}
                fontSize={30}
                x={120}
                y={-70}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                shadowColor={"white"}
                fontWeight={800}
            >DATA RACE</Txt>
            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={-40}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={`Threads access shared data,`}
            />
            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={-20}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={`leading to inconsistencies`}
            />

            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={20}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={`--------causes--------`.toUpperCase()}
                fontWeight={500}
            />
            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={45}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={"- Missing mutex or lock"}
            />
            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={70}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={`- Overlapping read and write`}
            />
            <Txt
                fontFamily={"Poppins"}
                fontSize={20}
                x={120}
                y={90}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                alignSelf={'center'}
                shadowColor={"white"}
                text={`- Other`}
            />
        </Rect>
    </GMRect>)

    yield* Float(badge_container);
    yield chain(
        all(
            traverseInc(.4, 1, easeInCubic),
            traverseMul(.43, 1, easeInCubic)
        ),
        pauseSignal(1, .6),
    )

    yield* chain(
        delay(.6, all(
            camera().scale(2.5, 1),
            camera().x(570, 1),
        )),
        all(
            badge_container().x(-300, 1),
        )
    )

    const traverseReadInc = createSignal(() => traverseInc() - .02);
    const traverseWriteInc = createSignal(() => traverseInc() + .02);
    const traverseReadMul = createSignal(() => traverseMul() - .02);
    const traverseWriteMul = createSignal(() => traverseMul() + .02);

    yield* waitUntil("decompose");
    const registerAData = {
        read: createSignal<number | null>(null),
        mid: createSignal<number | null>(null),
        write: createSignal<number | null>(null),
    }
    const registerBData = {
        read: createSignal<number | null>(null),
        mid: createSignal<number | null>(null),
        write: createSignal<number | null>(null),
    }
    const clonesinc = [
        incrementCirlce().clone({
            scale: 0.7,
            opacity: 0,
        }),
        incrementCirlce().clone({
            scale: 0.7,
            opacity: 0,
        })
    ]
    const clonesmul = [
        multiplyCircle().clone({
            scale: 0.7,
            opacity: 0,
        }),
        multiplyCircle().clone({
            scale: 0.7,
            opacity: 0,
        })
    ]
    const allcirclesIncrement = [clonesinc[0], incrementCirlce(), clonesinc[1]];
    const allcirclesMul = [clonesmul[0], multiplyCircle(), clonesmul[1]];
    threadB().add(<Node>{...clonesmul}</Node>)
    threadA().add(<Node>{...clonesinc}</Node>)

    const registerA = createRegisterElement(registerAData, "A");
    const registerB = createRegisterElement(registerBData, "B");
    registerB.x(registerB.x() + 450)
    view.add([registerA, registerB])


    yield* all(
        objectValue(10, 1),
        pauseSignal(0, 1),
        badge_container().x(-1400, 1),
        ...allcirclesIncrement.map((circle, i) => all(
            circle.findFirst(node => node instanceof Txt).text(["write", "inc", "read"][i], 0),
            circle.findFirst(node => node instanceof Txt).fontSize(20, .7),
            circle.findFirst(node => node instanceof Txt).x(-20, .7),
            circle.findFirst(node => node instanceof Txt).y(30, .7),
        )),
        ...clonesinc.map((circle, i) => all(
            circle.position(() => {
                const t = [traverseReadInc(), traverseWriteInc()][i];
                return threadA().getPointAtPercentage(t).position
            }, 1),
            circle.opacity(1, .7, easeOutCubic),
            circle.scale(.8, 1),
            incrementCirlce().scale(.8, 1),
        )),
        ...allcirclesMul.map((circle, i) => all(
            circle.findFirst(node => node instanceof Txt).text(["write", "mul", "read"][i], 0),
            circle.findFirst(node => node instanceof Txt).fontSize(20, .7),
            circle.findFirst(node => node instanceof Txt).x(-50, .7),
            circle.findFirst(node => node instanceof Txt).y(-20, .7),
        )),
        ...clonesmul.map((circle, i) => all(
            circle.position(() => {
                const t = [traverseReadMul(), traverseWriteMul()][i];
                return threadB().getPointAtPercentage(t).position
            }, 1),
            circle.opacity(1, .7, easeOutCubic),
            circle.scale(.8, 1),
            multiplyCircle().scale(.8, 1),
        ))
    );
    yield* all(
        registerA.scale(1, 1),
        registerB.scale(1, 1),
    )

    yield* waitUntil('start perform');
    yield* chain(
        all(
            traverseMul(traverseMul() + .01, 1),
            delay(.2,
                all(
                    clonesmul[1].scale(0, .5),
                    registerBData.read(10, 0),
                ),
            ),
        ),
        all(
            traverseInc(traverseInc() + .042, 1),
            delay(.3,
                all(
                    clonesinc[1].scale(0, .5),
                    registerAData.read(10, 0),
                ),
            ),
        ),
        all(
            traverseInc(traverseInc() + .064, 1),
            traverseMul(traverseMul() + .03, 1),
            clonesinc[0].findFirst(node => node instanceof Txt).x(-40, .7),
            delay(.4,
                all(
                    allcirclesIncrement[1].scale(0, .5),
                    registerAData.mid(10, 0),
                    allcirclesMul[1].scale(0, .5),
                    registerBData.mid(10, 0),
                ),
            ),
        ),
        all(
            traverseInc(traverseInc() + .085, 1),
            delay(.4,
                all(
                    allcirclesIncrement[0].scale(0, .5),
                    registerAData.write(11, 0),
                    objectValue(11, 0),
                ),
            ),
        ),
        all(
            traverseMul(traverseMul() + .055, 1),
            delay(.6,
                all(
                    allcirclesMul[0].scale(0, .5),
                    registerBData.write(20, 0),
                    objectValue(20, 0.4),
                ),
            ),
        ),
        waitUntil('overshadow'),
        all(
            registerA.scale(.8, 1),
            registerB.scale(1.2, 1),
        )
    );

    yield* Float(raceCondition);
    yield* chain(
        waitUntil("appear bug"),
        all(
            registerB.x(registerB.x() + 150, 1),
            registerA.x(() => registerB.x(), 1),
            registerA.y(170, 1),
            registerB.y(-170, 1),
            registerB.scale(.9, 1),
            registerA.scale(.9, 1),
            raceCondition().x(-400, 1),
        )
    )



    yield* waitUntil("next");
});
