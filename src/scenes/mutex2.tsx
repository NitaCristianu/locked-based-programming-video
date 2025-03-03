import { makeScene2D, Circle, Line, Rect, Node, Txt, Gradient, View2D, Icon, Code } from '@motion-canvas/2d';
import { all, any, chain, Color, createRef, createSignal, easeInCubic, easeOutBounce, easeOutCubic, PossibleVector2, remap, sequence, textLerp, useRandom, Vector2, waitUntil } from '@motion-canvas/core';
import { Background } from '../components/background';
import { ObjectValue } from '../components/objectValue';
import { GMRect } from '../components/glassmorphic_rect';
import gaussianblur from "../shaders/glassmorphic.glsl";

const generator = useRandom(2, true);
function* createThreadRay(view: View2D, name: string = '', main: boolean = false, point: Vector2) {
    const lineRef = createRef<Line>();
    const points: Vector2[] = [];
    const width = view.width();
    const height = view.height();
    const accentProcentage = createSignal<number>(0);

    points.push(point);
    points.push(point.mul(-1));

    view.add(<Line
        points={points}
        stroke={() => Color.lerp("#fffa", "#ff0", accentProcentage())}
        lineWidth={15}
        radius={128}
        ref={lineRef}
        zIndex={-1}
        end={0}
        endArrow
        shadowBlur={20}
        // opacity={() => main ? 1 : (1 - accentProcentage() * .3)}
        lineDash={main ? [0, 0] : [20, 5]}
        shadowColor={"white"}
    />);

    return { lineRef, accent: accentProcentage };
}

export default makeScene2D(function* (view) {
    view.add(<Background />);

    const { lineRef: rayA, accent: rayAaccent } = yield* createThreadRay(view, "A", false, new Vector2(400, 400).mul(1.5));
    const { lineRef: rayB, accent: rayBaccent } = yield* createThreadRay(view, "B", false, new Vector2(-800, 200).mul(1.5));
    const objectValue = createRef<ObjectValue>();
    const shield = createRef<Icon>();

    view.add(<ObjectValue
        type={'32bit int'}
        value={0}
        scale={0}
        ref={objectValue}
        translucency={1}
        darkness={-.1}
    >
        <Icon
            icon={"material-symbols:shield-lock-rounded"}
            size={100}
            position={[-120, 120]}
            opacity={0}
            offset={[-.5, .5]}
            scale={.4}
            color={"#ff0"}
            shadowBlur={10}
            shadowColor={"#ff0"}
            ref={shield}
        />
    </ObjectValue>)

    yield* waitUntil("start");
    yield* chain(
        sequence(
            .6,
            all(
                rayA().end(1, 2),
            ),
            objectValue().pop(),
        ),
    );
    yield* waitUntil("toggle");
    yield* any(
        objectValue().toggle(),
        rayAaccent(1, 1),
        objectValue().showInfo("Protected by mutex", 2),
        shield().opacity(1, 1, easeOutCubic),
        shield().scale(1, 1, easeOutCubic),
        shield().offset(0, 1, easeOutCubic),
    );
    yield* waitUntil("rayB");
    yield* all(
        rayB().end(.44, 1, easeOutBounce),
    )
    yield* waitUntil("wake up");
    yield* all(
        objectValue().toggle(false),
        rayAaccent(0, 1),
        shield().opacity(0, .5, easeInCubic),
        shield().scale(0.3, 1, easeInCubic),
        shield().offset([-.5,.5], 1, easeInCubic),
    );
    yield* all(
        rayB().end(1, 1, easeInCubic),
        shield().opacity(1, 1, easeOutCubic),
        shield().scale(1, 1, easeOutCubic),
        shield().offset(0, 1, easeOutCubic),
        objectValue().toggle(),
        rayBaccent(1, 1),
    );

    const code_rect = createRef<GMRect>();
    view.add(<GMRect
        size={[1100, 200]}
        ref={code_rect}
        translucency={1}
        darkness={-.2}
        scale={0}
    >
        <Code
            code={"// Attempt to lock the mutex without going to sleep\nbool result = pthread_mutex_trylock(&mutex)"}
            fontSize={35}
            zIndex={1}
        />
    </GMRect>)

    yield* waitUntil("try_lock");
    yield* chain(
        all(
            code_rect().scale(1, 1),
        )
    );


    yield* waitUntil("next");
});
