import { Camera, Code, lines, makeScene2D, Node, Rect } from "@motion-canvas/2d";
import { all, chain, createRef, createSignal, waitFor, waitUntil } from "@motion-canvas/core";
import { Background } from "../components/background";
import { GMRect } from "../components/glassmorphic_rect";
import gaussianblur from "../shaders/glassmorphic.glsl";
import { Chapter } from "../components/chapter";

const example_code = `\
#include <windows.h>
#include <stdio.h>

CRITICAL_SECTION CriticalSection;

DWORD WINAPI ThreadFunction(LPVOID lpParam) {
    // Enter the critical section
    EnterCriticalSection(&CriticalSection);

    // Critical section code
    printf("Thread %d is in the critical section.\\n", GetCurrentThreadId());
    Sleep(1000); // Simulate some work

    // Leave the critical section
    LeaveCriticalSection(&CriticalSection);

    return 0;
}

int main() {
    // Initialize the critical section
    if (!InitializeCriticalSectionAndSpinCount(&CriticalSection, 0x00000400)) {
        printf("Failed to initialize the critical section.\\n");
        return 1;
    }

    HANDLE threads[2];

    // Create threads
    for (int i = 0; i < 2; i++) {
        threads[i] = CreateThread(NULL, 0, ThreadFunction, NULL, 0, NULL);
        if (threads[i] == NULL) {
            printf("Failed to create thread %d.\\n", i + 1);
            DeleteCriticalSection(&CriticalSection);
            return 1;
        }
    }

    // Wait for threads to finish
    WaitForMultipleObjects(2, threads, TRUE, INFINITE);

    // Clean up
    for (int i = 0; i < 2; i++) {
        CloseHandle(threads[i]);
    }

    DeleteCriticalSection(&CriticalSection);

    printf("All threads have finished execution.\\n");

    return 0;
}`;

export default makeScene2D(function* (view) {
    view.add(<Background />);

    view.add(<Rect
        size={'100%'}
        fill={"white"}
        shaders={{
            fragment: gaussianblur,
            uniforms: {
                strength: 10.,
                opacity: 0.9,
                darkness: -.4,
                borderModifier: -1.5,
                blurstrength: 52,
            }
        }}
    />);

    const camera = createRef<Node>();


    const scroll = createSignal(0);
    const code = createRef<Code>();

    view.add(<Chapter
        chapterNumber={2}
        icon={"material-symbols:cycle-rounded"}
        name={"Critical Sections"}
    />);

    view.add(<Node
        ref={camera}
    >
        <GMRect
            height={() => code().height() + 100}
            width={() => code().width() + 80}
            darkness={-.4}
            borderModifier={-.9}
            removeShadow={0}
            shadowColor={"#fff"}
        />
        <Code
            code={example_code}
            fontSize={37}
            y={() => -750 + 1500 * (1 - scroll())}
            ref={code}
        />
        <Rect
            width={20}
            height={90}
            radius={16}
            x={() => code().right().x}
            y={() => -450 + 900 * scroll()}
            stroke={"white"}
            lineWidth={4}
            fill={"#fff1"}
        />
    </Node>);

    yield* chain(
        waitUntil('start'),
        all(
            code().selection(lines(3), 1),
            scroll(0, 1),
        ),
        waitFor(1.5),
        all(
            code().selection(lines(21), 1),
            scroll(0.5, 1),
        ),
        waitUntil('use it'),
        all(
            code().selection(lines(7, 14), 1),
            scroll(0.1, 1),
        ),
        waitUntil('uninit'),
        all(
            code().selection(lines(46), 1),
            scroll(1, 1),
        ),
    );

    yield* chain(
        waitUntil("enter"),
        all(
            scroll(0.1, 1),
            code().selection(lines(7, 14), 1),
        ),
        waitFor(0.3),
        all(
            code().selection(lines(7), .5),
        ),
    );


    yield* waitUntil("next");
});