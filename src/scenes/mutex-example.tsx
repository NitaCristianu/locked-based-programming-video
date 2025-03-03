import { Code, lines, makeScene2D, Node, Txt } from "@motion-canvas/2d";
import { Background } from "../components/background";
import { all, any, chain, Color, createRefArray, createSignal, DEFAULT, range, waitFor, waitUntil } from "@motion-canvas/core";
import { GMRect } from "../components/glassmorphic_rect";

const code_snippets = [
    `\
void* threadB(void* arg) {
    // Lock the mutex
    pthread_mutex_lock(&lock);
    printf("Thread B: locked");

    // Critical section
    counter++;
    printf("Thread B: Counter = %d",
        counter);

    // Unlock the mutex
    pthread_mutex_unlock(&lock); 
    printf("Thread B: unlocked");
    return NULL;
}`,
    `\
void* threadA(void* arg) {
    // Lock the mutex
    pthread_mutex_lock(&lock);
    printf("Thread A: locked");

    // Critical section
    counter++;
    printf("Thread A: Counter = %d",
        counter);
 
    // Unlock the mutex
    pthread_mutex_unlock(&lock);
    printf("Thread A: unlocked");
    return NULL;
}`,
    `\
// Shared resource
int counter = 0;

// Mutex declaration
pthread_mutex_t lock;

int main() {
    // Initialize the mutex
    pthread_mutex_init(&lock, NULL);

    // Create threads
    pthread_t tA, tB;
    pthread_create(&tA, NULL,
        threadA, NULL);
    pthread_create(&tB, NULL,
        threadB, NULL);

    // Wait for threads to finish
    pthread_join(tA, NULL);
    pthread_join(tB, NULL);

    // Destroy the mutex
    pthread_mutex_destroy(&lock);

    printf("Final Value: %d\\n",
    counter);
    return 0;
}`
];

export default makeScene2D(function* (view) {
    view.add(<Background />);

    const code_refs = createRefArray<Code>();
    const examples_scale = createSignal(0);
    const highlights = range(3).map(i => createSignal(0));
    const texts = createRefArray<Txt>();

    view.add(<Node>
        {...range(3).map(i => <GMRect
            size={[550, 900]}
            x={i * -600 + 600}
            y={() => 100 * (1 - examples_scale())}
            darkness={-.4}
            borderModifier={() => -1 * (highlights[2 - i]() + 1)}
            translucency={1}
            scale={() => examples_scale() * (1 + highlights[2 - i]() / 20)}
        >
            <Code
                code={code_snippets[i]}
                fontSize={25}
                zIndex={1}
                ref={code_refs}
            />
            <Txt
                text={["Main", "Thread A", "Thread B"][2 - i]}
                zIndex={1}
                y={-450}
                fontFamily={"Poppins"}
                fontWeight={400}
                scale={() => highlights[2 - i]() / 10 + 1}
                ref={texts}
                fontSize={50}
                fill={() => new Color("#fff").lerp("rgb(235, 255, 60)", highlights[2 - i]())}
                shadowBlur={15}
                shadowColor={"#fff"}


            />
        </GMRect>)}
    </Node>);

    yield* chain(
        waitUntil("start"),
        examples_scale(1, 1),
        waitUntil("exampleA"),
        highlights[1](1, 1),
        waitUntil("exampleB"),
        highlights[2](1, 1),
        waitUntil("counter"),
        all(
            highlights[2](0, 1),
            highlights[1](0 , 1),
            code_refs[2].selection(lines(0, 5), 1),
            code_refs[1].selection(lines(50, 50), 1),
            code_refs[0].selection(lines(50, 50), 1),
            ...texts.map(text=>text.scale(0, 1)),
        ),
        waitUntil("reverse"),
        all(
            code_refs[2].selection(DEFAULT, 1),
            code_refs[1].selection(DEFAULT, 1),
            code_refs[0].selection(DEFAULT, 1),
        ),
        waitUntil("mutex"),
        all(
            code_refs[2].selection(lines(100), 1),
            code_refs[1].selection(lines(1, 11), 1),
            code_refs[0].selection(lines(1, 11), 1),
        ),
        waitUntil("output"),
        all(
            code_refs[2].selection(lines(23, 25), 1),
            code_refs[1].selection(lines(6), 1),
            code_refs[0].selection(lines(6), 1),
        ),
        waitUntil("useA"),
        all(
            code_refs[2].selection(lines(100), 1),
            code_refs[1].selection(lines(1, 11), 1),
            code_refs[0].selection(lines(110, 11), 1),
            highlights[1](-.3, .5),
        ),
        waitUntil("useB"),
        any(
            code_refs[2].selection(lines(100), 1),
            code_refs[1].selection(lines(100, 11), 1),
            code_refs[0].selection(lines(1, 11), 1),
            highlights[2](-.3, .5),
            highlights[1](0, .5),
            waitFor(.4),
        ),
        waitUntil("resume"),
        all(
            code_refs[2].selection(DEFAULT, 1),
            code_refs[1].selection(lines(100, 11), 1),
            code_refs[0].selection(lines(100, 11), 1),
            highlights[2](0, 1),
            highlights[0](-.3, 1),
        ),
        waitUntil("back"),
        all(
            code_refs[2].selection(DEFAULT, 1),
            code_refs[1].selection(DEFAULT, 1),
            code_refs[0].selection(DEFAULT, 1),
        ),
    );



    yield* waitUntil("next");
})