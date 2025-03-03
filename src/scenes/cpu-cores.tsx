import { Gradient, Latex, makeScene2D, Node, Ray, Rect, Txt, Video, View2D } from "@motion-canvas/2d";
import { all, any, createRef, createRefArray, createSignal, delay, easeInCubic, easeOutCubic, loop, range, useRandom, waitFor, waitUntil } from "@motion-canvas/core";

import cpuvideo from '../assets/cpuvideo.mp4';
import { GMRect } from "../components/glassmorphic_rect";
import { Notification } from "../components/notifcation";

var view2d: View2D;

function CoreFunction(name: string, arrow: boolean = true) {
    return <Node>
        <Rect
            stroke={"rgb(255,26,26)"}
            fill={"#ec1c1c1a"}
            radius={32}
            lineWidth={.5}
            width={'100%'}
            justifyContent={'center'}
            padding={10}
        >
            <Txt
                fontSize={30}
                fill={"rgb(255,92,92)"}
            >{name}</Txt>
        </Rect>
        {arrow ?
            <Ray
                toY={30}
                arrowSize={5}
                lineWidth={2}
                stroke={"rgb(255,92,92)"}
                endArrow

            />
            : null}
    </Node>
}


export default makeScene2D(function* (view) {
    view2d = view;
    const video = createRef<Video>();
    const cores = createRefArray<Rect>();
    const corecontainer = createRef<Rect>();
    const generator = useRandom();

    view.add(<Video
        ref={video}
        src={cpuvideo}
    />);

    view.add(<Rect
        layout
        ref={corecontainer}
        opacity={0}
        x={16100}
        fontFamily={"Roboto"}
        gap={900}
    >
        {range(24).map(i => (
            <Rect
                size={[500, 900]}
                fill={"#ec1c1c2a"}
                radius={32}
                stroke={"rgb(255, 26, 26)"}
                lineWidth={1}
                ref={cores}
                layout
                textAlign={'center'}
                direction={'column'}
                justifyContent={'space-between'}
                padding={50}
                gap={50}
            >
                <Txt
                    width={'100%'}
                    fontWeight={700}
                    fill={"rgb(255, 92, 92)"}
                >
                    Core {i.toFixed(0)}
                </Txt>
                <Rect
                    direction={'column'}
                    gap={10}
                    alignItems={'center'}
                    scale={.6}
                >
                    {CoreFunction("F/D")}
                    {CoreFunction("Sched")} 
                    {CoreFunction("ALU/FPU")}
                    {CoreFunction("Mem Ctrl")}
                    {CoreFunction("L1 Cache", false)}
                </Rect>

                <Rect
                    layout
                    direction={'column'}
                >

                    <Txt
                        text={`Thread ID: #${generator.nextInt(4305, 34250).toFixed(0)}`}
                        fill={"rgb(255, 92, 92)"}
                        fontSize={30}
                        fontWeight={100}
                    />
                    <Txt
                        text={`Status: ${["Blocked", "Running", "Runnable"][generator.nextInt(0, 3)]}`}
                        fill={"rgb(255, 92, 92)"}
                        fontSize={30}
                        fontWeight={100}
                    />
                    <Txt
                        text={`CPU Usage: ${generator.nextInt(0, 100).toFixed(0)}%`}
                        fill={"rgb(255, 92, 92)"}
                        fontSize={30}
                        fontWeight={100}
                    />
                    <Txt
                        text={`Task: ${["IO Operation", "Data Processing", "Idle"][generator.nextInt(0, 3)]}`}
                        fill={"rgb(255, 92, 92)"}
                        fontSize={30}
                        fontWeight={100}
                    />
                </Rect>
            </Rect>
        ))}

    </Rect>)

    video().play();

    yield* waitUntil("highlight");
    yield Notification(3, "This is an imaginary CPU model (credits in description).\nThe brown rects represent CPU cores / core clusters", view, {darkmode : true});

    yield* waitUntil("appear cpu cores");

    yield* video().opacity(0, 1),
        yield* corecontainer().opacity(1, 1);

    yield* all(
        corecontainer().x(0, 3),
        delay(1, corecontainer().gap(200, 2)),
        corecontainer().scale(.1, 3),
    );
    const randnums: number[] = [];
    const uniqueNumbers = new Set<number>();

    while (uniqueNumbers.size < 24) {
        const ref = generator.nextInt(0, 24);
        uniqueNumbers.add(ref);
    }

    uniqueNumbers.forEach(num => randnums.push(num));
    yield* all(
        loop(24, (i) => cores[randnums[i]].fill("rgb(255,26,26)", .2)),
        loop(12, (i) => cores[randnums[i + 12]].fill("rgb(255,26,26)", .2)),
    )

    const tex = createRef<Latex>();
    view.add(<Latex
        tex={"\\frac{1}{24}"}
        ref={tex}
        fill={"rgb(255,26,26)"}
        height={40}
        opacity={0}
    />)
    yield* waitUntil('1/24');
    yield* all(
        ...cores.map((core, i) => i != 7 ? (core.opacity(.2, 1)) : null),
        tex().position([-315, -120], 0),
        tex().opacity(1, 1),
        tex().height(80, 1),
    )

    yield* waitUntil('1/4');
    yield* any(
        ...cores.map((core, i) => ((i > 7) || (i < 4)) ? any(core.size(0, 1), core.scale(0, 1)) : null ),
        corecontainer().scale(.6, 1),
        corecontainer().x(1100, 1),
        tex().position([650, -350], 1),
        tex().tex("\\frac{1}{4}", 1),
        tex().height(120, 1),
    );
    




    yield* waitUntil("next");
});