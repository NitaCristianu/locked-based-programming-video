import { Circle, Icon, Line, makeScene2D, Node, Path, PropertyMetadata, QuadBezier, Rect } from "@motion-canvas/2d";
import { Background } from "../components/background";
import { all, chain, Color, createEffect, createRef, createSignal, delay, easeOutCubic, range, Reference, sequence, spawn, useLogger, useRandom, Vector2, waitFor, waitUntil } from "@motion-canvas/core";
import { PropsNode } from "../components/propertyNode";

interface philosopher_type {
    index: number,
    state: 'waiting' | 'eating' | 'nothing',
    plate: plate_type,
    ref: Reference<Icon>,
}

interface chopstick_type {
    index: number,
    master?: philosopher_type,
    ref: Reference<Path>,
}

interface plate_type {
    index: number,
    state: 'clean' | 'food',
    chopsticks?: chopstick_type[],
    startTime?: number,
    duration: number,
    ref: Reference<Circle>,
}

function createPropertyMetadata(val : any): PropertyMetadata<any>{
    return {
        cloneable : true,
        compound : false,
        compoundEntries : [['a', 'b'],['c','d']],
        compoundParent : 'e',
        default : val,
        getter : ()=>val,
        setter: (newV: any) => null,
        inspectable : true,
        interpolationFunction : null,
    }
}

export default makeScene2D(function* (view) {
    view.fill("rgb(3,0,0)");
    const table = createRef<Circle>();
    const n = 5;

    const time = createRef<number>();
    const generator = useRandom();

    const connection_node = createRef<Node>()

    const action_event = createSignal<number>(0);

    function getConnections(type: 'pickup') {
        if (type == 'pickup') {
            return philosophers.map(philosopher => philosopher.plate.chopsticks.map(chopstick => chopstick.master == philosopher ? true : false));
        }
    }

    function* PickChopstick(philosopher: philosopher_type, index: 'low' | 'high') {
        const chopstick1 = philosopher.plate.chopsticks[0];
        const chopstick2 = philosopher.plate.chopsticks[1];
        const chopstick = index == 'low' ? philosopher.plate.chopsticks.find(chop => chop.index == Math.max(chopstick1.index, chopstick2.index)) : philosopher.plate.chopsticks.find(chop => chop.index == Math.min(chopstick1.index, chopstick2.index));
        if (chopstick.master == null) {
            chopstick.master = philosopher;
            console.log("PICKED Up")
            yield* action_event(action_event() == 0 ? 1 : 0, .5);
            return true;
        }
        yield* action_event(action_event() == 0 ? 1 : 0, .2);
        return false;
    }

    const chopsticks: chopstick_type[] = range(n).map(i => ({
        index: i,
        ref: createRef(),
    }));

    const plates: plate_type[] = range(n).map(i => ({
        index: i,
        state: 'food',
        chopsticks: [chopsticks[i], chopsticks[(i + 1) % n]],
        duration: generator.nextInt(2, 4),
        ref: createRef(),
    }))

    const philosophers: philosopher_type[] = range(n).map(i => ({
        index: i,
        state: 'nothing',
        plate: plates[i],
        ref: createRef(),
    }));


    view.add(<Circle
        ref={table}
        size={600}
        fill={"rgb(99, 23, 10)"}
        shadowBlur={300}
        shadowColor={() => new Color(table().fill() as any).brighten(1.3).saturate(1).alpha(.8)}
        zIndex={2}
    >
        <Node ref={connection_node} />
        {plates.map((plate, i) => {
            const radius = 100;
            const pos = new Vector2(Math.cos(i * Math.PI * 2 / n), Math.sin(i * Math.PI * 2 / n)).scale(radius + 100);

            return <Circle
                size={80}
                ref={plate.ref}
                scale={0}
                fill={"rgb(255, 89, 68)"}
                shadowColor={"rgb(252, 138, 109)"}
                shadowBlur={30}
                position={pos}
            />;
        })}
        {philosophers.map((philosopher, i) => {
            const radius = 300;
            const pos = new Vector2(Math.cos(i * Math.PI * 2 / n), Math.sin(i * Math.PI * 2 / n)).scale(radius + 80);

            return <Icon
                size={120}
                ref={philosopher.ref}
                icon={"material-symbols:person-rounded"}
                scale={0}
                color={"rgb(241, 183, 168)"}
                shadowColor={"rgb(252, 138, 109)"}
                shadowBlur={30}
                position={pos}
            />;
        })}
        {chopsticks.map((chopstick, i) => {
            const radius = 100;
            const offset = Math.PI / n;
            const pos = new Vector2(Math.cos(i * Math.PI * 2 / n + offset), Math.sin(i * Math.PI * 2 / n + offset)).scale(radius + 100);
            const angle = Math.atan2(pos.y, pos.x) * 180 / Math.PI + 65;

            return <Path
                size={20}
                ref={chopstick.ref}
                rotation={angle}
                data={"M 18.2679 -35.641 L 21.7321 -33.641 L -19.567 34.891 L -20.433 34.391 Z"}
                scale={0}
                fill={"pink"}
                position={pos}
            />;
        })}
    </Circle>);

    createEffect(() => {
        const actionValue = action_event();
        // PICKUP CHOPCSTICK
        if (true){
            const connections = getConnections('pickup');
            const children = connection_node().children().filter((child: PropsNode) => child.customprops.type == 'pickup');
            console.log(connections);
            children.forEach((child: PropsNode) => {
                // verify if valid
                useLogger().info("check remove");
                const master: philosopher_type = child.customprops.master as any;
                const chopstick: chopstick_type = child.customprops.chopstick as any;
                if (chopstick.master != master) return;
                useLogger().info("remove");
                spawn((child.children()[0] as any).size(0, 0.5).do(() => child.remove()));
            });
            connections.forEach((holdings, index1) => {
                holdings.forEach((holding, index2) => {
                    // useLogger().info("c");
                    // if (holding == false) return;
                    // useLogger().info("found");
                    // const chopstick = philosophers[index1].plate.chopsticks[index2];
                    // const child = children.findIndex((child: PropsNode) => child.customprops.type == 'pickup' && child.customprops.master.index == index1 && child.customprops.chopstick.index == index2) > -1;
                    // if (child) return;
                    // const connection = (<QuadBezier
                    //     p0={chopstick.ref().position}
                    //     p1={0}
                    //     p2={philosophers[index1].ref().position}
                    //     lineWidth={5}
                    //     stroke={"white"}
                    //     end={0}
                    // />) as QuadBezier
                    // connection_node().add(<PropsNode customprops={{
                    //     type : 'pickup',
                    //     master : philosophers[index1],
                    //     chopstick : chopsticks[index2],
                    // }} >{connection}</PropsNode>);
                    // spawn(connection.end(1, 1));
                })
            })
        }
    });

    const table_clones_effect = createSignal(0);
    const table_clones = range(10).map(i => {
        const obj = table().reactiveClone({
            shadowBlur: 0,
            offset: () => new Vector2([-i / 7, -i / 10]).scale(table_clones_effect()),
            y: () => table().y() + i * 20 * table_clones_effect(),
            zIndex: -i - 1,
            opacity: () => (8 - i) / 8 / 4 * table_clones_effect()
        });
        obj.children().forEach(c => c.remove());
        view.add(obj)
    });
    table().save(); table().size(0); table().rotation(90);

    yield* chain(
        waitUntil('start'),
        sequence(
            0.5,
            table().restore(1.5, easeOutCubic),
            all(
                sequence(
                    .1,
                    ...philosophers.map(p => p.ref().scale(1, 1)),
                    ...plates.map(p => p.ref().scale(1, 1)),
                    ...chopsticks.map(c => c.ref().scale(1, 1)),
                ),
            ),
        )
    );
    yield* waitFor(1);
    yield* chain(
        waitUntil("move"),
        all(
            table().skew([-40, 0], 2),
            table().rotation(30, 2),
            view.scale(1.1, 2),
            delay(.5, table_clones_effect(1, 1)),
            ...philosophers.map(p => all(p.ref().rotation(-30, 2), p.ref().skew([20, 0], 2), p.ref().scale(1.2, 2))),
        ),
    );
    yield* waitFor(1);

    yield* PickChopstick(philosophers[0], 'low');
    yield* waitFor(1);

    yield* waitUntil("next");
});