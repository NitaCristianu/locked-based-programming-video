import { Circle, Gradient, hue, Icon, Line, makeScene2D, Rect, Txt } from "@motion-canvas/2d";
import { all, chain, createRef, delay, easeOutCubic, tween, Vector2, waitFor, waitUntil } from "@motion-canvas/core";
import { Background } from "../components/background";
import { GMRect } from "../components/glassmorphic_rect";
import { Chapter } from "../components/chapter";
import { Notification } from "../components/notifcation";

export default makeScene2D(function* (view) {
    view.add(<Background />);

    const title = createRef<Txt>();
    const mutex_title = createRef<Txt>();
    const ray = createRef<Line>();
    const kernel = createRef<GMRect>();

    view.add(<Txt
        text={"CRITICAL SECTIONS"}
        ref={title}
        lineWidth={4}
        fontSize={130}
        fontFamily={"Poppins"}
        fill={"#fff4"}
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
    >
    </Txt>);

    view.add(<Chapter
        chapterNumber={2}
        icon={"material-symbols:cycle-rounded"}
        name={"Critical Sections"}
    />);

    const description = createRef<Rect>();
    view.add(<Rect
        layout
        alignItems={'center'}
        y={0} // 90
        opacity={0}
        scale={.8}
        ref={description}
        shadowBlur={40}
        shadowColor={"#fff9"}
    >
        <Txt
            fill={"#fff"}
            fontFamily={"Poppins"}
            fontWeight={300}
            text={"tool proved by"}
        >
        </Txt>
        <Icon
            icon={"bxl:microsoft"}
            size={80}
        /></Rect>);
    const transCirlce = createRef<Circle>();
    view.add(<GMRect
        x={900}
        size={0}
        ref={transCirlce}
        radius={10000}
        translucency={1}
        clip
    >
        <Txt
            ref={mutex_title}
            zIndex={1}
            text={"MUTEX"}
            lineWidth={4}
            fontSize={230}
            x={() => -transCirlce().x()}
            fontFamily={"Poppins"}
            fill={"#fff7"}
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
        >
        </Txt>
    </GMRect>);

    const call_icon = createRef<Icon>();
    view.add(<Icon
        position={()=>{
            const line = ray().getPointAtPercentage(0.3+0.5*ray().end());
            return line.position.add(line.normal.mul(100));
        }}
        opacity={0}
        offsetY={.5}
        icon={"material-symbols:call"}
        size={90}
        ref={call_icon}
    />)

    view.add(<Line
        ref={ray}
        end={0}
        points={() => [
            mutex_title().right().addX(transCirlce().x()),
            kernel().left(),
        ]}
        lineWidth={9}
        endOffset={50}
        startOffset={50}
        endArrow
        lineDash={[50, 20]}
        stroke={"white"}
        zIndex={1}
    />);
    view.add(<GMRect
        ref={kernel}
        x={1700}
        width={580}
        height={150}
    >
        <Txt
            text={"KERNEL"}
            zIndex={1}
            lineWidth={4}
            fontSize={130}
            fontFamily={"Poppins"}
            fill={"#fff4"}
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
        >
        </Txt>
    </GMRect>);

    yield* waitUntil("start");
    yield* all(
        description().opacity(1, .8, easeOutCubic),
        description().y(60, .8, easeOutCubic),
        description().scale(1, .8, easeOutCubic),
        title().y(-30, .8, easeOutCubic),
    );

    yield* chain(
        waitUntil("mutex"),
        all(
            transCirlce().size(2400, 1),
            transCirlce().x(100, 1),
        ),
        waitUntil("expensive"),
        all(
            delay(.4, all(
                call_icon().opacity(1, .7, easeOutCubic),
                call_icon().offset(0, .7, easeOutCubic),
            )),
            ray().end(1, 1.5, easeOutCubic),
            mutex_title().x(mutex_title().x() - 1700, 1),
            kernel().x(kernel().x() - 1700, 1)
        ),
    )
    yield* Notification(2, "Linux provides futex as a similar alternative, unfair lock for mac os",view, {top:true});

    yield* chain(
        all(
            tween(1, (t)=>{
                view.children()[0].filters([hue(t*100)])
            })
        )
    )

    yield* waitUntil("next");
})