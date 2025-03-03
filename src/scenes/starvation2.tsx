import { blur, contrast, grayscale, Line, makeScene2D, Ray, Rect, Txt, View2D } from "@motion-canvas/2d";
import { Background } from "../components/background";
import threadshader from "../shaders/threadpriority.glsl";
import { all, chain, Color, createRef, createSignal, delay, PossibleVector2, range, SimpleSignal, textLerp, Vector2, waitUntil } from "@motion-canvas/core";
import { GMRect } from "../components/glassmorphic_rect";
import { ObjectValue } from "../components/objectValue";
import { remap } from "../components/CommonMath";

function PriorityComponent(name: string, strength: number, view: View2D, size: SimpleSignal<any>, selected: SimpleSignal<number>) {
    const dimension = () => `${size()}%` as any;
    const r = <Rect
        height={'100%'}
        fill={'#fff'}
        width={dimension}
        filters={[contrast(1.2)]}
        radius={32}
        shadowColor={`rgb(${255},${255},${Math.floor(size() * 255)})`}
        shadowBlur={() => 120 * selected()}
        shaders={{
            fragment: threadshader,
            uniforms: {
                strength: strength
            }
        }}
    ></Rect> as Rect;

    view.add(<Txt
        text={name.indexOf('\n') >= 0 ? name.slice(0, name.indexOf('\n')) : name}
        scaleY={() => size() / 100}
        shadowBlur={15}
        shadowColor={new Color("#ffaa").darken(3)}
        zIndex={1}
        top={() => r.top().mul(r.parent().scale()).addY(20)}
        width={r.width}
        textAlign={'center'}
        fontSize={25}
        fontFamily={"Poppins"}
        fill={'white'}
        fontWeight={900}
        opacity={0.8}
    />);
    if (name.indexOf('\n') >= 0) {
        view.add(<Txt
            text={name.slice(name.indexOf('\n'))}
            scaleY={() => size() / 100}
            zIndex={1}
            top={() => r.top().mul(r.parent().scale()).addY(20)}
            shadowBlur={15}
            shadowColor={new Color("#ffaa").darken(3)}
            width={r.width}
            textAlign={'center'}
            fontSize={25}
            fontFamily={"Poppins"}
            fill={'white'}
            fontWeight={900}
            opacity={0.8}
        />);
    }
    view.add(<Rect
        size={r.size}
        position={r.position}
        scale={r.scale}
        zIndex={1}
        opacity={()=>remap(300, 1000, 0, 1, r.height()) * .1}
        clip
    >
        <Txt
            text={`${strength > 0.5 ? "HIGH" : "LOW"} PRIORITY`}
            textAlign={'center'}
            rotation={-45}
            fontFamily={"Poppins"}
            fontWeight={1000}
            fontSize={100}
            fill={"black"}
            x={() => (strength > 0.5 ? 100 + size() - 100 : -300 + 200 * size() / 100)}
        />
    </Rect>);

    return r;
}

export default makeScene2D(function* (view) {
    view.add(<Rect fill={"#fffa"} size={'100%'} />)
    view.add(<Background filters={[grayscale(1)]} />);

    const rects_size = range(10).map(i => createSignal(i == 0 || i == 9 ? 100 : 0));
    const selected = range(10).map(i => createSignal(0))
    const container = createRef<Rect>();
    const names: string[] = [
        "Idle",
        "Lowest",
        "Below\nNormal",
        "Normal",
        "Above\nNormal",
        "Highest",
        "Time\nCritical",
        "Real-Time\n(1)",
        "Real-Time\n(15)",
        "Real-Time\n(31)"
    ];


    view.add(<Rect
        scale={.8}
        size={'100%'}
        ref={container}
        layout
        direction={'row-reverse'}
        justifyContent={'center'}
        alignItems={'center'}
        gap={5}
        padding={75}
    >
        {range(10).map(i => PriorityComponent(names[i], i / 10, view, rects_size[i], selected[i]))}
    </Rect>);

    const name = createSignal("[priority]");
    const thread = <ObjectValue
        name={"A"}
        focusName={1}
        type={name}
        darkness={1}
        translucency={.5}
        darkmode={1}
        zIndex={1}
        scale={0}
    /> as ObjectValue;
    view.add(thread);


    yield* chain(
        waitUntil('start'),
        thread.pop(),
        all(
            thread.x(-350, 2),
            delay(1, name("HIGH PRIORITY", 1)),
        ),
        all(
            thread.x(350, 2),
            delay(1, name("LOW PRIORITY", 1)),
        ),
    )

    yield* chain(
        waitUntil("more"),
        thread.pop(false),
        all(
            ...rects_size.map(size => size(100, 1)),
            container().scale(1, 1),
            container().gap(20, 1),
        ),
    );

    const arrow = createRef<Line>();
    view.add(<Ray
        ref={arrow}
        fromX={-850}
        toX={850}
        y={90}
        endArrow
        end={0}
        lineDash={[20, 20]}
        shadowBlur={10}
        lineWidth={5}
        stroke={"#000"}
    >
        <Txt
            text={()=>textLerp("","FROM MOST TO LEAST PREFFERED\nPRIORITY BY THE SCEDULER", arrow().end())}
            textAlign={'center'}
            fontFamily={"Poppins"}
            fontWeight={300}
            letterSpacing={15}
            y={100}
            shadowBlur={20}
            shadowColor={"#000"}
            fill={"#000"}
        />
    </Ray>);

    yield* chain(
        waitUntil("preference"),
        all(
            container().height(250, 1),
            delay(.5, arrow().end(1, 1.5)),
        )
    )

yield * waitUntil("next");
});