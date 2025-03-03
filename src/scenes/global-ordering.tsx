import { brightness, Circle, Code, contrast, Gradient, Layout, makeScene2D, Node, Rect, Txt } from "@motion-canvas/2d";
import { all, chain, createEffect, createRef, createSignal, easeInCubic, easeInOutSine, easeOutCubic, range, sequence, waitFor, waitUntil } from "@motion-canvas/core";
import { Background } from "../components/background";
import { GMRect } from "../components/glassmorphic_rect";

function CreateInstruction(view: Node, text: string, y: number) {
    const ins = <GMRect
        size={[800, 100]}
        y={y + 80}
        translucency={1}
        darkness={-.2}
        borderModifier={-1}
        scale={[0.4, 0]}
    >
        <Code
            code={text}
            zIndex={1}
            filters={[contrast(3)]}
        />
    </GMRect>;
    view.add(ins);
    return {
        ref: ins,
        popIn: function* () {
            yield* all(
                ins.scale(1, 1, easeOutCubic),
                ins.y(y, 1, easeOutCubic)
            );
        },
        popOut: function* () {
            yield* all(
                ins.scale(1, 1, easeInCubic),
                ins.y(ins.y() - 50, 1, easeInCubic)
            );
        }
    };
}

export default makeScene2D(function* (view) {
    view.add(<Background />);

    const container = createRef<Node>();
    // A B E D C
    const elements = range(5).map(i => ({
        focus: createSignal([1, 1, 0, 0, 1][i]),
        name: ["A", "B", "D", "E", "C"][i],
        ref1: createRef<Circle>(),
        ref2: createRef<GMRect>(),
    }));

    view.add(<Layout
        layout
        gap={10}
        justifyContent={'center'}
        alignItems={'center'}
    >
        {elements.map(data => (
            <Circle
                ref={data.ref1}
                size={() => 250 * data.focus()}
            />
        ))}
    </Layout>);

    view.add(<Node ref={container}>
        {...elements.map(data => (
            <GMRect
                radius={1000}
                ref={data.ref2}
                size={data.ref1().size}
                position={data.ref1().position}
            >
                <Txt
                    text={data.name}
                    zIndex={1}
                    fontSize={100}
                    fontFamily={"Poppins"}
                    fill={() => new Gradient({
                        toY: 45,
                        fromY: -45,
                        stops: [
                            { offset: 0.0, color: "#fff0" },
                            { offset: 0.2, color: "#fff" },
                            { offset: 0.8, color: "#fff" },
                            { offset: 1.0, color: "#fff0" },
                        ]
                    })}
                    scale={data.focus}
                />
            </GMRect>
        ))}
    </Node>)

    const dc = CreateInstruction(view, "Insert D before C", 100);
    const ec = CreateInstruction(view, "Insert E before C", 230);

    yield* chain(
        waitUntil('start'),
        sequence(
            1.5,
            container().y(-150, 1),
            sequence(
                0.9,
                dc.popIn(),
                ec.popIn(),
            )
        ),
        () => { dc.ref.save(), ec.ref.save() },
        sequence(
            1.5,
            container().y(-150, 1),
            sequence(
                0.9,
                all(
                    elements[2].focus(1, 1),
                    dc.ref.scale([0, 0], 1),
                    dc.ref.y(-100, 1),
                ),
                all(
                    elements[3].focus(1, 1),
                    ec.ref.scale([0, 0], 1),
                    ec.ref.y(-100, 1),
                )
            )
        ),
    );
    const clone = container().clone();
    view.add(clone);
    clone.children().forEach((child: Rect) => (child as Rect).size(child.size()));
    clone.children().forEach((child: Rect) => (child as Rect).position(child.position()));
    clone.children().forEach((child: Rect) => (child.children().forEach(t => t.scale(t.scale()))));
    clone.children().forEach((child: Rect) => (child as Rect).position(child.position())),
        yield* all(
            clone.scale(0.5, 1),
            clone.y(400, 1),
        )
    yield* chain(
        waitUntil('switch'),
        all(
            dc.ref.restore(1),
            ec.ref.restore(1),
            elements[2].focus(0, 1),
            elements[3].focus(0, 1),
        ),
        all(
            dc.ref.y(230, 1),
            ec.ref.y(100, 1),
            elements[2].ref2().x(elements[3].ref2().x(), 1),
            elements[3].ref2().x(elements[2].ref2().x(), 1),
        ),
        sequence(
            0.9,
            all(
                elements[3].focus(1, 1),
                ec.ref.scale([0, 0], 1),
                ec.ref.y(-100, 1),
            ),
            all(
                elements[2].focus(1, 1),
                dc.ref.scale([0, 0], 1),
                dc.ref.y(-100, 1),
            )
        )
    );


    const title = createRef<Txt>();
    view.add(<Txt
        text={"Possible Outcomes"}
        lineWidth={4}
        fontSize={130}
        ref={title}
        y={-600}
        fontFamily={"Poppins"}
        opacity={0}
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

    yield* waitUntil("compare");
    yield* all(
        container().scale(0.7, 1),
        container().y(-100, 1),
        clone.scale(0.7, 1),
        clone.y(() => -container().y(), 1),
        title().y(-300, .7, easeInOutSine),
        title().opacity(1, .7, easeInOutSine),
    );

    const clone2 = container().clone();
    view.add(clone2);
    clone2.children().forEach((child: Rect) => (child as Rect).size(child.size()));
    clone2.children().forEach((child: Rect) => (child as Rect).position(child.position()));
    clone2.children().forEach((child: Rect) => (child.children().forEach(t => t.scale(t.scale()))));
    clone2.children().forEach((child: Rect, i) => i == 2 || i == 3 ? (child.findAll((t:any) => (t instanceof Txt ? null : true) ?? t.text('~'))) : null);
    clone2.children().forEach((child: Rect) => (child as Rect).position(child.position()));
    clone2.y(0);
    clone2.scale(0);
    yield* waitUntil("corrupted");
    yield* all(
        title().y(-360, 1, easeInOutSine),
        container().y(-200, 1),
        clone2.scale(.7, 1),
    )



    yield* waitUntil("next");
});