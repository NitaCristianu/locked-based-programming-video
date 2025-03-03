import { Circle, Code, CODE, Gradient, Icon, Line, lines, makeScene2D, Ray, Rect, Txt, View2D } from "@motion-canvas/2d";
import { Background } from "../components/background";
import { all, BBox, chain, Color, createRef, createRefArray, createSignal, DEFAULT, easeOutCubic, range, Reference, sequence, useLogger, Vector2, waitFor, waitUntil } from "@motion-canvas/core";
import { GMRect } from "../components/glassmorphic_rect";
import { Chapter } from "../components/chapter";

const exampleCode=`\
#include <windows.h>
#include <stdio.h>

HANDLE evt;

DWORD WINAPI Worker(LPVOID lpParam) {
    printf("Worker: Waiting for event...\\n");
    WaitForSingleObject(evt, INFINITE);
    printf("Worker: Event signaled, proceeding!\\n");
    return 0;
}

int main(void) {
    // manual-reset, initially nonsignaled
    evt = CreateEvent(NULL, TRUE, FALSE, NULL);
    CreateThread(NULL, 0, Worker, NULL, 0, NULL);
    Sleep(2000); // simulate work
    printf("Main: Signaling event (like an ambulance's siren)...\\n");
    SetEvent(evt);
    Sleep(1000); // allow worker to finish
    return 0;
}`;
const splited = exampleCode.split('\n');

type api_func = "SetEvent" | "WaitForSingleObject";
const colors = {
    "SetEvent": new Color("#f0f"),
    "WaitForSingleObject": new Color("#ff0"),
}

function* createAPIComponent(view: View2D, type: api_func) {
    const ref = createRef<GMRect>();
    view.add(<GMRect
        size={[650, 100]}
        y={150}
        x={type == 'SetEvent' ? -1500 : 1500}
        ref={ref}
        borderModifier={-1.5}
    >
        <Txt
            fontFamily={"Fira Code"}
            zIndex={1}
            fill={colors[type].brighten(3)}
        >
            {type}
            <Txt
                text={"()"}
                zIndex={1}
                fill={"white"}

            />
        </Txt>
    </GMRect>);

    return {
        ref,
        spawn: function* () {
            yield* all(
                ref().x(type == "SetEvent" ? -500 : 500, 1, easeOutCubic),
            )
        }

    };
}

function getlerpForLines(code : Code){
    // if (!code) return (line:number)=>line;
    // useLogger().info(code.code().fragments[0].toString());
    // const selection0 = code.findFirstRange("#include <w");
    // const selection1 = code.findFirstRange("#include <s");
    // const y0 = BBox.fromBBoxes(...code.getSelectionBBox(selection0)).y;
    // const y1 = BBox.fromBBoxes(...code.getSelectionBBox(selection1)).y;
    // useLogger().info(`${y0};${y1}`)
    return (line:number)=> -315 + (-287 + 316.9) * line - code.y();
}

function* createExecutionBullet(yFunction: (line: number) => number) {
    const c = createRef<Circle>();
    return {
        ref: <Circle
            size={25}
            fill={"white"}
            y={50}
            ref={c}
            zIndex={1}
            scale={0}
            x={-510}
        >
            <Circle
                size={35}
                lineWidth={3}
                stroke={"rgb(76, 248, 248)"}
                shadowColor={"rgb(76,248,248)"}
                shadowBlur={3}
            />
        </Circle>,
        goTo: function* (pos: number) {
            yield* c().y(yFunction(pos), .5);
        },
        pop: function* (pos?: number) {
            if (pos){
                c().y(yFunction(pos));
                if (pos < 11){
                    (c().children()[0] as Circle).shadowColor("rgb(248, 248, 76)");
                    (c().children()[0] as Circle).stroke("rgb(248, 248, 76)");
                }
            }
            yield* c().scale((c().scale().x == 0) ? 1 : 0, .5, easeOutCubic);
        }
    }
}

export default makeScene2D(function* (view) {
    view.add(<Background />);

    view.add(<Chapter
        chapterNumber={4}
        name={"EVENTS"}
        icon={"material-symbols:calendar-clock-rounded"}
    />)

    const title = createRef<Txt>();
    view.add(<Txt
        text={"EVENTS"}
        fontFamily={"Poppins"}
        fontWeight={900}
        fontSize={200}
        stroke={new Gradient({
            fromY: -50,
            toY: 50,
            stops: [
                { offset: 0, color: "#fff5" },
                { offset: 0.2, color: "#fffa" },
                { offset: 0.8, color: "#fffa" },
                { offset: 1, color: "#fff5" },
            ]
        })}
        lineWidth={5}
        fill={"#fff2"}
        shadowBlur={20}
        shadowColor={"white"}
        ref={title}
    />);


    const windows = createRef<Rect>();
    view.add(<Rect
        layout
        top={() => title().bottom().addY(-50)}
        alignItems={'center'}
        fontFamily={"Poppins"}
        gap={30}
        ref={windows}
    >
        <Txt
            fill={"#fffa"}
            fontWeight={300}
        >Tool provided by</Txt>
        <Icon
            icon={"bxl:windows"}
            size={80}
        />
    </Rect>
    );
    windows().save();
    windows().y(50);
    windows().scale(.7);
    windows().opacity(0);

    yield* waitUntil("start");
    yield* all(
        windows().restore(1),
        title().y(-20, 1),
    );
    const setEvent = yield* createAPIComponent(view, "SetEvent");
    const waitForSingleObject = yield* createAPIComponent(view, "WaitForSingleObject");
    const line = createRef<Line>();
    view.add(<Ray
        from={setEvent.ref().right}
        to={waitForSingleObject.ref().left}
        lineWidth={5}
        stroke={"white"}
        endOffset={20}
        startOffset={20}
        endArrow
        arrowSize={20}
        ref={line}
        end={0}
    />);
    const code = createRef<Code>();
    const pad = createRef<GMRect>();
    const texts = createRefArray<Txt>();
    view.add(<GMRect
        size={[0, 0]}
        translucency={1}
        ref={pad}

    >
        <Code
            ref={code}
            fontSize={0}
            zIndex={1}
            x={25}
            code={exampleCode}

        >
            <Rect
                x={-510}
            >
                {...range(splited.length).map(i=>(<Txt
                    text={i.toFixed(0)}
                    zIndex={1}
                    scale={()=>code().fontSize()/25}
                    fontFamily={"Fira Code"}
                    opacity={0.3}
                    fill={"white"}
                    fontSize={25}
                    ref={texts}
                />))}
            </Rect>
        </Code>
    </GMRect>);
    const lineY = getlerpForLines(code());

    texts.forEach((t, i)=>t.y(lineY(i)));
    const pointerA = yield* createExecutionBullet(lineY);
    const pointerB = yield* createExecutionBullet(lineY);
    code().add(pointerA.ref);
    code().add(pointerB.ref);
    yield* all(
        title().y(-80, 1),
        windows().top(title().bottom().addY(-100), 1),
    )
    yield* waitUntil("api");
    yield* all(
        line().end(1, 1),
        setEvent.spawn(),
        waitForSingleObject.spawn(),
    );
    yield* waitUntil("code");
    yield* all(
        title().y(-900, 1),
        setEvent.ref().y(-900, 1),
        waitForSingleObject.ref().y(-900, 1),
        windows().opacity(0, 1),
        pad().size([1050, 700], 1),
        code().fontSize(25, 1),
    );
    title().text("Execution example");
    title().fontSize(92);
    title().lineWidth(3);

    yield* waitUntil("execution");
    yield* sequence(
        .8,
        all(
            title().y(-380, 1),
            pad().y(50, 1),
            pointerA.pop(12),
        ),
        pointerA.goTo(13),
        pointerA.goTo(14),
        
        all(
            pointerA.goTo(15),
            pointerB.pop(5)
        ),
        all(
            pointerA.goTo(16),
            pointerB.goTo(6)
        ),
        all(
            pointerA.goTo(16),
            pointerB.goTo(7)
        ),
        code().selection(lines(7), 1),
        
    );
    yield* waitUntil("func1");
    yield* sequence(
        .8,
        code().selection(DEFAULT, 1),
        all(
            pointerA.goTo(16),
            pointerB.goTo(7)
        ),
        all(
            pointerA.goTo(17),
            pointerB.goTo(7)
        ),
        all(
            pointerA.goTo(18),
            pointerB.goTo(7),
            code().selection(lines(18), 1),
        ),
    );
    yield* waitUntil("func2");
    yield* sequence(.8, 
        all(
            pointerA.goTo(19),
            pointerB.goTo(8),
            code().selection(DEFAULT, 1),
        ),
        all(
            pointerA.goTo(19),
            pointerB.goTo(9)
        ),
        all(
            pointerA.goTo(19),
            pointerB.goTo(10)
        ),
        pointerB.pop(),
        pointerA.goTo(20),
        pointerA.pop(), 
    );

    yield* waitUntil("next");
});