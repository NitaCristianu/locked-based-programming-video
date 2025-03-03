import { Gradient, Icon, makeScene2D, Node, Rect, Txt, View2D } from "@motion-canvas/2d";
import { Background } from "../components/background";
import { GMRect } from "../components/glassmorphic_rect";
import { all, createRef, delay, easeInOutCubic, easeOutCubic, loop, Promisable, range, Reference, ThreadGenerator, tween, Vector2, waitUntil } from "@motion-canvas/core";
import { Notification } from "../components/notifcation";

function CpuThread(i: number, priority: "high" | "low") {
    const rect = <Rect
        size={150}
        fill={priority == 'low' ? "#fff3" : "#ff03"}
        stroke={new Gradient({
            fromY: -75,
            toY: 75,
            stops: [
                { offset: 0, color: priority == 'low' ? "#fff6" : "#ff06" },
                { offset: 0.2, color: priority == 'low' ? "#fff" : "#ff0" },
                { offset: 0.8, color: priority == 'low' ? "#fff" : "#ff0" },
                { offset: 1, color: priority == 'low' ? "#fff6" : "#ff06" },
            ]
        })}
        lineWidth={2}
        radius={16}
        layout
        justifyContent={'center'}
        alignItems={'center'}
        shadowBlur={10}
        shadowColor={priority == 'low' ? "#fff" : "#ff0"}
    >
        <Txt
            text={`Thread ${i}`}
            textAlign={'center'}
            fontSize={30}
            fill={priority == 'low' ? "#fff" : "#ff3"}
            fontFamily={"Poppins"}
        />
    </Rect>;

    return rect;
}

export function CursorComponent() {
    const icon = <Icon
        icon={'mdi:cursor-pointer'}
        size={80}
        zIndex={2}
        y={100}
        x={515}
    />;

    function* move(where: Vector2, time: number = 0.1) {
        const lerp = Vector2.createArcLerp();
        const start = icon.position();
        yield* tween(time, (t) => {
            t = easeInOutCubic(t);
            icon.position(start.lerp(where, t));
        });
    }

    return {
        icon,
        move,
        moveX: function* (x: number, time: number = 0.8) {
            const where = new Vector2(x, icon.y());
            return yield* move(where, time);
        },
    }
}

var oldThreadIndex = 6;
export function* selectThread(moveCursor: (x: number, time?: number) => Generator<void | ThreadGenerator | Promise<any> | Promisable<any>, void, any>, threads: Rect[], threadIndex: number, time: number = 0.6) {
    const pos = threads[threadIndex].position.x();
    yield all(
        threads[oldThreadIndex].shadowBlur(10, time),
        threads[oldThreadIndex].size(150, time),
    )
    yield all(
        threads[threadIndex].shadowBlur(50, time),
        threads[threadIndex].size(170, time),
    );
    yield* moveCursor(pos, time);
    oldThreadIndex = threadIndex;
}

export function* SelectionSequence(cursor : any , threads : any){
    yield* selectThread(cursor.moveX, threads, 5, 0.6);
    yield* selectThread(cursor.moveX, threads, 4, 0.6);
    yield* selectThread(cursor.moveX, threads, 6, 0.6);
    yield* selectThread(cursor.moveX, threads, 3, 0.6);
    yield* selectThread(cursor.moveX, threads, 2, 0.6);
    yield* selectThread(cursor.moveX, threads, 5, 0.6);
    yield* selectThread(cursor.moveX, threads, 4, 0.6);
    yield* selectThread(cursor.moveX, threads, 6, 0.6);
}

export default makeScene2D(function* (view) {
    view.add(<Background />);
    const cpu_layout = createRef<Rect>();
    const cpu_container = createRef<GMRect>();
    const danger_icon = createRef<Icon>();


    yield* waitUntil('start');
    view.add(<GMRect
        size={() => cpu_layout().size().add(50)}
        ref={cpu_container}
    >
        <Rect
            ref={cpu_layout}
            gap={20}
            layout
            alignItems={'center'}
            zIndex={1}
        >
            {range(7).map(i => CpuThread(i, i < 4 ? 'low' : 'high'))}
        </Rect>
        <Icon
            ref={danger_icon}
            icon={"solar:danger-triangle-bold"}
            shadowColor={"#FF0a"}
            shadowBlur={10}
            size={80}
            y={-100}
            color={"#ff5"}
            scale={.8}
            zIndex={1}
            opacity={0}
        />
    </GMRect>);

    const cursor = CursorComponent();
    cpu_container().add(cursor.icon);

    const threads = cpu_layout().children() as Rect[];
    yield* SelectionSequence(cursor, threads);
    yield loop(4, ()=> SelectionSequence(cursor, threads));
    yield* all(
        threads[0].opacity(.5, 1),
        threads[1].opacity(.5, 1),
        danger_icon().opacity(1, 1, easeOutCubic),
        danger_icon().y(-130, 1, easeOutCubic),
        danger_icon().scale(1.1, 1, easeOutCubic),
        danger_icon().x((threads[0].x()+threads[1].x())/2, 0, easeOutCubic),
    );
    yield* Notification(4, "Threads 0 and 1 are 'starving'. The higher priority\nthreads get most execution time.", view);

    yield* waitUntil("next");
});