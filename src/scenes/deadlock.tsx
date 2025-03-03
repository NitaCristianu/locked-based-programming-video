import { Circle, Icon, Line, makeScene2D, Node, Ray, Rect, Txt, View2D } from "@motion-canvas/2d";
import { Background } from "../components/background";
import { all, chain, Color, createRef, createRefArray, easeInOutBack, easeInOutBounce, easeOutBack, PossibleVector2, Random, range, sequence, SignalGenerator, useRandom, Vector2, waitFor, waitUntil } from "@motion-canvas/core";
import { GMRect } from "../components/glassmorphic_rect";
import { Float } from "../components/float";

const scale_factor = 300;
const variation_factor = 0.4;
var generator: Random;

function Thread(name: number | string, position: PossibleVector2, offset: boolean = true) {
    const pos = new Vector2(position).scale(scale_factor);

    return <GMRect
        size={150}
        fill={"#00f"}
        translucency={1}
        darkness={-.1}
        borderModifier={-1.2}
        position={pos}
        // offset={offset ? generator.floatArray(2, -variation_factor, variation_factor) as any : 0}
    >
        <Txt
            text={typeof (name) == 'string' ? name : "T" + name}
            zIndex={1}
            fontFamily={"Poppins"}
            fontWeight={700}
            fill={"white"}
            shadowBlur={10}
            shadowColor={"#fffa"}
        />
    </GMRect> as GMRect
}

function Resource(name: number | string, position: PossibleVector2, offset: boolean = true) {
    const pos = new Vector2(position).scale(scale_factor);
    return <GMRect
        translucency={1}
        darkness={.1}
        radius={1000}
        borderModifier={1.2}
        fill={"#f00"}
        // offset={offset ? generator.floatArray(2, -variation_factor, variation_factor) as any : 0}
        position={pos}
        size={150}
    >
        <Txt
            text={typeof (name) == 'string' ? name : "R" + name}
            zIndex={1}
            fontFamily={"Poppins"}
            fontWeight={700}
            fill={"white"}
            shadowBlur={10}
            shadowColor={"#fffa"}
        />
    </GMRect> as GMRect
}

export function connection(view: View2D, from: GMRect, to: GMRect, type = false) {
    const r0 = from.size().x / 2;
    const r1 = to.size().y / 2;
    const l = <Line
        end={0}
        points={()=>[
            from.position(),
            to.position()
        ]}
        startOffset={r0 + 30}
        endOffset={r1 + 30}
        lineWidth={9}
        opacity={type ? 0.5 : 1}
        stroke={"white"}
        lineDash={type ? [20, 10] : [0, 0]}
        endArrow
    /> as Line;
    view.add(l)
    return l;
}

export default makeScene2D(function* (view) {
    view.add(<Background />);

    generator = useRandom(6);
    const camera = <Node />;
    view.add(camera);

    const pos_data = [
        Resource(3, [0, -1]), // 0
        Thread(4, [-1, -1]), // 1
        Resource(1, [0, 0]), // 2
        Thread(0, [-1, 0]), // 3
        Thread(2, [1, 0]), // 4
        Thread(1, [0, 1]), // 5
        Resource(0, [-1, 1]), // 6
        Resource(2, [1, 1]), // 7
    ];
    const connections = [
        [0, 1],
        [1, 2],
        [3, 2],
        [2, 4],
        [4, 7],
        [7, 5],
        [5, 2],
        [6, 5],
    ];

    const tools = createRefArray<GMRect>();
    view.add(<Node
    >
        {[
            ['mutex', 'material-symbols:lock'],
            ['critical section', 'material-symbols:cycle-rounded'],
            ['semaphore', 'material-symbols:speed-camera-rounded'],
            ['events', 'material-symbols:calendar-clock-rounded'],
            ['promise & future', 'material-symbols:clock-arrow-up-rounded'],
        ].map(([name, icon], i)=>(<GMRect
            size={250}
            radius={1000}
            x={i*300-600}
            ref={tools}
            scale={0}
        >
            <Icon
                icon={icon}
                zIndex={1}
                size={150}
            />
            <Txt
                text={name}
                y={170 * ((i % 2 == 0) ? 1 : -1)}
                fontFamily={"Poppins"}
                fontSize={45}
                zIndex={2}
                fill={"white"}
                shadowBlur={20}
                shadowColor={"white"}
                fontWeight={400}
                scaleY={0}
                scaleX={.3}
            />
        </GMRect>))}
    </Node>)

    const arrowArr = createRefArray<Ray>();
    connections.forEach(([start, end]) => {
        const from: GMRect = pos_data[start] as any;
        const to: GMRect = pos_data[end] as any;
        const isSolid = new Color(from.fill() as any).rgb()[0] == 255;

        camera.add(<Ray
            from={from.position}
            to={to.position}
            lineWidth={5}
            stroke={"white"}
            lineDash={isSolid ? [0, 0] : [20, 20]}
            endOffset={() => to.size().x * .75 * from.scale().x}
            startOffset={() => from.size().x * .75 * from.scale().x}
            endArrow
            end={0}
            arrowSize={10}
            ref={arrowArr}
            zIndex={2}
        />)
    })
    const bgr = createRef<Rect>();
    camera.add(<Rect
        fill={"#000"}
        size={'100%'}
        opacity={0}
        zIndex={1}
        ref={bgr}
    />)
    pos_data.forEach(el => {
        el.save();

        el.scale(0);
        el.y(el.y() + 40);

        camera.add(el);
    });

    const resourceA = Resource("A", [0, -0.5], false);
    const resourceB = Resource("B", [0, 0.5], false);
    const thread1 = Thread(1, [-1, 0], false);
    const thread2 = Thread(2, [1, 0], false);
    const t1ra = connection(view, resourceA, thread1, false);
    const t1rb = connection(view, thread1, resourceB, true);
    const t2rb = connection(view, resourceB, thread2, false);
    const t2ra = connection(view, thread2, resourceA, true);
    resourceA.save();
    resourceA.scale(0);
    resourceB.save();
    resourceB.scale(0);
    thread2.save();
    thread2.scale(0);
    thread1.save();
    thread1.scale(0);
    view.add(resourceA);
    view.add(resourceB);
    view.add(thread2);
    view.add(thread1);

    yield* chain(
        waitUntil("start"),
        sequence(
            .2,
            ...tools.map(t=>t.scale(1, 1, easeOutBack)),
        ),
        sequence(
            .2,
            ...tools.map(t=>t.findFirst(node=>node instanceof Txt).scale(1, 1, easeOutBack)),
        ),
        waitUntil("graph1"),
        all(
            resourceA.restore(1),
            resourceB.restore(1),
            thread1.restore(1),
            thread2.restore(1),
        ),
        waitUntil("t1rA"),
        t1ra.end(1, 1),
        waitUntil("t1rB"),
        t1rb.end(1, 1),
        waitUntil("t2rB"),
        t2rb.end(1, 1),
        waitUntil("t2rA"),
        t2ra.end(1, 1),
        waitUntil("complex"),
        all(
            t1ra.opacity(0, 1),
            t1rb.opacity(0, 1),
            t2ra.opacity(0, 1),
            t2rb.opacity(0, 1),
            thread1.scale(0, 1),
            thread2.scale(0, 1),
            resourceA.scale(0, 1),
            resourceB.scale(0, 1),
            resourceA.y(resourceA.y() + 80, 1),
            resourceB.y(resourceB.y() - 80, 1),
        ),
        all(...pos_data.map(el => el.restore(1))),
        all(...arrowArr.map(el => el.end(1, 1))),
    );
    yield* waitUntil("remove");
    const taskArray: SignalGenerator<any, any>[] = [];
    const thread_array: GMRect[] = pos_data.filter(el => new Color((el as any).fill() as any).rgb()[2] == 255) as any;
    pos_data.forEach((el, i) => {
        const isSolid = new Color((el as any).fill() as any).rgb()[0] == 255;
        var thread: GMRect;
        connections.forEach(([start, end]) => {
            if (start == i) { thread = pos_data[end] as any };
        });
        if (!thread) return null;
        if (isSolid) {
            const dir = thread.position().sub(el.position()).normalized;
            taskArray.push(el.scale(0, 1));
            taskArray.push(el.position(thread.position().sub(dir.mul(60)), 1));
        }
    })

    yield* all(
        ...taskArray,
        ...thread_array.map(el => el.scale(1.2, 1)),
        ...arrowArr.map((el, i) => {
            const connection = pos_data[connections[i][1]];
            const pointsThread = new Color((connection as any).fill() as any).rgb()[2] == 255;
            return pointsThread ? all(el.opacity(0, 1), el.end(0, .6)) : null
        })
    );

    const badge_container = createRef<GMRect>();
    view.add(<GMRect
        size={[600, 300]}
        x={-1400}
        scale={1.4}
        darkness={-.5}
        borderModifier={-.6}
        translucency={1}
        shadowColor={"rgba(253, 30, 30, 0.5)"}
        zIndex={5}
        ref={badge_container}
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
                icon={"tabler:lock-cancel"}
                size={150}
                color={"rgb(255, 33, 33)"}
                shadowBlur={20}
                shadowColor={"rgba(255, 44, 44, .6)"}
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
            >DEADLOCK</Txt>
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
                text={`Processes block each other indefinitely,`}
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
                text={`waiting for unavailable resources.`}
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
                text={"- Holding while waiting"}
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
                text={`- Non-shareable resources`}
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
                text={`- Cyclic resource dependency`}
            />
        </Rect>
    </GMRect>)

    yield* Float(badge_container);
    yield* chain(
        waitUntil("highlight"),
        all(
            camera.scale(4, 1),
            camera.x(-1000, 1),
            camera.y(-600, 1),
        ),
        waitFor(.5),
        all(
            bgr().opacity(.8, 1),
            ...arrowArr.map(arrow => all(arrow.shadowColor("#fff", 1), arrow.shadowBlur(50, 1))),
            badge_container().x(400, 1),
        )
    );

    yield* waitUntil("next");

});