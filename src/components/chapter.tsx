import { Gradient, Icon, initial, Rect, signal, Txt, View2D } from "@motion-canvas/2d";
import { createRef, SignalValue, SimpleSignal, Vector2 } from "@motion-canvas/core";
import { GMRect, GMRectProps } from "./glassmorphic_rect";

export interface ChapterProps extends GMRectProps {
    name?: SignalValue<string>;
    icon: SignalValue<string>;
    chapterNumber?: SignalValue<number>;
    darkmode?: SignalValue<boolean>;
}

export class Chapter extends GMRect {

    @initial("test name")
    @signal()
    public declare readonly name: SimpleSignal<string, this>;

    @initial("")
    @signal()
    public declare readonly icon: SimpleSignal<string, this>;
    
    @initial(0)
    @signal()
    public declare readonly chapterNumber: SimpleSignal<number, this>;

    @initial(false)
    @signal()
    public declare readonly darkmode: SimpleSignal<boolean, this>;

    private readonly text = createRef<Txt>();

    public constructor(props?: ChapterProps) {
        super({
            zIndex: 999,
            height: 80,
            radius: 16,
            shadowColor: "#fffa",
            shadowBlur: -1,
            ...props,
        })

        this.add(<Txt
            text={String(this.chapterNumber()) + ". " + this.name().toUpperCase()}
            fontWeight={800}
            ref={this.text}
            fill={"white"}
            fontSize={50}
            fontFamily={"Poppins"}
            left={()=>[-w()/2 + 30, 0]}
        />);
        const w = ()=>this.text().width() + 130;
        this.add(<Icon
            icon={this.icon}
            size={40}
            right={()=>[w()/2 - 30, 0]}
        />)
        this.width(w);
        this.bottomRight(() => (this.parent() as View2D).size().div(2).add(-50));


    }
}