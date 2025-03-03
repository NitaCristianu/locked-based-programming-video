import { Circle, Code, contrast, Icon, Layout, makeScene2D, Node, Path, Rect, Txt } from '@motion-canvas/2d';
import { all, any, BBox, chain, createRef, createRefArray, createSignal, delay, easeInCubic, easeInElastic, easeInOutCubic, easeInOutSine, easeInQuad, easeOutBounce, easeOutCubic, easeOutElastic, linear, loop, PossibleVector2, range, tween, useLogger, useRandom, Vector2, waitFor, waitUntil } from '@motion-canvas/core';
import { Background } from '../components/background';
import { GMRect } from '../components/glassmorphic_rect';
import mutexProtectionExamples from '../assets/example-code/mutex-protection-examples';

export default makeScene2D(function* (view) {
    const mutex_rect = createRef<Rect>();
    const mutex_title = createRef<Txt>();
    const mutex_icon = createRef<Path>();

    const code_samples_rects = createRefArray<Rect>();
    const code_samples_codes = createRefArray<Code>();
    const code_samples_highlight = createRefArray<Rect>();

    const alternatives_title = createRef<Txt>();
    const black_frame = createRef<Rect>();
    const questions_refs = createRefArray<Txt>();

    const time = createSignal<number>(0);
    const alternatives_transition = createSignal<number>(0);
    const code_sample_scale = createSignal<number>(0);
    const code_samples_x = createSignal<number>(2120);

    const threadnames = "ABCDEFGHIJ".split('').map(character => `Thread ${character}`);
    const highlighted_sections = createSignal([]);

    yield time(10000, 10000, linear);
    view.add(<Background
        size="150%"
    />);
    view.add(<Rect
        size={"100%"}
        fill={"#000"}
        opacity={0}
        ref={black_frame}
    />)
    const generator = useRandom();

    const questions = ["when", "how"];

    view.add(<Node>
        {...questions.map((word, i) => <Txt
            ref={questions_refs}
            fontSize={90}
            y={() => ((i % 2) * 2 - 1) * 150 * questions_refs[i].opacity()}
            fontFamily={"Poppins"}
            opacity={0}
            scale={0}
            fill="white"
            shadowColor={"white"}
            shadowBlur={20}

        ><Txt fontWeight={800} >{word.toUpperCase()}</Txt> to use it?</Txt>)}
    </Node>)

    view.add(<Node>

        {...mutexProtectionExamples.map((code_str, i) => <GMRect
            size={() => code_samples_rects[i].size() || 0}
            position={() => code_samples_rects[i].absolutePosition() || 0}
            zIndex={-10}
            radius={16}
            scale={code_sample_scale}
            darkness={-.3}
            borderModifier={-2}
        >
            <Rect
                layout
                y={-360}
                justifyContent={'space-between'}
                width={() => code_samples_rects[i].size().x - 100}
                zIndex={3}
            >
                <Txt
                    text={threadnames[i]}
                    fontSize={40}
                    zIndex={4}
                    fill={"white"}
                    fontWeight={300}
                    fontFamily={"Poppins"}
                />
                <Rect
                    alignItems={'center'}
                    gap={30}
                    layout
                >
                    {range(3).map(i => <Circle
                        size={20}
                        stroke={"#fffa"}
                        lineWidth={2}
                    />)}
                </Rect>

            </Rect>

            <Code
                code={code_str}
                fontSize={25}
                zIndex={3}
                fontFamily={"Fira Code"}
                filters={[contrast(1.6)]}
                ref={code_samples_codes}
            />

            <Rect
                ref={code_samples_highlight}
                height={() => {
                    const code = code_samples_codes[i];
                    const mutexSectionRegex = /pthread_mutex_lock\(\s*&\w+\s*\);\s*([\s\S]*?)\s*pthread_mutex_unlock\(\s*&\w+\s*\);/g;
                    const range = code.findFirstRange(new RegExp(mutexSectionRegex));
                    const bboxes = code.getSelectionBBox(range);

                    const final_bbox = BBox.fromBBoxes(...bboxes).expand([4, 16])
                    return final_bbox.height
                }}
                width={() => code_samples_rects[i].width() * 0.95}
                y={() => {
                    const code = code_samples_codes[i];
                    const mutexSectionRegex = /pthread_mutex_lock\(\s*&\w+\s*\);\s*([\s\S]*?)\s*pthread_mutex_unlock\(\s*&\w+\s*\);/g;
                    const range = code.findFirstRange(new RegExp(mutexSectionRegex));
                    const bboxes = code.getSelectionBBox(range);

                    const final_bbox = BBox.fromBBoxes(...bboxes).expand([4, 16])
                    return final_bbox.position.y + 65
                }}
                stroke={"white"}
                fill={"#fff2"}
                lineDash={() => [20, 20]}
                lineWidth={3}
                zIndex={3}
                radius={32}
                opacity={() => highlighted_sections()[i]}
                scale={() => Math.min(highlighted_sections()[i] + .6, 1)}
            >
                <Rect
                    size={80}
                    x={() => code_samples_highlight[i].topRight().x}
                    scale={() => code_samples_highlight[i].scale()}
                    fill={"rgb(79, 113, 201)"}
                    stroke={"#fff"}
                    lineWidth={2}
                    radius={100}
                >
                    <Icon
                        icon={"material-symbols:shield-lock-outline-rounded"}
                        size={50}
                    />
                </Rect>
            </Rect>

        </GMRect>)}
    </Node>)
    view.add(<Layout
        layout
        gap={100}
        zIndex={-1}
        x={code_samples_x}
        y={-540}
    >
        {...mutexProtectionExamples.map((code_str, i) => <Rect
            height={840}
            paddingLeft={30}
            paddingRight={30}
            radius={16}
            scale={code_sample_scale}
            zIndex={-10}
            ref={code_samples_rects}
        >
            <Txt
                text={threadnames[i]}
                fontSize={40}
                fill={"white"}
                fontWeight={1000}
                fontFamily={"Poppins"}
            />
            <Code
                code={code_str}
                fontSize={25}
                zIndex={3}
                fontFamily={"Fira Code"}
                opacity={0}
            />
        </Rect>)}
    </Layout>)

    view.add(<Txt
        ref={alternatives_title}
        text={"ALTERNATIVES"}
        y={-350}
        fontSize={100}
        fontFamily={"Poppins"}
        opacity={0}
        scale={0.5}
        fill="white"
        shadowColor={"white"}
        fontWeight={700}
        shadowBlur={20}
    />)

    view.add(<GMRect
        height={200}
        width={800}
        scale={.6}
        scaleY={0}
        ref={mutex_rect}
    >
        <Txt
            ref={mutex_title}
            zIndex={1}
            text={"MUTEX"}
            fontSize={120}
            fill={"white"}
            fontWeight={1000}
            fontFamily={"Poppins"}
        />
        <Icon
            icon={"material-symbols:lock"}
            size={100}
            zIndex={1}
            scale={0}
            opacity={0}
            ref={mutex_icon}
        />
    </GMRect>);

    view.add(<Node>
        {...range(4).map(i => {
            var initialOffset = new Vector2(generator.nextFloat(-6, 6), generator.nextFloat(-6, 6));
            return <GMRect
                size={450 * generator.nextFloat(.9, 1.05)}
                scale={() => .6 * alternatives_transition()}
                radius={300}
                darkness={-.2}
                x={() => ((i > 1 ? i + 1 : i) - 2) * 350 * alternatives_transition()}
                offsetY={() => initialOffset.mul(0.01).add([Math.sin(time()) + initialOffset.x * 0.1, Math.cos(time()) * initialOffset.y * 0.1]).y}
                borderModifier={-1}
            >
                <Icon
                    icon={"material-symbols:question-mark-rounded"}
                    size={190}
                    zIndex={1}
                />
            </GMRect>
        }
        )}
    </Node>)

    yield* chain(
        waitUntil("appear"),
        all(
            mutex_rect().scale(1, 1, easeOutCubic),
        ),
        waitUntil("transform"),
        any(
            mutex_title().opacity(0, .5),
            mutex_title().scale(0, .5),
            mutex_rect().width(mutex_rect().height(), .5),
            mutex_rect().radius(500, .5),
            delay(.15, all(
                mutex_icon().scale(1, .6, easeOutCubic),
                mutex_icon().opacity(1, .6, easeOutCubic),
            )),
            mutex_rect().scale(.6, .8, easeOutCubic),
        ),
    );
    yield all(
        code_sample_scale(1, 1),
        code_samples_x(-4240, 10),
        delay(9, code_sample_scale(0, 1))
    );

    yield tween(8, (val) => {
        var mutex_pos_x = mutex_rect().x();
        var rects_x = code_samples_rects.map(rect => rect.absolutePosition().x - rect.width() / 4);
        highlighted_sections(rects_x.map(pos => Math.min(Math.max(-pos / 400, 0)), 1));
    })
    yield* loop(3, () => mutex_rect().y(200, 1, easeInOutSine).to(-200, 1, easeInOutSine));
    yield* mutex_rect().y(0, 1, easeInOutSine);

    yield* chain(
        waitUntil("when"),
        all(
            questions_refs[0].scale(1, .5),
            questions_refs[0].opacity(1, .5),
        ),
        waitUntil("how"),
        all(
            questions_refs[1].scale(1, .5),
            questions_refs[1].opacity(1, .5),
        ),
        waitUntil("alternatives"),
        all(...questions_refs.map(question => all(question.scale(0, .5), question.opacity(0, .5))),
            alternatives_transition(1, 1),
            mutex_rect().scale(.8, 1),
            alternatives_title().scale(1, .7),
            alternatives_title().opacity(1, .7),
            black_frame().opacity(.4, 1),
        ),
    )

    yield* waitUntil("next");
});
