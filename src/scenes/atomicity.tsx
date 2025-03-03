import { Code, makeScene2D, saturate, Txt, Node, View2D, Ray, Line, Rect, Icon, blur } from "@motion-canvas/2d";
import { all, chain, Color, createRef, createSignal, delay, easeOutCubic, linear, PossibleColor, PossibleVector2, range, sequence, spawn, textLerp, useLogger, useRandom, Vector2, waitUntil } from "@motion-canvas/core";
import { Background } from "../components/background";
import { GMRect } from "../components/glassmorphic_rect";
import { ObjectValue } from "../components/objectValue";
import { alphabet } from "../components/CommonMath";
import gaussianblur from "../shaders/glassmorphic.glsl";

const generator = useRandom(2, true);
function* createThreadRay(view: View2D, name: string = '', main: boolean = false) {
    const lineRef = createRef<Line>();
    const points: Vector2[] = [];
    const width = view.width();
    const height = view.height();
    const accentProcentage = createSignal<number>(0);

    const a = main ? -Math.PI : generator.nextFloat(-Math.PI * 2, Math.PI / 2);
    const r = width / 2 + height / 2;
    const s = Math.sin;
    const c = Math.cos;


    points.push(new Vector2(c(a), s(a)).scale(r));
    if (!main) {
        points.push(points[0].sub(points[0].scale(.95)));
        points.push(points[1].add([-points[0].y, points[0].x]));
    } else {
        points.push(new Vector2(c(Math.PI - a), s(Math.PI - a)).scale(r));
    }

    view.add(<Line
        points={points}
        stroke={() => main ? Color.lerp("#fff", "#ff0", accentProcentage()) : "#fff"}
        lineWidth={15}
        radius={128}
        ref={lineRef}
        zIndex={-1}
        end={0}
        endArrow
        shadowBlur={20}
        opacity={() => main ? 1 : (1 - accentProcentage() * .3)}
        lineDash={main ? [0, 0] : [20, 5]}
        shadowColor={"white"}
    >
        <Rect
            layout
            position={() => {
                const point = lineRef().getPointAtPercentage(main ? .25 : .6);
                return point.position.add(point.normal.scale(30));
            }}
            fill={main ? "#fff0" : "#fff2"}
            stroke={main ? "#fff0" : "#fffa"}
            lineWidth={1}
            radius={16}
            padding={15}
            paddingBottom={5}
            paddingTop={5}
        >
            <Txt
                text={() => textLerp("", "Thread " + name, (main ? lineRef().end() : accentProcentage()))}
                fill={() => main ? Color.lerp("#fff", "#ff0", accentProcentage()) : "#fff"}
                shadowColor={() => main ? Color.lerp("#fff", "#ff0", accentProcentage()).alpha(.25) : "#fff4"}
                textAlign={'left'}
                fontFamily={"Poppins"}
                shadowBlur={20}
            />
        </Rect>
    </Line>);

    return { lineRef, accent: accentProcentage };
}

function* spawnLine(view: View2D, i: number) {
    const name = alphabet[i + 1];
    const { lineRef: newLine, accent: procentage } = yield* createThreadRay(view, name.toUpperCase());
    newLine().zIndex(-2);
    yield procentage(1, 1);
    yield* newLine().end(1, 2);

}

export default makeScene2D(function* (view) {
    view.add(<Background />);

    const object = createRef<ObjectValue>();
    view.add(<ObjectValue
        name={"X"}
        value={10}
        ref={object}
        focusName={1}
    />);
    object().scale(0);


    const { lineRef: threadA, accent: threadAAccent } = yield* createThreadRay(view, "A", true);

    yield* object().pop();
    yield delay(.4,
        all(
            object().toggle(true, "#FF0"),
            threadAAccent(1, 1),
        ));
    yield* threadA().end(1, 1);
    yield* createThreadRay(view);


    yield* sequence(
        .3,
        ...range(4).map(i => {
            return spawnLine(view, i + 1)
        }))

    yield* waitUntil("infocard");
    const children_container = <Rect
        size={'100%'}
        offset={-1}
        zIndex={-1}
    />;
    const blursterngth = createSignal<number>(0);
    const currentChildren = view.children();
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
    currentChildren.forEach((child, i) => i != 0 ? child.parent(children_container) : null)
    const info_card = createRef<GMRect>();
    const title = createRef<Txt>();
    const info_string = `An atomic operation is an indivisible action that guarantees data integrity and prevents interference in multi-threaded or concurrent systems." Again, in simpler terms, it will execute safely as long as its thread runs.`;
    const main_text_container = createRef<Rect>();
    const bug_container = createRef<Rect>();

    view.add(<GMRect
        fontFamily={"Poppins"}
        size={[1000, 600]}
        darkness={.2}
        borderModifier={.3}
        ref={info_card}
        scale={[0.4, 0]}
        shadowColor={"rgba(199, 205, 255, 0.8)"}
        x={800}
        translucency={1}
    >
        <Txt
            ref={title}
            zIndex={1}
            topLeft={() => info_card().topLeft().add(50)}
            fontWeight={800}
            fontSize={70}
            fill={"white"}
            shadowBlur={3}
            shadowColor={"white"}
        >ATOMICITY</Txt>
        <Txt
            zIndex={1}
            top={() => title().bottom()}
            fontWeight={200}
            fill={"white"}
            shadowBlur={3}
            fontSize={30}
            shadowColor={"white"}
        >"Freedom from Interference."</Txt>
        <Rect
            fill={"#fff2"}
            opacity={0}
            stroke={"white"}
            lineWidth={1}
            zIndex={1}
            radius={16}
            padding={20}
            layout
            topLeft={() => title().bottomLeft().addY(110 - 40 * main_text_container().opacity())}
            direction={'column'}
            width={900}
            gap={10}
            ref={main_text_container}
        >
            <Icon
                marginTop={-45}
                icon={"tabler:book-filled"}
                shadowBlur={10}
                shadowColor={"rgba(255, 255, 255, .3)"}
                size={50}
            />
            <Txt
                zIndex={1}
                fontWeight={200}
                fill={"white"}
                shadowBlur={3}
                textWrap
                fontSize={30}
                gap={20}
                shadowColor={"white"}
            >{info_string}</Txt>
        </Rect>
        <GMRect
            position={() => info_card().topRight().sub([10, -10]).scale(info_card().scale().y)}
            zIndex={1}
            size={80}
            darkness={.5}
            borderModifier={.5}
            radius={12}
        >
            <Icon
                icon={"tabler:bulb-filled"}
                color={"rgb(254, 255, 211)"}
                shadowBlur={5}
                shadowColor={"rgb(253, 255, 140)"}
                zIndex={1}
                size={50}
            />
        </GMRect>
        <GMRect
            position={() => info_card().topRight().sub([10, -100]).scale(info_card().scale().y)}
            zIndex={1}
            size={80}
            darkness={.5}
            borderModifier={.5}
            radius={12}
        >
            <Icon
                icon={"tabler:bookmarks-filled"}
                color={"rgb(211, 248, 255)"}
                shadowBlur={5}
                shadowColor={"rgb(140, 255, 255)"}
                zIndex={1}
                size={50}
            />
        </GMRect>
        <Rect
            opacity={0}
            top={() => main_text_container().bottom().addY(110 - 40 * bug_container().opacity())}
            zIndex={1}
            textAlign={'center'}
            justifyContent={'center'}
            alignItems={'center'}
            ref={bug_container}
            gap={20}
            layout
        >
            <Txt
                text={"Completly free from"}
                fontSize={35}
                fill={"rgb(219, 255, 227)"}
                fontWeight={300}
                shadowBlur={20}
                shadowColor={"rgba(175, 255, 194, 1)"}
            ></Txt>
            <Txt
                text={"data races"}
                fontSize={35}
                fill={"rgb(219, 255, 227)"}
                fontWeight={500}
                shadowBlur={20}
                shadowColor={"rgba(175, 255, 194, 1)"}
            ></Txt>
            <Icon
                icon={"tabler:bug-off"}
                shadowBlur={20}
                shadowColor={"rgba(175, 255, 194, 1)"}
                color={"rgb(219, 255, 227)"}
                size={50}
                left={() => title().right().addX(10)}
                zIndex={1}
            />
        </Rect>

    </GMRect>)
    yield* all(
        info_card().scale(1, 1),
        info_card().x(0, 1),
        blursterngth(1, 1),
    )

    yield* chain(
        waitUntil("definition"),
        all(
            main_text_container().opacity(1, 1, easeOutCubic),
        ),
        waitUntil("bug"),
        bug_container().opacity(1, 1, easeOutCubic),
    );

    yield* waitUntil("next");
});