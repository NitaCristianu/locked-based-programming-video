import { createRef, easeInCubic, easeOutCubic, waitFor } from "@motion-canvas/core";
import { GMRect } from "./glassmorphic_rect";
import { Node, Txt, View2D } from "@motion-canvas/2d";

export interface NotificationParams {
    darkmode? : boolean,
    top? : boolean
}

export function* Notification(time: number = 3, title: string, view2d: Node, params : NotificationParams = {}) {

    const notification = createRef<GMRect>();

    view2d.add(<GMRect
        size={[1200, 80]}
        translucency={1}
        shadowColor={params.darkmode ? "#000000aa" : "#ffffff"}
        y={!params.top ? 600 : -600}
        ref={notification}
        darkness={params.darkmode ? .4 : -.4}
        borderModifier={params.darkmode ? .4 : -.4}
    >
        <Txt
            text={title}
            fontSize={25}
            textAlign={'center'}
            fontFamily={"Roboto"}
            zIndex={3}
            fill={"white"}
            shadowBlur={5}
            shadowColor={"white"}


        />
    </GMRect>)

    yield* notification().y(params.top ? -450 : 450, .6, easeOutCubic);
    yield* waitFor(time);
    yield* notification().y(params.top ? -600 : 600, .6, easeInCubic);
}